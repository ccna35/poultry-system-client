import { useQuery } from "@tanstack/react-query"

import { ApiError } from "@/services/api-client"
import { cyclesService } from "@/services/cycles.service"
import { dashboardService } from "@/services/dashboard.service"
import { operationsService } from "@/services/operations.service"
import { farmQueryKeys } from "@/lib/query-keys"

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Unable to load data from the server."
}

export function useCyclesQuery() {
  return useQuery({
    queryKey: farmQueryKeys.cycles(),
    queryFn: ({ signal }) => cyclesService.list(signal),
  })
}

export function useDashboardSummaryQuery(cycleId: string | null) {
  return useQuery({
    queryKey: cycleId ? farmQueryKeys.dashboard(cycleId) : ["farm", "dashboard"],
    queryFn: ({ signal }) => dashboardService.getSummary(cycleId!, signal),
    enabled: Boolean(cycleId),
  })
}

export function useDashboardReportQuery(cycleId: string | null) {
  return useQuery({
    queryKey: cycleId ? farmQueryKeys.report(cycleId) : ["farm", "report"],
    queryFn: ({ signal }) => dashboardService.getReport(cycleId!, signal),
    enabled: Boolean(cycleId),
  })
}

export function useDailyLogsQuery(cycleId: string | null) {
  return useQuery({
    queryKey: cycleId ? farmQueryKeys.dailyLogs(cycleId) : ["farm", "daily-logs"],
    queryFn: ({ signal }) => operationsService.listDailyLogs(cycleId!, signal),
    enabled: Boolean(cycleId),
  })
}

export function useFeedPurchasesQuery(cycleId: string | null) {
  return useQuery({
    queryKey: cycleId
      ? farmQueryKeys.feedPurchases(cycleId)
      : ["farm", "feed-purchases"],
    queryFn: ({ signal }) => operationsService.listFeedPurchases(cycleId!, signal),
    enabled: Boolean(cycleId),
  })
}

export function useFeedBalancesQuery(cycleId: string | null) {
  return useQuery({
    queryKey: cycleId
      ? farmQueryKeys.feedBalances(cycleId)
      : ["farm", "feed-balances"],
    queryFn: ({ signal }) => operationsService.listFeedBalances(cycleId!, signal),
    enabled: Boolean(cycleId),
  })
}

export function useWeightLogsQuery(cycleId: string | null) {
  return useQuery({
    queryKey: cycleId ? farmQueryKeys.weightLogs(cycleId) : ["farm", "weight-logs"],
    queryFn: ({ signal }) => operationsService.listWeightLogs(cycleId!, signal),
    enabled: Boolean(cycleId),
  })
}

export function useMedicationLogsQuery(cycleId: string | null) {
  return useQuery({
    queryKey: cycleId
      ? farmQueryKeys.medicationLogs(cycleId)
      : ["farm", "medication-logs"],
    queryFn: ({ signal }) => operationsService.listMedicationLogs(cycleId!, signal),
    enabled: Boolean(cycleId),
  })
}

export function useExpensesQuery(cycleId: string | null) {
  return useQuery({
    queryKey: cycleId ? farmQueryKeys.expenses(cycleId) : ["farm", "expenses"],
    queryFn: ({ signal }) => operationsService.listExpenses(cycleId!, signal),
    enabled: Boolean(cycleId),
  })
}

export function useExpenseBreakdownQuery(cycleId: string | null) {
  return useQuery({
    queryKey: cycleId
      ? farmQueryKeys.expenseBreakdown(cycleId)
      : ["farm", "expense-breakdown"],
    queryFn: ({ signal }) => operationsService.getExpenseBreakdown(cycleId!, signal),
    enabled: Boolean(cycleId),
  })
}

export function useSaleQuery(cycleId: string | null) {
  return useQuery({
    queryKey: cycleId ? farmQueryKeys.sale(cycleId) : ["farm", "sale"],
    queryFn: ({ signal }) => operationsService.getSale(cycleId!, signal),
    enabled: Boolean(cycleId),
  })
}
