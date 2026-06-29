import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import { useCyclesQuery } from "@/hooks/use-farm-queries"
import { getPreferredCycleId } from "@/lib/farm-utils"
import { farmQueryKeys } from "@/lib/query-keys"
import type { Cycle } from "@/types/api"

type FarmCycleContextValue = {
  cycles: Cycle[]
  selectedCycleId: string | null
  setSelectedCycleId: (cycleId: string) => void
  selectedCycle: Cycle | null
  isLoadingCycles: boolean
  refreshAll: () => Promise<void>
}

const FarmCycleContext = React.createContext<FarmCycleContextValue | undefined>(
  undefined
)

export function FarmCycleProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = useQueryClient()
  const { data: cycles = [], isLoading: isLoadingCycles } = useCyclesQuery()
  const [selectedCycleId, setSelectedCycleId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setSelectedCycleId((current) => getPreferredCycleId(cycles, current))
  }, [cycles])

  const selectedCycle = React.useMemo(
    () => cycles.find((cycle) => cycle.id === selectedCycleId) ?? null,
    [cycles, selectedCycleId]
  )

  const refreshAll = React.useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: farmQueryKeys.all })
  }, [queryClient])

  const value = React.useMemo<FarmCycleContextValue>(
    () => ({
      cycles,
      selectedCycleId,
      setSelectedCycleId,
      selectedCycle,
      isLoadingCycles,
      refreshAll,
    }),
    [cycles, isLoadingCycles, refreshAll, selectedCycle, selectedCycleId]
  )

  return (
    <FarmCycleContext.Provider value={value}>
      {children}
    </FarmCycleContext.Provider>
  )
}

export function useFarmCycle() {
  const context = React.useContext(FarmCycleContext)

  if (!context) {
    throw new Error("useFarmCycle must be used within FarmCycleProvider.")
  }

  return context
}
