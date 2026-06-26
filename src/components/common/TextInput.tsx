import { cn } from "@/lib/utils"

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>

function TextInput({ className, ...props }: TextInputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-[#E3E8DF] bg-[#FBFCF8] px-4 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition outline-none placeholder:text-slate-400 focus:border-[#8CB17F] focus:bg-white focus:ring-4 focus:ring-[#DDECD7]",
        className
      )}
      {...props}
    />
  )
}

export default TextInput
