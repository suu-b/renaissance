import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { createClient } from "@supabase/supabase-js";

export default fp(async (app: FastifyInstance) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("SUPABASE_URL and SUPABASE_KEY must be provided in the environment variables.");
    }

    const client = createClient(supabaseUrl, supabaseKey);
    app.decorate("supabase", client);
});
