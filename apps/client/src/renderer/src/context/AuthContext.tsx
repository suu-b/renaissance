import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

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
        username: "Guest",
        displayName: "Guest",
        avatarUrl: `https://picsum.photos/seed/${guestId}/200/200`,
        email: "guest@local.pc",
        createdAt: new Date().toISOString(),
    };
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        // OAuth removed - always treat as guest
        setAuthenticated(false);
        setUser(null);
        setEmail(null);
        persistUserProfile(buildGuestProfile());
    }, []);

    async function checkAuth() {
        // OAuth removed - no-op
    }

    async function setAuthenticatedUser(_newEmail: string) {
        // OAuth removed - no-op
    }

    async function logout() {
        // OAuth removed - just reset to guest
        setAuthenticated(false);
        setUser(null);
        setEmail(null);
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
