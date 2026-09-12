import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FiPlus } from "react-icons/fi"
import Page from "../components/layout/Page";
import Typography from "../components/ui/Typography";
import ChapterList from "../components/common/ChapterList";
import SearchBar from "../components/ui/SearchBar";
import BackLink from "../components/ui/BackLink";
import Contributions from "../components/common/Contributions";
import Stream from "../components/common/Stream";
import ToolKit from "../components/common/ToolKit";
import Button from "../components/ui/Button";
import { ProjectSchema, type ProjectObject, type ChapterObject } from "@renaissance/shared";
import { config } from "../config";

export default function Project() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [project, setProject] = useState<ProjectObject | null>(null)
    const [chapters, setChapters] = useState<ChapterObject[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProject = async () => {
            try {
                if (!config.serverUrl) {
                    console.error("Server URL is not configured");
                    setLoading(false);
                    return;
                }

                if (!id) {
                    setLoading(false);
                    return;
                }

                const projectResponse = await fetch(`${config.serverUrl}/api/v1/user/data/project/search/mine`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        filters: [{ field: "id", operator: "eq", value: id }],
                        limit: 1
                    }),
                });

                if (!projectResponse.ok) throw new Error(`Failed to fetch project: ${projectResponse.status}`);

                const projectResult = await projectResponse.json();
                const projectsData = projectResult.data?.projects || projectResult.projects || [];

                if (projectsData.length > 0) setProject(ProjectSchema.parse(projectsData[0]));

                const chapterResponse = await fetch(`${config.serverUrl}/api/v1/user/data/chapter/search`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ project: id, limit: 100, offset: 0 }),
                });

                if (!chapterResponse.ok) throw new Error(`Failed to fetch chapters: ${chapterResponse.status}`);

                const chapterResult = await chapterResponse.json();
                const chaptersData = chapterResult.data?.chapters || chapterResult.chapters || [];

                setChapters(chaptersData);
            } catch (error) {
                console.error("Failed to fetch project data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id])

    const handleDelete = () => {
        console.log("Delete project", id)
        // Add actual delete logic here
    }

    return (
        <Page alignment="default" className="flex gap-4">
            <div className="mx-auto w-[60vw]">
                <div className="mb-6 flex justify-between items-start">
                    <div><BackLink fallbackPath="/dashboard" /></div>
                    <ToolKit size="sm" confirm={true} confirmTitle="Delete Project" confirmContent="Are you sure you want to delete this project? This action cannot be undone." onDelete={handleDelete} />
                </div>

                <Typography variant="h1" className="my-6">
                    {loading ? "Loading..." : project?.name || `Project ${id}`}
                </Typography>

                <div className="flex items-center gap-2 mb-4">
                    <SearchBar placeholder="Search chapters..." size="md" onChange={() => console.log("Search chapters")} className="flex-1" />
                    <Button variant="primary" size="md" onClick={() => navigate(`/project/${id}/new-chapter`)}>
                        <FiPlus /> New Chapter
                    </Button>
                </div>

                <ChapterList size="md" itemsPerPage={5} projectId={id} chapters={chapters} />
            </div>

            <div className="mx-auto w-[25vw]">
                <div className="mb-4 p-4 rounded-lg border border-foreground/10 bg-gradient-to-br from-gray-50 to-white">
                    <Typography variant="h4" className="mb-3">Project Details</Typography>

                    <div className="flex flex-col gap-2">
                        <Typography variant="muted" className="text-muted-foreground">
                            Owner: <span className="text-foreground font-semibold">{project?.owner.displayName || "Unknown"}</span>
                        </Typography>
                        <Typography variant="muted" className="text-muted-foreground">
                            Created: <span className="text-foreground font-semibold">{project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : "Unknown"}</span>
                        </Typography>
                        <Typography variant="muted" className="text-muted-foreground">
                            Last Updated: <span className="text-foreground font-semibold">{project?.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "Unknown"}</span>
                        </Typography>
                        <Typography variant="muted" className="text-muted-foreground">
                            Status: <span className="text-foreground font-semibold">{project?.isPrivate ? "Private" : "Public"}</span>
                        </Typography>
                        <Typography variant="muted" className="text-muted-foreground">
                            Contributors: <span className="text-foreground font-semibold">{project?.contributors?.length || 0}</span>
                        </Typography>
                        <Typography variant="muted" className="text-muted-foreground">
                            Chapters: <span className="text-foreground font-semibold">{chapters.length}</span>
                        </Typography>
                    </div>

                    <div className="mt-4 pt-4 border-t border-foreground/10">
                        <Typography variant="h4" className="mb-2">Description</Typography>
                        <Typography variant="p" className="text-sm text-muted-foreground leading-relaxed">
                            {project?.description || "No description available."}
                        </Typography>
                    </div>
                </div>

                <Stream contributions={[]} className="mb-4" />

                <Contributions contributors={project?.contributors?.map((c, index) => ({
                    id: parseInt(c.id.replace(/-/g, '').substring(0, 8), 16) || index,
                    name: c.displayName,
                    avatar: c.avatarUrl
                })) || []} />
            </div>
        </Page>
    )
}
