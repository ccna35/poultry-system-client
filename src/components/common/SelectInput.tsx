import { cn } from "@/lib/utils"

type SelectInputProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{
    label: string
    value: string
  }>
}

function SelectInput({ className, options, ...props }: SelectInputProps) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-2xl border border-[#E3E8DF] bg-[#FBFCF8] px-4 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition outline-none focus:border-[#8CB17F] focus:bg-white focus:ring-4 focus:ring-[#DDECD7]",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default SelectInput
