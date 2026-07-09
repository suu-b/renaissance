import {
    UserObject,
    LoginResponseObject,
    SessionObject,
    SearchUserRequestObject
} from "@renaissance/shared";

export interface UserRepositoryService {
    register(
        email: string,
        password: string,
        displayName: string,
        username: string
    ): Promise<UserObject>;

    login(
        email: string,
        password: string
    ): Promise<LoginResponseObject>;

    refresh(
        refreshToken: string
    ): Promise<SessionObject>;

    search(
        query: SearchUserRequestObject
    ): Promise<UserObject[]>;

    findById(
        id: string
    ): Promise<UserObject>;

    findByUsername(
        username: string
    ): Promise<UserObject>;
}
