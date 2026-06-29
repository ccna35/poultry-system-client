import { Bird, LoaderCircle, LockKeyhole, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { useNavigate, useSearchParams } from "react-router"

import SurfaceCard from "@/components/common/SurfaceCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLogin } from "@/hooks/use-auth"
import { getSafeRedirectPath } from "@/lib/auth"
import { toast } from "@/lib/toast"
import { ApiError } from "@/services/api-client"
import type { LoginRequest } from "@/types/api"

type LoginFormValues = LoginRequest

function getLoginErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "تعذر تسجيل الدخول. حاول مرة أخرى بعد قليل."
}

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const loginMutation = useLogin()
  const redirectPath = getSafeRedirectPath(searchParams.get("redirect"), "/")
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      await loginMutation.mutateAsync(values)
      toast.success("تم تسجيل الدخول بنجاح.")
      navigate(redirectPath, { replace: true })
    } catch (error) {
      toast.error(getLoginErrorMessage(error))
    }
  }

  const isPending = isSubmitting || loginMutation.isPending

  return (
    <div className="grid min-h-svh place-content-center bg-[radial-gradient(circle_at_14%_0%,rgba(201,226,189,0.28),transparent_25%),linear-gradient(180deg,#fbfbf8_0%,#f7f8f2_60%,#f3f4ee_100%)] px-4 py-8">
      <SurfaceCard className="mx-auto w-full max-w-md p-6 sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-[1.3rem] bg-[#EDF6E7] text-[#6C9562]">
            <LockKeyhole className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold text-slate-900">
              تسجيل الدخول
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              أدخل بيانات الحساب للوصول إلى لوحة الإدارة.
            </p>
          </div>
        </div>

        <form
          className="space-y-5"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="email"
            >
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="farm@example.com"
                className="h-11 rounded-2xl border-[#E2E8D9] bg-[#FCFDFB] ps-10 text-sm shadow-none"
                aria-invalid={errors.email ? true : undefined}
                {...register("email", {
                  required: "أدخل البريد الإلكتروني.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "أدخل بريدًا إلكترونيًا صحيحًا.",
                  },
                })}
              />
            </div>
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="password"
            >
              كلمة المرور
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-11 rounded-2xl border-[#E2E8D9] bg-[#FCFDFB] ps-10 text-sm shadow-none"
                aria-invalid={errors.password ? true : undefined}
                {...register("password", {
                  required: "أدخل كلمة المرور.",
                })}
              />
            </div>
            {errors.password ? (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full rounded-2xl bg-[#6F9E68] text-white hover:bg-[#628E5B]"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                جارٍ تسجيل الدخول
              </>
            ) : (
              "دخول"
            )}
          </Button>
        </form>
      </SurfaceCard>
    </div>
  )
}
