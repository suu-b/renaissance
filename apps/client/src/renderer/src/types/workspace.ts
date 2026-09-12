import { ReactNode } from "react";

// Types
export type WorkspaceContextType = {
    workspacePath: string | null;
    setWorkspacePath: (path: string | null) => void;
    indexFilePath: string | null;
    setIndexFilePath: (path: string | null) => void;
};

export type WorkspaceProviderProps = {
    children: ReactNode;
};