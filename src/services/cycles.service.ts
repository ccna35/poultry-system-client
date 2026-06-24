import { apiRequest } from "@/services/api-client"
import type { CreateCycleRequest, Cycle } from "@/types/api"

export const cyclesService = {
    async list(signal?: AbortSignal) {
        const response = await apiRequest<Cycle[]>("/api/cycles", { signal })
        return response.data
    },

    async getById(id: string, signal?: AbortSignal) {
        const response = await apiRequest<Cycle>(`/api/cycles/${id}`, { signal })
        return response.data
    },

    async create(payload: CreateCycleRequest, signal?: AbortSignal) {
        const response = await apiRequest<Cycle>("/api/cycles", {
            method: "POST",
            body: payload,
            signal,
        })

        return response.data
    },
}