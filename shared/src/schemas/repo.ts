import { z } from "zod";

export const InitResponseSchema = z.object({
    repositoryPath: z.string(),
    createdAt: z.coerce.date()
});

export type InitResponseObject = z.infer<typeof InitResponseSchema>;
