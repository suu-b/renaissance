export function sendSuccess<T>(data: T) {
    return {
        success: true as const,
        data
    };
}