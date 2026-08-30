import { cva, type VariantProps } from "class-variance-authority"

const inputVariants = cva(
  "bg-transparent border border-border rounded-lg font-sans text-sm px-4 py-3 transition-all duration-200 ease-out focus:outline-none placeholder:text-muted placeholder:opacity-60",
  {
    variants: {
      variant: {
        default: "focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,205,237,0.2)]",
        error: "focus:border-destructive focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type InputProps = VariantProps<typeof inputVariants> & {
  type?: string
  id?: string
  name?: string
  value?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
}

export default function Input({
  type = "text",
  id,
  name,
  value,
  placeholder,
  required = false,
  disabled = false,
  onChange,
  variant,
  className,
}: InputProps) {
  return (
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      onChange={onChange}
      className={`${inputVariants({ variant })} ${className ?? ""}`}
    />
  )
}
