export const Errors = {
    PROJECTS_SEARCH_FAILED: {
        code: "PROJECTS_SEARCH_FAILED",
        message: "Failed to search projects.",
    },

    PROJECT_GET_FAILED: {
        code: "PROJECTS_GET_FAILED",
        message: "Failed to get user by ID.",
    },

    PROJECT_CREATE_FAILED: {
        code: "PROJECT_CREATE_FAILED",
        message: "Failed to create project.",
    },

    PROJECT_NOT_FOUND: {
        code: "PROJECT_NOT_FOUND",
        message: "Project not found.",
    },

    PROJECT_PUBLISH_FAILED: {
        code: "PROJECT_PUBLISH_FAILED",
        message: "Failed to publish project.",
    },

    PROJECT_PUBLISH_FORBIDDEN: {
        code: "PROJECT_PUBLISH_FORBIDDEN",
        message: "You do not have permission to make changes to this project.",
    },

    PROJECT_ACCESS_DENIED: {
        code: "PROJECT_ACCESS_DENIED",
        message: "You do not have permission to read this project.",
    },

    USERS_SEARCH_FAILED: {
        code: "USERS_SEARCH_FAILED",
        message: "Failed to search users.",
    },

    USER_GET_FAILED: {
        code: "USERS_GET_FAILED",
        message: "Failed to get user by ID.",
    },

    USER_NOT_FOUND: {
        code: "USER_NOT_FOUND",
        message: "User not found.",
    },

    USER_REGISTRATION_FAILED: {
        code: "USER_REGISTRATION_FAILED",
        message: "Failed to register the user"
    },

    USER_LOGIN_FAILED: {
        code: "USER_LOGIN_FAILED",
        message: "Failed to log in user"
    },

    USER_REFRESH_FAILED: {
        code: "USER_REFRESH_FAILED",
        message: "Failed to refresh user session"
    }
} as const;