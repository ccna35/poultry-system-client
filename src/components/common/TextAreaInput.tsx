import { cn } from "@/lib/utils"

type TextAreaInputProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

function TextAreaInput({ className, ...props }: TextAreaInputProps) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-[#E3E8DF] bg-[#FBFCF8] px-4 py-3 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition outline-none placeholder:text-slate-400 focus:border-[#8CB17F] focus:bg-white focus:ring-4 focus:ring-[#DDECD7]",
        className
      )}
      {...props}
    />
  )
}

export default TextAreaInput
