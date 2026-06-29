import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { feedTypeOptions } from "@/common"
import { toast } from "@/lib/toast"
import DataTable from "@/components/common/DataTable"
import EmptyState from "@/components/common/EmptyState"
import FormDialog from "@/components/common/FormDialog"
import InputField from "@/components/common/InputField"
import SelectInput from "@/components/common/SelectInput"
import TextInput from "@/components/common/TextInput"
import { FeedBalanceCards } from "@/components/feedPurchase/FeedBalanceCards"
import { useFarmCycle } from "@/context/FarmCycleContext"
import { useCreateFeedPurchaseMutation } from "@/hooks/use-farm-mutations"
import {
  useDailyLogsQuery,
  useFeedBalancesQuery,
  useFeedPurchasesQuery,
} from "@/hooks/use-farm-queries"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { toNumber } from "@/lib/farm-utils"
import type { CreateFeedPurchaseRequest, FeedType } from "@/types/api"

type FeedMovementRow = {
  entryId: string
  date: string
  createdAt: string
  direction: "IN" | "OUT"
  movementLabel: string
  feedType: FeedType
  quantityDeltaKg: number
  unitPrice: number | null
  totalValue: number | null
  notes: string | null
  balanceAfterKg: number
}

type FeedPurchaseFormValues = {
  purchaseDate: string
  feedType: FeedType
  quantityKg: string
  unitPrice: string
}

const initialFeedBalances: Record<FeedType, number> = {
  STARTER: 0,
  GROWER: 0,
  FINISHER: 0,
}

const defaultFeedPurchaseValues: FeedPurchaseFormValues = {
  purchaseDate: "",
  feedType: "STARTER",
  quantityKg: "",
  unitPrice: "",
}

function getFeedTypeLabel(feedType: FeedType) {
  return (
    feedTypeOptions.find((option) => option.value === feedType)?.label ??
    feedType
  )
}

export default function FeedPurchases() {
  const { selectedCycleId } = useFarmCycle()
  const dailyLogsQuery = useDailyLogsQuery(selectedCycleId)
  const feedPurchasesQuery = useFeedPurchasesQuery(selectedCycleId)
  const feedBalancesQuery = useFeedBalancesQuery(selectedCycleId)
  const createFeedPurchaseMutation =
    useCreateFeedPurchaseMutation(selectedCycleId)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedPurchaseFormValues>({
    defaultValues: defaultFeedPurchaseValues,
  })

  const purchaseRows = useMemo(
    () =>
      [...(feedPurchasesQuery.data ?? [])].sort((left, right) =>
        right.purchaseDate.localeCompare(left.purchaseDate)
      ),
    [feedPurchasesQuery.data]
  )

  const movementRows = useMemo<FeedMovementRow[]>(() => {
    const purchaseMovements = (feedPurchasesQuery.data ?? [])
      .filter((purchase) => purchase.quantityKg > 0)
      .map((purchase) => ({
        entryId: purchase.id,
        date: purchase.purchaseDate,
        createdAt: purchase.createdAt,
        direction: "IN" as const,
        movementLabel: "شراء علف",
        feedType: purchase.feedType,
        quantityDeltaKg: purchase.quantityKg,
        unitPrice: purchase.unitPrice,
        totalValue: purchase.quantityKg * purchase.unitPrice,
        notes: null,
      }))

    const consumptionMovements = (dailyLogsQuery.data ?? [])
      .filter((log) => log.feedConsumedKg > 0)
      .map((log) => ({
        entryId: log.id,
        date: log.date,
        createdAt: log.createdAt,
        direction: "OUT" as const,
        movementLabel: "استهلاك يومي",
        feedType: log.feedType,
        quantityDeltaKg: -log.feedConsumedKg,
        unitPrice: null,
        totalValue: null,
        notes: log.notes,
      }))

    const runningBalances = { ...initialFeedBalances }

    const ledger = [...purchaseMovements, ...consumptionMovements]
      .sort((left, right) => {
        const dateCompare = left.date.localeCompare(right.date)

        if (dateCompare !== 0) {
          return dateCompare
        }

        if (left.direction !== right.direction) {
          return left.direction === "IN" ? -1 : 1
        }

        const createdAtCompare = left.createdAt.localeCompare(right.createdAt)

        if (createdAtCompare !== 0) {
          return createdAtCompare
        }

        return left.entryId.localeCompare(right.entryId)
      })
      .map((movement) => {
        const balanceAfterKg =
          runningBalances[movement.feedType] + movement.quantityDeltaKg

        runningBalances[movement.feedType] = balanceAfterKg

        return {
          ...movement,
          balanceAfterKg,
        }
      })

    return ledger.reverse()
  }, [dailyLogsQuery.data, feedPurchasesQuery.data])

  if (!selectedCycleId) {
    return (
      <EmptyState
        title="لا توجد دورة محددة"
        description="اختر دورة أولًا لتسجيل مشتريات العلف."
      />
    )
  }

  function handleDialogOpenChange(open: boolean) {
    setIsFormOpen(open)

    if (!open) {
      reset(defaultFeedPurchaseValues)
    }
  }

  function submitFeedPurchase(values: FeedPurchaseFormValues) {
    const payload: CreateFeedPurchaseRequest = {
      purchaseDate: values.purchaseDate,
      feedType: values.feedType,
      quantityKg: toNumber(values.quantityKg),
      unitPrice: toNumber(values.unitPrice),
    }

    void createFeedPurchaseMutation
      .mutateAsync(payload)
      .then(() => {
        reset(defaultFeedPurchaseValues)
        setIsFormOpen(false)
        toast.success("تم تسجيل شراء العلف.")
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "تعذر تسجيل شراء العلف."
        )
      })
  }

  return (
    <div className="space-y-5">
      <FormDialog
        open={isFormOpen}
        onOpenChange={handleDialogOpenChange}
        triggerLabel="تسجيل شراء علف"
        title="تسجيل شراء علف"
        description="أضف نوع العلف والكمية وسعر الوحدة."
        submitLabel="حفظ المشتريات"
        busy={createFeedPurchaseMutation.isPending}
        onSubmit={handleSubmit(submitFeedPurchase)}
      >
        <InputField label="تاريخ الشراء" error={errors.purchaseDate?.message}>
          <TextInput
            type="date"
            {...register("purchaseDate", { required: "تاريخ الشراء مطلوب" })}
            aria-invalid={Boolean(errors.purchaseDate)}
          />
        </InputField>

        <div className="grid gap-4 md:grid-cols-3">
          <InputField label="نوع العلف" error={errors.feedType?.message}>
            <Controller
              name="feedType"
              control={control}
              rules={{ required: "نوع العلف مطلوب" }}
              render={({ field }) => (
                <SelectInput
                  options={feedTypeOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  aria-invalid={Boolean(errors.feedType)}
                />
              )}
            />
          </InputField>

          <InputField label="الكمية (كجم)" error={errors.quantityKg?.message}>
            <TextInput
              type="number"
              min="0.1"
              step="0.01"
              {...register("quantityKg", { required: "الكمية مطلوبة" })}
              aria-invalid={Boolean(errors.quantityKg)}
            />
          </InputField>

          <InputField label="سعر الوحدة" error={errors.unitPrice?.message}>
            <TextInput
              type="number"
              min="0"
              step="0.01"
              {...register("unitPrice", { required: "سعر الوحدة مطلوب" })}
              aria-invalid={Boolean(errors.unitPrice)}
            />
          </InputField>
        </div>
      </FormDialog>

      <FeedBalanceCards balances={feedBalancesQuery.data ?? []} />

      <DataTable
        title="حركة العلف"
        actionLabel={`${formatNumber(movementRows.length)} حركة`}
        rows={movementRows}
        emptyText="لا توجد حركات علف مسجلة حتى الآن."
        columns={[
          {
            key: "date",
            title: "التاريخ",
            render: (row) => formatDate(row.date),
          },
          {
            key: "statement",
            title: "البيان",
            render: (row) => (
              <div className="space-y-1">
                <p className="font-medium text-slate-800">
                  {row.movementLabel}
                </p>
                <p className="text-xs text-slate-500">{row.notes ?? "--"}</p>
              </div>
            ),
          },
          {
            key: "direction",
            title: "الاتجاه",
            render: (row) => (
              <span
                className={
                  row.direction === "IN"
                    ? "inline-flex rounded-full bg-[#EAF7E8] px-3 py-1 text-xs font-medium text-[#4E8B4A]"
                    : "inline-flex rounded-full bg-[#FFF4E9] px-3 py-1 text-xs font-medium text-[#C97318]"
                }
              >
                {row.direction === "IN" ? "وارد" : "منصرف"}
              </span>
            ),
          },
          {
            key: "type",
            title: "نوع العلف",
            render: (row) => getFeedTypeLabel(row.feedType),
          },
          {
            key: "qty",
            title: "الكمية",
            render: (row) => (
              <span
                className={
                  row.quantityDeltaKg >= 0 ? "text-[#4E8B4A]" : "text-[#C97318]"
                }
              >
                {`${row.quantityDeltaKg >= 0 ? "+" : ""}${formatNumber(
                  row.quantityDeltaKg
                )} كجم`}
              </span>
            ),
          },
          {
            key: "unitPrice",
            title: "سعر الوحدة",
            render: (row) =>
              row.unitPrice === null ? "--" : formatCurrency(row.unitPrice),
          },
          {
            key: "totalValue",
            title: "قيمة الحركة",
            render: (row) =>
              row.totalValue === null ? "--" : formatCurrency(row.totalValue),
          },
          {
            key: "balance",
            title: "الرصيد بعد الحركة",
            render: (row) => `${formatNumber(row.balanceAfterKg)} كجم`,
          },
        ]}
      />

      <DataTable
        title="مشتريات العلف"
        rows={purchaseRows}
        emptyText="لا توجد مشتريات علف مسجلة حتى الآن."
        columns={[
          {
            key: "date",
            title: "التاريخ",
            render: (row) => formatDate(row.purchaseDate),
          },
          {
            key: "type",
            title: "النوع",
            render: (row) => getFeedTypeLabel(row.feedType),
          },
          {
            key: "qty",
            title: "الكمية",
            render: (row) => `${formatNumber(row.quantityKg)} كجم`,
          },
          {
            key: "price",
            title: "سعر الوحدة",
            render: (row) => formatCurrency(row.unitPrice),
          },
          {
            key: "total",
            title: "الإجمالي",
            render: (row) => formatCurrency(row.quantityKg * row.unitPrice),
          },
        ]}
      />
    </div>
  )
}
