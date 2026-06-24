import * as React from "react"

import { cyclesService } from "@/services/cycles.service"
import { dashboardService } from "@/services/dashboard.service"
import { ApiError } from "@/services/api-client"
import { operationsService } from "@/services/operations.service"
import type {
    Cycle,
    DailyLog,
    DashboardSectionState,
    DashboardSummary,
    Expense,
    ExpenseBreakdown,
    FeedPurchase,
    MedicationLog,
    Sale,
    WeightLog,
} from "@/types/api"

type OperationsState = {
    dailyLogs: DashboardSectionState<DailyLog[]>
    feedPurchases: DashboardSectionState<FeedPurchase[]>
    weightLogs: DashboardSectionState<WeightLog[]>
    medicationLogs: DashboardSectionState<MedicationLog[]>
    expenses: DashboardSectionState<Expense[]>
    expenseBreakdown: DashboardSectionState<ExpenseBreakdown>
    sale: DashboardSectionState<Sale | null>
}

type FarmDashboardState = {
    cycles: Cycle[]
    selectedCycleId: string | null
    setSelectedCycleId: (cycleId: string) => void
    selectedCycle: Cycle | null
    dashboard: DashboardSummary | null
    report: DashboardSummary | null
    operations: OperationsState
    isLoading: boolean
    error: string | null
    refresh: () => Promise<void>
}

type DashboardPayload = {
    cycles: Cycle[]
    selectedCycleId: string | null
    dashboard: DashboardSummary | null
    report: DashboardSummary | null
    operations: OperationsState
    error: string | null
}

function getErrorMessage(error: unknown) {
    if (error instanceof ApiError) {
        return error.message
    }

    if (error instanceof Error) {
        return error.message
    }

    return "تعذر تحميل البيانات من الخادم."
}

function emptyOperationsState(): OperationsState {
    return {
        dailyLogs: { data: [], error: null },
        feedPurchases: { data: [], error: null },
        weightLogs: { data: [], error: null },
        medicationLogs: { data: [], error: null },
        expenses: { data: [], error: null },
        expenseBreakdown: { data: {}, error: null },
        sale: { data: null, error: null },
    }
}

async function loadDashboardData(
    requestedCycleId: string | null,
    signal?: AbortSignal
): Promise<DashboardPayload> {
    const cycleList = await cyclesService.list(signal)

    if (cycleList.length === 0) {
        return {
            cycles: [],
            selectedCycleId: null,
            dashboard: null,
            report: null,
            operations: emptyOperationsState(),
            error: null,
        }
    }

    const preferredCycleId =
        requestedCycleId && cycleList.some((cycle) => cycle.id === requestedCycleId)
            ? requestedCycleId
            : cycleList.find((cycle) => cycle.status === "ACTIVE")?.id ?? cycleList[0]?.id ?? null

    if (!preferredCycleId) {
        return {
            cycles: cycleList,
            selectedCycleId: null,
            dashboard: null,
            report: null,
            operations: emptyOperationsState(),
            error: null,
        }
    }

    const results = await Promise.allSettled([
        dashboardService.getSummary(preferredCycleId, signal),
        dashboardService.getReport(preferredCycleId, signal),
        operationsService.listDailyLogs(preferredCycleId, signal),
        operationsService.listFeedPurchases(preferredCycleId, signal),
        operationsService.listWeightLogs(preferredCycleId, signal),
        operationsService.listMedicationLogs(preferredCycleId, signal),
        operationsService.listExpenses(preferredCycleId, signal),
        operationsService.getExpenseBreakdown(preferredCycleId, signal),
        operationsService.getSale(preferredCycleId, signal),
    ])

    const [
        dashboardResult,
        reportResult,
        dailyLogsResult,
        feedResult,
        weightResult,
        medicationResult,
        expensesResult,
        breakdownResult,
        saleResult,
    ] = results

    return {
        cycles: cycleList,
        selectedCycleId: preferredCycleId,
        dashboard:
            dashboardResult.status === "fulfilled" ? dashboardResult.value : null,
        report: reportResult.status === "fulfilled" ? reportResult.value : null,
        operations: {
            dailyLogs:
                dailyLogsResult.status === "fulfilled"
                    ? { data: dailyLogsResult.value, error: null }
                    : { data: [], error: getErrorMessage(dailyLogsResult.reason) },
            feedPurchases:
                feedResult.status === "fulfilled"
                    ? { data: feedResult.value, error: null }
                    : { data: [], error: getErrorMessage(feedResult.reason) },
            weightLogs:
                weightResult.status === "fulfilled"
                    ? { data: weightResult.value, error: null }
                    : { data: [], error: getErrorMessage(weightResult.reason) },
            medicationLogs:
                medicationResult.status === "fulfilled"
                    ? { data: medicationResult.value, error: null }
                    : { data: [], error: getErrorMessage(medicationResult.reason) },
            expenses:
                expensesResult.status === "fulfilled"
                    ? { data: expensesResult.value, error: null }
                    : { data: [], error: getErrorMessage(expensesResult.reason) },
            expenseBreakdown:
                breakdownResult.status === "fulfilled"
                    ? { data: breakdownResult.value, error: null }
                    : { data: {}, error: getErrorMessage(breakdownResult.reason) },
            sale:
                saleResult.status === "fulfilled"
                    ? { data: saleResult.value, error: null }
                    : { data: null, error: getErrorMessage(saleResult.reason) },
        },
        error:
            dashboardResult.status === "rejected"
                ? getErrorMessage(dashboardResult.reason)
                : null,
    }
}

export function useFarmDashboard(): FarmDashboardState {
    const [cycles, setCycles] = React.useState<Cycle[]>([])
    const [selectedCycleId, setSelectedCycleIdState] = React.useState<string | null>(null)
    const [dashboard, setDashboard] = React.useState<DashboardSummary | null>(null)
    const [report, setReport] = React.useState<DashboardSummary | null>(null)
    const [operations, setOperations] = React.useState<OperationsState>(
        emptyOperationsState
    )
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [refreshNonce, setRefreshNonce] = React.useState(0)

    const refresh = React.useCallback(async () => {
        setIsLoading(true)
        setError(null)
        setRefreshNonce((currentValue) => currentValue + 1)
    }, [])

    React.useEffect(() => {
        const abortController = new AbortController()
        let isActive = true

        void loadDashboardData(selectedCycleId, abortController.signal)
            .then((payload) => {
                if (!isActive) {
                    return
                }

                setCycles(payload.cycles)
                setSelectedCycleIdState(payload.selectedCycleId)
                setDashboard(payload.dashboard)
                setReport(payload.report)
                setOperations(payload.operations)
                setError(payload.error)
            })
            .catch((nextError) => {
                if (!isActive) {
                    return
                }

                setError(getErrorMessage(nextError))
                setDashboard(null)
                setReport(null)
                setOperations(emptyOperationsState())
            })
            .finally(() => {
                if (!isActive) {
                    return
                }

                setIsLoading(false)
            })

        return () => {
            isActive = false
            abortController.abort()
        }
    }, [refreshNonce, selectedCycleId])

    const setSelectedCycleId = React.useCallback((cycleId: string) => {
        setIsLoading(true)
        setError(null)
        setSelectedCycleIdState(cycleId)
    }, [])

    const selectedCycle = React.useMemo(
        () => cycles.find((cycle) => cycle.id === selectedCycleId) ?? null,
        [cycles, selectedCycleId]
    )

    return {
        cycles,
        selectedCycleId,
        setSelectedCycleId,
        selectedCycle,
        dashboard,
        report,
        operations,
        isLoading,
        error,
        refresh,
    }
}