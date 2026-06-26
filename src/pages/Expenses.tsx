import { useState } from "react"
import { Wallet } from "lucide-react"

import ActionNotice, { type StatusMessage } from "@/components/common/ActionNotice"
import DataTable from "@/components/common/DataTable"
import EmptyState from "@/components/common/EmptyState"
import FormPanel from "@/components/common/FormPanel"
import InputField from "@/components/common/InputField"
import PageHeader from "@/components/common/PageHeader"
import SelectInput from "@/components/common/SelectInput"
import SurfaceCard from "@/components/common/SurfaceCard"
import TextAreaInput from "@/components/common/TextAreaInput"
import TextInput from "@/components/common/TextInput"
import { useFarmCycle } from "@/context/FarmCycleContext"
import { useCreateExpenseMutation } from "@/hooks/use-farm-mutations"
import { useExpenseBreakdownQuery, useExpensesQuery } from "@/hooks/use-farm-queries"
import { formatCurrency, formatDate } from "@/lib/format"
import { toNumber } from "@/lib/farm-utils"
import type { CreateManualExpenseRequest, ExpenseCategory } from "@/types/api"

const expenseCategoryOptions: Array<{ label: string; value: ExpenseCategory }> = [
  { label: "كتاكيت", value: "CHICKS" },
  { label: "علف", value: "FEED" },
  { label: "أدوية", value: "MEDICATION" },
  { label: "عمالة", value: "LABOR" },
  { label: "كهرباء", value: "ELECTRICITY" },
  { label: "نقل", value: "TRANSPORT" },
  { label: "متفرقات", value: "MISC" },
  { label: "أخرى", value: "OTHER" },
]

export default function Expenses() {
  const { selectedCycle, selectedCycleId } = useFarmCycle()
  const expensesQuery = useExpensesQuery(selectedCycleId)
  const expenseBreakdownQuery = useExpenseBreakdownQuery(selectedCycleId)
  const createExpenseMutation = useCreateExpenseMutation(selectedCycleId)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [form, setForm] = useState({
    expenseDate: "",
    category: "OTHER" as ExpenseCategory,
    amount: "",
    description: "",
  })

  if (!selectedCycleId) {
    return <EmptyState title="لا توجد دورة محددة" description="اختر دورة أولًا لتسجيل المصروفات." />
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatusMessage(null)

    const payload: CreateManualExpenseRequest = {
      expenseDate: form.expenseDate,
      category: form.category,
      amount: toNumber(form.amount),
      description: form.description.trim() === "" ? null : form.description,
    }

    void createExpenseMutation
      .mutateAsync(payload)
      .then(() => {
        setForm({ expenseDate: "", category: "OTHER", amount: "", description: "" })
        setStatusMessage({ tone: "success", text: "تمت إضافة المصروف بنجاح." })
      })
      .catch((error: unknown) => {
        setStatusMessage({
          tone: "error",
          text: error instanceof Error ? error.message : "تعذر حفظ المصروف.",
        })
      })
  }

  const expenseRows = [...(expensesQuery.data ?? [])].sort((left, right) =>
    right.expenseDate.localeCompare(left.expenseDate)
  )
  const breakdownEntries = Object.entries(expenseBreakdownQuery.data ?? {}).sort(
    ([, leftValue], [, rightValue]) => rightValue - leftValue
  )

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-5">
        <SurfaceCard className="p-5 sm:p-6">
          <PageHeader
            eyebrow="المصروفات"
            title={`المصروفات - ${selectedCycle?.name ?? ""}`}
            description="صفحة منفصلة لتسجيل المصروفات وتتبع توزيعها حسب الفئة."
          />
        </SurfaceCard>
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="إضافة مصروف يدوي"
          description="سجّل أي مصروف إضافي مرتبط بالدورة المحددة."
          submitLabel="حفظ المصروف"
          busy={createExpenseMutation.isPending}
          onSubmit={onSubmit}
        >
          <InputField label="التاريخ">
            <TextInput type="date" value={form.expenseDate} onChange={(event) => setForm((current) => ({ ...current, expenseDate: event.target.value }))} required />
          </InputField>
          <InputField label="الفئة">
            <SelectInput value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as ExpenseCategory }))} options={expenseCategoryOptions} />
          </InputField>
          <InputField label="المبلغ">
            <TextInput type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} required />
          </InputField>
          <InputField label="الوصف">
            <TextAreaInput value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </InputField>
        </FormPanel>
      </div>

      <div className="space-y-5">
        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">تفصيل المصروفات</p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">
                الفئات الأعلى تكلفة
              </h3>
            </div>
            <Wallet className="size-5 text-[#74A36A]" />
          </div>
          <div className="space-y-3">
            {breakdownEntries.length > 0 ? (
              breakdownEntries.map(([category, value]) => (
                <div key={category} className="rounded-2xl border border-[#E8EEE4] bg-[#FBFCF8] px-4 py-3">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
                    <span>{category}</span>
                    <span className="font-medium text-slate-900">{formatCurrency(value)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">لا توجد بيانات تفصيلية بعد.</p>
            )}
          </div>
        </SurfaceCard>

        <DataTable
          title="كل المصروفات"
          rows={expenseRows}
          emptyText="لا توجد مصروفات مسجلة بعد."
          columns={[
            { key: "date", title: "التاريخ", render: (row) => formatDate(row.expenseDate) },
            { key: "category", title: "الفئة", render: (row) => row.category },
            { key: "amount", title: "المبلغ", render: (row) => formatCurrency(row.amount) },
            { key: "source", title: "المصدر", render: (row) => row.sourceType ?? "MANUAL" },
            { key: "desc", title: "الوصف", render: (row) => row.description ?? "--" },
          ]}
        />
      </div>
    </div>
  )
}
