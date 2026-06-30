import * as React from "react"
import { createPortal } from "react-dom"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type SelectItemRegistration = {
  disabled: boolean
  id: string
  label: string
  ref: HTMLButtonElement | null
  value: string
}

type SelectContextValue = {
  close: (focusTrigger?: boolean) => void
  contentId: string
  disabled: boolean
  highlightedIndex: number
  items: SelectItemRegistration[]
  open: boolean
  selectedLabel: string | null
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setValue: (value: string) => void
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>
  value?: string
  registerItem: (item: SelectItemRegistration) => void
  unregisterItem: (id: string) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext(componentName: string) {
  const context = React.useContext(SelectContext)

  if (!context) {
    throw new Error(`${componentName} must be used within Select`)
  }

  return context
}

function getNodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join("")
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>
    return getNodeText(element.props.children)
  }

  return ""
}

function getFirstEnabledIndex(items: SelectItemRegistration[]) {
  return items.findIndex((item) => !item.disabled)
}

function getLastEnabledIndex(items: SelectItemRegistration[]) {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!items[index].disabled) {
      return index
    }
  }

  return -1
}

function getNextEnabledIndex(
  items: SelectItemRegistration[],
  currentIndex: number,
  direction: 1 | -1
) {
  if (items.length === 0) {
    return -1
  }

  for (let offset = 1; offset <= items.length; offset += 1) {
    const nextIndex = (currentIndex + direction * offset + items.length) % items.length

    if (!items[nextIndex].disabled) {
      return nextIndex
    }
  }

  return -1
}

function Select({
  children,
  defaultValue,
  disabled = false,
  name,
  onValueChange,
  value: valueProp,
}: React.PropsWithChildren<{
  defaultValue?: string
  disabled?: boolean
  name?: string
  onValueChange?: (value: string) => void
  value?: string
}>) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
  const [items, setItems] = React.useState<SelectItemRegistration[]>([])
  const itemLabelsRef = React.useRef(new Map<string, string>())
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const contentId = React.useId()
  const value = valueProp ?? internalValue

  const setValue = React.useCallback(
    (nextValue: string) => {
      if (valueProp === undefined) {
        setInternalValue(nextValue)
      }

      onValueChange?.(nextValue)
    },
    [onValueChange, valueProp]
  )

  const close = React.useCallback((focusTrigger = true) => {
    setOpen(false)
    setHighlightedIndex(-1)

    if (focusTrigger) {
      triggerRef.current?.focus()
    }
  }, [])

  const registerItem = React.useCallback((item: SelectItemRegistration) => {
    itemLabelsRef.current.set(item.value, item.label)

    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (currentItem) => currentItem.id === item.id
      )

      if (existingIndex === -1) {
        return [...currentItems, item]
      }

      const nextItems = [...currentItems]
      nextItems[existingIndex] = item
      return nextItems
    })
  }, [])

  const unregisterItem = React.useCallback((id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }, [])

  const selectedLabel = React.useMemo(() => {
    if (!value) {
      return null
    }

    return itemLabelsRef.current.get(value) ?? value
  }, [items, value])

  React.useEffect(() => {
    if (!open) {
      return
    }

    const selectedIndex = items.findIndex((item) => item.value === value)
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : getFirstEnabledIndex(items))
  }, [items, open, value])

  const contextValue = React.useMemo(
    () => ({
      close,
      contentId,
      disabled,
      highlightedIndex,
      items,
      open,
      registerItem,
      selectedLabel,
      setHighlightedIndex,
      setOpen,
      setValue,
      triggerRef,
      unregisterItem,
      value,
    }),
    [
      close,
      contentId,
      disabled,
      highlightedIndex,
      items,
      open,
      registerItem,
      selectedLabel,
      setValue,
      value,
      unregisterItem,
    ]
  )

  return (
    <SelectContext.Provider value={contextValue}>
      <div data-slot="select" className="relative">
        {children}
        {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      </div>
    </SelectContext.Provider>
  )
}

function SelectGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  className,
  placeholder,
  ...props
}: React.ComponentPropsWithoutRef<"span"> & {
  placeholder?: React.ReactNode
}) {
  const { selectedLabel } = useSelectContext("SelectValue")

  return (
    <span
      data-slot="select-value"
      className={cn(
        "flex items-center gap-1.5 truncate",
        !selectedLabel && "text-muted-foreground",
        className
      )}
      {...props}
    >
      {selectedLabel ?? placeholder}
    </span>
  )
}

function SelectTrigger({
  children,
  className,
  disabled: disabledProp,
  onClick,
  onKeyDown,
  size = "default",
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  size?: "sm" | "default"
}) {
  const {
    contentId,
    disabled,
    items,
    open,
    setHighlightedIndex,
    setOpen,
    triggerRef,
  } = useSelectContext("SelectTrigger")

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)

      if (event.defaultPrevented || disabled || disabledProp) {
        return
      }

      if (!open) {
        setHighlightedIndex((currentIndex) =>
          currentIndex >= 0 ? currentIndex : getFirstEnabledIndex(items)
        )
      }

      setOpen((currentOpen) => !currentOpen)
    },
    [disabled, disabledProp, items, onClick, open, setHighlightedIndex, setOpen]
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event)

      if (event.defaultPrevented || disabled || disabledProp) {
        return
      }

      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault()
        setHighlightedIndex(
          event.key === "ArrowUp"
            ? getLastEnabledIndex(items)
            : getFirstEnabledIndex(items)
        )
        setOpen(true)
      }
    },
    [disabled, disabledProp, items, onKeyDown, setHighlightedIndex, setOpen]
  )

  return (
    <button
      ref={triggerRef}
      type="button"
      data-slot="select-trigger"
      data-size={size}
      data-state={open ? "open" : "closed"}
      aria-controls={contentId}
      aria-expanded={open}
      aria-haspopup="listbox"
      disabled={disabled || disabledProp}
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pe-2 ps-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
      <ChevronDownIcon className="size-4 text-muted-foreground" />
    </button>
  )
}

function SelectContent({
  align = "center",
  children,
  className,
  position = "item-aligned",
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  align?: "center" | "end" | "start"
  position?: "item-aligned" | "popper"
}) {
  const {
    close,
    contentId,
    highlightedIndex,
    items,
    open,
    setHighlightedIndex,
    setValue,
    triggerRef,
  } = useSelectContext("SelectContent")
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const [contentStyle, setContentStyle] = React.useState<React.CSSProperties>({})

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current

    if (!trigger) {
      return
    }

    const rect = trigger.getBoundingClientRect()
    const viewportPadding = 12
    const width = rect.width
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding
    const spaceAbove = rect.top - viewportPadding
    const openUpwards = spaceBelow < 220 && spaceAbove > spaceBelow
    const maxHeight = Math.max(140, Math.min(320, openUpwards ? spaceAbove : spaceBelow))
    const baseLeft = align === "end" ? rect.right - width : rect.left
    const left = Math.min(
      Math.max(viewportPadding, baseLeft),
      window.innerWidth - viewportPadding - width
    )

    setContentStyle({
      left,
      maxHeight,
      minWidth: width,
      position: "fixed",
      top: openUpwards ? undefined : rect.bottom + 8,
      bottom: openUpwards ? window.innerHeight - rect.top + 8 : undefined,
      width,
      zIndex: 70,
    })
  }, [align, triggerRef])

  React.useEffect(() => {
    if (!open) {
      return
    }

    updatePosition()

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null

      if (
        target &&
        !triggerRef.current?.contains(target) &&
        !contentRef.current?.contains(target)
      ) {
        close(false)
      }
    }

    const handleWindowChange = () => updatePosition()

    document.addEventListener("mousedown", handlePointerDown, true)
    window.addEventListener("resize", handleWindowChange)
    window.addEventListener("scroll", handleWindowChange, true)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown, true)
      window.removeEventListener("resize", handleWindowChange)
      window.removeEventListener("scroll", handleWindowChange, true)
    }
  }, [close, open, triggerRef, updatePosition])

  React.useEffect(() => {
    if (!open || highlightedIndex < 0) {
      return
    }

    items[highlightedIndex]?.ref?.focus()
  }, [highlightedIndex, items, open])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        close()
        return
      }

      if (event.key === "Tab") {
        close(false)
        return
      }

      if (event.key === "ArrowDown") {
        event.preventDefault()
        setHighlightedIndex((currentIndex) =>
          getNextEnabledIndex(items, currentIndex, 1)
        )
        return
      }

      if (event.key === "ArrowUp") {
        event.preventDefault()
        setHighlightedIndex((currentIndex) =>
          getNextEnabledIndex(items, currentIndex, -1)
        )
        return
      }

      if (event.key === "Home") {
        event.preventDefault()
        setHighlightedIndex(getFirstEnabledIndex(items))
        return
      }

      if (event.key === "End") {
        event.preventDefault()
        setHighlightedIndex(getLastEnabledIndex(items))
        return
      }

      if (["Enter", " "].includes(event.key) && highlightedIndex >= 0) {
        event.preventDefault()
        const highlightedItem = items[highlightedIndex]

        if (highlightedItem && !highlightedItem.disabled) {
          setValue(highlightedItem.value)
          close()
        }
      }
    },
    [close, highlightedIndex, items, setHighlightedIndex, setValue]
  )

  if (!open || typeof document === "undefined") {
    return null
  }

  return createPortal(
    <div
      ref={contentRef}
      id={contentId}
      role="listbox"
      data-slot="select-content"
      data-position={position}
      className={cn(
        "overflow-x-hidden overflow-y-auto rounded-2xl border border-[#E3E8DF] bg-white text-popover-foreground shadow-[0_18px_50px_rgba(15,23,42,0.16)] outline-none",
        className
      )}
      style={contentStyle}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>,
    document.body
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="select-label"
      className={cn("px-2.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  children,
  className,
  disabled = false,
  onClick,
  onMouseEnter,
  textValue,
  value,
  ...props
}: Omit<React.ComponentPropsWithoutRef<"button">, "value"> & {
  disabled?: boolean
  textValue?: string
  value: string
}) {
  const {
    close,
    highlightedIndex,
    items,
    registerItem,
    setHighlightedIndex,
    setValue,
    unregisterItem,
    value: selectedValue,
  } = useSelectContext("SelectItem")
  const itemId = React.useId()
  const itemRef = React.useRef<HTMLButtonElement | null>(null)
  const label = textValue ?? getNodeText(children).trim()
  const itemIndex = items.findIndex((item) => item.id === itemId)
  const isSelected = selectedValue === value
  const isHighlighted = itemIndex === highlightedIndex

  React.useEffect(() => {
    registerItem({
      disabled,
      id: itemId,
      label,
      ref: itemRef.current,
      value,
    })

    return () => unregisterItem(itemId)
  }, [disabled, itemId, label, registerItem, unregisterItem, value])

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)

      if (event.defaultPrevented || disabled) {
        return
      }

      setValue(value)
      close()
    },
    [close, disabled, onClick, setValue, value]
  )

  const handleMouseEnter = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onMouseEnter?.(event)

      if (!disabled && itemIndex >= 0) {
        setHighlightedIndex(itemIndex)
      }
    },
    [disabled, itemIndex, onMouseEnter, setHighlightedIndex]
  )

  return (
    <button
      ref={itemRef}
      type="button"
      role="option"
      aria-selected={isSelected}
      data-slot="select-item"
      data-highlighted={isHighlighted ? "true" : undefined}
      disabled={disabled}
      className={cn(
        "relative flex w-full items-center gap-2 rounded-xl py-2 pe-8 ps-3 text-right text-sm outline-none transition hover:bg-[#F4F7F1] focus:bg-[#F4F7F1] disabled:cursor-not-allowed disabled:opacity-50",
        isHighlighted && "bg-[#F4F7F1]",
        className
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      <span className="pointer-events-none absolute end-3 flex size-4 items-center justify-center text-[#6C9562]">
        {isSelected ? <CheckIcon className="size-4" /> : null}
      </span>
      <span className="truncate">{children}</span>
    </button>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="select-separator"
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="select-scroll-up-button"
      className={cn("hidden", className)}
      {...props}
    >
      <ChevronUpIcon />
    </div>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="select-scroll-down-button"
      className={cn("hidden", className)}
      {...props}
    >
      <ChevronDownIcon />
    </div>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
