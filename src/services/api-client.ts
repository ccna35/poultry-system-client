import axios, { AxiosError } from "axios"
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

function stringifyError(value: unknown): string {
    if (typeof value === "string") return value

    if (Array.isArray(value)) {
        return value.map(stringifyError).join(", ")
    }

    if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>

        if (typeof obj.message === "string") return obj.message
        if (typeof obj.error === "string") return obj.error

        if (obj.message) return stringifyError(obj.message)
        if (obj.error) return stringifyError(obj.error)

        return JSON.stringify(obj)
    }

    return "Something went wrong"
}

function getAxiosErrorMessage(error: AxiosError) {
    const status = error.response?.status ?? 500
    const data = error.response?.data

    return stringifyError(data) || `Request failed with status ${status}`
}

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        "Content-Type": "application/json",
    },
})

export async function apiRequest<T>(
    path: string,
    { method = "GET", body, signal }: ApiRequestOptions = {}
) {
    try {
        const response = await api.request<ApiEnvelope<T>>({
            url: path,
            method,
            data: body,
            signal,
        })

        return response.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new ApiError(
                getAxiosErrorMessage(error),
                error.response?.status ?? 500
            )
        }

        throw error
    }
}