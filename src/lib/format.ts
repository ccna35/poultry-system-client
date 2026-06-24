const arabicNumberFormatter = new Intl.NumberFormat("ar-EG")

const arabicCurrencyFormatter = new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
})

const arabicPercentFormatter = new Intl.NumberFormat("ar-EG", {
    style: "percent",
    maximumFractionDigits: 1,
})

const arabicDateFormatter = new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
})

export function formatNumber(value: number) {
    return arabicNumberFormatter.format(value)
}

export function formatCurrency(value: number) {
    return arabicCurrencyFormatter.format(value)
}

export function formatPercent(value: number) {
    return arabicPercentFormatter.format(value / 100)
}

export function formatDate(value: string) {
    return arabicDateFormatter.format(new Date(value))
}

export function formatNullableNumber(
    value: number | null,
    formatter: (nextValue: number) => string = formatNumber
) {
    return value === null ? "—" : formatter(value)
}