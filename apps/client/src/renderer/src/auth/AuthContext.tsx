import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { getCurrentUser } from "../api/authClient";
import { OAuthService } from "../services/oauthService";
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

                // Check auth status via local server session check
                const oauthService = OAuthService.getInstance();
                const isAuth = await oauthService.checkAuthStatus(storedEmail);
                setAuthenticated(isAuth);

                if (isAuth) {
                    const user = await getCurrentUser();
                    setUser(user);
                    console.log("Authenticated:", true);
                    console.log("user:", user);
                } else {
                    // If not authenticated, clear the stored email and user data
                    // This handles the "not_logged_in" state
                    localStorage.removeItem('user_email');
                    setEmail(null);
                    setUser(null);
                    console.log("Authenticated:", false);
                }
            } else {
                setAuthenticated(false);
                console.log("Authenticated:", false);
            }
        } catch (error) {
            console.error("Authentication check failed:", error);
            // On error, treat as not authenticated
            setAuthenticated(false);
            localStorage.removeItem('user_email');
            setEmail(null);
            setUser(null);
        }
    }

    async function setAuthenticatedUser(newEmail: string) {
        // Store the email and run the full authentication check
        localStorage.setItem('user_email', newEmail);
        await checkAuth();
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