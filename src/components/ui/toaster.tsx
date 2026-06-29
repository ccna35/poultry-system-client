import * as React from "react"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastViewport,
} from "@/components/ui/toast"
import { subscribeToToasts, type AppToast } from "@/lib/toast"

function Toaster() {
  const [toasts, setToasts] = React.useState<AppToast[]>([])

  React.useEffect(() => {
    return subscribeToToasts((nextToast) => {
      setToasts((current) => [...current, nextToast])
    })
  }, [])

  function dismissToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map((item) => (
        <Toast
          key={item.id}
          open
          variant={item.tone}
          duration={item.tone === "error" ? 4500 : 2600}
          onOpenChange={(open) => {
            if (!open) {
              dismissToast(item.id)
            }
          }}
        >
          <div className="min-w-0 flex-1">
            <ToastDescription>{item.message}</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

export default Toaster
