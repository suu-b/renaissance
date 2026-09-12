import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { SearchProjectRequestSchema, CreateProjectRequestSchema } from "@renaissance/shared";
import { renaissance_home } from "../../../config/index.js";
import path from "path";

export async function projectRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/user/data/project/search
    typedApp.post("/search", {
        schema: {
            body: SearchProjectRequestSchema
        }
    }, async (request, reply) => {
        return reply.status(200).send();
    });

    // POST /api/v1/user/data/project/new
    typedApp.post("/new", {
        schema: {
            body: CreateProjectRequestSchema
        }
    }, async (request, reply) => {
        try {
            const { name, description, isPrivate } = request.body;
            
            // Create folder using vandc service
            const projectPath = path.join(renaissance_home, name);
            await app.vandcService.createFolder(projectPath);
            
            // Call remote-service to create project record
            // Assuming remote-service runs on localhost:3001
            const remoteServiceUrl = "http://localhost:8080/api/v1/user/data/project/new";
            
            try {
                const response = await fetch(remoteServiceUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name, description, isPrivate }),
                });
                
                if (!response.ok) {
                    throw new Error(`Remote service responded with status ${response.status}`);
                }
                
                const projectData = await response.json();
                
                return reply.status(201).send({ 
                    message: "Project created successfully",
                    path: projectPath,
                    project: projectData
                });
            } catch (remoteError) {
                console.error("Failed to create project record in remote service:", remoteError);
                // Still return success for local folder creation, but note the remote service issue
                return reply.status(201).send({ 
                    message: "Project folder created successfully (remote service unavailable)",
                    path: projectPath,
                    warning: "Remote service record creation failed"
                });
            }
        } catch (error) {
            console.error("Failed to create project:", error);
            return reply.status(500).send({ 
                error: "Failed to create project" 
            });
        }
    });
}
