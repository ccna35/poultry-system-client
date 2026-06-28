import { Card, CardContent } from "@/components/ui/card"

export type FeedType = "STARTER" | "GROWER" | "FINISHER"

export interface FeedBalance {
  feedType: FeedType
  quantityKg: number
}

type FeedBalanceCardsProps = {
  balances: FeedBalance[]
}

const feedTypeLabel: Record<FeedType, string> = {
  STARTER: "علف بادئ",
  GROWER: "علف نامي",
  FINISHER: "علف ناهي",
}

export function FeedBalanceCards({ balances }: FeedBalanceCardsProps) {
  return (
    <div dir="rtl" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {balances.map((balance) => (
        <Card
          key={balance.feedType}
          className="border border-slate-200 bg-white shadow-none"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">
                  {feedTypeLabel[balance.feedType]}
                </p>

                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {balance.quantityKg}
                  <span className="mr-1 text-sm font-normal text-slate-500">
                    كجم
                  </span>
                </p>
              </div>

              <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                🌾
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
