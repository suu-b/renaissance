import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import path from "path";
import { z } from "zod";

import {
    SearchProjectRequestSchema,
    CreateProjectRequestSchema,
    UpdateProjectRequestSchema,
    DeleteProjectRequestSchema,
    ProjectHistorySchema,
    ProjectObject,
    CARResponses,
    UserObject,
    sendSuccess,
    Errors,
    sendError,
    GitCommit,
    GetCommitDiffRequestSchema
} from "@renaissance/shared";

import { getUserProfile } from "../../../utils/userProfile.js";
import { DataService } from "../../../services/dataService.js";

// Local schemas for branch management
const GetBranchesRequestSchema = z.object({
    projectId: z.string()
});

const DeleteBranchRequestSchema = z.object({
    branchId: z.string()
});

const CreateBranchRequestSchema = z.object({
    projectId: z.string(),
    branchName: z.string()
});

export async function projectRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/user/data/project/search
    typedApp.post("/search", {
        schema: {
            body: SearchProjectRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { includePrivate, limit, offset, sort, filters, fields } = request.body;
            const projects = app.indexService.getAllProjects({ includePrivate });
            const result = DataService.processSearch(projects, {
                limit, offset, sort, filters, fields
            });

            return reply.status(200).send(sendSuccess({
                projects: result.items,
                total: result.total,
                limit: result.limit,
                offset: result.offset
            }));

        } catch (error) {
            console.error("Failed to search projects:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_GET_FAILED));
        }
    });

    // POST /api/v1/user/data/project/search/mine
    typedApp.post("/search/mine", {
        schema: {
            body: SearchProjectRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { includePrivate, limit, offset, sort, filters, fields } = request.body;
            const userProfile = getUserProfile();
            const projects = app.indexService.getAllProjects({
                includePrivate,
                ownerId: userProfile.id,
                contributorIds: [userProfile.id]
            });

            const result = DataService.processSearch(projects, {
                limit, offset, sort, filters, fields
            });

            return reply.status(200).send(sendSuccess({
                projects: result.items,
                total: result.total,
                limit: result.limit,
                offset: result.offset
            }));

        } catch (error) {
            console.error("Failed to search projects:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_GET_FAILED));
        }
    });

    // POST /api/v1/user/data/project/new
    // create a default branch record first called main
    // get its id
    // create an actual branch whosen name is that id
    // swithc to that branch
    // create the foler of that project in that branch
    // then create the project record, in its default field, put the id of this branch
    typedApp.post("/new", {
        schema: {
            body: CreateProjectRequestSchema
        }
    }, async (request, reply) => {
        try {
            const { name, description, isPrivate } = request.body;
            const userProfile = getUserProfile();
            const id = randomUUID();
            const localProjectPath = path.join(app.appPaths.workspacePath, id);

            // Create folder first
            await app.vandcService.createFolder(localProjectPath);

            // Initialize git repository
            await app.vandcService.init(localProjectPath);

            // Create an initial commit to enable branch creation
            const { promises: fs } = await import('fs');
            const readmePath = path.join(localProjectPath, 'README.md');
            await fs.writeFile(readmePath, `# ${name}\n\n${description || 'No description'}`, 'utf-8');

            // Stage and commit the initial file
            await app.vandcService.scopedSaved(
                readmePath,
                `# ${name}\n\n${description || 'No description'}`,
                'Initial commit',
                'utf-8',
                localProjectPath
            );

            // Create project record first (needed for foreign key constraint)
            const projectId = app.indexService.createProject({
                id,
                name,
                description,
                isPrivate,
                path: localProjectPath,
                owner: userProfile,
                defaultBranch: undefined // Will be updated after branch creation
            });

            // Create default branch record called "main"
            const branchId = app.indexService.createBranch({
                projectId: id,
                branchName: "main"
            });

            // Create actual git branch with name as the branch ID
            await app.vandcService.createBranch(branchId, localProjectPath);

            // Switch to that branch
            await app.vandcService.changeBranch(branchId, localProjectPath);

            // Update project record with default_branch = branch ID
            // We need to update the project since we can't set it initially due to FK constraint
            app.indexService.updateProjectDefaultBranch(id, branchId);

            return reply.status(201).send(sendSuccess({ id: projectId }));

        } catch (error) {
            console.error("Failed to create project:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_GET_FAILED));
        }
    });

    // POST /api/v1/user/data/project/update
    typedApp.post("/update", {
        schema: {
            body: UpdateProjectRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { id, name, description, isPrivate } = request.body;
            const success = app.indexService.updateProject(id, {
                name,
                description,
                isPrivate
            });

            if (!success) {
                return reply.status(404).send(sendError(Errors.PROJECT_UPDATE_FAILED));
            }
            return reply.status(200).send(sendSuccess({ id }));
        } catch (error) {
            console.error("Failed to update project:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_UPDATE_FAILED));
        }
    });

    // POST /api/v1/user/data/project/history
    // take branch name as well from the user
    // first change the branch then return the history as it is alreayd being returned
    typedApp.post("/history", {
        schema: {
            body: ProjectHistorySchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { projectId, limit, branchId } = request.body;
            const projectPath = path.join(app.appPaths.workspacePath, projectId);

            // If branchId is provided, switch to that branch first
            if (branchId) {
                const branch = app.indexService.getBranchById(branchId);
                if (!branch) {
                    return reply.status(404).send(sendError(Errors.PROJECT_GET_FAILED));
                }
                await app.vandcService.changeBranch(branchId, projectPath);
            }

            const history: GitCommit[] = await app.vandcService.getScopedHistory(projectPath, limit);
            return reply.status(200).send(sendSuccess({ history }));
        } catch (error) {
            console.error("Failed to get scoped history:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_GET_FAILED));
        }
    });

    // POST /api/v1/user/data/project/delete
    // fetch all the branches of thsi project
    // delelte all of them as well
    typedApp.post("/delete", {
        schema: {
            body: DeleteProjectRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { id } = request.body as { id: string };

            // Get project info to find project path
            const project = app.indexService.getProjectById(id);
            if (!project) {
                return reply.status(404).send(sendError(Errors.PROJECT_NOT_FOUND));
            }

            // Fetch all branches of this project
            const branches = app.indexService.getBranchesByProjectId(id);
            const projectPath = path.join(app.appPaths.workspacePath, id);

            // Delete all git branches
            for (const branch of branches) {
                try {
                    await app.vandcService.deleteBranch(branch.id, projectPath);
                } catch (error) {
                    console.error(`Failed to delete git branch ${branch.id}:`, error);
                    // Continue even if branch deletion fails
                }
            }

            // Delete from database (branches will be cascade deleted)
            const success = app.indexService.deleteProject(id);
            if (!success) {
                return reply.status(404).send(sendError(Errors.PROJECT_DELETE_FAILED));
            }

            // Delete the project folder and all its contents using the vandc service
            try {
                await app.vandcService.deleteFolder(projectPath, projectPath);
            } catch (fileError) {
                console.error("Failed to delete project folder:", fileError);
                // Continue even if folder deletion fails, as DB is updated
            }

            return reply.status(200).send(sendSuccess({ id }));
        } catch (error) {
            console.error("Failed to delete project:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_DELETE_FAILED));
        }
    });

    // POST /api/v1/user/data/project/diff
    typedApp.post("/diff", {
        schema: {
            body: GetCommitDiffRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { project: projectId, filePath, hash } = request.body;
            const fullPath = path.join(app.appPaths.workspacePath, projectId, filePath);

            const diff = await app.vandcService.getCommitDiff(fullPath, hash);

            return reply.status(200).send(sendSuccess({
                diff,
                hash,
                filePath
            }));
        } catch (error) {
            console.error("Failed to get commit diff:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_GET_FAILED));
        }
    });

    // add a route to get all the branhces of a given project.r eturna list {branch id, branch name}
    typedApp.post("/branches", {
        schema: {
            body: GetBranchesRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { projectId } = request.body as z.infer<typeof GetBranchesRequestSchema>;
            const branches = app.indexService.getBranchesByProjectId(projectId);

            return reply.status(200).send(sendSuccess({
                branches: branches.map(branch => ({
                    id: branch.id,
                    branchName: branch.branchName
                }))
            }));
        } catch (error) {
            console.error("Failed to get branches:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_GET_FAILED));
        }
    });

    // add a route to delete that passed id waali branch of the proejct. if it is the default branch, do not delete and reutrna  failed messaeg - 'Cannot delete defautl brancj'
    typedApp.post("/branch/delete", {
        schema: {
            body: DeleteBranchRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { branchId } = request.body as z.infer<typeof DeleteBranchRequestSchema>;

            // Get branch info
            const branch = app.indexService.getBranchById(branchId);
            if (!branch) {
                return reply.status(404).send(sendError(Errors.PROJECT_NOT_FOUND));
            }

            // Get project info to check if this is the default branch
            const project = app.indexService.getProjectById(branch.projectId);
            if (!project) {
                return reply.status(404).send(sendError(Errors.PROJECT_NOT_FOUND));
            }

            // Check if this is the default branch
            if ((project as any).defaultBranch === branchId) {
                return reply.status(400).send(sendError({
                    code: "CANNOT_DELETE_DEFAULT_BRANCH",
                    message: "Cannot delete default branch"
                }));
            }

            // Delete git branch
            const projectPath = path.join(app.appPaths.workspacePath, branch.projectId);
            try {
                await app.vandcService.deleteBranch(branchId, projectPath);
            } catch (error) {
                console.error(`Failed to delete git branch ${branchId}:`, error);
                // Continue even if git branch deletion fails
            }

            // Delete branch from database
            const success = app.indexService.deleteBranch(branchId);
            if (!success) {
                return reply.status(404).send(sendError(Errors.PROJECT_DELETE_FAILED));
            }

            return reply.status(200).send(sendSuccess({ id: branchId }));
        } catch (error) {
            console.error("Failed to delete branch:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_DELETE_FAILED));
        }
    });

    // add a route to create a new branch for a project
    typedApp.post("/branch/new", {
        schema: {
            body: CreateBranchRequestSchema,
            response: CARResponses,
            tags: ["User Data"]
        }
    }, async (request, reply) => {
        try {
            const { projectId, branchName } = request.body as z.infer<typeof CreateBranchRequestSchema>;

            // Get project info
            const project = app.indexService.getProjectById(projectId);
            if (!project) {
                return reply.status(404).send(sendError(Errors.PROJECT_NOT_FOUND));
            }

            // Check if branch name already exists
            const existingBranches = app.indexService.getBranchesByProjectId(projectId);
            const branchExists = existingBranches.some(branch => branch.branchName === branchName);
            if (branchExists) {
                return reply.status(400).send(sendError({
                    code: "BRANCH_ALREADY_EXISTS",
                    message: "Branch with this name already exists"
                }));
            }

            // Create branch record in database
            const branchId = app.indexService.createBranch({
                projectId,
                branchName
            });

            // Create actual git branch
            const projectPath = path.join(app.appPaths.workspacePath, projectId);
            await app.vandcService.createBranch(branchId, projectPath);

            // Switch to the new branch
            await app.vandcService.changeBranch(branchId, projectPath);

            return reply.status(201).send(sendSuccess({
                id: branchId,
                branchName
            }));
        } catch (error) {
            console.error("Failed to create branch:", error);
            return reply.status(500).send(sendError(Errors.PROJECT_GET_FAILED));
        }
    });
}
