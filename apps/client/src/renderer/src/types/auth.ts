import { ReactNode } from "react";

// Types
export type UserProfile = {
    id: string;
    username: string;
    name: string;
    email: string;
    location: string;
    projectCount: number;
    avatar?: string;
}

export type AuthContextType = {
    authenticated: boolean | null;

    // data only authenticated user has
    user: UserProfile | null;
    email: string | null;
    checkAuth: () => Promise<void>;
    setAuthenticatedUser: (email: string) => Promise<void>;
    logout: () => Promise<void>;
};

export type AuthProviderProps = {
    children: ReactNode;
};