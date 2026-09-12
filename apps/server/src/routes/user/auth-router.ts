import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
} from "../../utils/pkce.js";

interface OAuthState {
  verifier: string;
  state: string;
  expiresAt: number;
}

// In-memory storage for OAuth state
// Consider Redis/shared storage if this moves to a multi-process server.
const oauthStateStore = new Map<string, OAuthState>();

// Clean up expired states every 5 minutes
setInterval(() => {
  const now = Date.now();

  for (const [key, value] of oauthStateStore.entries()) {
    if (value.expiresAt < now) {
      oauthStateStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

const StartOAuthRequestSchema = z.object({
  email: z.string().email().optional(),
});

const StartOAuthResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    authUrl: z.string(),
    state: z.string(),
  }),
});

const OAuthCallbackRequestSchema = z.object({
  callbackUrl: z.string(),
});

const OAuthCallbackResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    authenticated: z.boolean(),
    email: z.string().optional(),
  }),
});

const RefreshTokenRequestSchema = z.object({
  email: z.string().email(),
  refreshToken: z.string(),
});

const LogoutRequestSchema = z.object({
  email: z.string().email(),
});

const MigrateTokensRequestSchema = z.object({
  email: z.string().email(),
  access_token: z.string(),
  refresh_token: z.string(),
  user_id: z.string(),
});

export async function authRouter(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/v1/user/auth/oauth/start
  typedApp.post(
    "/oauth/start",
    {
      schema: {
        body: StartOAuthRequestSchema,
        response: {
          200: StartOAuthResponseSchema,
        },
        tags: ["Authentication"],
      },
    },
    async (request, reply) => {
      try {
        const { email } = request.body;

        // Generate PKCE parameters
        const verifier = generateCodeVerifier();
        const challenge = generateCodeChallenge(verifier);
        const state = generateState();

        // Store OAuth state with 10-minute expiration
        const oauthState: OAuthState = {
          verifier,
          state,
          expiresAt: Date.now() + 10 * 60 * 1000,
        };

        oauthStateStore.set(state, oauthState);
        app.log.debug(
          {
            state,
            storeSize: oauthStateStore.size,
          },
          "OAuth state SET"
        );

        // Build authorization URL
        const params = new URLSearchParams({
          client_id: "renaissance-desktop",
          redirect_uri: "renaissance://auth/callback",
          response_type: "code",
          code_challenge: challenge,
          code_challenge_method: "S256",
          state,
        });

        const webServiceUrl =
          process.env.RENAISSANCE_URL || "http://localhost:3000";

        const authUrl = `${webServiceUrl}/oauth?${params.toString()}`;

        app.log.info(
          {
            hasEmail: Boolean(email),
          },
          "OAuth flow started"
        );

        return reply.status(200).send({
          success: true,
          data: {
            authUrl,
            state,
          },
        });
      } catch (error) {
        app.log.error(
          { err: error },
          "Failed to start OAuth flow"
        );

        return reply.status(500).send({
          success: false,
          data: {
            authUrl: "",
            state: "",
          },
        });
      }
    }
  );

  // POST /api/v1/user/auth/oauth/callback
  typedApp.post(
    "/oauth/callback",
    {
      schema: {
        body: OAuthCallbackRequestSchema,
        response: {
          200: OAuthCallbackResponseSchema,
        },
        tags: ["Authentication"],
      },
    },
    async (request, reply) => {
      try {
        app.log.debug("In Callback method");

        const { callbackUrl } = request.body;

        app.log.debug(
          {
            hasCallbackUrl: Boolean(callbackUrl),
          },
          "Callback URL received"
        );

        const url = new URL(callbackUrl);

        app.log.debug(
          {
            protocol: url.protocol,
            hostname: url.hostname,
            pathname: url.pathname,
          },
          "Callback URL parsed"
        );

        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        app.log.debug(
          {
            hasCode: Boolean(code),
            hasState: Boolean(state),
          },
          "OAuth parameters extracted"
        );

        if (!code || !state) {
          app.log.error(
            {
              hasCode: Boolean(code),
              hasState: Boolean(state),
            },
            "Invalid callback URL"
          );

          return reply.status(400).send({
            success: false,
            data: {
              authenticated: false,
            },
          });
        }

        // Validate callback URL
        if (
          url.protocol !== "renaissance:" ||
          url.hostname !== "auth" ||
          url.pathname !== "/callback"
        ) {
          app.log.error(
            {
              protocol: url.protocol,
              hostname: url.hostname,
              pathname: url.pathname,
            },
            "Invalid OAuth callback destination"
          );

          return reply.status(400).send({
            success: false,
            data: {
              authenticated: false,
            },
          });
        }

        // Retrieve OAuth state
        app.log.debug(
          {
            state,
            storeSize: oauthStateStore.size,
          },
          "state to look for"
        );
        const oauthState = oauthStateStore.get(state);


        app.log.debug(
          {
            stateFound: Boolean(oauthState),
          },
          "OAuth state retrieved"
        );

        if (!oauthState || oauthState.expiresAt < Date.now()) {
          app.log.error(
            "Invalid or expired OAuth state"
          );

          oauthStateStore.delete(state);

          return reply.status(400).send({
            success: false,
            data: {
              authenticated: false,
            },
          });
        }

        // Consume the state so it cannot be reused
        oauthStateStore.delete(state);

        // Exchange authorization code for tokens
        const webServiceUrl =
          process.env.RENAISSANCE_URL || "http://localhost:3000";

        app.log.debug(
          "Starting OAuth token exchange"
        );

        const tokenResponse = await fetch(
          `${webServiceUrl}/api/auth/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              grant_type: "authorization_code",
              code,
              code_verifier: oauthState.verifier,
              redirect_uri: "renaissance://auth/callback",
            }),
          }
        );

        app.log.debug(
          {
            status: tokenResponse.status,
            ok: tokenResponse.ok,
          },
          "OAuth token exchange response"
        );

        if (!tokenResponse.ok) {
          app.log.error(
            {
              status: tokenResponse.status,
            },
            "Token exchange failed"
          );

          return reply.status(400).send({
            success: false,
            data: {
              authenticated: false,
            },
          });
        }

        const tokenData = await tokenResponse.json();

        app.log.debug(
          {
            success: tokenData?.success,
            hasData: Boolean(tokenData?.data),
          },
          "Token response received"
        );

        if (!tokenData.success || !tokenData.data) {
          app.log.error(
            "Invalid token response"
          );

          return reply.status(400).send({
            success: false,
            data: {
              authenticated: false,
            },
          });
        }

        const {
          access_token,
          refresh_token,
          user_id,
          email,
        } = tokenData.data;

        // Validate required token data
        if (
          !access_token ||
          !refresh_token ||
          !user_id ||
          !email
        ) {
          app.log.error(
            {
              hasAccessToken: Boolean(access_token),
              hasRefreshToken: Boolean(refresh_token),
              hasUserId: Boolean(user_id),
              hasEmail: Boolean(email),
            },
            "Incomplete token response"
          );

          return reply.status(400).send({
            success: false,
            data: {
              authenticated: false,
            },
          });
        }

        // Store tokens securely using keytar
        const success =
          await app.tokenStorageService.saveTokens(email, {
            access_token,
            refresh_token,
            user_id,
            email,
          });

        if (!success) {
          app.log.error(
            { email },
            "Failed to store tokens"
          );

          return reply.status(500).send({
            success: false,
            data: {
              authenticated: false,
            },
          });
        }

        app.log.info(
          {
            email,
            userId: user_id,
          },
          "OAuth callback successful"
        );

        return reply.status(200).send({
          success: true,
          data: {
            authenticated: true,
            email,
          },
        });
      } catch (error) {
        // Use `err`, not `error`, so Pino serializes the Error properly.
        app.log.error(
          { err: error },
          "OAuth callback failed"
        );

        return reply.status(500).send({
          success: false,
          data: {
            authenticated: false,
          },
        });
      }
    }
  );

  // GET /api/v1/user/auth/me
  typedApp.get(
    "/me",
    {
      schema: {
        querystring: z.object({
          email: z.string().email(),
        }),
        tags: ["Authentication"],
      },
    },
    async (request, reply) => {
      try {
        const { email } = request.query;

        // Check if user has valid tokens
        const hasTokens =
          await app.tokenStorageService.hasTokens(email);

        if (!hasTokens) {
          return reply.status(401).send({
            success: false,
            error: {
              message: "Not authenticated",
            },
          });
        }

        // Get user data from remote service
        const accessToken =
          await app.tokenStorageService.getAccessToken(email);

        const remoteServiceUrl =
          process.env.REMOTE_SERVICE_URL ||
          "http://localhost:8080";

        const response = await fetch(
          `${remoteServiceUrl}/api/v1/user/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          app.log.error(
            {
              status: response.status,
            },
            "Failed to get user from remote service"
          );

          return reply.status(401).send({
            success: false,
            error: {
              message: "Failed to get user data",
            },
          });
        }

        const userData = await response.json();

        return reply.status(200).send(userData);
      } catch (error) {
        app.log.error(
          { err: error },
          "Failed to get current user"
        );

        return reply.status(500).send({
          success: false,
          error: {
            message: "Internal server error",
          },
        });
      }
    }
  );

  // POST /api/v1/user/auth/refresh
  typedApp.post(
    "/refresh",
    {
      schema: {
        body: RefreshTokenRequestSchema,
        tags: ["Authentication"],
      },
    },
    async (request, reply) => {
      try {
        const { email, refreshToken } = request.body;

        const remoteServiceUrl =
          process.env.REMOTE_SERVICE_URL ||
          "http://localhost:8080";

        const response = await fetch(
          `${remoteServiceUrl}/api/v1/user/auth/refresh`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refresh_token: refreshToken,
            }),
          }
        );

        if (!response.ok) {
          app.log.error(
            {
              status: response.status,
            },
            "Token refresh failed"
          );

          return reply.status(401).send({
            success: false,
            error: {
              message: "Token refresh failed",
            },
          });
        }

        const refreshData = await response.json();

        if (refreshData.success && refreshData.data) {
          const {
            access_token,
            refresh_token: new_refresh_token,
          } = refreshData.data;

          const tokens =
            await app.tokenStorageService.getTokens(email);

          if (tokens) {
            tokens.access_token = access_token;

            if (new_refresh_token) {
              tokens.refresh_token = new_refresh_token;
            }

            await app.tokenStorageService.saveTokens(
              email,
              tokens
            );
          }

          return reply.status(200).send(refreshData);
        }

        return reply.status(401).send({
          success: false,
          error: {
            message: "Token refresh failed",
          },
        });
      } catch (error) {
        app.log.error(
          { err: error },
          "Token refresh failed"
        );

        return reply.status(500).send({
          success: false,
          error: {
            message: "Internal server error",
          },
        });
      }
    }
  );

  // POST /api/v1/user/auth/logout
  typedApp.post(
    "/logout",
    {
      schema: {
        body: LogoutRequestSchema,
        tags: ["Authentication"],
      },
    },
    async (request, reply) => {
      try {
        const { email } = request.body;

        await app.tokenStorageService.deleteTokens(email);

        app.log.info(
          { email },
          "User logged out successfully"
        );

        return reply.status(200).send({
          success: true,
          data: {
            message: "Logged out successfully",
          },
        });
      } catch (error) {
        app.log.error(
          { err: error },
          "Logout failed"
        );

        return reply.status(500).send({
          success: false,
          error: {
            message: "Logout failed",
          },
        });
      }
    }
  );

  // POST /api/v1/user/auth/migrate
  typedApp.post(
    "/migrate",
    {
      schema: {
        body: MigrateTokensRequestSchema,
        tags: ["Authentication"],
      },
    },
    async (request, reply) => {
      try {
        const {
          email,
          access_token,
          refresh_token,
          user_id,
        } = request.body;

        const success =
          await app.tokenStorageService.migrateFromLocalStorage(
            email,
            {
              access_token,
              refresh_token,
              user_id,
              email,
            }
          );

        if (success) {
          app.log.info(
            { email },
            "Tokens migrated successfully from localStorage"
          );

          return reply.status(200).send({
            success: true,
            data: {
              message: "Tokens migrated successfully",
            },
          });
        }

        app.log.error(
          { email },
          "Token migration failed"
        );

        return reply.status(500).send({
          success: false,
          error: {
            message: "Token migration failed",
          },
        });
      } catch (error) {
        app.log.error(
          { err: error },
          "Token migration failed"
        );

        return reply.status(500).send({
          success: false,
          error: {
            message: "Token migration failed",
          },
        });
      }
    }
  );
}