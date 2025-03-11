export interface ApiError {
    message: string;
    code: string | number;
}

export interface ResponseError {
    status?: string | number;
    message?: string;
}

export function handleApiError(err: unknown, methodName: string): never {
    let errorCode: string | number = 'UNKNOWN';
    let errorMessage: string;

    if (err instanceof Error) {
        errorMessage = err.message;
    } else if (typeof err === 'object' && err !== null) {
        const responseError = err as ResponseError;
        errorCode = responseError.status || errorCode;
        errorMessage = responseError.message || 'Unknown error occurred';
    } else {
        errorMessage = String(err);
    }

    console.error(`Error in ${methodName}: ${errorMessage}`);

    throw {
        message: `Error in ${methodName}: ${errorMessage}`,
        code: errorCode,
    } as ApiError;
}

export function isApiError(err: unknown): err is ApiError {
    return typeof err === 'object' && err !== null && 'message' in err && 'code' in err;
}
