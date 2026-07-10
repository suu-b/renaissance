import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { UserRepositoryService } from "../services/repository/user-repository-service.js";
import { SupabaseUserRepository } from "../services/repository/providers/supabase/user-repository.js";

export default fp(async (app: FastifyInstance) => {
    app.log.info("Initializing repository plugin...");
    const userRepository: UserRepositoryService = new SupabaseUserRepository(app.supabase, app.log);
    app.decorate("userRepository", userRepository);
    app.log.info("UserRepository registered successfully.");
});
