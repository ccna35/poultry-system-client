import { Navigate, Outlet, useLocation } from "react-router"

import AuthScreen from "@/components/auth/AuthScreen"
import { useAuth } from "@/hooks/use-auth"
import { buildLoginRedirectPath } from "@/lib/auth"

function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, isFetching, isLoading } = useAuth()

  if (isLoading || (isFetching && !isAuthenticated)) {
    return <AuthScreen />
  }

  if (!isAuthenticated) {
    const redirectPath = `${location.pathname}${location.search}${location.hash}`

    return <Navigate to={buildLoginRedirectPath(redirectPath)} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
