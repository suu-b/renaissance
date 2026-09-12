import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { getCurrentUser } from "../api/authClient";
import { OAuthService } from "../services/oauthService";
import { config } from "../config";
import { AuthContextType, AuthProviderProps, UserProfile } from "../types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            // Check if we have stored email from previous session
            const storedEmail = localStorage.getItem('user_email');
            if (storedEmail) {
                setEmail(storedEmail);
                
                // Check auth status via local server
                const oauthService = OAuthService.getInstance();
                const isAuth = await oauthService.checkAuthStatus(storedEmail);
                setAuthenticated(isAuth);

                if (isAuth) {
                    const user = await getCurrentUser();
                    setUser(user);
                }
            } else {
                setAuthenticated(false);
            }

            console.log("Authenticated:", authenticated);
            console.log("user:", user);
        } catch (error) {
            console.error("Authentication check failed:", error);
            setAuthenticated(false);
        }
    }

    async function setAuthenticatedUser(newEmail: string) {
        setEmail(newEmail);
        localStorage.setItem('user_email', newEmail);
        setAuthenticated(true);
        
        // Check if we need to migrate tokens from localStorage
        const oldAccessToken = localStorage.getItem('access_token');
        const oldRefreshToken = localStorage.getItem('refresh_token');
        const oldUserId = localStorage.getItem('user_id');
        
        if (oldAccessToken && oldRefreshToken && oldUserId && config.serverUrl) {
            try {
                await fetch(`${config.serverUrl}/api/v1/user/auth/migrate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: newEmail,
                        access_token: oldAccessToken,
                        refresh_token: oldRefreshToken,
                        user_id: oldUserId,
                    }),
                });
                
                // Clear old localStorage tokens after successful migration
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_id');
                console.log('Tokens migrated from localStorage to keytar');
            } catch (error) {
                console.error('Failed to migrate tokens from localStorage:', error);
            }
        }
        
        try {
            const user = await getCurrentUser();
            setUser(user);
        } catch (error) {
            console.error("Failed to get user after authentication:", error);
        }
    }

    async function logout() {
        if (email) {
            const oauthService = OAuthService.getInstance();
            await oauthService.logout(email);
        }
        
        setEmail(null);
        localStorage.removeItem('user_email');
        setAuthenticated(false);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ authenticated, user, checkAuth, setAuthenticatedUser, logout, email }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}