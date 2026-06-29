import SurfaceCard from "@/components/common/SurfaceCard"

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <SurfaceCard className="p-6 text-center">
      <h3 className="font-heading text-lg font-semibold text-slate-900">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </SurfaceCard>
  )
}

export default EmptyState
