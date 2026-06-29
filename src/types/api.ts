export type ApiEnvelope<T> = {
    success: boolean
    data: T
}

export type Nullable<T> = T | null

export type AuthUser = {
    id?: string
    email?: Nullable<string>
    name?: Nullable<string>
    fullName?: Nullable<string>
    role?: Nullable<string>
}

export type LoginRequest = {
    email: string
    password: string
}

export type CycleStatus = "ACTIVE" | "COMPLETED"
export type FeedType = "STARTER" | "GROWER" | "FINISHER"

export type ExpenseCategory =
    | "CHICKS"
    | "FEED"
    | "MEDICATION"
    | "LABOR"
    | "ELECTRICITY"
    | "TRANSPORT"
    | "MISC"
    | "OTHER"

export type ExpenseSourceType =
    | "MANUAL"
    | "FEED_PURCHASE"
    | "MEDICATION_LOG"
    | "SYSTEM"

export type Cycle = {
    id: string
    name: string
    startDate: string
    endDate: Nullable<string>
    status: CycleStatus
    initialBirds: number
    chickPrice: number
    expectedFinalWeightKg: number
    expectedSellingPricePerKg: number
    expectedRemainingCost: number
    createdAt: string
    updatedAt: string
}

export type DailyLog = {
    id: string
    cycleId: string
    date: string
    deaths: number
    feedConsumedKg: number
    feedType: FeedType
    waterConsumedLiters: number
    temperature: Nullable<number>
    humidity: Nullable<number>
    notes: Nullable<string>
    createdAt: string
    updatedAt: string
}

export type FeedPurchase = {
    id: string
    cycleId: string
    purchaseDate: string
    feedType: FeedType
    quantityKg: number
    unitPrice: number
    createdAt: string
    updatedAt: string
}

export interface FeedBalance {
    feedType: FeedType
    quantityKg: number
}

export type FeedInventoryMovementType =
    | "PURCHASE"
    | "CONSUMPTION"
    | "ADJUSTMENT"
export type FeedInventoryReferenceType =
    | "FEED_PURCHASE"
    | "DAILY_LOG"
    | "MANUAL"
    | "SYSTEM"

export interface FeedInventoryMovement {
    id: string
    cycleId: string
    movementDate: string
    feedType: FeedType
    movementType: FeedInventoryMovementType
    quantityKg: number
    referenceType: FeedInventoryReferenceType | null
    referenceId: string | null
    notes: string | null
    createdAt: string
    updatedAt: string
}

export type WeightLog = {
    id: string
    cycleId: string
    date: string
    sampleSize: number
    averageWeightKg: number
    notes: Nullable<string>
    createdAt: string
    updatedAt: string
}

export type MedicationLog = {
    id: string
    cycleId: string
    date: string
    medicineName: string
    dosage: MedicationDosage
    cost: number
    notes: Nullable<string>
    createdAt: string
    updatedAt: string
}

export type Expense = {
    id: string
    cycleId: string
    expenseDate: string
    category: ExpenseCategory
    amount: number
    description: Nullable<string>
    sourceType: Nullable<ExpenseSourceType>
    sourceId: Nullable<string>
    createdAt: string
    updatedAt: string
}

export type Sale = {
    id: string
    cycleId: string
    saleDate: string
    totalWeightKg: number
    pricePerKg: number
    createdAt: string
    updatedAt: string
}

export type ChartPoint = {
    date: string
    value: Nullable<number>
}

export type DashboardCharts = {
    deaths: ChartPoint[]
    temperature: ChartPoint[]
    humidity: ChartPoint[]
    feedConsumedKg: ChartPoint[]
    averageWeightKg: ChartPoint[]
}

export type DashboardSummary = {
    cycleId: string
    cycleName: string
    cycleStatus: CycleStatus
    currentDay: number
    initialBirds: number
    totalDeaths: number
    remainingBirds: number
    mortalityRate: number
    totalFeedConsumedKg: number
    latestAverageWeightKg: Nullable<number>
    feedCost: number
    medicationCost: number
    otherExpenses: number
    totalExpenses: number
    estimatedRevenue: number
    estimatedProfit: number
    actualRevenue: Nullable<number>
    actualProfit: Nullable<number>
    fcrEstimate: Nullable<number>
    actualFcr: Nullable<number>
    charts: DashboardCharts
}

export type CreateCycleRequest = {
    name: string
    startDate: string
    initialBirds: number
    chickPrice: number
    expectedFinalWeightKg: number
    expectedSellingPricePerKg: number
    expectedRemainingCost: number
}

export type CreateDailyLogRequest = {
    date: string
    deaths: number
    feedConsumedKg: number
    feedType: FeedType
    waterConsumedLiters: number
    temperature?: Nullable<number>
    humidity?: Nullable<number>
    notes?: Nullable<string>
}

export type CreateFeedPurchaseRequest = {
    purchaseDate: string
    feedType: FeedType
    quantityKg: number
    unitPrice: number
}

export type CreateWeightLogRequest = {
    date: string
    sampleSize: number
    averageWeightKg: number
    notes?: Nullable<string>
}
export type DosageUnit = "SPOON" | "GRAM" | "ML" | "CM"
export type DosagePerUnit = "LITER" | "BIRD" | "KG"
export interface MedicationDosage {
    amount: number
    unit: DosageUnit
    perAmount?: number
    perUnit: DosagePerUnit
}

export type CreateMedicationLogRequest = {
    date: string
    medicineName: string
    dosage: MedicationDosage
    notes?: Nullable<string>
}

export type CreateManualExpenseRequest = {
    expenseDate: string
    category: ExpenseCategory
    amount: number
    description?: Nullable<string>
}

export type CreateSaleRequest = {
    saleDate: string
    totalWeightKg: number
    pricePerKg: number
}

export type ExpenseBreakdown = Record<string, number>

export type DashboardSectionState<T> = {
    data: T
    error: string | null
}
