import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { config } from "../config"
import { OAuthService } from "../services/oauthService"
import { useAuth } from "../auth/AuthContext"

import Page from "../components/layout/Page"
import Button from "../components/ui/Button"
import Typography from "../components/ui/Typography"

export default function Welcome(): React.JSX.Element {
    const { authenticated, checkAuth } = useAuth();
    const navigate = useNavigate();

    const handleContinue = () => {
        window.api.maximizeWindow();
        navigate("/dashboard");
    };

    const handleSignIn = async () => {
        try {
            const oauthService = OAuthService.getInstance();
            const authUrl = oauthService.startOAuthFlow();
    
            window.api.startOAuth(authUrl);
        } catch (error) {
            console.error("Error starting OAuth flow:", error);
        }
    };

    useEffect(() => {
        const handleOAuthCallback = (callbackUrl: string) => {
            console.log('OAuth callback received in renderer:', callbackUrl);
            const oauthService = OAuthService.getInstance();
            oauthService.handleCallback(callbackUrl)
                .then(({ access_token, refresh_token, user_id, email }) => {
                    console.log('OAuth callback successful, storing tokens');
                    // store tokens securely
                    localStorage.setItem('access_token', access_token)
                    localStorage.setItem('refresh_token', refresh_token)
                    localStorage.setItem('user_id', user_id)
                    localStorage.setItem('email', email)

                    checkAuth();
                })
                .catch((error) => {
                    console.error("OAuth callback failed:", error);
                })
        };

        if (window.api?.onOAuthCallback) {
            console.log('Setting up OAuth callback listener');
            window.api.onOAuthCallback(handleOAuthCallback);
        }

        return () => {
            if(window.api?.removeOAuthCallback) {
                window.api.removeOAuthCallback();
            }
        }
    }, [checkAuth]);

    return (
        <Page alignment="center" showSkeleton={false}>
            <div className="flex flex-col gap-2 max-w-[50vw]">
                <Typography variant="h1">Renaissance</Typography>

                <Typography variant="muted">
                    A bower for thee. A quiet place for thought, creation, and things worth keeping.
                </Typography>

                {authenticated === null ? (
                    <div className="flex justify-start items-center gap-4 mt-5">
                        <Typography variant="muted">
                            Loading...
                        </Typography>
                    </div>
                ) : authenticated ? (
                    <div className="flex justify-start items-center gap-4 mt-5">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleContinue}
                        >
                            Continue
                        </Button>
                    </div>
                ) : (
                    <div className="flex justify-start items-center gap-4 mt-5">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSignIn}
                        >
                            Sign In
                        </Button>

                        <Button
                            variant="secondary"
                            size="sm"
                            href={config.getRenaissanceJoinURL}
                            external
                        >
                            Sign up
                        </Button>
                    </div>
                )}
            </div>
        </Page>
    );
}