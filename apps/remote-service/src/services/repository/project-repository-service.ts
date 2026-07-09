import {
    ProjectObject,
    SearchProjectRequestObject,
    CreateProjectRequestObject
} from "@renaissance/shared";

export interface ProjectRepositoryService {
    searchGlobal(
        query: SearchProjectRequestObject,
        includeUserProjects?: boolean
    ): Promise<ProjectObject[]>;

    findById(
        id: string
    ): Promise<ProjectObject>;

    searchUserProjects(
        userId: string,
        query: SearchProjectRequestObject
    ): Promise<ProjectObject[]>;

    create(
        userId: string,
        project: CreateProjectRequestObject
    ): Promise<ProjectObject>;
}
