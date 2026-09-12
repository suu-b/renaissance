import React, { useEffect, useState } from "react";
import Page from "../components/layout/Page";
import ProjectList from "../components/common/ProjectList";
import Typography from "../components/ui/Typography";

import {
    ProjectSchema,
    type ProjectObject,
} from "@renaissance/shared";
import { config } from "../config";

export default function Projects(): React.JSX.Element {
    const [projects, setProjects] = useState<ProjectObject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(
                    `${config.serverUrl}/api/v1/user/data/project/search/mine`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({}),
                    }
                );
                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch projects: ${response.status}`
                    );
                }
                const result = await response.json();
                const parsedProjects = ProjectSchema
                    .array()
                    .parse(result.data);
                setProjects(parsedProjects);
            } catch (error) {
                console.error("Failed to fetch projects:", error);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <Page alignment="default">
            <div className="flex flex-col gap-4">
                <div className="mb-6">
                    <Typography variant="h1" className="mb-2">
                        Projects
                    </Typography>

                    <Typography variant="muted">
                        All projects in the workspace
                    </Typography>
                </div>

                <div className="flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Typography
                                variant="muted"
                                className="text-muted-foreground text-sm"
                            >
                                Loading projects...
                            </Typography>
                        </div>
                    ) : (
                        <>
                            <ProjectList
                                size="md"
                                itemsPerPage={10}
                                projects={projects}
                            />

                            <div className="mt-4 text-sm text-muted-foreground">
                                Showing {projects.length} projects
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Page>
    );
}