import { Bird, LoaderCircle } from "lucide-react"

import SurfaceCard from "@/components/common/SurfaceCard"

type AuthScreenProps = {
  title?: string
  description?: string
}

function AuthScreen({
  title = "جاري التحقق من الجلسة",
  description = "نحضر بيانات الحساب ونستعيد الجلسة الحالية إن وجدت.",
}: AuthScreenProps) {
  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_12%_0%,rgba(201,226,189,0.28),transparent_26%),linear-gradient(180deg,#fbfbf8_0%,#f7f8f2_60%,#f3f4ee_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-5xl items-center justify-center">
        <SurfaceCard className="w-full max-w-md p-8 sm:p-9">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-16 items-center justify-center rounded-[1.6rem] bg-[#EDF6E7] text-[#6C9562] shadow-[inset_0_0_0_1px_rgba(126,169,116,0.08)]">
              <Bird className="size-7" />
            </div>
            <div className="mt-6 flex items-center gap-2 text-[#6C9562]">
              <LoaderCircle className="size-4 animate-spin" />
              <span className="text-sm font-medium">جاري التحميل</span>
            </div>
            <h1 className="mt-4 font-heading text-2xl font-semibold text-slate-900">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              {description}
            </p>
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}

export default AuthScreen
