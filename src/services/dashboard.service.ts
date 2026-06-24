import { apiRequest } from "@/services/api-client"
import type { DashboardSummary } from "@/types/api"

export const dashboardService = {
    async getSummary(cycleId: string, signal?: AbortSignal) {
        const response = await apiRequest<DashboardSummary>(
            `/api/cycles/${cycleId}/dashboard`,
            { signal }
        )

        return response.data
    },

    async getReport(cycleId: string, signal?: AbortSignal) {
        const response = await apiRequest<DashboardSummary>(
            `/api/cycles/${cycleId}/report`,
            { signal }
        )

        return response.data
    },
}