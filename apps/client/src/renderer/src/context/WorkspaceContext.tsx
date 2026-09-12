import {
    createContext,
    useContext, 
    useState,   
} from "react";

import { WorkspaceContextType, WorkspaceProviderProps } from "../types/workspace";

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
    const [workspacePath, setWorkspacePath] = useState<string | null>(null);
    const [indexFilePath, setIndexFilePath] = useState<string | null>(null);

    return (
        <WorkspaceContext.Provider value={{ workspacePath, setWorkspacePath, indexFilePath, setIndexFilePath}}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);

    if (!context) {
        throw new Error("useWorkspace must be used inside WorkspaceProvider");
    }

    return context;
}