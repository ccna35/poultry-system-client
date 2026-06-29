import { useState } from "react"
import { useForm } from "react-hook-form"

import { toast } from "@/lib/toast"
import FormDialog from "@/components/common/FormDialog"
import InputField from "@/components/common/InputField"
import SurfaceCard from "@/components/common/SurfaceCard"
import TextInput from "@/components/common/TextInput"
import { Button } from "@/components/ui/button"
import { useFarmCycle } from "@/context/FarmCycleContext"
import { useCreateCycleMutation } from "@/hooks/use-farm-mutations"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { toNumber } from "@/lib/farm-utils"
import { cn } from "@/lib/utils"
import type { CreateCycleRequest, CycleStatus } from "@/types/api"

type CycleFormValues = {
  name: string
  startDate: string
  initialBirds: string
  chickPrice: string
  expectedFinalWeightKg: string
  expectedSellingPricePerKg: string
  expectedRemainingCost: string
}

const defaultCycleValues: CycleFormValues = {
  name: "",
  startDate: "",
  initialBirds: "5000",
  chickPrice: "24",
  expectedFinalWeightKg: "2.2",
  expectedSellingPricePerKg: "65",
  expectedRemainingCost: "25000",
}

const cycleStatusTranslationMap: Record<CycleStatus, string> = {
  ACTIVE: "نشطة",
  COMPLETED: "اكتملت",
}

export default function Cycles() {
  const { cycles, selectedCycleId, setSelectedCycleId } = useFarmCycle()
  const createCycleMutation = useCreateCycleMutation()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CycleFormValues>({
    defaultValues: defaultCycleValues,
  })

  function handleDialogOpenChange(open: boolean) {
    setIsFormOpen(open)

    if (!open) {
      reset(defaultCycleValues)
    }
  }

  function submitCycle(values: CycleFormValues) {
    const payload: CreateCycleRequest = {
      name: values.name,
      startDate: values.startDate,
      initialBirds: toNumber(values.initialBirds),
      chickPrice: toNumber(values.chickPrice),
      expectedFinalWeightKg: toNumber(values.expectedFinalWeightKg),
      expectedSellingPricePerKg: toNumber(values.expectedSellingPricePerKg),
      expectedRemainingCost: toNumber(values.expectedRemainingCost),
    }

    void createCycleMutation
      .mutateAsync(payload)
      .then((createdCycle) => {
        reset(defaultCycleValues)
        setIsFormOpen(false)
        setSelectedCycleId(createdCycle.id)
        toast.success("تم إنشاء الدورة الجديدة بنجاح.")
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "تعذر إنشاء الدورة."
        )
      })
  }

  return (
    <div className="space-y-5">
      <FormDialog
        open={isFormOpen}
        onOpenChange={handleDialogOpenChange}
        triggerLabel="إنشاء دورة جديدة"
        title="إنشاء دورة جديدة"
        description="أدخل بيانات الدورة الأساسية وسيتم تحديث قائمة الدورات تلقائيًا بعد الحفظ."
        submitLabel="حفظ الدورة"
        busy={createCycleMutation.isPending}
        onSubmit={handleSubmit(submitCycle)}
      >
        <InputField label="اسم الدورة" error={errors.name?.message}>
          <TextInput
            {...register("name", { required: "اسم الدورة مطلوب" })}
            aria-invalid={Boolean(errors.name)}
          />
        </InputField>

        <InputField label="تاريخ البداية" error={errors.startDate?.message}>
          <TextInput
            type="date"
            {...register("startDate", { required: "تاريخ البداية مطلوب" })}
            aria-invalid={Boolean(errors.startDate)}
          />
        </InputField>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="عدد الطيور الابتدائي"
            error={errors.initialBirds?.message}
          >
            <TextInput
              type="number"
              min="1"
              {...register("initialBirds", {
                required: "عدد الطيور مطلوب",
              })}
              aria-invalid={Boolean(errors.initialBirds)}
            />
          </InputField>

          <InputField label="سعر الكتكوت" error={errors.chickPrice?.message}>
            <TextInput
              type="number"
              min="0"
              step="0.01"
              {...register("chickPrice", { required: "سعر الكتكوت مطلوب" })}
              aria-invalid={Boolean(errors.chickPrice)}
            />
          </InputField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="الوزن النهائي المتوقع"
            error={errors.expectedFinalWeightKg?.message}
          >
            <TextInput
              type="number"
              min="0.1"
              step="0.01"
              {...register("expectedFinalWeightKg", {
                required: "الوزن النهائي المتوقع مطلوب",
              })}
              aria-invalid={Boolean(errors.expectedFinalWeightKg)}
            />
          </InputField>

          <InputField
            label="سعر البيع المتوقع / كجم"
            error={errors.expectedSellingPricePerKg?.message}
          >
            <TextInput
              type="number"
              min="0"
              step="0.01"
              {...register("expectedSellingPricePerKg", {
                required: "سعر البيع المتوقع مطلوب",
              })}
              aria-invalid={Boolean(errors.expectedSellingPricePerKg)}
            />
          </InputField>
        </div>

        <InputField
          label="التكلفة المتبقية المتوقعة"
          error={errors.expectedRemainingCost?.message}
        >
          <TextInput
            type="number"
            min="0"
            step="0.01"
            {...register("expectedRemainingCost", {
              required: "التكلفة المتبقية المتوقعة مطلوبة",
            })}
            aria-invalid={Boolean(errors.expectedRemainingCost)}
          />
        </InputField>
      </FormDialog>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                    {cycleStatusTranslationMap[cycle.status]}
                  </span>
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
  )
}
