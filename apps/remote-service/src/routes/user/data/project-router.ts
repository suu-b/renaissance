import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { SearchProjectRequestSchema, CreateProjectRequestSchema } from "@renaissance/shared";

export async function projectRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/user/data/project/search
    typedApp.post("/search", {
        schema: {
            body: SearchProjectRequestSchema
        },
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            request.log.info({ query: request.body }, "User scoped project search API triggered");
            const userId = request.user!.id;
            const projects = await app.projectRepository.searchUserProjects(userId, request.body);
            request.log.info({ count: projects.length }, "User scoped project search API completed successfully");
            return reply.status(200).send({
                success: true,
                data: projects
            });
        } catch (err: any) {
            request.log.error({ err }, "User scoped project search API failed");
            return reply.status(400).send({
                success: false,
                error: {
                    code: "SEARCH_FAILED",
                    message: err.message || "Failed to search projects."
                }
            });
        }
    });

    // POST /api/v1/user/data/project/new
    typedApp.post("/new", {
        schema: {
            body: CreateProjectRequestSchema
        },
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            request.log.info({ body: request.body }, "Create project API triggered");
            const userId = request.user!.id;

            // Fetch the username from users database table to ensure consistency
            const { data: dbUser, error: dbUserError } = await app.supabase
                .from("users")
                .select("username")
                .eq("id", userId)
                .single();

            if (dbUserError || !dbUser) {
                const errMsg = dbUserError?.message || "Failed to fetch user username profile";
                request.log.error({ dbUserError, userId }, errMsg);
                throw new Error(errMsg);
            }

            const project = await app.projectRepository.create(userId, dbUser.username, request.body);
            request.log.info({ projectId: project.id }, "Create project API completed successfully");
            return reply.status(201).send({
                success: true,
                data: project
            });
        } catch (err: any) {
            request.log.error({ err }, "Create project API failed");
            return reply.status(400).send({
                success: false,
                error: {
                    code: "CREATE_FAILED",
                    message: err.message || "Failed to create project."
                }
            });
        }
    });
}
