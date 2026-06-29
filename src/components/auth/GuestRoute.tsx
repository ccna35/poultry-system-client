import { Navigate, Outlet, useSearchParams } from "react-router"

import AuthScreen from "@/components/auth/AuthScreen"
import { useAuth } from "@/hooks/use-auth"
import { getSafeRedirectPath } from "@/lib/auth"

function GuestRoute() {
  const [searchParams] = useSearchParams()
  const { isAuthenticated, isFetching, isLoading } = useAuth()

  if (isLoading || (isFetching && !isAuthenticated)) {
    return (
      <AuthScreen
        title="جاري تجهيز صفحة الدخول"
        description="نتأكد أولًا مما إذا كانت هناك جلسة نشطة حتى لا نطلب تسجيل الدخول مرة أخرى دون حاجة."
      />
    )
  }

  if (isAuthenticated) {
    const redirectPath = getSafeRedirectPath(searchParams.get("redirect"), "/")

    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}

export default GuestRoute
