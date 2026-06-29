import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { toast } from "@/lib/toast"
import DataTable from "@/components/common/DataTable"
import EmptyState from "@/components/common/EmptyState"
import FormDialog from "@/components/common/FormDialog"
import InputField from "@/components/common/InputField"
import TextAreaInput from "@/components/common/TextAreaInput"
import TextInput from "@/components/common/TextInput"
import { useFarmCycle } from "@/context/FarmCycleContext"
import { useCreateMedicationLogMutation } from "@/hooks/use-farm-mutations"
import { useMedicationLogsQuery } from "@/hooks/use-farm-queries"
import { formatDate } from "@/lib/format"
import type {
  CreateMedicationLogRequest,
  DosagePerUnit,
  DosageUnit,
  MedicationLog,
} from "@/types/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type MedicationLogFormValues = {
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

const defaultMedicationValues: MedicationLogFormValues = {
  date: "",
  medicineName: "",
  dosage: {
    amount: "",
    unit: "",
    perAmount: "1",
    perUnit: "LITER",
  },
  notes: "",
}

const selectTriggerClassName =
  "h-11 w-full rounded-2xl border border-[#E3E8DF] bg-[#FBFCF8] px-4 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus-visible:border-[#8CB17F] focus-visible:ring-4 focus-visible:ring-[#DDECD7]"

export default function MedicationLogs() {
  const { selectedCycleId } = useFarmCycle()
  const medicationLogsQuery = useMedicationLogsQuery(selectedCycleId)
  const createMedicationLogMutation =
    useCreateMedicationLogMutation(selectedCycleId)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicationLogFormValues>({
    defaultValues: defaultMedicationValues,
  })

  const rows = useMemo(
    () =>
      [...(medicationLogsQuery.data ?? [])].sort((left, right) =>
        right.date.localeCompare(left.date)
      ),
    [medicationLogsQuery.data]
  )

  if (!selectedCycleId) {
    return (
      <EmptyState
        title="لا توجد دورة محددة"
        description="اختر دورة أولًا لتسجيل الأدوية."
      />
    )
  }

  function handleDialogOpenChange(open: boolean) {
    setIsFormOpen(open)

    if (!open) {
      reset(defaultMedicationValues)
    }
  }

  function submitMedication(values: MedicationLogFormValues) {
    const payload: CreateMedicationLogRequest = {
      date: values.date,
      medicineName: values.medicineName,
      dosage: {
        amount: Number(values.dosage.amount),
        unit: values.dosage.unit as DosageUnit,
        perAmount: Number(values.dosage.perAmount || 1),
        perUnit: values.dosage.perUnit,
      },
      notes: values.notes.trim() === "" ? null : values.notes,
    }

    void createMedicationLogMutation
      .mutateAsync(payload)
      .then(() => {
        reset(defaultMedicationValues)
        setIsFormOpen(false)
        toast.success("تم حفظ سجل الدواء.")
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "تعذر حفظ سجل الدواء."
        )
      })
  }

  return (
    <div className="space-y-5">
      <FormDialog
        open={isFormOpen}
        onOpenChange={handleDialogOpenChange}
        triggerLabel="إضافة سجل دواء"
        title="إضافة سجل دواء"
        description="أدخل اسم الدواء والجرعة."
        submitLabel="حفظ الدواء"
        busy={createMedicationLogMutation.isPending}
        onSubmit={handleSubmit(submitMedication)}
      >
        <InputField label="التاريخ" error={errors.date?.message}>
          <TextInput
            type="date"
            {...register("date", { required: "التاريخ مطلوب" })}
            aria-invalid={Boolean(errors.date)}
          />
        </InputField>

        <InputField label="اسم الدواء" error={errors.medicineName?.message}>
          <TextInput
            {...register("medicineName", { required: "اسم الدواء مطلوب" })}
            aria-invalid={Boolean(errors.medicineName)}
          />
        </InputField>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="الكمية" error={errors.dosage?.amount?.message}>
            <TextInput
              type="number"
              min="0"
              step="0.01"
              {...register("dosage.amount", { required: "الكمية مطلوبة" })}
              aria-invalid={Boolean(errors.dosage?.amount)}
            />
          </InputField>

          <InputField label="وحدة الجرعة" error={errors.dosage?.unit?.message}>
            <Controller
              name="dosage.unit"
              control={control}
              rules={{ required: "اختر وحدة الجرعة" }}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => field.onChange(value as DosageUnit)}
                >
                  <SelectTrigger
                    className={selectTriggerClassName}
                    aria-invalid={Boolean(errors.dosage?.unit)}
                  >
                    <SelectValue placeholder="اختر الوحدة" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-[#E4EBDD] bg-white">
                    <SelectItem value="GRAM">جم</SelectItem>
                    <SelectItem value="ML">مل</SelectItem>
                    <SelectItem value="SPOON">ملعقة</SelectItem>
                    <SelectItem value="CM">سم</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </InputField>

          <InputField label="لكل" error={errors.dosage?.perAmount?.message}>
            <TextInput
              type="number"
              min="1"
              step="0.01"
              {...register("dosage.perAmount", {
                required: "قيمة لكل مطلوبة",
              })}
              aria-invalid={Boolean(errors.dosage?.perAmount)}
            />
          </InputField>

          <InputField
            label="وحدة القياس"
            error={errors.dosage?.perUnit?.message}
          >
            <Controller
              name="dosage.perUnit"
              control={control}
              rules={{ required: "اختر وحدة القياس" }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value as DosagePerUnit)
                  }
                >
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="اختر وحدة القياس" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-[#E4EBDD] bg-white">
                    <SelectItem value="LITER">لتر</SelectItem>
                    <SelectItem value="BIRD">طائر</SelectItem>
                    <SelectItem value="KG">كيلو وزن</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </InputField>
        </div>

        <InputField label="ملاحظات" error={errors.notes?.message}>
          <TextAreaInput {...register("notes")} />
        </InputField>
      </FormDialog>

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
