import { z } from "zod";
import { UserSchema, SortObjectSchema, FilterObjectSchema } from "./common.js";

export const ChapterSchema = z.object({
    id: z.uuid(),
    project: z.uuid(),
    name: z.string().min(1),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    branchId: z.string()
});

export type ChapterObject = z.infer<typeof ChapterSchema>;

export const CreateChapterRequestSchema = z.object({
    project: z.uuid(),
    name: z.string().min(1),
    branchId: z.uuid().optional()
});

export type CreateChapterRequestObject = z.infer<typeof CreateChapterRequestSchema>;

export const UpdateChapterRequestSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1).optional()
});

export type UpdateChapterRequestObject = z.infer<typeof UpdateChapterRequestSchema>;

export const SearchChapterRequestSchema = z.object({
  project: z.uuid(),
  includePrivate: z.boolean().default(true),
  limit: z.number().int().min(1).max(100).default(25),
  offset: z.number().int().min(0).default(0),
  sort: SortObjectSchema.optional(),
  filters: z.array(FilterObjectSchema).default([]),
  fields: z.array(z.string()).default([]),
  branch: z.uuid()
});

export type SearchChapterRequestObject = z.infer<typeof SearchChapterRequestSchema>;

export const GetChapterRequestSchema = z.object({
    project: z.uuid(),
    id: z.uuid()
});

export type GetChapterRequestObject = z.infer<typeof GetChapterRequestSchema>;

export const ChapterContentSchema = z.object({
    id: z.uuid(),
    project: z.uuid(),
    name: z.string(),
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

export type ChapterContentObject = z.infer<typeof ChapterContentSchema>;


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
    ),
    message: z.string().default(`Update chapter`),
    branchId: z.uuid().optional()
});

export type SaveChapterRequest = z.infer<
    typeof SaveChapterRequestSchema
>;


export const DeleteChapterRequestSchema = z.object({
    id: z.uuid()
});



export type DeleteChapterRequestObject = z.infer<typeof DeleteChapterRequestSchema>;

export const BulkDeleteChapterRequestSchema = z.object({
    ids: z.array(z.uuid()).min(1)
});

export type BulkDeleteChapterRequestObject = z.infer<typeof BulkDeleteChapterRequestSchema>;

export interface ChaptersData {
    chaptersNumber: number;
    chapters: ChapterObject[];
}
