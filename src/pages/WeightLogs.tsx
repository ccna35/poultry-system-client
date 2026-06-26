import { useState } from "react"

import ActionNotice, { type StatusMessage } from "@/components/common/ActionNotice"
import DataTable from "@/components/common/DataTable"
import EmptyState from "@/components/common/EmptyState"
import FormPanel from "@/components/common/FormPanel"
import InputField from "@/components/common/InputField"
import PageHeader from "@/components/common/PageHeader"
import SurfaceCard from "@/components/common/SurfaceCard"
import TextAreaInput from "@/components/common/TextAreaInput"
import TextInput from "@/components/common/TextInput"
import { useFarmCycle } from "@/context/FarmCycleContext"
import { useCreateWeightLogMutation } from "@/hooks/use-farm-mutations"
import { useWeightLogsQuery } from "@/hooks/use-farm-queries"
import { formatDate, formatNumber } from "@/lib/format"
import { toNumber } from "@/lib/farm-utils"
import type { CreateWeightLogRequest } from "@/types/api"

export default function WeightLogs() {
  const { selectedCycle, selectedCycleId } = useFarmCycle()
  const weightLogsQuery = useWeightLogsQuery(selectedCycleId)
  const createWeightLogMutation = useCreateWeightLogMutation(selectedCycleId)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [form, setForm] = useState({
    date: "",
    sampleSize: "50",
    averageWeightKg: "",
    notes: "",
  })

  if (!selectedCycleId) {
    return <EmptyState title="لا توجد دورة محددة" description="اختر دورة أولًا لتسجيل الأوزان." />
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatusMessage(null)

    const payload: CreateWeightLogRequest = {
      date: form.date,
      sampleSize: toNumber(form.sampleSize),
      averageWeightKg: toNumber(form.averageWeightKg),
      notes: form.notes.trim() === "" ? null : form.notes,
    }

    void createWeightLogMutation
      .mutateAsync(payload)
      .then(() => {
        setForm({ date: "", sampleSize: "50", averageWeightKg: "", notes: "" })
        setStatusMessage({ tone: "success", text: "تم حفظ قراءة الوزن." })
      })
      .catch((error: unknown) => {
        setStatusMessage({
          tone: "error",
          text: error instanceof Error ? error.message : "تعذر حفظ الوزن.",
        })
      })
  }

  const rows = [...(weightLogsQuery.data ?? [])].sort((left, right) =>
    right.date.localeCompare(left.date)
  )

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <SurfaceCard className="p-5 sm:p-6">
          <PageHeader
            eyebrow="الأوزان"
            title={`متابعة الأوزان - ${selectedCycle?.name ?? ""}`}
            description="صفحة منفصلة لقراءات الأوزان حتى تبقى منطقية الصيانة والاختبار أسهل من النسخة القديمة."
          />
        </SurfaceCard>
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="تسجيل وزن جديد"
          description="أدخل متوسط الوزن وحجم العينة."
          submitLabel="حفظ الوزن"
          busy={createWeightLogMutation.isPending}
          onSubmit={onSubmit}
        >
          <InputField label="التاريخ">
            <TextInput type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} required />
          </InputField>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="حجم العينة">
              <TextInput type="number" min="1" value={form.sampleSize} onChange={(event) => setForm((current) => ({ ...current, sampleSize: event.target.value }))} required />
            </InputField>
            <InputField label="متوسط الوزن (كجم)">
              <TextInput type="number" min="0.1" step="0.01" value={form.averageWeightKg} onChange={(event) => setForm((current) => ({ ...current, averageWeightKg: event.target.value }))} required />
            </InputField>
          </div>
          <InputField label="ملاحظات">
            <TextAreaInput value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          </InputField>
        </FormPanel>
      </div>

      <DataTable
        title="متابعة الأوزان"
        rows={rows}
        emptyText="لا توجد قراءات وزن مسجلة حتى الآن."
        columns={[
          { key: "date", title: "التاريخ", render: (row) => formatDate(row.date) },
          { key: "sample", title: "العينة", render: (row) => formatNumber(row.sampleSize) },
          { key: "avg", title: "متوسط الوزن", render: (row) => `${formatNumber(row.averageWeightKg)} كجم` },
          { key: "notes", title: "ملاحظات", render: (row) => row.notes ?? "--" },
        ]}
      />
    </div>
  )
}
