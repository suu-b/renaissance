import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

import {
    SearchChapterRequestSchema,
    CreateChapterRequestSchema,
    ChapterObject,
    CARResponses,
    sendSuccess,
    sendError,
    Errors
} from "@renaissance/shared";

import { DataService } from "../../../services/dataService.js";

export async function chapterRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/user/data/chapter/search
    typedApp.post("/search", {
        schema: {
            body: SearchChapterRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const {project: projectId, limit, offset, sort, filters, fields} = request.body;

            const workspacePath = app.appPaths.workspacePath;
            const projectPath = path.join(workspacePath, projectId);
            const chaptersFilePath = path.join(
                projectPath,
                "chapters.csv"
            );

            const fileContent = await fs.readFile(chaptersFilePath,"utf-8");

            const records = parse(fileContent, {
                skip_empty_lines: true,
                from_line: 2
            });

            const chapters: ChapterObject[] = records.map(
                (record: string[]) => {
                    const [id, name, createdAt, updatedAt] = record;

                    return {
                        id,
                        project: projectId,
                        name,                        
                        createdAt: new Date(createdAt),
                        updatedAt: new Date(updatedAt)
                    };
                }
            );

            const result = DataService.processSearch(chapters, {
                limit,
                offset,
                sort,
                filters,
                fields
            });

            return reply
                .status(200)
                .send(sendSuccess({
                    chapters: result.items,
                    total: result.total,
                    limit: result.limit,
                    offset: result.offset
                }));

        } catch (error) {
            console.error("Failed to search chapters:", error);

            return reply
                .status(500)
                .send(sendError(Errors.CHAPTER_GET_FAILED));
        }
    });

    // POST /api/v1/user/data/chapter/new
    typedApp.post("/new", {
        schema: {
            body: CreateChapterRequestSchema
        }
    }, async (request, reply) => {
        try {
            const {
                project: projectId,
                name
            } = request.body;

            const id = randomUUID();
            const createdAt = new Date();
            const updatedAt = new Date();

            const workspacePath = app.appPaths.workspacePath;
            const projectPath = path.join(
                workspacePath,
                projectId
            );
            const chaptersFilePath = path.join(
                projectPath,
                "chapters.csv"
            );
            const chapterFilePath = path.join(
                projectPath,
                `${id}.txt`
            );

            try {
                await fs.access(chaptersFilePath);
            } catch {
                const headers = [
                    "id",
                    "name",
                    "createdAt",
                    "updatedAt"
                ];

                await fs.writeFile(
                    chaptersFilePath,
                    headers.join(",") + "\n",
                    "utf-8"
                );
            }

            const indexEntry = [
                id,
                name,
                createdAt.toISOString(),
                updatedAt.toISOString()
            ];

            await fs.appendFile(
                chaptersFilePath,
                stringify([indexEntry]),
                "utf-8"
            );

            app.vandcService.createFile(
                chapterFilePath,
                "Hey",
                "utf-8"
            );

            return reply
                .status(201)
                .send(sendSuccess({ id }));

        } catch (error) {
            console.error("Failed to create chapter:", error);

            return reply
                .status(500)
                .send(sendError(Errors.CHAPTER_CREATE_FAILED));
        }
    });
}