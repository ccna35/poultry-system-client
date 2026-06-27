import { useState } from "react"

import ActionNotice, {
  type StatusMessage,
} from "@/components/common/ActionNotice"
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
import type {
  CreateMedicationLogRequest,
  DosagePerUnit,
  DosageUnit,
  MedicationLog,
} from "@/types/api"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function MedicationLogs() {
  const { selectedCycle, selectedCycleId } = useFarmCycle()
  const medicationLogsQuery = useMedicationLogsQuery(selectedCycleId)
  const createMedicationLogMutation =
    useCreateMedicationLogMutation(selectedCycleId)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  type MedicationLogFormState = {
    date: string
    medicineName: string
    dosage: {
      amount: string
      unit: DosageUnit | ""
      perAmount: string
      perUnit: DosagePerUnit
    }
    notes: string
  }

  const [form, setForm] = useState<MedicationLogFormState>({
    date: "",
    medicineName: "",
    dosage: {
      amount: "",
      unit: "",
      perAmount: "1",
      perUnit: "لتر",
    },
    notes: "",
  })

  if (!selectedCycleId) {
    return (
      <EmptyState
        title="لا توجد دورة محددة"
        description="اختر دورة أولًا لتسجيل الأدوية."
      />
    )
  }

  const updateDosage = (field: keyof typeof form.dosage, value: string) => {
    setForm((current) => ({
      ...current,
      dosage: {
        ...current.dosage,
        [field]: value,
      },
    }))
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatusMessage(null)

    const payload: CreateMedicationLogRequest = {
      date: form.date,
      medicineName: form.medicineName,
      dosage: {
        amount: Number(form.dosage.amount),
        unit: form.dosage.unit as DosageUnit,
        perAmount: Number(form.dosage.perAmount || 1),
        perUnit: form.dosage.perUnit,
      },
      notes: form.notes.trim() === "" ? null : form.notes,
    }

    void createMedicationLogMutation
      .mutateAsync(payload)
      .then(() => {
        setForm({
          date: "",
          medicineName: "",
          dosage: {
            amount: "",
            unit: "",
            perAmount: "1",
            perUnit: "liter",
          },
          notes: "",
        })
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
        {/* <SurfaceCard className="p-5 sm:p-6">
          <PageHeader
            eyebrow="الأدوية"
            title={`سجلات الأدوية - ${selectedCycle?.name ?? ""}`}
            description="صفحة مخصصة لتسجيل العلاج والتكلفة بعيدًا عن الصفحة الرئيسية."
          />
        </SurfaceCard> */}
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="إضافة سجل دواء"
          description="أدخل اسم الدواء والجرعة والتكلفة."
          submitLabel="حفظ الدواء"
          busy={createMedicationLogMutation.isPending}
          onSubmit={onSubmit}
        >
          <InputField label="التاريخ">
            <TextInput
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((current) => ({ ...current, date: event.target.value }))
              }
              required
            />
          </InputField>
          <InputField label="اسم الدواء">
            <TextInput
              value={form.medicineName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  medicineName: event.target.value,
                }))
              }
              required
            />
          </InputField>
          <div className="grid gap-4 md:grid-cols-4">
            <InputField label="الكمية">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.dosage.amount}
                onChange={(event) => updateDosage("amount", event.target.value)}
                required
              />
            </InputField>

            <InputField label="وحدة الجرعة">
              <Select
                value={form.dosage.unit}
                onValueChange={(value) => updateDosage("unit", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الوحدة" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="جرام">جم</SelectItem>
                  <SelectItem value="مل">مل</SelectItem>
                  <SelectItem value="ملعقة">ملعقة</SelectItem>
                </SelectContent>
              </Select>
            </InputField>

            <InputField label="لكل">
              <Input
                type="number"
                min="1"
                step="0.01"
                value={form.dosage.perAmount}
                onChange={(event) =>
                  updateDosage("perAmount", event.target.value)
                }
                required
              />
            </InputField>

            <InputField label="وحدة القياس">
              <Select
                value={form.dosage.perUnit}
                onValueChange={(value) => updateDosage("perUnit", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر وحدة القياس" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="لتر">لتر</SelectItem>
                  <SelectItem value="طائر">طائر</SelectItem>
                  <SelectItem value="كجم">كيلو وزن</SelectItem>
                </SelectContent>
              </Select>
            </InputField>
          </div>
          <InputField label="ملاحظات">
            <TextAreaInput
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
            />
          </InputField>
        </FormPanel>
      </div>

      <DataTable
        title="سجلات الأدوية"
        rows={rows}
        emptyText="لا توجد سجلات أدوية حتى الآن."
        columns={[
          {
            key: "date",
            title: "التاريخ",
            render: (row: MedicationLog) => formatDate(row.date),
          },
          {
            key: "name",
            title: "الدواء",
            render: (row: MedicationLog) => row.medicineName,
          },
          {
            key: "dose",
            title: "الجرعة",
            render: (row: MedicationLog) =>
              `${row.dosage.amount} ${row.dosage.unit} لكل ${row.dosage.perAmount} ${row.dosage.perUnit}`,
          },
          {
            key: "notes",
            title: "ملاحظات",
            render: (row: MedicationLog) => row.notes ?? "--",
          },
        ]}
      />
    </div>
  )
}
