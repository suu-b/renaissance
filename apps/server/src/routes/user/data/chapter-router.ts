import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import path from "path";

import {
    SearchChapterRequestSchema,
    CreateChapterRequestSchema,
    UpdateChapterRequestSchema,
    GetChapterRequestSchema,
    SaveChapterRequestSchema,
    DeleteChapterRequestSchema,
    BulkDeleteChapterRequestSchema,
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
            const chapters = app.indexService.getChaptersByProjectId(projectId);

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
            const chapterNumber = app.indexService.getChapterNumber(chapterId);
            const chaptersCount = app.indexService.getChaptersCount(projectId);

            if (chapterNumber === null) {
                return reply.status(404).send(sendError(Errors.CHAPTER_GET_FAILED));
            }

            return reply.status(200).send(sendSuccess({
                metadata: {
                    chaptersNumber: chaptersCount,
                    chapterNumber: chapterNumber
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
            const chapterId = app.indexService.createChapter({
                id,
                projectId,
                name
            });

            const projectPath = path.join(app.appPaths.workspacePath, projectId);
            const chapterFilePath = path.join(projectPath, `${chapterId}.json`);
            const initialContent = {
                id: chapterId,
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
            return reply.status(201).send(sendSuccess({ id: chapterId }));
        } catch (error) {
            console.error("Failed to create chapter:", error);
            return reply.status(500).send(sendError(Errors.CHAPTER_CREATE_FAILED));
        }
    });

    // POST /api/v1/user/data/chapter/update
    typedApp.post("/update", {
        schema: {
            body: UpdateChapterRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { id, name } = request.body;
            if (!name) {
                return reply.status(400).send(sendError(Errors.CHAPTER_UPDATE_FAILED));
            }
            const success = app.indexService.updateChapter(id, name);
            if (!success) {
                return reply.status(404).send(sendError(Errors.CHAPTER_UPDATE_FAILED));
            }
            return reply.status(200).send(sendSuccess({ id }));
        } catch (error) {
            console.error("Failed to update chapter:", error);
            return reply.status(500).send(sendError(Errors.CHAPTER_UPDATE_FAILED));
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
            const { project: projectId, id: chapterId, content, message } = request.body;
            const chapterFilePath = path.join(app.appPaths.workspacePath, projectId, `${chapterId}.json`);

            await app.vandcService.scopedSaved(
                chapterFilePath,
                JSON.stringify({ id: chapterId, content }, null, 2),
                message || `Update chapter ${chapterId}`,
                "utf-8"
            );

            return reply.status(200).send(sendSuccess({ id: chapterId }));
        } catch (error) {
            console.error("Failed to save chapter:", error);
            return reply.status(500).send(sendError(Errors.CHAPTER_SAVE_FAILED));
        }
    });

    // POST /api/v1/user/data/chapter/delete
    typedApp.post("/delete", {
        schema: {
            body: DeleteChapterRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { id } = request.body as { id: string };
            
            // Get chapter info to find project ID
            const chapter = app.indexService.getChapterById(id);
            if (!chapter) {
                return reply.status(404).send(sendError(Errors.CHAPTER_NOT_FOUND));
            }

            // Delete from database
            const success = app.indexService.deleteChapter(id);
            if (!success) {
                return reply.status(404).send(sendError(Errors.CHAPTER_DELETE_FAILED));
            }

            // Delete the chapter file
            const chapterFilePath = path.join(app.appPaths.workspacePath, chapter.project, `${id}.json`);
            try {
                await fs.unlink(chapterFilePath);
            } catch (fileError) {
                console.error("Failed to delete chapter file:", fileError);
                // Continue even if file deletion fails, as DB is updated
            }

            return reply.status(200).send(sendSuccess({ id }));
        } catch (error) {
            console.error("Failed to delete chapter:", error);
            return reply.status(500).send(sendError(Errors.CHAPTER_DELETE_FAILED));
        }
    });

    // POST /api/v1/user/data/chapter/bulk-delete
    typedApp.post("/bulk-delete", {
        schema: {
            body: BulkDeleteChapterRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { ids } = request.body as { ids: string[] };
            const deletedIds: string[] = [];
            const failedIds: string[] = [];

            for (const id of ids) {
                try {
                    // Get chapter info to find project ID
                    const chapter = app.indexService.getChapterById(id);
                    if (!chapter) {
                        failedIds.push(id);
                        continue;
                    }

                    // Delete from database
                    const success = app.indexService.deleteChapter(id);
                    if (!success) {
                        failedIds.push(id);
                        continue;
                    }

                    // Delete the chapter file
                    const chapterFilePath = path.join(app.appPaths.workspacePath, chapter.project, `${id}.json`);
                    try {
                        await fs.unlink(chapterFilePath);
                    } catch (fileError) {
                        console.error("Failed to delete chapter file:", fileError);
                        // Continue even if file deletion fails, as DB is updated
                    }

                    deletedIds.push(id);
                } catch (error) {
                    console.error("Failed to delete chapter:", id, error);
                    failedIds.push(id);
                }
            }

            return reply.status(200).send(sendSuccess({
                deletedIds,
                failedIds,
                totalRequested: ids.length,
                totalDeleted: deletedIds.length
            }));
        } catch (error) {
            console.error("Failed to bulk delete chapters:", error);
            return reply.status(500).send(sendError(Errors.CHAPTER_DELETE_FAILED));
        }
    });
}
