import { useParams } from "react-router-dom"
import Page from "@renderer/components/layout/Page";
import Typography from "@renderer/components/ui/Typography";
import ChapterList from "@renderer/components/common/ChapterList";
import SearchBar from "@renderer/components/ui/SearchBar";
import BackLink from "@renderer/components/ui/BackLink";
import Contributions from "@renderer/components/common/Contributions";
import Stream from "@renderer/components/common/Stream";
import ToolKit from "@renderer/components/common/ToolKit";

export default function Project() {
    const { id } = useParams<{ id: string }>()

    const handleDelete = () => {
        console.log("Delete project", id)
        // Add actual delete logic here
    }
    
    // Sample contributors data - this would come from the parent/API in real usage
    const contributors = [
        { id: 1, name: "Shubham" },
        { id: 2, name: "Alice" },
        { id: 3, name: "Bob" },
        { id: 4, name: "Charlie" },
        { id: 5, name: "Diana" },
        { id: 6, name: "Eve" },
        { id: 7, name: "Frank" },
        { id: 8, name: "Grace" },
    ]
    
    // Sample stream/contribution data
    const streamData = [
        { id: 1, name: "Shubham", message: "Add chapter 3", time: "2 hrs ago" },
        { id: 2, name: "Alice", message: "Fixed typo in chapter 1", time: "4 hrs ago" },
        { id: 3, name: "Bob", message: "Added new section to chapter 2", time: "1 day ago" },
        { id: 4, name: "Charlie", message: "Updated project description", time: "2 days ago" },
    ]
    
    return(
        <Page alignment="default" className="flex gap-4">
            <div className="mx-auto w-[60vw]">
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <BackLink fallbackPath="/dashboard" />
                    </div>
                    <ToolKit
                        size="sm"
                        confirm={true}
                        confirmTitle="Delete Project"
                        confirmContent="Are you sure you want to delete this project? This action cannot be undone."
                        onDelete={handleDelete}
                    />
                </div>
                <Typography variant="h1" className="my-6">Project {id}</Typography>
                
                <SearchBar
                    placeholder="Search chapters..."
                    size="md"
                    onChange={() => console.log("Search chapters")}
                    className="mb-4"
                />
                <ChapterList size="md" itemsPerPage={5} projectId={id} />
            </div>
            <div className="mx-auto w-[25vw]">
                <div className="mb-4 p-4 rounded-lg border border-foreground/10 bg-gradient-to-br from-gray-50 to-white">
                    <Typography variant="h4" className="mb-3">Project Details</Typography>
                    <div className="flex flex-col gap-2">
                        <Typography variant="muted" className="text-muted-foreground">
                            Owner: <span className="text-foreground font-semibold">Shubham</span>
                        </Typography>
                        <Typography variant="muted" className="text-muted-foreground">
                            Created: <span className="text-foreground font-semibold">2 weeks ago</span>
                        </Typography>
                        <Typography variant="muted" className="text-muted-foreground">
                            Chapters: <span className="text-foreground font-semibold">20</span>
                        </Typography>
                    </div>
                    <div className="mt-4 pt-4 border-t border-foreground/10">
                        <Typography variant="h4" className="mb-2">Description</Typography>
                        <Typography variant="p" className="text-sm text-muted-foreground leading-relaxed">
                            Project description comes here. This is a placeholder description that provides an overview of the project.
                        </Typography>
                    </div>
                </div>
                <Stream contributions={streamData} className="mb-4"/>
                <Contributions contributors={contributors} />
            </div>
        </Page>
    )
}