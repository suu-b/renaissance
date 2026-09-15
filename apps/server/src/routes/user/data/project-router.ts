import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import path from "path";

import {
    SearchProjectRequestSchema,
    CreateProjectRequestSchema,
    UpdateProjectRequestSchema,
    DeleteProjectRequestSchema,
    ProjectHistorySchema,
    ProjectObject,
    CARResponses,
    UserObject,
    sendSuccess,
    Errors,
    sendError,
    GitCommit
} from "@renaissance/shared";

import { getUserProfile } from "../../../utils/userProfile.js";
import { DataService } from "../../../services/dataService.js";

export async function projectRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/user/data/project/search
    typedApp.post("/search", {
        schema: {
            body: SearchProjectRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { includePrivate, limit, offset, sort, filters, fields } = request.body;
            const projects = app.indexService.getAllProjects({ includePrivate });
            const result = DataService.processSearch(projects, {
                limit, offset, sort, filters, fields
            });

            return reply.status(200).send(sendSuccess({
                projects: result.items,
                total: result.total,
                limit: result.limit,
                offset: result.offset
            }));

        } catch (error) {
            console.error("Failed to search projects:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_GET_FAILED));
        }
    });

    // POST /api/v1/user/data/project/search/mine
    typedApp.post("/search/mine", {
        schema: {
            body: SearchProjectRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { includePrivate, limit, offset, sort, filters, fields } = request.body;
            const userProfile = getUserProfile();
            const projects = app.indexService.getAllProjects({
                includePrivate,
                ownerId: userProfile.id,
                contributorIds: [userProfile.id]
            });

            const result = DataService.processSearch(projects, {
                limit, offset, sort, filters, fields
            });

            return reply.status(200).send(sendSuccess({
                projects: result.items,
                total: result.total,
                limit: result.limit,
                offset: result.offset
            }));

        } catch (error) {
            console.error("Failed to search projects:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_GET_FAILED));
        }
    });

    // POST /api/v1/user/data/project/new
    typedApp.post("/new", {
        schema: {
            body: CreateProjectRequestSchema
        }
    }, async (request, reply) => {
        try {
            const { name, description, isPrivate } = request.body;
            const userProfile = getUserProfile();
            const id = randomUUID();
            const localProjectPath = path.join(app.appPaths.workspacePath, id);

            await app.vandcService.createFolder(localProjectPath);

            const projectId = app.indexService.createProject({
                id,
                name,
                description,
                isPrivate,
                path: localProjectPath,
                owner: userProfile
            });

            return reply.status(201).send(sendSuccess({ id: projectId }));

        } catch (error) {
            console.error("Failed to create project:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_GET_FAILED));
        }
    });

    // POST /api/v1/user/data/project/update
    typedApp.post("/update", {
        schema: {
            body: UpdateProjectRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { id, name, description, isPrivate } = request.body;
            const success = app.indexService.updateProject(id, {
                name,
                description,
                isPrivate
            });

            if (!success) {
                return reply.status(404).send(sendError(Errors.PROJECT_UPDATE_FAILED));
            }
            return reply.status(200).send(sendSuccess({ id }));
        } catch (error) {
            console.error("Failed to update project:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_UPDATE_FAILED));
        }
    });

    // POST /api/v1/user/data/project/history
    typedApp.post("/history", {
        schema: {
            body: ProjectHistorySchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { projectId, limit } = request.body;
            const projectPath = path.join(app.appPaths.workspacePath, projectId);
            const history: GitCommit[] = await app.vandcService.getScopedHistory(projectPath, limit);
            return reply.status(200).send(sendSuccess({ history }));
        } catch (error) {
            console.error("Failed to get scoped history:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_GET_FAILED));
        }
    });

    // POST /api/v1/user/data/project/delete
    typedApp.post("/delete", {
        schema: {
            body: DeleteProjectRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { id } = request.body as { id: string };
            
            // Get project info to find project path
            const project = app.indexService.getProjectById(id);
            if (!project) {
                return reply.status(404).send(sendError(Errors.PROJECT_NOT_FOUND));
            }

            // Delete from database
            const success = app.indexService.deleteProject(id);
            if (!success) {
                return reply.status(404).send(sendError(Errors.PROJECT_DELETE_FAILED));
            }

            // Delete the project folder and all its contents
            const projectPath = path.join(app.appPaths.workspacePath, id);
            try {
                await fs.rm(projectPath, { recursive: true, force: true });
            } catch (fileError) {
                console.error("Failed to delete project folder:", fileError);
                // Continue even if folder deletion fails, as DB is updated
            }

            return reply.status(200).send(sendSuccess({ id }));
        } catch (error) {
            console.error("Failed to delete project:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_DELETE_FAILED));
        }
    });
}