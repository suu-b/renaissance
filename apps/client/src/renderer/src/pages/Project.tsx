import { useNavigate } from "react-router-dom"
import { FiPlus } from "react-icons/fi"
import Page from "../components/layout/Page"
import Typography from "../components/ui/Typography"
import ChapterList from "../components/common/ChapterList"
import SearchBar from "../components/ui/SearchBar"
import BackLink from "../components/ui/BackLink"
import Contributions from "../components/common/Contributions"
import Stream from "../components/common/Stream"
import ToolKit from "../components/common/ToolKit"
import Button from "../components/ui/Button"
import { useProject } from "../context/ProjectContext"

import Veil from "../components/ui/Veil"

export default function Project() {
    const navigate = useNavigate()
    const { project, chapters, loading, history, historyLoading } = useProject()

    const handleDelete = () => {
        console.log("Delete project", project?.id)
        // Add actual delete logic here
    }

    return (
        <Page alignment="default" className="flex gap-4">
            <div className="mx-auto w-[60vw]">
                <div className="mb-6 flex justify-between items-start">
                    <div><BackLink fallbackPath="/dashboard" /></div>

                    <ToolKit
                        size="sm"
                        confirm={true}
                        confirmTitle="Delete Project"
                        confirmContent="Are you sure you want to delete this project? This action cannot be undone."
                        onDelete={handleDelete}
                    />
                </div>

                <Typography variant="h1" className="my-6">
                    {loading ? "Loading..." : project?.name || `Project ${project?.id}`}
                </Typography>

                <div className="flex items-center gap-2 mb-4">
                    <SearchBar
                        placeholder="Search chapters..."
                        size="md"
                        onChange={() => console.log("Search chapters")}
                        className="flex-1"
                    />

                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate(`/project/${project?.id}/new-chapter`)}
                    >
                        <FiPlus /> New Chapter
                    </Button>
                </div>

                <ChapterList
                    size="md"
                    itemsPerPage={5}
                    projectId={project?.id}
                    chapters={chapters}
                />
            </div>

            <div className="mx-auto w-[25vw]">
                <div className="mb-4 p-4 rounded-lg border border-foreground/10 bg-gradient-to-br from-gray-50 to-white">
                    <Typography variant="h4" className="mb-3">
                        Project Details
                    </Typography>

                    <div className="flex flex-col gap-2">
                        <Typography variant="muted" className="text-muted-foreground">
                            Owner:{" "}
                            <span className="text-foreground font-semibold">
                                {project?.owner.displayName || "Unknown"}
                            </span>
                        </Typography>

                        <Typography variant="muted" className="text-muted-foreground">
                            Created:{" "}
                            <span className="text-foreground font-semibold">
                                {project?.createdAt
                                    ? new Date(project.createdAt).toLocaleDateString()
                                    : "Unknown"}
                            </span>
                        </Typography>

                        <Typography variant="muted" className="text-muted-foreground">
                            Last Updated:{" "}
                            <span className="text-foreground font-semibold">
                                {project?.updatedAt
                                    ? new Date(project.updatedAt).toLocaleDateString()
                                    : "Unknown"}
                            </span>
                        </Typography>

                        <Typography variant="muted" className="text-muted-foreground">
                            Status:{" "}
                            <span className="text-foreground font-semibold">
                                {project?.isPrivate ? "Private" : "Public"}
                            </span>
                        </Typography>
                            <Typography variant="muted" className="text-muted-foreground">
                                Contributors:{" "}
                                <span className="text-foreground font-semibold">
                                    {project?.contributors?.length || 0}
                                </span>
                            </Typography>                  

                        <Typography variant="muted" className="text-muted-foreground">
                            Chapters:{" "}
                            <span className="text-foreground font-semibold">
                                {chapters.length}
                            </span>
                        </Typography>
                    </div>

                    <div className="mt-4 pt-4 border-t border-foreground/10">
                        <Typography variant="h4" className="mb-2">
                            Description
                        </Typography>

                        <Typography
                            variant="p"
                            className="text-sm text-muted-foreground leading-relaxed"
                        >
                            {project?.description || "No description available."}
                        </Typography>
                    </div>
                </div>

                <Stream history={history} className="mb-4" />

                <Veil className="rounded-lg">
                <Contributions
                    contributors={
                        project?.contributors?.map((c, index) => ({
                            id:
                                parseInt(
                                    c.id.replace(/-/g, "").substring(0, 8),
                                    16
                                ) || index,
                            name: c.displayName,
                            avatar: c.avatarUrl
                        })) || []
                    }
                />
                </Veil>
            </div>
        </Page>
    )
}
