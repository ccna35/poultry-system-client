import { useState } from "react"

import ActionNotice, { type StatusMessage } from "@/components/common/ActionNotice"
import DataTable from "@/components/common/DataTable"
import EmptyState from "@/components/common/EmptyState"
import FormPanel from "@/components/common/FormPanel"
import InputField from "@/components/common/InputField"
import PageHeader from "@/components/common/PageHeader"
import SelectInput from "@/components/common/SelectInput"
import SurfaceCard from "@/components/common/SurfaceCard"
import TextInput from "@/components/common/TextInput"
import { useFarmCycle } from "@/context/FarmCycleContext"
import { useCreateFeedPurchaseMutation } from "@/hooks/use-farm-mutations"
import { useFeedPurchasesQuery } from "@/hooks/use-farm-queries"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { toNumber } from "@/lib/farm-utils"
import type { CreateFeedPurchaseRequest, FeedType } from "@/types/api"

const feedTypeOptions: Array<{ label: string; value: FeedType }> = [
  { label: "بادئ", value: "STARTER" },
  { label: "نامي", value: "GROWER" },
  { label: "ناهٍ", value: "FINISHER" },
]

export default function FeedPurchases() {
  const { selectedCycle, selectedCycleId } = useFarmCycle()
  const feedPurchasesQuery = useFeedPurchasesQuery(selectedCycleId)
  const createFeedPurchaseMutation = useCreateFeedPurchaseMutation(selectedCycleId)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [form, setForm] = useState({
    purchaseDate: "",
    feedType: "STARTER" as FeedType,
    quantityKg: "",
    unitPrice: "",
  })

  if (!selectedCycleId) {
    return <EmptyState title="لا توجد دورة محددة" description="اختر دورة أولًا لتسجيل مشتريات العلف." />
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatusMessage(null)

    const payload: CreateFeedPurchaseRequest = {
      purchaseDate: form.purchaseDate,
      feedType: form.feedType,
      quantityKg: toNumber(form.quantityKg),
      unitPrice: toNumber(form.unitPrice),
    }

    void createFeedPurchaseMutation
      .mutateAsync(payload)
      .then(() => {
        setForm({ purchaseDate: "", feedType: "STARTER", quantityKg: "", unitPrice: "" })
        setStatusMessage({ tone: "success", text: "تم تسجيل شراء العلف." })
      })
      .catch((error: unknown) => {
        setStatusMessage({
          tone: "error",
          text: error instanceof Error ? error.message : "تعذر تسجيل شراء العلف.",
        })
      })
  }

  const rows = [...(feedPurchasesQuery.data ?? [])].sort((left, right) =>
    right.purchaseDate.localeCompare(left.purchaseDate)
  )

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <SurfaceCard className="p-5 sm:p-6">
          <PageHeader
            eyebrow="العلف"
            title={`مشتريات العلف - ${selectedCycle?.name ?? ""}`}
            description="صفحة مخصصة لتتبع نوع العلف والكميات والأسعار باستخدام mutations مستقلة عن باقي الصفحات."
          />
        </SurfaceCard>
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="تسجيل شراء علف"
          description="أضف نوع العلف والكمية وسعر الوحدة."
          submitLabel="حفظ المشتريات"
          busy={createFeedPurchaseMutation.isPending}
          onSubmit={onSubmit}
        >
          <InputField label="تاريخ الشراء">
            <TextInput
              type="date"
              value={form.purchaseDate}
              onChange={(event) => setForm((current) => ({ ...current, purchaseDate: event.target.value }))}
              required
            />
          </InputField>
          <InputField label="نوع العلف">
            <SelectInput
              value={form.feedType}
              onChange={(event) => setForm((current) => ({ ...current, feedType: event.target.value as FeedType }))}
              options={feedTypeOptions}
            />
          </InputField>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="الكمية (كجم)">
              <TextInput
                type="number"
                min="0.1"
                step="0.01"
                value={form.quantityKg}
                onChange={(event) => setForm((current) => ({ ...current, quantityKg: event.target.value }))}
                required
              />
            </InputField>
            <InputField label="سعر الوحدة">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={form.unitPrice}
                onChange={(event) => setForm((current) => ({ ...current, unitPrice: event.target.value }))}
                required
              />
            </InputField>
          </div>
        </FormPanel>
      </div>

      <DataTable
        title="مشتريات العلف"
        rows={rows}
        emptyText="لا توجد مشتريات علف مسجلة حتى الآن."
        columns={[
          { key: "date", title: "التاريخ", render: (row) => formatDate(row.purchaseDate) },
          {
            key: "type",
            title: "النوع",
            render: (row) => feedTypeOptions.find((option) => option.value === row.feedType)?.label ?? row.feedType,
          },
          { key: "qty", title: "الكمية", render: (row) => `${formatNumber(row.quantityKg)} كجم` },
          { key: "price", title: "سعر الوحدة", render: (row) => formatCurrency(row.unitPrice) },
          { key: "total", title: "الإجمالي", render: (row) => formatCurrency(row.quantityKg * row.unitPrice) },
        ]}
      />
    </div>
  )
}
