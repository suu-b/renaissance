import { z } from "zod";
import { UserSchema, SortObjectSchema, FilterObjectSchema } from "./common.js";

export const ChapterSchema = z.object({
    id: z.uuid(),
    project: z.uuid(),
    name: z.string().min(1),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});

export type ChapterObject = z.infer<typeof ChapterSchema>;

export const CreateChapterRequestSchema = z.object({
    project: z.uuid(),
    name: z.string().min(1)
});

export type CreateChapterRequestObject = z.infer<typeof CreateChapterRequestSchema>;

export const SearchChapterRequestSchema = z.object({
    project: z.uuid(),
    includePrivate: z.boolean().default(true),
    limit: z.number().int().min(1).max(100).default(25),
    offset: z.number().int().min(0).default(0),
    sort: SortObjectSchema.optional(),
    filters: z.array(FilterObjectSchema).default([]),
    fields: z.array(z.string()).default([])
});

export type SearchChapterRequestObject = z.infer<typeof SearchChapterRequestSchema>;

export const GetChapterRequestSchema = z.object({ 
    project: z.uuid(), 
    id: z.uuid() 
});

export type GetChapterRequestObject = z.infer<typeof GetChapterRequestSchema>;


export const SaveChapterRequestSchema = z.object({
    project: z.uuid(),
    id: z.uuid(),
    content: z.array(
        z.object({
            type: z.string(),
            children: z.array(
                z.object({
                    text: z.string()
                })
            )
        })
    )
});

export type SaveChapterRequest = z.infer<
    typeof SaveChapterRequestSchema
>;
