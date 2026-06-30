import * as React from "react"
import { createPortal } from "react-dom"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type DialogContextValue = {
  descriptionId: string
  open: boolean
  setOpen: (open: boolean) => void
  titleId: string
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialogContext(componentName: string) {
  const context = React.useContext(DialogContext)

  if (!context) {
    throw new Error(`${componentName} must be used within Dialog`)
  }

  return context
}

function Dialog({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
}: React.PropsWithChildren<{
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const open = openProp ?? uncontrolledOpen
  const titleId = React.useId()
  const descriptionId = React.useId()

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (openProp === undefined) {
        setUncontrolledOpen(nextOpen)
      }

      onOpenChange?.(nextOpen)
    },
    [onOpenChange, openProp]
  )

  const contextValue = React.useMemo(
    () => ({
      descriptionId,
      open,
      setOpen,
      titleId,
    }),
    [descriptionId, open, setOpen, titleId]
  )

  return (
    <DialogContext.Provider value={contextValue}>{children}</DialogContext.Provider>
  )
}

function DialogTrigger({
  asChild = false,
  children,
  onClick,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean
}) {
  const { setOpen } = useDialogContext("DialogTrigger")

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event as React.MouseEvent<HTMLButtonElement>)

      if (!event.defaultPrevented) {
        setOpen(true)
      }
    },
    [onClick, setOpen]
  )

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
    })
  }

  return (
    <button
      type="button"
      data-slot="dialog-trigger"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

function DialogPortal({ children }: React.PropsWithChildren) {
  if (typeof document === "undefined") {
    return null
  }

  return createPortal(children, document.body)
}

function DialogClose({
  asChild = false,
  children,
  onClick,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean
}) {
  const { setOpen } = useDialogContext("DialogClose")

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event as React.MouseEvent<HTMLButtonElement>)

      if (!event.defaultPrevented) {
        setOpen(false)
      }
    },
    [onClick, setOpen]
  )

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
    })
  }

  return (
    <button
      type="button"
      data-slot="dialog-close"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-[2px]",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = "DialogOverlay"

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("hidden"))
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, onKeyDown, ...props }, forwardedRef) => {
  const { descriptionId, open, setOpen, titleId } = useDialogContext("DialogContent")
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const previousFocusedElementRef = React.useRef<HTMLElement | null>(null)

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node

      if (typeof forwardedRef === "function") {
        forwardedRef(node)
      } else if (forwardedRef) {
        forwardedRef.current = node
      }
    },
    [forwardedRef]
  )

  React.useEffect(() => {
    if (!open || !contentRef.current) {
      return
    }

    previousFocusedElementRef.current = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const focusableElements = getFocusableElements(contentRef.current)
    const initialFocusTarget = focusableElements[0] ?? contentRef.current
    initialFocusTarget.focus()

    return () => {
      document.body.style.overflow = originalOverflow
      previousFocusedElementRef.current?.focus()
    }
  }, [open])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event)

      if (event.defaultPrevented || !contentRef.current) {
        return
      }

      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
        return
      }

      if (event.key !== "Tab") {
        return
      }

      const focusableElements = getFocusableElements(contentRef.current)

      if (focusableElements.length === 0) {
        event.preventDefault()
        contentRef.current.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement as HTMLElement | null

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
        return
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    },
    [onKeyDown, setOpen]
  )

  if (!open) {
    return null
  }

  return (
    <DialogPortal>
      <DialogOverlay onMouseDown={() => setOpen(false)} />
      <div className="fixed inset-0 z-[51] flex items-center justify-center px-4 py-6 sm:px-6">
        <div
          ref={setRefs}
          role="dialog"
          aria-modal="true"
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          data-slot="dialog-content"
          tabIndex={-1}
          className={cn(
            "relative w-[min(92vw,42rem)] max-w-[42rem] rounded-[1.75rem] border border-[#E4EBDD] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] outline-none",
            className
          )}
          onKeyDown={handleKeyDown}
          onMouseDown={(event) => event.stopPropagation()}
          {...props}
        >
          {children}
          <DialogClose
            className="absolute end-4 top-4 inline-flex size-9 items-center justify-center rounded-full border border-[#E4EBDD] bg-white text-slate-500 transition hover:bg-[#F7FAF5] hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#DDECD7] focus-visible:outline-none"
            aria-label="Close"
          >
            <XIcon className="size-4" />
          </DialogClose>
        </div>
      </div>
    </DialogPortal>
  )
})
DialogContent.displayName = "DialogContent"

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col space-y-1.5 text-right", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-start",
        className
      )}
      {...props}
    />
  )
}

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<"h2">
>(({ className, ...props }, ref) => {
  const { titleId } = useDialogContext("DialogTitle")

  return (
    <h2
      ref={ref}
      id={titleId}
      data-slot="dialog-title"
      className={cn("font-heading text-xl font-semibold text-slate-900", className)}
      {...props}
    />
  )
})
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => {
  const { descriptionId } = useDialogContext("DialogDescription")

  return (
    <p
      ref={ref}
      id={descriptionId}
      data-slot="dialog-description"
      className={cn("text-sm leading-6 text-slate-500", className)}
      {...props}
    />
  )
})
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
