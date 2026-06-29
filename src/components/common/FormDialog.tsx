import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type FormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerLabel: string
  title: string
  description: string
  submitLabel: string
  busy: boolean
  disabled?: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
}

function FormDialog({
  open,
  onOpenChange,
  triggerLabel,
  title,
  description,
  submitLabel,
  busy,
  disabled,
  onSubmit,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="flex">
        <DialogTrigger asChild>
          <Button
            type="button"
            className="h-11 rounded-2xl bg-[#7EA974] px-5 text-white hover:bg-[#6C9562]"
            disabled={disabled}
          >
            {triggerLabel}
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="w-[min(94vw,52rem)] max-w-[52rem] overflow-hidden p-0">
        <div className="border-b border-[#EDF1EA] px-6 py-5">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </div>

        <form className="flex max-h-[80vh] flex-col" onSubmit={onSubmit}>
          <div className="space-y-4 overflow-y-auto px-6 py-5">{children}</div>
          <div className="border-t border-[#EDF1EA] px-6 py-4">
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl border-[#DDE7D7] bg-white px-5 text-slate-600"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button
                className="h-11 rounded-2xl bg-[#7EA974] px-5 text-white hover:bg-[#6C9562]"
                disabled={busy || disabled}
              >
                {busy ? "جارٍ الحفظ..." : submitLabel}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default FormDialog
