import type { ApiEnvelope } from "@/types/api"

const DEFAULT_API_BASE_URL = "http://localhost:3000"

type RequestMethod = "GET" | "POST"

type ApiRequestOptions = {
    method?: RequestMethod
    body?: unknown
    signal?: AbortSignal
}

export class ApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = "ApiError"
        this.status = status
    }
}

function getApiBaseUrl() {
    return (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(
        /\/$/,
        ""
    )
}

async function parseErrorMessage(response: Response) {
    try {
        const payload = (await response.json()) as Partial<{
            message: string
            error: string
        }>

        return payload.message ?? payload.error ?? `Request failed with status ${response.status}`
    } catch {
        return `Request failed with status ${response.status}`
    }
}

export async function apiRequest<T>(
    path: string,
    { method = "GET", body, signal }: ApiRequestOptions = {}
) {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
        method,
        signal,
        headers: {
            "Content-Type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    })

    if (!response.ok) {
        throw new ApiError(await parseErrorMessage(response), response.status)
    }

    return (await response.json()) as ApiEnvelope<T>
}