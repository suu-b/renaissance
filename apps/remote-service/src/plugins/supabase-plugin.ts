import "dotenv/config";
import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { createClient } from "@supabase/supabase-js";

export default fp(async (app: FastifyInstance) => {
    app.log.info("Initializing Supabase client plugin...");
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        const errMsg = "SUPABASE_URL and SUPABASE_KEY must be provided in the environment variables.";
        app.log.error(errMsg);
        throw new Error(errMsg);
    }

    app.log.info({ supabaseUrl }, "Configuring Supabase client");
    const client = createClient(supabaseUrl, supabaseKey);
    app.decorate("supabase", client);
    app.log.info("Supabase client initialized and registered successfully.");
});
