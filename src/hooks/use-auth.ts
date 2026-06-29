import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { authQueryKeys } from "@/lib/query-keys"
import { resetAuthQueries } from "@/lib/auth"
import { authService } from "@/services/auth.service"
import { ApiError } from "@/services/api-client"
import type { LoginRequest } from "@/types/api"

export function useMeQuery() {
  return useQuery({
    queryKey: authQueryKeys.me(),
    queryFn: async ({ signal }) => {
      try {
        return await authService.getMe(signal)
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null
        }

        throw error
      }
    },
    retry: false,
    staleTime: 60_000,
  })
}

export function useAuth() {
  const meQuery = useMeQuery()

  return {
    user: meQuery.data ?? null,
    isAuthenticated: Boolean(meQuery.data),
    isLoading: meQuery.isLoading,
    isFetching: meQuery.isFetching,
    error: meQuery.error,
    refetch: meQuery.refetch,
  }
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.me() })
      await queryClient.ensureQueryData({
        queryKey: authQueryKeys.me(),
        queryFn: () => authService.getMe(),
      })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      await resetAuthQueries(queryClient)
    },
    onError: async (error) => {
      if (error instanceof ApiError && error.status === 401) {
        await resetAuthQueries(queryClient)
      }
    },
  })
}
