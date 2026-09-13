import { Outlet, useParams } from "react-router-dom"
import { ProjectProvider } from "../context/ProjectContext"

export default function ProjectLayout() {
    const { projectId } = useParams<{ projectId: string }>()

    return (
        <ProjectProvider projectId={projectId || null}>
            <Outlet />
        </ProjectProvider>
    )
}