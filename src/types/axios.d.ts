import "axios"

declare module "axios" {
  interface AxiosRequestConfig<D = unknown> {
    skipAuthRefresh?: boolean
  }

  interface InternalAxiosRequestConfig<D = unknown> {
    skipAuthRefresh?: boolean
  }
}
