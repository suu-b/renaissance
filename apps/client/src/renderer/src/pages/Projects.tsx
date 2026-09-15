import React, { useEffect, useState } from "react";
import Page from "../components/layout/Page";
import ProjectList from "../components/common/ProjectList";
import Typography from "../components/ui/Typography";
import Modal from "../components/ui/Modal";

import {
    ProjectSchema,
    type ProjectObject,
} from "@renaissance/shared";
import { config } from "../config";
import { useNavigate } from "react-router-dom";

export default function Projects(): React.JSX.Element {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<ProjectObject[]>([]);
    const [totalProjects, setTotalProjects] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [projectsToDelete, setProjectsToDelete] = useState<string[]>([]);

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
                const projectsData = result.data?.projects || result.projects || [];
                const totalCount = result.data?.total || result.total || projectsData.length;
                const parsedProjects = ProjectSchema
                    .array()
                    .parse(projectsData);
                setProjects(parsedProjects);
                setTotalProjects(totalCount);
            } catch (error) {
                console.error("Failed to fetch projects:", error);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleDeleteProject = async (projectId: string) => {
        try {
            const response = await fetch(
                `${config.serverUrl}/api/v1/user/data/project/delete`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: projectId })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error?.message ||
                    result.error ||
                    `Failed to delete project: ${response.status}`
                );
            }

            // Remove the deleted project from the list
            setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
            setTotalProjects(prev => prev - 1);
            setSuccess("Project deleted successfully");
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error("Failed to delete project:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete project"
            );
            
            // Clear error message after 3 seconds
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleBulkDeleteProjects = async (projectIds: string[]) => {
        try {
            // Delete projects one by one
            for (const projectId of projectIds) {
                const response = await fetch(
                    `${config.serverUrl}/api/v1/user/data/project/delete`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: projectId })
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error?.message ||
                        result.error ||
                        `Failed to delete project: ${response.status}`
                    );
                }
            }

            // Remove the deleted projects from the list
            setProjects(prevProjects => prevProjects.filter(p => !projectIds.includes(p.id)));
            setTotalProjects(prev => prev - projectIds.length);
            setSuccess(`Successfully deleted ${projectIds.length} projects`);
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error("Failed to bulk delete projects:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete projects"
            );
            
            // Clear error message after 3 seconds
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleBulkDeleteProjectsWithConfirm = (projectIds: string[]) => {
        if (projectIds.length === 0) return
        setProjectsToDelete(projectIds)
        setShowDeleteConfirm(true)
    }

    const confirmBulkDelete = async () => {
        setShowDeleteConfirm(false)
        await handleBulkDeleteProjects(projectsToDelete)
        setProjectsToDelete([])
    }

    const cancelBulkDelete = () => {
        setShowDeleteConfirm(false)
        setProjectsToDelete([])
    }

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

                    {success && (
                        <div className="mt-2 text-sm text-green-600">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="mt-2 text-sm text-red-600">
                            {error}
                        </div>
                    )}
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
                                onDelete={handleDeleteProject}
                                onBulkDelete={handleBulkDeleteProjectsWithConfirm}
                            />

                            <div className="mt-4 text-sm text-muted-foreground">
                                Showing {projects.length} of {totalProjects} projects
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Modal
                isOpen={showDeleteConfirm}
                title="Delete Projects"
                content={`Are you sure you want to delete ${projectsToDelete.length} project${projectsToDelete.length > 1 ? 's' : ''}? This action cannot be undone.`}
                onConfirm={confirmBulkDelete}
                onCancel={cancelBulkDelete}
            />
        </Page>
    );
}