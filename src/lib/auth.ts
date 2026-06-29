import type { QueryClient } from "@tanstack/react-query"

import { authQueryKeys, farmQueryKeys } from "@/lib/query-keys"

export function getCurrentAppPath() {
  if (typeof window === "undefined") {
    return "/"
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

export function getSafeRedirectPath(
  redirect: string | null | undefined,
  fallback = "/"
) {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return fallback
  }

  if (redirect.startsWith("/login")) {
    return fallback
  }

  return redirect
}

export function buildLoginRedirectPath(currentPath = getCurrentAppPath()) {
  const safeCurrentPath = getSafeRedirectPath(currentPath, "/")

  if (safeCurrentPath.startsWith("/login")) {
    return "/login"
  }

  return `/login?redirect=${encodeURIComponent(safeCurrentPath)}`
}

export async function resetAuthQueries(queryClient: QueryClient) {
  await queryClient.cancelQueries({ queryKey: authQueryKeys.all })
  queryClient.setQueryData(authQueryKeys.me(), null)
  queryClient.removeQueries({ queryKey: farmQueryKeys.all })
}
