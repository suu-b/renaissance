import { z } from "zod";

export const UserSchema = z.object({
    id: z.uuid(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.url(),
    email: z.string().email(),
    createdAt: z.coerce.date()
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

export const SessionSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresAt: z.coerce.date()
});

export type SessionObject = z.infer<typeof SessionSchema>;

export const LoginResponseSchema = z.object({
    user: UserSchema,
    session: SessionSchema
});

export type LoginResponseObject = z.infer<typeof LoginResponseSchema>;

export const SearchUserRequestSchema = z.object({
    limit: z.number().int().min(1).max(100).default(25),
    offset: z.number().int().min(0).default(0),
    sort: SortObjectSchema.optional(),
    filters: z.array(FilterObjectSchema).default([]),
    fields: z.array(z.string()).default([])
});

export type SearchUserRequestObject = z.infer<typeof SearchUserRequestSchema>;

export const RegisterUserRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    displayName: z.string().min(1),
    username: z.string().min(1)
});

export type RegisterUserRequestObject = z.infer<typeof RegisterUserRequestSchema>;

export const LoginRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

export type LoginRequestObject = z.infer<typeof LoginRequestSchema>;

export const RefreshSessionRequestSchema = z.object({
    refreshToken: z.string()
});

export type RefreshSessionRequestObject = z.infer<typeof RefreshSessionRequestSchema>;
