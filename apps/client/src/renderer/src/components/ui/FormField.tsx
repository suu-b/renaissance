import React from "react"
import Label from "./Label"

type FormFieldProps = {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

export default function FormField({
  label,
  htmlFor,
  required = false,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label
        htmlFor={htmlFor}
        variant={error ? "error" : "default"}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  )
}
