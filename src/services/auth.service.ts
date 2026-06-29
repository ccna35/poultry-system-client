import { apiRequest } from "@/services/api-client"
import type { AuthUser, LoginRequest } from "@/types/api"

export const authService = {
  async login(payload: LoginRequest, signal?: AbortSignal) {
    const response = await apiRequest<null>("/api/auth/login", {
      method: "POST",
      body: payload,
      signal,
      skipAuthRefresh: true,
    })

    return response.data
  },

  async refresh(signal?: AbortSignal) {
    const response = await apiRequest<null>("/api/auth/refresh", {
      method: "POST",
      signal,
      skipAuthRefresh: true,
    })

    return response.data
  },

  async logout(signal?: AbortSignal) {
    const response = await apiRequest<null>("/api/auth/logout", {
      method: "POST",
      signal,
      skipAuthRefresh: true,
    })

    return response.data
  },

  async getMe(signal?: AbortSignal) {
    const response = await apiRequest<AuthUser>("/api/auth/me", {
      signal,
    })

    return response.data
  },
}
