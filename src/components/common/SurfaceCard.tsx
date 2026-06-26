import { cn } from "@/lib/utils"

type SurfaceCardProps = {
  className?: string
  children: React.ReactNode
}

function SurfaceCard({ className, children }: SurfaceCardProps) {
  return (
    <section
      className={cn(
        "rounded-[1.8rem] border border-[rgba(121,154,109,0.14)] bg-white shadow-[0_18px_50px_rgba(63,92,56,0.08)]",
        className
      )}
    >
      {children}
    </section>
  )
}

export default SurfaceCard
