type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  actions?: React.ReactNode
}

function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-sm font-medium text-[#6E8F68]">{eyebrow}</p>
        <h2 className="mt-1 font-heading text-[1.75rem] font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
          {description}
        </p>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

export default PageHeader
