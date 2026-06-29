export const authQueryKeys = {
  all: ["auth"] as const,
  me: () => [...authQueryKeys.all, "me"] as const,
}

export const farmQueryKeys = {
  all: ["farm"] as const,
  cycles: () => [...farmQueryKeys.all, "cycles"] as const,
  dashboard: (cycleId: string) =>
    [...farmQueryKeys.all, "dashboard", cycleId] as const,
  report: (cycleId: string) =>
    [...farmQueryKeys.all, "report", cycleId] as const,
  dailyLogs: (cycleId: string) =>
    [...farmQueryKeys.all, "daily-logs", cycleId] as const,
  feedPurchases: (cycleId: string) =>
    [...farmQueryKeys.all, "feed-purchases", cycleId] as const,
  feedBalances: (cycleId: string) =>
    [...farmQueryKeys.all, "feed-balances", cycleId] as const,
  weightLogs: (cycleId: string) =>
    [...farmQueryKeys.all, "weight-logs", cycleId] as const,
  medicationLogs: (cycleId: string) =>
    [...farmQueryKeys.all, "medication-logs", cycleId] as const,
  expenses: (cycleId: string) =>
    [...farmQueryKeys.all, "expenses", cycleId] as const,
  expenseBreakdown: (cycleId: string) =>
    [...farmQueryKeys.all, "expense-breakdown", cycleId] as const,
  sale: (cycleId: string) => [...farmQueryKeys.all, "sale", cycleId] as const,
}
