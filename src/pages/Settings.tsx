import { useState } from "react"

import ActionNotice, { type StatusMessage } from "@/components/common/ActionNotice"
import FormPanel from "@/components/common/FormPanel"
import InputField from "@/components/common/InputField"
import PageHeader from "@/components/common/PageHeader"
import SurfaceCard from "@/components/common/SurfaceCard"
import TextInput from "@/components/common/TextInput"
import { useFarmCycle } from "@/context/FarmCycleContext"

export default function Settings() {
  const { selectedCycle } = useFarmCycle()
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [settingsForm, setSettingsForm] = useState({
    farmName: "مزرعة الدواجن",
    managerName: "مدير المزرعة",
    email: "farm@example.com",
    enableAlerts: true,
    currencyLabel: "جنيه مصري",
  })

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatusMessage({ tone: "success", text: "تم حفظ الإعدادات المحلية للواجهة." })
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-5">
        <SurfaceCard className="p-5 sm:p-6">
          <PageHeader
            eyebrow="الإعدادات"
            title="إعدادات الواجهة"
            description="صفحة مستقلة للتفضيلات العامة بدل بقائها جزءًا من الملف الرئيسي."
          />
        </SurfaceCard>
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="إعدادات الواجهة"
          description="غيّر بيانات العرض والتنبيهات من مكان واحد."
          submitLabel="حفظ الإعدادات"
          busy={false}
          onSubmit={onSubmit}
        >
          <InputField label="اسم المزرعة">
            <TextInput value={settingsForm.farmName} onChange={(event) => setSettingsForm((current) => ({ ...current, farmName: event.target.value }))} />
          </InputField>
          <InputField label="اسم المسؤول">
            <TextInput value={settingsForm.managerName} onChange={(event) => setSettingsForm((current) => ({ ...current, managerName: event.target.value }))} />
          </InputField>
          <InputField label="البريد الإلكتروني">
            <TextInput type="email" value={settingsForm.email} onChange={(event) => setSettingsForm((current) => ({ ...current, email: event.target.value }))} />
          </InputField>
          <InputField label="العملة الافتراضية">
            <TextInput value={settingsForm.currencyLabel} onChange={(event) => setSettingsForm((current) => ({ ...current, currencyLabel: event.target.value }))} />
          </InputField>
          <label className="flex items-center justify-between rounded-2xl border border-[#E3E8DF] bg-[#FBFCF8] px-4 py-3 text-sm text-slate-700">
            <span>تفعيل تنبيهات البيئة</span>
            <input
              type="checkbox"
              checked={settingsForm.enableAlerts}
              onChange={(event) => setSettingsForm((current) => ({ ...current, enableAlerts: event.target.checked }))}
              className="size-4 rounded border-[#DDE7D7] text-[#7EA974]"
            />
          </label>
        </FormPanel>
      </div>

      <SurfaceCard className="p-5 sm:p-6">
        <PageHeader
          eyebrow="النظام"
          title="ملخص الإعدادات الحالية"
          description="بطاقات بسيطة لعرض الإعدادات الحالية ومعلومات الربط النشطة."
        />
        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-[#F7FAF5] p-4">عنوان API: {apiBaseUrl}</div>
          <div className="rounded-2xl bg-[#F7FAF5] p-4">الدورة الحالية: {selectedCycle?.name ?? "لا توجد دورة مختارة"}</div>
          <div className="rounded-2xl bg-[#F7FAF5] p-4">تنبيهات البيئة: {settingsForm.enableAlerts ? "مفعلة" : "معطلة"}</div>
          <div className="rounded-2xl bg-[#F7FAF5] p-4">العملة الافتراضية: {settingsForm.currencyLabel}</div>
        </div>
      </SurfaceCard>
    </div>
  )
}
