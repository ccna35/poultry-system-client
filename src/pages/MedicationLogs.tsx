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
import { useCreateMedicationLogMutation } from "@/hooks/use-farm-mutations"
import { useMedicationLogsQuery } from "@/hooks/use-farm-queries"
import { formatCurrency, formatDate } from "@/lib/format"
import { toNumber } from "@/lib/farm-utils"
import type { CreateMedicationLogRequest, MedicationLog } from "@/types/api"

export default function MedicationLogs() {
  const { selectedCycle, selectedCycleId } = useFarmCycle()
  const medicationLogsQuery = useMedicationLogsQuery(selectedCycleId)
  const createMedicationLogMutation = useCreateMedicationLogMutation(selectedCycleId)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [form, setForm] = useState({
    date: "",
    medicineName: "",
    dosage: "",
    cost: "",
    notes: "",
  })

  if (!selectedCycleId) {
    return <EmptyState title="لا توجد دورة محددة" description="اختر دورة أولًا لتسجيل الأدوية." />
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatusMessage(null)

    const payload: CreateMedicationLogRequest = {
      date: form.date,
      medicineName: form.medicineName,
      dosage: form.dosage,
      cost: toNumber(form.cost),
      notes: form.notes.trim() === "" ? null : form.notes,
    }

    void createMedicationLogMutation
      .mutateAsync(payload)
      .then(() => {
        setForm({ date: "", medicineName: "", dosage: "", cost: "", notes: "" })
        setStatusMessage({ tone: "success", text: "تم حفظ سجل الدواء." })
      })
      .catch((error: unknown) => {
        setStatusMessage({
          tone: "error",
          text: error instanceof Error ? error.message : "تعذر حفظ سجل الدواء.",
        })
      })
  }

  const rows = [...(medicationLogsQuery.data ?? [])].sort((left, right) =>
    right.date.localeCompare(left.date)
  )

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <SurfaceCard className="p-5 sm:p-6">
          <PageHeader
            eyebrow="الأدوية"
            title={`سجلات الأدوية - ${selectedCycle?.name ?? ""}`}
            description="صفحة مخصصة لتسجيل العلاج والتكلفة بعيدًا عن الصفحة الرئيسية."
          />
        </SurfaceCard>
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="إضافة سجل دواء"
          description="أدخل اسم الدواء والجرعة والتكلفة."
          submitLabel="حفظ الدواء"
          busy={createMedicationLogMutation.isPending}
          onSubmit={onSubmit}
        >
          <InputField label="التاريخ">
            <TextInput type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} required />
          </InputField>
          <InputField label="اسم الدواء">
            <TextInput value={form.medicineName} onChange={(event) => setForm((current) => ({ ...current, medicineName: event.target.value }))} required />
          </InputField>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="الجرعة">
              <TextInput value={form.dosage} onChange={(event) => setForm((current) => ({ ...current, dosage: event.target.value }))} required />
            </InputField>
            <InputField label="التكلفة">
              <TextInput type="number" min="0" step="0.01" value={form.cost} onChange={(event) => setForm((current) => ({ ...current, cost: event.target.value }))} required />
            </InputField>
          </div>
          <InputField label="ملاحظات">
            <TextAreaInput value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          </InputField>
        </FormPanel>
      </div>

      <DataTable
        title="سجلات الأدوية"
        rows={rows}
        emptyText="لا توجد سجلات أدوية حتى الآن."
        columns={[
          { key: "date", title: "التاريخ", render: (row: MedicationLog) => formatDate(row.date) },
          { key: "name", title: "الدواء", render: (row: MedicationLog) => row.medicineName },
          { key: "dose", title: "الجرعة", render: (row: MedicationLog) => row.dosage },
          { key: "cost", title: "التكلفة", render: (row: MedicationLog) => formatCurrency(row.cost) },
          { key: "notes", title: "ملاحظات", render: (row: MedicationLog) => row.notes ?? "--" },
        ]}
      />
    </div>
  )
}
