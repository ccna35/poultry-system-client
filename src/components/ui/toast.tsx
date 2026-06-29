import * as React from "react"
import { Toast as ToastPrimitive } from "radix-ui"
import { AlertTriangle, CheckCircle2, XIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitive.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-[110] flex w-[min(92vw,23rem)] flex-col gap-2 outline-none",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

const toastVariants = cva(
  [
    "group pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5",
    "shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur-sm",
    "transition-all duration-200",
    "before:absolute before:inset-y-0 before:right-0 before:w-1",
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
  ],
  {
    variants: {
      variant: {
        success:
          "border-emerald-200/80 bg-gradient-to-l from-emerald-50/95 to-white text-emerald-950 before:bg-emerald-500",
        error:
          "border-red-200/80 bg-gradient-to-l from-red-50/95 to-white text-red-950 before:bg-red-500",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  }
)

const toastIconVariants = cva(
  "flex size-9 shrink-0 items-center justify-center rounded-full border shadow-sm",
  {
    variants: {
      variant: {
        success:
          "border-emerald-200 bg-emerald-100 text-emerald-700 shadow-emerald-900/5",
        error: "border-red-200 bg-red-100 text-red-700 shadow-red-900/5",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant = "success", children, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    dir="rtl"
    data-variant={variant}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  >
    <div className={cn(toastIconVariants({ variant }))}>
      {variant === "error" ? (
        <AlertTriangle className="size-4" />
      ) : (
        <CheckCircle2 className="size-4" />
      )}
    </div>

    {children}
  </ToastPrimitive.Root>
))
Toast.displayName = ToastPrimitive.Root.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn(
      "text-sm leading-5 font-semibold tracking-[-0.01em]",
      "group-data-[variant=success]:text-emerald-950",
      "group-data-[variant=error]:text-red-950",
      className
    )}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm leading-5",
      "group-data-[variant=success]:text-emerald-800/80",
      "group-data-[variant=error]:text-red-800/80",
      className
    )}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      "inline-flex size-8 shrink-0 items-center justify-center rounded-full transition",
      "focus-visible:ring-2 focus-visible:outline-none",
      "group-data-[variant=success]:text-emerald-700/60 group-data-[variant=success]:hover:bg-emerald-100 group-data-[variant=success]:hover:text-emerald-800 group-data-[variant=success]:focus-visible:ring-emerald-200",
      "group-data-[variant=error]:text-red-700/60 group-data-[variant=error]:hover:bg-red-100 group-data-[variant=error]:hover:text-red-800 group-data-[variant=error]:focus-visible:ring-red-200",
      className
    )}
    toast-close=""
    {...props}
  >
    <XIcon className="size-4" />
  </ToastPrimitive.Close>
))
ToastClose.displayName = ToastPrimitive.Close.displayName

export {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
}
