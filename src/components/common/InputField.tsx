type InputFieldProps = {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}

function InputField({ label, hint, error, children }: InputFieldProps) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
        <span>{label}</span>
        {hint ? (
          <span className="text-xs font-normal text-slate-400">{hint}</span>
        ) : null}
      </div>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </label>
  )
}

export default InputField
