type InputFieldProps = {
  label: string
  hint?: string
  children: React.ReactNode
}

function InputField({ label, hint, children }: InputFieldProps) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
        <span>{label}</span>
        {hint ? (
          <span className="text-xs font-normal text-slate-400">{hint}</span>
        ) : null}
      </div>
      {children}
    </label>
  )
}

export default InputField
