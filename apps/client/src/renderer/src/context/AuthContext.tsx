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

async function persistUserProfile(profile: object): Promise<void> {
    try {
        await window.api.saveUserProfile(profile);
    } catch (err) {
        console.error("Failed to persist user profile:", err);
    }
}

function buildGuestProfile() {
    let guestId = localStorage.getItem("guest_id");
    if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem("guest_id", guestId);
    }

    return {
        id: guestId,
        username: "user",
        displayName: "User",
        avatarUrl: `https://picsum.photos/seed/${guestId}/200/200`,
        email: "guest@local.pc",
        createdAt: new Date().toISOString(),
    };
}

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

                    // Persist the real user profile
                    await persistUserProfile({
                        id: user.id || crypto.randomUUID(),
                        username: user.username,
                        displayName: user.name,
                        avatarUrl: user.avatar ?? `https://picsum.photos/seed/${user.id}/200/200`,
                        email: user.email,
                        createdAt: new Date().toISOString(),
                    });
                } else {
                    // If not authenticated, clear the stored email and user data
                    // This handles the "not_logged_in" state
                    localStorage.removeItem('user_email');
                    setEmail(null);
                    setUser(null);
                    console.log("Authenticated:", false);

                    // Persist guest profile
                    await persistUserProfile(buildGuestProfile());
                }
            } else {
                setAuthenticated(false);
                console.log("Authenticated:", false);

                // Persist guest profile for users entering without an account
                await persistUserProfile(buildGuestProfile());
            }
        } catch (error) {
            console.error("Authentication check failed:", error);
            // On error, treat as not authenticated
            setAuthenticated(false);
            localStorage.removeItem('user_email');
            setEmail(null);
            setUser(null);

            // Still persist a guest profile so user.json always exists
            await persistUserProfile(buildGuestProfile());
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

        // On logout, write a guest profile
        await persistUserProfile(buildGuestProfile());
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