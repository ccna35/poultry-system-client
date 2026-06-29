import SurfaceCard from "@/components/common/SurfaceCard"
import { Button } from "@/components/ui/button"

type FormPanelProps = {
  title: string
  description: string
  submitLabel: string
  busy: boolean
  disabled?: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
}

function FormPanel({
  title,
  description,
  submitLabel,
  busy,
  disabled,
  onSubmit,
  children,
}: FormPanelProps) {
  return (
    <SurfaceCard className="p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="font-heading text-xl font-semibold text-slate-900">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        {children}
        <Button
          className="h-11 rounded-2xl bg-[#7EA974] px-5 text-white hover:bg-[#6C9562]"
          disabled={busy || disabled}
        >
          {busy ? "Saving..." : submitLabel}
        </Button>
      </form>
    </SurfaceCard>
  )
}

export default FormPanel
