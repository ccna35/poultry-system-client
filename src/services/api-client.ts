import axios, { AxiosError } from "axios"
import type { InternalAxiosRequestConfig } from "axios"

import { buildLoginRedirectPath, resetAuthQueries } from "@/lib/auth"
import { queryClient } from "@/lib/query-client"
import type { ApiEnvelope } from "@/types/api"

const DEFAULT_API_BASE_URL = "http://localhost:3000"

type RequestMethod = "GET" | "POST"

type ApiRequestOptions = {
  method?: RequestMethod
  body?: unknown
  signal?: AbortSignal
  skipAuthRefresh?: boolean
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
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

function isNonRefreshableAuthRequest(url?: string) {
  if (!url) {
    return false
  }

  return ["/api/auth/login", "/api/auth/logout", "/api/auth/refresh"].some(
    (path) => url.includes(path)
  )
}

let refreshPromise: Promise<void> | null = null
let isHandlingAuthFailure = false

function handleAuthFailure() {
  void resetAuthQueries(queryClient)

  if (typeof window === "undefined" || window.location.pathname === "/login") {
    return
  }

  if (isHandlingAuthFailure) {
    return
  }

  isHandlingAuthFailure = true
  window.location.replace(buildLoginRedirectPath())
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/api/auth/refresh", undefined, { skipAuthRefresh: true })
      .then(() => {
        isHandlingAuthFailure = false
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (
      !originalRequest ||
      originalRequest.skipAuthRefresh ||
      originalRequest._retry ||
      error.response?.status !== 401 ||
      isNonRefreshableAuthRequest(originalRequest.url)
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      await refreshSession()
      return api.request(originalRequest)
    } catch (refreshError) {
      handleAuthFailure()
      return Promise.reject(refreshError)
    }
  }
)

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, signal, skipAuthRefresh }: ApiRequestOptions = {}
) {
  try {
    const response = await api.request<ApiEnvelope<T>>({
      url: path,
      method,
      data: body,
      signal,
      skipAuthRefresh,
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
