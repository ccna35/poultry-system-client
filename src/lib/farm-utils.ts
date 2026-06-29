import type { Cycle } from "@/types/api"

export function getPreferredCycleId(
  cycles: Cycle[],
  currentCycleId: string | null
) {
  if (currentCycleId && cycles.some((cycle) => cycle.id === currentCycleId)) {
    return currentCycleId
  }

  return (
    cycles.find((cycle) => cycle.status === "ACTIVE")?.id ??
    cycles[0]?.id ??
    null
  )
}

export function toNumber(value: string) {
  return Number(value)
}

export function toOptionalNumber(value: string) {
  return value.trim() === "" ? null : Number(value)
}

export function getLastNumericValue(values: Array<number | null>) {
  return [...values].reverse().find((value): value is number => value !== null)
}

export function buildCumulative(values: Array<number | null>) {
  let total = 0

  return values.map((value) => {
    total += value ?? 0
    return total
  })
}

export function deriveHealthState(
  temperature: number | null,
  humidity: number | null
) {
  if (temperature === null || humidity === null) {
    return "Unknown"
  }

  if (
    temperature <= 31 &&
    temperature >= 27 &&
    humidity >= 55 &&
    humidity <= 70
  ) {
    return "Excellent"
  }

  return "Needs review"
}
