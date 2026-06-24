import { apiRequest } from "@/services/api-client"
import type {
    CreateDailyLogRequest,
    CreateFeedPurchaseRequest,
    CreateManualExpenseRequest,
    CreateMedicationLogRequest,
    CreateSaleRequest,
    CreateWeightLogRequest,
    DailyLog,
    Expense,
    ExpenseBreakdown,
    FeedPurchase,
    MedicationLog,
    Sale,
    WeightLog,
} from "@/types/api"

function buildPath(cycleId: string, resource: string) {
    return `/api/cycles/${cycleId}/${resource}`
}

export const operationsService = {
    async listDailyLogs(cycleId: string, signal?: AbortSignal) {
        const response = await apiRequest<DailyLog[]>(
            buildPath(cycleId, "daily-logs"),
            { signal }
        )

        return response.data
    },

    async createDailyLog(
        cycleId: string,
        payload: CreateDailyLogRequest,
        signal?: AbortSignal
    ) {
        const response = await apiRequest<DailyLog>(buildPath(cycleId, "daily-logs"), {
            method: "POST",
            body: payload,
            signal,
        })

        return response.data
    },

    async listFeedPurchases(cycleId: string, signal?: AbortSignal) {
        const response = await apiRequest<FeedPurchase[]>(
            buildPath(cycleId, "feed-purchases"),
            { signal }
        )

        return response.data
    },

    async createFeedPurchase(
        cycleId: string,
        payload: CreateFeedPurchaseRequest,
        signal?: AbortSignal
    ) {
        const response = await apiRequest<FeedPurchase>(
            buildPath(cycleId, "feed-purchases"),
            {
                method: "POST",
                body: payload,
                signal,
            }
        )

        return response.data
    },

    async listWeightLogs(cycleId: string, signal?: AbortSignal) {
        const response = await apiRequest<WeightLog[]>(
            buildPath(cycleId, "weight-logs"),
            { signal }
        )

        return response.data
    },

    async createWeightLog(
        cycleId: string,
        payload: CreateWeightLogRequest,
        signal?: AbortSignal
    ) {
        const response = await apiRequest<WeightLog>(buildPath(cycleId, "weight-logs"), {
            method: "POST",
            body: payload,
            signal,
        })

        return response.data
    },

    async listMedicationLogs(cycleId: string, signal?: AbortSignal) {
        const response = await apiRequest<MedicationLog[]>(
            buildPath(cycleId, "medication-logs"),
            { signal }
        )

        return response.data
    },

    async createMedicationLog(
        cycleId: string,
        payload: CreateMedicationLogRequest,
        signal?: AbortSignal
    ) {
        const response = await apiRequest<MedicationLog>(
            buildPath(cycleId, "medication-logs"),
            {
                method: "POST",
                body: payload,
                signal,
            }
        )

        return response.data
    },

    async listExpenses(cycleId: string, signal?: AbortSignal) {
        const response = await apiRequest<Expense[]>(buildPath(cycleId, "expenses"), {
            signal,
        })

        return response.data
    },

    async createExpense(
        cycleId: string,
        payload: CreateManualExpenseRequest,
        signal?: AbortSignal
    ) {
        const response = await apiRequest<Expense>(buildPath(cycleId, "expenses"), {
            method: "POST",
            body: payload,
            signal,
        })

        return response.data
    },

    async getExpenseBreakdown(cycleId: string, signal?: AbortSignal) {
        const response = await apiRequest<ExpenseBreakdown>(
            buildPath(cycleId, "expenses/breakdown"),
            { signal }
        )

        return response.data
    },

    async getSale(cycleId: string, signal?: AbortSignal) {
        const response = await apiRequest<Sale | null>(buildPath(cycleId, "sales"), {
            signal,
        })

        return response.data
    },

    async createSale(
        cycleId: string,
        payload: CreateSaleRequest,
        signal?: AbortSignal
    ) {
        const response = await apiRequest<Sale>(buildPath(cycleId, "sales"), {
            method: "POST",
            body: payload,
            signal,
        })

        return response.data
    },
}