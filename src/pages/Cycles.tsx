import { useState } from "react"

import ActionNotice, {
  type StatusMessage,
} from "@/components/common/ActionNotice"
import FormPanel from "@/components/common/FormPanel"
import InputField from "@/components/common/InputField"
import PageHeader from "@/components/common/PageHeader"
import SurfaceCard from "@/components/common/SurfaceCard"
import TextInput from "@/components/common/TextInput"
import { Button } from "@/components/ui/button"
import { useFarmCycle } from "@/context/FarmCycleContext"
import { useCreateCycleMutation } from "@/hooks/use-farm-mutations"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { toNumber } from "@/lib/farm-utils"
import type { CreateCycleRequest } from "@/types/api"

export default function Cycles() {
  const { cycles, selectedCycleId, setSelectedCycleId, refreshAll } =
    useFarmCycle()
  const createCycleMutation = useCreateCycleMutation()
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [cycleForm, setCycleForm] = useState({
    name: "",
    startDate: "",
    initialBirds: "5000",
    chickPrice: "24",
    expectedFinalWeightKg: "2.2",
    expectedSellingPricePerKg: "65",
    expectedRemainingCost: "25000",
  })

  function submitCycle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatusMessage(null)

    const payload: CreateCycleRequest = {
      name: cycleForm.name,
      startDate: cycleForm.startDate,
      initialBirds: toNumber(cycleForm.initialBirds),
      chickPrice: toNumber(cycleForm.chickPrice),
      expectedFinalWeightKg: toNumber(cycleForm.expectedFinalWeightKg),
      expectedSellingPricePerKg: toNumber(cycleForm.expectedSellingPricePerKg),
      expectedRemainingCost: toNumber(cycleForm.expectedRemainingCost),
    }

    void createCycleMutation
      .mutateAsync(payload)
      .then((createdCycle) => {
        setCycleForm({
          name: "",
          startDate: "",
          initialBirds: "5000",
          chickPrice: "24",
          expectedFinalWeightKg: "2.2",
          expectedSellingPricePerKg: "65",
          expectedRemainingCost: "25000",
        })
        setSelectedCycleId(createdCycle.id)
        setStatusMessage({
          tone: "success",
          text: "تم إنشاء الدورة الجديدة بنجاح.",
        })
      })
      .catch((error: unknown) => {
        setStatusMessage({
          tone: "error",
          text: error instanceof Error ? error.message : "تعذر إنشاء الدورة.",
        })
      })
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        {/* <SurfaceCard className="p-5 sm:p-6">
          <PageHeader
            eyebrow="الدورات"
            title="إدارة دورات الإنتاج"
            description="تم نقل إدارة الدورات إلى صفحة مستقلة بدل إبقائها ضمن App.tsx، مع طفرة إنشاء مبنية على React Query."
            actions={
              <Button
                variant="outline"
                className="h-11 rounded-2xl border-[#DDE7D7] bg-white px-4 text-slate-600"
                onClick={() => {
                  void refreshAll()
                }}
              >
                تحديث
              </Button>
            }
          />
        </SurfaceCard> */}

        <div className="grid gap-4 md:grid-cols-2">
          {cycles.map((cycle) => (
            <SurfaceCard key={cycle.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        cycle.status === "ACTIVE"
                          ? "bg-[#E8F5E4] text-[#5E905C]"
                          : "bg-[#EEF2F7] text-slate-500"
                      )}
                    >
                      {cycle.status}
                    </span>
                    {/* <span className="text-xs text-slate-400">{cycle.id}</span> */}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-slate-900">
                    {cycle.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    بدأت {formatDate(cycle.startDate)} •{" "}
                    {formatNumber(cycle.initialBirds)} طائر
                  </p>
                </div>
                <Button
                  variant={selectedCycleId === cycle.id ? "default" : "outline"}
                  className={cn(
                    "h-10 rounded-2xl px-4",
                    selectedCycleId === cycle.id
                      ? "bg-[#7EA974] text-white"
                      : "border-[#DDE7D7] bg-white text-slate-600"
                  )}
                  onClick={() => {
                    setSelectedCycleId(cycle.id)
                  }}
                >
                  {selectedCycleId === cycle.id ? "الحالية" : "فتح"}
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-[#F7FAF5] p-3">
                  <p className="text-xs text-slate-400">الوزن المستهدف</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {formatNumber(cycle.expectedFinalWeightKg)} كجم
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F7FAF5] p-3">
                  <p className="text-xs text-slate-400">سعر البيع المتوقع</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {formatCurrency(cycle.expectedSellingPricePerKg)}
                  </p>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="إنشاء دورة جديدة"
          description="أدخل بيانات الدورة الأساسية وسيتم تحديث قائمة الدورات تلقائيًا بعد الحفظ."
          submitLabel="حفظ الدورة"
          busy={createCycleMutation.isPending}
          onSubmit={submitCycle}
        >
          <InputField label="اسم الدورة">
            <TextInput
              value={cycleForm.name}
              onChange={(event) => {
                setCycleForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }}
              required
            />
          </InputField>
          <InputField label="تاريخ البداية">
            <TextInput
              type="date"
              value={cycleForm.startDate}
              onChange={(event) => {
                setCycleForm((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }}
              required
            />
          </InputField>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="عدد الطيور الابتدائي">
              <TextInput
                type="number"
                min="1"
                value={cycleForm.initialBirds}
                onChange={(event) => {
                  setCycleForm((current) => ({
                    ...current,
                    initialBirds: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
            <InputField label="سعر الكتكوت">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={cycleForm.chickPrice}
                onChange={(event) => {
                  setCycleForm((current) => ({
                    ...current,
                    chickPrice: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="الوزن النهائي المتوقع">
              <TextInput
                type="number"
                min="0.1"
                step="0.01"
                value={cycleForm.expectedFinalWeightKg}
                onChange={(event) => {
                  setCycleForm((current) => ({
                    ...current,
                    expectedFinalWeightKg: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
            <InputField label="سعر البيع المتوقع / كجم">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={cycleForm.expectedSellingPricePerKg}
                onChange={(event) => {
                  setCycleForm((current) => ({
                    ...current,
                    expectedSellingPricePerKg: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
          </div>
          <InputField label="التكلفة المتبقية المتوقعة">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={cycleForm.expectedRemainingCost}
              onChange={(event) => {
                setCycleForm((current) => ({
                  ...current,
                  expectedRemainingCost: event.target.value,
                }))
              }}
              required
            />
          </InputField>
        </FormPanel>
      </div>
    </div>
  )
}
