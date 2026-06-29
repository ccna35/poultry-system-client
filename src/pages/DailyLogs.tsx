import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { feedTypeOptions } from "@/common"
import { toast } from "@/lib/toast"
import DataTable from "@/components/common/DataTable"
import EmptyState from "@/components/common/EmptyState"
import FormDialog from "@/components/common/FormDialog"
import InputField from "@/components/common/InputField"
import SelectInput from "@/components/common/SelectInput"
import TextAreaInput from "@/components/common/TextAreaInput"
import TextInput from "@/components/common/TextInput"
import { useFarmCycle } from "@/context/FarmCycleContext"
import { useCreateDailyLogMutation } from "@/hooks/use-farm-mutations"
import { useDailyLogsQuery } from "@/hooks/use-farm-queries"
import { formatDate, formatNullableNumber, formatNumber } from "@/lib/format"
import { toNumber, toOptionalNumber } from "@/lib/farm-utils"
import type { CreateDailyLogRequest, DailyLog, FeedType } from "@/types/api"

type DailyLogFormValues = {
  date: string
  deaths: string
  feedConsumedKg: string
  feedType: FeedType
  waterConsumedLiters: string
  temperature: string
  humidity: string
  notes: string
}

const defaultDailyLogValues: DailyLogFormValues = {
  date: "",
  deaths: "0",
  feedConsumedKg: "",
  feedType: "STARTER",
  waterConsumedLiters: "",
  temperature: "",
  humidity: "",
  notes: "",
}

export default function DailyLogs() {
  const { selectedCycleId } = useFarmCycle()
  const dailyLogsQuery = useDailyLogsQuery(selectedCycleId)
  const createDailyLogMutation = useCreateDailyLogMutation(selectedCycleId)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DailyLogFormValues>({
    defaultValues: defaultDailyLogValues,
  })

  const rows = useMemo(
    () =>
      [...(dailyLogsQuery.data ?? [])].sort((left, right) =>
        right.date.localeCompare(left.date)
      ),
    [dailyLogsQuery.data]
  )

  if (!selectedCycleId) {
    return (
      <EmptyState
        title="لا توجد دورة محددة"
        description="اختر دورة أولًا من الشريط العلوي ثم أضف سجلًا يوميًا."
      />
    )
  }

  function handleDialogOpenChange(open: boolean) {
    setIsFormOpen(open)

    if (!open) {
      reset(defaultDailyLogValues)
    }
  }

  function submitDailyLog(values: DailyLogFormValues) {
    const payload: CreateDailyLogRequest = {
      date: values.date,
      deaths: toNumber(values.deaths),
      feedConsumedKg: toNumber(values.feedConsumedKg),
      feedType: values.feedType,
      waterConsumedLiters: toNumber(values.waterConsumedLiters),
      temperature: toOptionalNumber(values.temperature),
      humidity: toOptionalNumber(values.humidity),
      notes: values.notes.trim() === "" ? null : values.notes,
    }

    void createDailyLogMutation
      .mutateAsync(payload)
      .then(() => {
        reset(defaultDailyLogValues)
        setIsFormOpen(false)
        toast.success("تمت إضافة السجل اليومي.")
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "تعذر حفظ السجل اليومي."
        )
      })
  }

  return (
    <div className="space-y-5">
      <FormDialog
        open={isFormOpen}
        onOpenChange={handleDialogOpenChange}
        triggerLabel="إضافة سجل يومي"
        title="إضافة سجل يومي"
        description="أدخل النافق واستهلاك العلف وبيانات البيئة اليومية."
        submitLabel="حفظ السجل اليومي"
        busy={createDailyLogMutation.isPending}
        onSubmit={handleSubmit(submitDailyLog)}
      >
        <InputField label="التاريخ" error={errors.date?.message}>
          <TextInput
            type="date"
            {...register("date", { required: "التاريخ مطلوب" })}
            aria-invalid={Boolean(errors.date)}
          />
        </InputField>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="النافق" error={errors.deaths?.message}>
            <TextInput
              type="number"
              min="0"
              {...register("deaths", { required: "عدد النافق مطلوب" })}
              aria-invalid={Boolean(errors.deaths)}
            />
          </InputField>

          <InputField
            label="استهلاك المياه"
            error={errors.waterConsumedLiters?.message}
          >
            <TextInput
              type="number"
              min="0"
              {...register("waterConsumedLiters", {
                required: "استهلاك المياه مطلوب",
              })}
              aria-invalid={Boolean(errors.waterConsumedLiters)}
            />
          </InputField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="استهلاك العلف (كجم)"
            error={errors.feedConsumedKg?.message}
          >
            <TextInput
              type="number"
              min="0"
              step="0.01"
              {...register("feedConsumedKg", {
                required: "استهلاك العلف مطلوب",
              })}
              aria-invalid={Boolean(errors.feedConsumedKg)}
            />
          </InputField>

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
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="الحرارة" error={errors.temperature?.message}>
            <TextInput type="number" step="0.1" {...register("temperature")} />
          </InputField>

          <InputField label="الرطوبة" error={errors.humidity?.message}>
            <TextInput type="number" step="0.1" {...register("humidity")} />
          </InputField>
        </div>

        <InputField label="ملاحظات" error={errors.notes?.message}>
          <TextAreaInput {...register("notes")} />
        </InputField>
      </FormDialog>

      <DataTable
        title="آخر العمليات اليومية"
        rows={rows}
        emptyText="لا توجد سجلات يومية مسجلة حتى الآن."
        columns={[
          {
            key: "date",
            title: "التاريخ",
            render: (row: DailyLog) => formatDate(row.date),
          },
          {
            key: "deaths",
            title: "النافق",
            render: (row: DailyLog) => formatNumber(row.deaths),
          },
          {
            key: "feed",
            title: "العلف",
            render: (row: DailyLog) =>
              `${formatNumber(row.feedConsumedKg)} كجم`,
          },
          {
            key: "water",
            title: "المياه",
            render: (row: DailyLog) =>
              `${formatNumber(row.waterConsumedLiters)} لتر`,
          },
          {
            key: "temp",
            title: "الحرارة",
            render: (row: DailyLog) => formatNullableNumber(row.temperature),
          },
          {
            key: "humidity",
            title: "الرطوبة",
            render: (row: DailyLog) => formatNullableNumber(row.humidity),
          },
          {
            key: "notes",
            title: "ملاحظات",
            render: (row: DailyLog) => row.notes ?? "--",
          },
        ]}
      />
    </div>
  )
}
