import {
    ProjectObject,
    SearchProjectRequestObject,
    CreateProjectRequestObject,
    GlobalSearchProjectRequestObject
} from "@renaissance/shared";

export interface ProjectRepositoryService {
    create(
        userId: string,
        username: string,
        payload: CreateProjectRequestObject
    ): Promise<ProjectObject>;

    findById(
        id: string,
        userId: string
    ): Promise<ProjectObject>;

    searchUserProjects(
        userId: string,
        query: SearchProjectRequestObject
    ): Promise<ProjectObject[]>;

    searchGlobalProjects(
        userId: string,
        query: GlobalSearchProjectRequestObject
    ): Promise<ProjectObject[]>;
}
