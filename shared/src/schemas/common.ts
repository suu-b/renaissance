import { z } from "zod";

export const UserSchema = z.object({
    id: z.uuid(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.url()
});

export type UserObject = z.infer<typeof UserSchema>;

export const ErrorObjectSchema = z.object({
    code: z.string(),
    message: z.string()
});

export type ErrorObject = z.infer<typeof ErrorObjectSchema>;

export const CARObjectSchema = z.object({
    success: z.boolean(),
    error: ErrorObjectSchema.optional(),
    data: z.any().optional()
});

export type CARObject = z.infer<typeof CARObjectSchema>;

export const SortObjectSchema = z.object({
    field: z.string(),
    order: z.enum(["asc", "desc"])
});

export type SortObject = z.infer<typeof SortObjectSchema>;

export const FilterOperatorSchema = z.enum([
    "eq",
    "neq",
    "contains",
    "startsWith",
    "endsWith",
    "in",
    "notIn",
    "gt",
    "gte",
    "lt",
    "lte",
    "between",
    "exists"
]);

export type FilterOperator = z.infer<typeof FilterOperatorSchema>;

export const FilterObjectSchema = z.object({
    field: z.string(),
    operator: FilterOperatorSchema,
    value: z.any()
});

export type FilterObject = z.infer<typeof FilterObjectSchema>;
