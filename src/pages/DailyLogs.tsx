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
import { useCreateDailyLogMutation } from "@/hooks/use-farm-mutations"
import { useDailyLogsQuery } from "@/hooks/use-farm-queries"
import { formatDate, formatNullableNumber, formatNumber } from "@/lib/format"
import { toNumber, toOptionalNumber } from "@/lib/farm-utils"
import type { CreateDailyLogRequest, DailyLog } from "@/types/api"

export default function DailyLogs() {
  const { selectedCycle, selectedCycleId } = useFarmCycle()
  const dailyLogsQuery = useDailyLogsQuery(selectedCycleId)
  const createDailyLogMutation = useCreateDailyLogMutation(selectedCycleId)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [form, setForm] = useState({
    date: "",
    deaths: "0",
    feedConsumedKg: "",
    temperature: "",
    humidity: "",
    notes: "",
  })

  if (!selectedCycleId) {
    return (
      <EmptyState
        title="لا توجد دورة محددة"
        description="اختر دورة أولًا من الشريط العلوي ثم أضف سجلًا يوميًا."
      />
    )
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatusMessage(null)

    const payload: CreateDailyLogRequest = {
      date: form.date,
      deaths: toNumber(form.deaths),
      feedConsumedKg: toNumber(form.feedConsumedKg),
      temperature: toOptionalNumber(form.temperature),
      humidity: toOptionalNumber(form.humidity),
      notes: form.notes.trim() === "" ? null : form.notes,
    }

    void createDailyLogMutation
      .mutateAsync(payload)
      .then(() => {
        setForm({
          date: "",
          deaths: "0",
          feedConsumedKg: "",
          temperature: "",
          humidity: "",
          notes: "",
        })
        setStatusMessage({ tone: "success", text: "تمت إضافة السجل اليومي." })
      })
      .catch((error: unknown) => {
        setStatusMessage({
          tone: "error",
          text:
            error instanceof Error ? error.message : "تعذر حفظ السجل اليومي.",
        })
      })
  }

  const rows = [...(dailyLogsQuery.data ?? [])].sort((left, right) =>
    right.date.localeCompare(left.date)
  )

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <SurfaceCard className="p-5 sm:p-6">
          <PageHeader
            eyebrow="اليومي"
            title={`العمليات اليومية - ${selectedCycle?.name ?? ""}`}
            description="صفحة مستقلة لتسجيل الوفيات واستهلاك العلف والبيئة اليومية بدل إبقائها كقسم داخل App.tsx."
          />
        </SurfaceCard>
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="إضافة سجل يومي"
          description="أدخل الوفيات واستهلاك العلف وبيانات البيئة اليومية."
          submitLabel="حفظ السجل اليومي"
          busy={createDailyLogMutation.isPending}
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
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="الوفيات">
              <TextInput
                type="number"
                min="0"
                value={form.deaths}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    deaths: event.target.value,
                  }))
                }
                required
              />
            </InputField>
            <InputField label="استهلاك العلف (كجم)">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={form.feedConsumedKg}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    feedConsumedKg: event.target.value,
                  }))
                }
                required
              />
            </InputField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="الحرارة">
              <TextInput
                type="number"
                step="0.1"
                value={form.temperature}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    temperature: event.target.value,
                  }))
                }
              />
            </InputField>
            <InputField label="الرطوبة">
              <TextInput
                type="number"
                step="0.1"
                value={form.humidity}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    humidity: event.target.value,
                  }))
                }
              />
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
            title: "الوفيات",
            render: (row: DailyLog) => formatNumber(row.deaths),
          },
          {
            key: "feed",
            title: "العلف",
            render: (row: DailyLog) =>
              `${formatNumber(row.feedConsumedKg)} كجم`,
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
