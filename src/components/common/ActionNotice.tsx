import { cn } from "@/lib/utils"

export type StatusMessage = {
  tone: "success" | "error"
  text: string
}

function ActionNotice({ message }: { message: StatusMessage | null }) {
  if (!message) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-[1.5rem] border px-4 py-3 text-sm",
        message.tone === "success"
          ? "border-[#CFE5C7] bg-[#F4FAF1] text-[#4C7A49]"
          : "border-destructive/20 bg-destructive/6 text-destructive"
      )}
    >
      {message.text}
    </div>
  )
}

export default ActionNotice
