import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

import {
    SearchChapterRequestSchema,
    CreateChapterRequestSchema,
    GetChapterRequestSchema,
    SaveChapterRequestSchema,
    ChaptersData,
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
            const { project: projectId, limit, offset, sort, filters, fields } = request.body;
            const chaptersFilePath = path.join(app.appPaths.workspacePath, projectId, "chapters.json");

            const chaptersData: ChaptersData = JSON.parse(await fs.readFile(chaptersFilePath, "utf-8"));

            const chapters: ChapterObject[] = chaptersData.chapters.map(chapter => ({
                ...chapter,
                project: projectId,
                createdAt: new Date(chapter.createdAt),
                updatedAt: new Date(chapter.updatedAt)
            }));

            const result = DataService.processSearch(chapters, {
                limit, offset, sort, filters, fields
            });

            return reply.status(200).send(sendSuccess({
                chapters: result.items,
                total: result.total,
                limit: result.limit,
                offset: result.offset
            }));
        } catch (error) {
            console.error("Failed to search chapters:", error);
            return reply.status(500).send(sendError(Errors.CHAPTER_GET_FAILED));
        }
    });

    // POST /api/v1/user/data/chapter/metadata
    typedApp.post("/metadata", {
        schema: {
            body: GetChapterRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { project: projectId, id: chapterId } = request.body;
            const chaptersFilePath = path.join(app.appPaths.workspacePath, projectId, "chapters.json");

            const chaptersData: ChaptersData = JSON.parse(await fs.readFile(chaptersFilePath, "utf-8"));
            const chapterIndex = chaptersData.chapters.findIndex(chapter => chapter.id === chapterId);

            if (chapterIndex === -1) {
                return reply.status(404).send(sendError(Errors.CHAPTER_GET_FAILED));
            }

            return reply.status(200).send(sendSuccess({
                metadata: {
                    chaptersNumber: chaptersData.chapters.length,
                    chapterNumber: chapterIndex + 1
                }
            }));
        } catch (error) {
            console.error("Failed to get chapter metadata:", error);
            return reply.status(500).send(sendError(Errors.CHAPTER_GET_FAILED));
        }
    });

    // POST /api/v1/user/data/chapter/get
    typedApp.post("/get", {
        schema: {
            body: GetChapterRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { project: projectId, id: chapterId } = request.body;
            const chapterFilePath = path.join(app.appPaths.workspacePath, projectId, `${chapterId}.json`);

            const chapterData = JSON.parse(await fs.readFile(chapterFilePath, "utf-8"));

            return reply.status(200).send(sendSuccess({
                chapter: {
                    id: chapterId,
                    project: projectId,
                    content: chapterData.content
                }
            }));
        } catch (error) {
            console.error("Failed to get chapter:", error);
            return reply.status(500).send(sendError(Errors.CHAPTER_GET_FAILED));
        }
    });

    // POST /api/v1/user/data/chapter/new
    typedApp.post("/new", {
        schema: {
            body: CreateChapterRequestSchema
        }
    }, async (request, reply) => {
        try {
            const { project: projectId, name } = request.body;
            const id = randomUUID();
            const now = new Date();

            const projectPath = path.join(app.appPaths.workspacePath, projectId);
            const chaptersFilePath = path.join(projectPath, "chapters.json");
            const chapterFilePath = path.join(projectPath, `${id}.json`);

            let chaptersData: ChaptersData;

            try {
                chaptersData = JSON.parse(await fs.readFile(chaptersFilePath, "utf-8"));
            } catch {
                chaptersData = { chaptersNumber: 0, chapters: [] };
            }

            const newChapter: ChapterObject = {
                id,
                project: projectId,
                name,
                createdAt: now,
                updatedAt: now
            };

            chaptersData.chapters.push(newChapter);
            chaptersData.chaptersNumber = chaptersData.chapters.length;

            await fs.writeFile(
                chaptersFilePath,
                JSON.stringify(chaptersData, null, 2),
                "utf-8"
            );

            const initialContent = {
                id,
                content: [{
                    type: "paragraph",
                    children: [{ text: "Hey Boy, start writing from here..." }]
                }]
            };

            await app.vandcService.createFile(
                chapterFilePath,
                JSON.stringify(initialContent, null, 2),
                "utf-8"
            );

            return reply.status(201).send(sendSuccess({ id }));
        } catch (error) {
            console.error("Failed to create chapter:", error);
            return reply.status(500).send(sendError(Errors.CHAPTER_CREATE_FAILED));
        }
    });

    // POST /api/v1/user/data/chapter/save
    typedApp.post("/save", {
        schema: {
            body: SaveChapterRequestSchema,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { project: projectId, id: chapterId, content } = request.body;
            const chapterFilePath = path.join(app.appPaths.workspacePath, projectId, `${chapterId}.json`);

            await app.vandcService.scopedSaved(
                chapterFilePath,
                JSON.stringify({ id: chapterId, content }, null, 2),
                "utf-8"
            );

            return reply.status(200).send(sendSuccess({ id: chapterId }));
        } catch (error) {
            console.error("Failed to save chapter:", error);
            return reply.status(500).send(sendError(Errors.CHAPTER_SAVE_FAILED));
        }
    });
}
