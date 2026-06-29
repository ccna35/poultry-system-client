import { useState } from "react"
import { useForm } from "react-hook-form"

import { toast } from "@/lib/toast"
import FormDialog from "@/components/common/FormDialog"
import InputField from "@/components/common/InputField"
import SurfaceCard from "@/components/common/SurfaceCard"
import TextInput from "@/components/common/TextInput"
import { useFarmCycle } from "@/context/FarmCycleContext"

type SettingsFormValues = {
  farmName: string
  managerName: string
  email: string
  enableAlerts: boolean
  currencyLabel: string
}

const defaultSettingsValues: SettingsFormValues = {
  farmName: "مزرعة الدواجن",
  managerName: "مدير المزرعة",
  email: "farm@example.com",
  enableAlerts: true,
  currencyLabel: "جنيه مصري",
}

export default function Settings() {
  const { selectedCycle } = useFarmCycle()
  const [settings, setSettings] = useState<SettingsFormValues>(
    defaultSettingsValues
  )
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm<SettingsFormValues>({
    defaultValues: settings,
  })

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"

  function handleDialogOpenChange(open: boolean) {
    setIsFormOpen(open)
    reset(settings)
  }

  function submitSettings(values: SettingsFormValues) {
    setSettings(values)
    reset(values)
    setIsFormOpen(false)
    toast.success("تم حفظ الإعدادات المحلية للواجهة.")
  }

  return (
    <div className="space-y-5">
      <FormDialog
        open={isFormOpen}
        onOpenChange={handleDialogOpenChange}
        triggerLabel="فتح إعدادات الواجهة"
        title="إعدادات الواجهة"
        description="غيّر بيانات العرض والتنبيهات من مكان واحد."
        submitLabel="حفظ الإعدادات"
        busy={false}
        onSubmit={handleSubmit(submitSettings)}
      >
        <InputField label="اسم المزرعة">
          <TextInput {...register("farmName")} />
        </InputField>

        <InputField label="اسم المسؤول">
          <TextInput {...register("managerName")} />
        </InputField>

        <InputField label="البريد الإلكتروني">
          <TextInput type="email" {...register("email")} />
        </InputField>

        <InputField label="العملة الافتراضية">
          <TextInput {...register("currencyLabel")} />
        </InputField>

        <label className="flex items-center justify-between rounded-2xl border border-[#E3E8DF] bg-[#FBFCF8] px-4 py-3 text-sm text-slate-700">
          <span>تفعيل تنبيهات البيئة</span>
          <input
            type="checkbox"
            {...register("enableAlerts")}
            className="size-4 rounded border-[#DDE7D7] text-[#7EA974]"
          />
        </label>
      </FormDialog>

      <SurfaceCard className="p-5 sm:p-6">
        <div className="mb-5">
          <p className="text-sm font-medium text-slate-500">النظام</p>
          <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">
            ملخص الإعدادات الحالية
          </h3>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-[#F7FAF5] p-4">
            عنوان API: {apiBaseUrl}
          </div>
          <div className="rounded-2xl bg-[#F7FAF5] p-4">
            الدورة الحالية: {selectedCycle?.name ?? "لا توجد دورة مختارة"}
          </div>
          <div className="rounded-2xl bg-[#F7FAF5] p-4">
            تنبيهات البيئة: {settings.enableAlerts ? "مفعلة" : "معطلة"}
          </div>
          <div className="rounded-2xl bg-[#F7FAF5] p-4">
            العملة الافتراضية: {settings.currencyLabel}
          </div>
        </div>
      </SurfaceCard>
    </div>
  )
}
