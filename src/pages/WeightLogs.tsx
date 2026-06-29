import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { toast } from "@/lib/toast"
import DataTable from "@/components/common/DataTable"
import EmptyState from "@/components/common/EmptyState"
import FormDialog from "@/components/common/FormDialog"
import InputField from "@/components/common/InputField"
import TextAreaInput from "@/components/common/TextAreaInput"
import TextInput from "@/components/common/TextInput"
import { useFarmCycle } from "@/context/FarmCycleContext"
import { useCreateWeightLogMutation } from "@/hooks/use-farm-mutations"
import { useWeightLogsQuery } from "@/hooks/use-farm-queries"
import { formatDate, formatNumber } from "@/lib/format"
import { toNumber } from "@/lib/farm-utils"
import type { CreateWeightLogRequest } from "@/types/api"

type WeightLogFormValues = {
  date: string
  sampleSize: string
  averageWeightKg: string
  notes: string
}

const defaultWeightLogValues: WeightLogFormValues = {
  date: "",
  sampleSize: "50",
  averageWeightKg: "",
  notes: "",
}

export default function WeightLogs() {
  const { selectedCycleId } = useFarmCycle()
  const weightLogsQuery = useWeightLogsQuery(selectedCycleId)
  const createWeightLogMutation = useCreateWeightLogMutation(selectedCycleId)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WeightLogFormValues>({
    defaultValues: defaultWeightLogValues,
  })

  const rows = useMemo(
    () =>
      [...(weightLogsQuery.data ?? [])].sort((left, right) =>
        right.date.localeCompare(left.date)
      ),
    [weightLogsQuery.data]
  )

  if (!selectedCycleId) {
    return (
      <EmptyState
        title="لا توجد دورة محددة"
        description="اختر دورة أولًا لتسجيل الأوزان."
      />
    )
  }

  function handleDialogOpenChange(open: boolean) {
    setIsFormOpen(open)

    if (!open) {
      reset(defaultWeightLogValues)
    }
  }

  function submitWeightLog(values: WeightLogFormValues) {
    const payload: CreateWeightLogRequest = {
      date: values.date,
      sampleSize: toNumber(values.sampleSize),
      averageWeightKg: toNumber(values.averageWeightKg),
      notes: values.notes.trim() === "" ? null : values.notes,
    }

    void createWeightLogMutation
      .mutateAsync(payload)
      .then(() => {
        reset(defaultWeightLogValues)
        setIsFormOpen(false)
        toast.success("تم حفظ قراءة الوزن.")
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "تعذر حفظ الوزن.")
      })
  }

  return (
    <div className="space-y-5">
      <FormDialog
        open={isFormOpen}
        onOpenChange={handleDialogOpenChange}
        triggerLabel="تسجيل وزن جديد"
        title="تسجيل وزن جديد"
        description="أدخل متوسط الوزن وحجم العينة."
        submitLabel="حفظ الوزن"
        busy={createWeightLogMutation.isPending}
        onSubmit={handleSubmit(submitWeightLog)}
      >
        <InputField label="التاريخ" error={errors.date?.message}>
          <TextInput
            type="date"
            {...register("date", { required: "التاريخ مطلوب" })}
            aria-invalid={Boolean(errors.date)}
          />
        </InputField>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="حجم العينة" error={errors.sampleSize?.message}>
            <TextInput
              type="number"
              min="1"
              {...register("sampleSize", { required: "حجم العينة مطلوب" })}
              aria-invalid={Boolean(errors.sampleSize)}
            />
          </InputField>

          <InputField
            label="متوسط الوزن (كجم)"
            error={errors.averageWeightKg?.message}
          >
            <TextInput
              type="number"
              min="0.1"
              step="0.01"
              {...register("averageWeightKg", {
                required: "متوسط الوزن مطلوب",
              })}
              aria-invalid={Boolean(errors.averageWeightKg)}
            />
          </InputField>
        </div>

        <InputField label="ملاحظات" error={errors.notes?.message}>
          <TextAreaInput {...register("notes")} />
        </InputField>
      </FormDialog>

      <DataTable
        title="متابعة الأوزان"
        rows={rows}
        emptyText="لا توجد قراءات وزن مسجلة حتى الآن."
        columns={[
          {
            key: "date",
            title: "التاريخ",
            render: (row) => formatDate(row.date),
          },
          {
            key: "sample",
            title: "العينة",
            render: (row) => formatNumber(row.sampleSize),
          },
          {
            key: "avg",
            title: "متوسط الوزن",
            render: (row) => `${formatNumber(row.averageWeightKg)} كجم`,
          },
          {
            key: "notes",
            title: "ملاحظات",
            render: (row) => row.notes ?? "--",
          },
        ]}
      />
    </div>
  )
}
