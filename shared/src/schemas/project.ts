import { z } from "zod";
import { UserSchema, SortObjectSchema, FilterObjectSchema } from "./common.js";

export const ProjectSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1),
    description: z.string(),
    isPrivate: z.boolean(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
    authors: z.array(UserSchema)
});

export type ProjectObject = z.infer<typeof ProjectSchema>;

export const SearchProjectRequestSchema = z.object({
    includePrivate: z.boolean().default(true),
    limit: z.number().int().min(1).max(100).default(25),
    offset: z.number().int().min(0).default(0),
    sort: SortObjectSchema.optional(),
    filters: z.array(FilterObjectSchema).default([]),
    fields: z.array(z.string()).default([])
});

export type SearchProjectRequestObject = z.infer<typeof SearchProjectRequestSchema>;

export const GlobalSearchProjectRequestSchema = SearchProjectRequestSchema.extend({
    includeUserProjects: z.boolean().default(false)
});

export type GlobalSearchProjectRequestObject = z.infer<typeof GlobalSearchProjectRequestSchema>;

export const CreateProjectRequestSchema = z.object({
    name: z.string().min(1),
    description: z.string().default(""),
    isPrivate: z.boolean().default(true)
});

export type CreateProjectRequestObject = z.infer<typeof CreateProjectRequestSchema>;
