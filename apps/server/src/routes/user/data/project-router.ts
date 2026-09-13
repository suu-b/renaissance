import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

import {
    SearchProjectRequestSchema,
    CreateProjectRequestSchema,
    ProjectHistorySchema,
    ProjectObject,
    CARResponses,
    UserObject,
    sendSuccess,
    Errors,
    sendError,
    ChaptersData
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
            const fileContent = await fs.readFile(app.appPaths.indexFilePath, "utf-8");
            const records = parse(fileContent, { skip_empty_lines: true, from_line: 2 });

            let projects: ProjectObject[] = records.map((record: string[]) => {
                const [id, name, description, isPrivate, createdAt, updatedAt, owner, contributors] = record;
                const parsedOwner: UserObject = JSON.parse(owner);

                return {
                    id,
                    name,
                    description,
                    isPrivate: isPrivate === "true",
                    createdAt: new Date(createdAt),
                    updatedAt: new Date(updatedAt),
                    owner: {
                        ...parsedOwner,
                        createdAt: new Date(parsedOwner.createdAt)
                    },
                    contributors: contributors
                        ? contributors.split(";").filter(Boolean).map(contributorId => ({
                            id: contributorId,
                            username: "",
                            displayName: "",
                            avatarUrl: "",
                            email: "",
                            createdAt: new Date()
                        }))
                        : []
                };
            });

            if (!includePrivate) {
                projects = projects.filter(project => !project.isPrivate);
            }

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
            const fileContent = await fs.readFile(app.appPaths.indexFilePath, "utf-8");
            const records = parse(fileContent, { skip_empty_lines: true, from_line: 2 });

            let projects: ProjectObject[] = records.map((record: string[]) => {
                const [id, name, description, isPrivate, createdAt, updatedAt, owner, contributors] = record;
                const parsedOwner: UserObject = JSON.parse(owner);

                return {
                    id,
                    name,
                    description,
                    isPrivate: isPrivate === "true",
                    createdAt: new Date(createdAt),
                    updatedAt: new Date(updatedAt),
                    owner: {
                        ...parsedOwner,
                        createdAt: new Date(parsedOwner.createdAt)
                    },
                    contributors: contributors
                        ? contributors.split(";").filter(Boolean).map(contributorId => ({
                            id: contributorId,
                            username: "",
                            displayName: "",
                            avatarUrl: "",
                            email: "",
                            createdAt: new Date()
                        }))
                        : []
                };
            });

            projects = projects.filter(project =>
                project.owner.id === userProfile.id ||
                project.contributors.some(contributor => contributor.id === userProfile.id)
            );

            if (!includePrivate) {
                projects = projects.filter(project => !project.isPrivate);
            }

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
            const id = randomUUID();
            const now = new Date();
            const indexFilePath = app.appPaths.indexFilePath;
            const localProjectPath = path.join(app.appPaths.workspacePath, id);
            const userProfile = getUserProfile();

            const indexEntry = [
                id,
                name,
                description,
                isPrivate,
                now.toISOString(),
                now.toISOString(),
                JSON.stringify(userProfile),
                ""
            ];

            await app.vandcService.createFolder(localProjectPath);
            await fs.appendFile(indexFilePath, stringify([indexEntry]), "utf-8");

            const chaptersData: ChaptersData = {
                chaptersNumber: 0,
                chapters: []
            };

            await fs.writeFile(
                path.join(localProjectPath, "chapters.json"),
                JSON.stringify(chaptersData, null, 2),
                "utf-8"
            );

            return reply.status(201).send(sendSuccess({ id }));

        } catch (error) {
            console.error("Failed to create project:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_GET_FAILED));
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
            const history = await app.vandcService.getScopedHistory(projectPath, limit);
            return reply.status(200).send(sendSuccess({ history }));
        } catch (error) {
            console.error("Failed to get scoped history:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_GET_FAILED));
        }
    });
}