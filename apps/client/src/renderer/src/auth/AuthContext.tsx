import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { getAuthStatus, getCurrentUser } from "../api/auth_client";
import { AuthContextType, AuthProviderProps, UserProfile } from "../types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const authenticated = await getAuthStatus();
            setAuthenticated(authenticated);

            if(authenticated) {
                const user = await getCurrentUser();
                setUser(user);
            }

            console.log("Authenticated:", authenticated);
            console.log("user:", user);
        } catch (error) {
            console.error("Authentication check failed:", error);
            setAuthenticated(false);
        }
    }

    return (
        <AuthContext.Provider value={{ authenticated, user }}>
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