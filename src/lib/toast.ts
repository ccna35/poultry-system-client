export type AppToast = {
  id: string
  message: string
  tone: "success" | "error"
}

type ToastListener = (toast: AppToast) => void

const listeners = new Set<ToastListener>()
let toastCounter = 0

function emitToast(toast: Omit<AppToast, "id">) {
  const nextToast = {
    ...toast,
    id: `toast-${++toastCounter}`,
  }

  listeners.forEach((listener) => {
    listener(nextToast)
  })
}

export const toast = {
  success(message: string) {
    emitToast({ message, tone: "success" })
  },
  error(message: string) {
    emitToast({ message, tone: "error" })
  },
}

export function subscribeToToasts(listener: ToastListener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}
