import { useFarmCycle } from "@/context/FarmCycleContext"
import {
  getErrorMessage,
  useDailyLogsQuery,
  useDashboardReportQuery,
  useDashboardSummaryQuery,
  useExpenseBreakdownQuery,
  useExpensesQuery,
  useFeedPurchasesQuery,
  useMedicationLogsQuery,
  useSaleQuery,
  useWeightLogsQuery,
} from "@/hooks/use-farm-queries"
import type {
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
  cycles: ReturnType<typeof useFarmCycle>["cycles"]
  selectedCycleId: string | null
  setSelectedCycleId: (cycleId: string) => void
  selectedCycle: ReturnType<typeof useFarmCycle>["selectedCycle"]
  dashboard: DashboardSummary | null
  report: DashboardSummary | null
  operations: OperationsState
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useFarmDashboard(): FarmDashboardState {
  const {
    cycles,
    selectedCycleId,
    setSelectedCycleId,
    selectedCycle,
    refreshAll,
  } = useFarmCycle()

  const dashboardQuery = useDashboardSummaryQuery(selectedCycleId)
  const reportQuery = useDashboardReportQuery(selectedCycleId)
  const dailyLogsQuery = useDailyLogsQuery(selectedCycleId)
  const feedPurchasesQuery = useFeedPurchasesQuery(selectedCycleId)
  const weightLogsQuery = useWeightLogsQuery(selectedCycleId)
  const medicationLogsQuery = useMedicationLogsQuery(selectedCycleId)
  const expensesQuery = useExpensesQuery(selectedCycleId)
  const expenseBreakdownQuery = useExpenseBreakdownQuery(selectedCycleId)
  const saleQuery = useSaleQuery(selectedCycleId)

  const errors = [
    dashboardQuery.error,
    reportQuery.error,
    dailyLogsQuery.error,
    feedPurchasesQuery.error,
    weightLogsQuery.error,
    medicationLogsQuery.error,
    expensesQuery.error,
    expenseBreakdownQuery.error,
    saleQuery.error,
  ].filter(Boolean)

  return {
    cycles,
    selectedCycleId,
    setSelectedCycleId,
    selectedCycle,
    dashboard: dashboardQuery.data ?? null,
    report: reportQuery.data ?? null,
    operations: {
      dailyLogs: {
        data: dailyLogsQuery.data ?? [],
        error: dailyLogsQuery.error ? getErrorMessage(dailyLogsQuery.error) : null,
      },
      feedPurchases: {
        data: feedPurchasesQuery.data ?? [],
        error: feedPurchasesQuery.error ? getErrorMessage(feedPurchasesQuery.error) : null,
      },
      weightLogs: {
        data: weightLogsQuery.data ?? [],
        error: weightLogsQuery.error ? getErrorMessage(weightLogsQuery.error) : null,
      },
      medicationLogs: {
        data: medicationLogsQuery.data ?? [],
        error: medicationLogsQuery.error ? getErrorMessage(medicationLogsQuery.error) : null,
      },
      expenses: {
        data: expensesQuery.data ?? [],
        error: expensesQuery.error ? getErrorMessage(expensesQuery.error) : null,
      },
      expenseBreakdown: {
        data: expenseBreakdownQuery.data ?? {},
        error: expenseBreakdownQuery.error ? getErrorMessage(expenseBreakdownQuery.error) : null,
      },
      sale: {
        data: saleQuery.data ?? null,
        error: saleQuery.error ? getErrorMessage(saleQuery.error) : null,
      },
    },
    isLoading: [
      dashboardQuery.isLoading,
      reportQuery.isLoading,
      dailyLogsQuery.isLoading,
      feedPurchasesQuery.isLoading,
      weightLogsQuery.isLoading,
      medicationLogsQuery.isLoading,
      expensesQuery.isLoading,
      expenseBreakdownQuery.isLoading,
      saleQuery.isLoading,
    ].some(Boolean),
    error: errors.length > 0 ? getErrorMessage(errors[0]) : null,
    refresh: refreshAll,
  }
}
