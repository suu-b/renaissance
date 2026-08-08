import { ErrorRegistryObject } from "../schemas/common.js";

export function sendError(error: ErrorRegistryObject) {
    return {
        success: false as const,
        error: {
            code: error.code,
            message: error.message
        }
    }
}