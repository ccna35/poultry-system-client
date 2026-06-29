import * as React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type SelectInputProps = {
  options: Array<{
    label: string
    value: string
  }>
  className?: string
  contentClassName?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onBlur?: () => void
  name?: string
  disabled?: boolean
  "aria-invalid"?: boolean
}

function SelectInput({
  className,
  contentClassName,
  options,
  placeholder,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  name,
  disabled,
  "aria-invalid": ariaInvalid,
}: SelectInputProps) {
  return (
    <Select
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "h-11 w-full rounded-2xl border border-[#E3E8DF] bg-[#FBFCF8] px-4 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition outline-none focus:border-[#8CB17F] focus:bg-white focus:ring-4 focus:ring-[#DDECD7] aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15",
          className
        )}
        aria-invalid={ariaInvalid}
        onBlur={onBlur}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className={cn(
          "rounded-2xl border border-[#E3E8DF] bg-white",
          contentClassName
        )}
      >
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default SelectInput
