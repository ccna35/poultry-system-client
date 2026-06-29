import { useMutation, useQueryClient } from "@tanstack/react-query"

import { farmQueryKeys } from "@/lib/query-keys"
import { cyclesService } from "@/services/cycles.service"
import { operationsService } from "@/services/operations.service"
import type {
  CreateCycleRequest,
  CreateDailyLogRequest,
  CreateFeedPurchaseRequest,
  CreateManualExpenseRequest,
  CreateMedicationLogRequest,
  CreateSaleRequest,
  CreateWeightLogRequest,
} from "@/types/api"

async function invalidateCycleData(
  queryClient: ReturnType<typeof useQueryClient>,
  cycleId: string
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: farmQueryKeys.cycles() }),
    queryClient.invalidateQueries({ queryKey: farmQueryKeys.dashboard(cycleId) }),
    queryClient.invalidateQueries({ queryKey: farmQueryKeys.report(cycleId) }),
    queryClient.invalidateQueries({ queryKey: farmQueryKeys.dailyLogs(cycleId) }),
    queryClient.invalidateQueries({
      queryKey: farmQueryKeys.feedPurchases(cycleId),
    }),
    queryClient.invalidateQueries({
      queryKey: farmQueryKeys.feedBalances(cycleId),
    }),
    queryClient.invalidateQueries({ queryKey: farmQueryKeys.weightLogs(cycleId) }),
    queryClient.invalidateQueries({
      queryKey: farmQueryKeys.medicationLogs(cycleId),
    }),
    queryClient.invalidateQueries({ queryKey: farmQueryKeys.expenses(cycleId) }),
    queryClient.invalidateQueries({
      queryKey: farmQueryKeys.expenseBreakdown(cycleId),
    }),
    queryClient.invalidateQueries({ queryKey: farmQueryKeys.sale(cycleId) }),
  ])
}

export function useCreateCycleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCycleRequest) => cyclesService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: farmQueryKeys.cycles() })
    },
  })
}

export function useCreateDailyLogMutation(cycleId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateDailyLogRequest) =>
      operationsService.createDailyLog(cycleId!, payload),
    onSuccess: async () => {
      if (cycleId) {
        await invalidateCycleData(queryClient, cycleId)
      }
    },
  })
}

export function useCreateFeedPurchaseMutation(cycleId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateFeedPurchaseRequest) =>
      operationsService.createFeedPurchase(cycleId!, payload),
    onSuccess: async () => {
      if (cycleId) {
        await invalidateCycleData(queryClient, cycleId)
      }
    },
  })
}

export function useCreateWeightLogMutation(cycleId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateWeightLogRequest) =>
      operationsService.createWeightLog(cycleId!, payload),
    onSuccess: async () => {
      if (cycleId) {
        await invalidateCycleData(queryClient, cycleId)
      }
    },
  })
}

export function useCreateMedicationLogMutation(cycleId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateMedicationLogRequest) =>
      operationsService.createMedicationLog(cycleId!, payload),
    onSuccess: async () => {
      if (cycleId) {
        await invalidateCycleData(queryClient, cycleId)
      }
    },
  })
}

export function useCreateExpenseMutation(cycleId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateManualExpenseRequest) =>
      operationsService.createExpense(cycleId!, payload),
    onSuccess: async () => {
      if (cycleId) {
        await invalidateCycleData(queryClient, cycleId)
      }
    },
  })
}

export function useCreateSaleMutation(cycleId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSaleRequest) =>
      operationsService.createSale(cycleId!, payload),
    onSuccess: async () => {
      if (cycleId) {
        await invalidateCycleData(queryClient, cycleId)
      }
    },
  })
}
