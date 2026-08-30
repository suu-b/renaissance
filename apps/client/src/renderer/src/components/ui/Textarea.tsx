import { cva, type VariantProps } from "class-variance-authority"

const textareaVariants = cva(
  "bg-transparent border border-border rounded-lg font-sans text-sm px-4 py-3 transition-all duration-200 ease-out focus:outline-none resize-vertical min-h-[120px] leading-relaxed placeholder:text-muted placeholder:opacity-60",
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

type TextareaProps = VariantProps<typeof textareaVariants> & {
  id?: string
  name?: string
  value?: string
  placeholder?: string
  rows?: number
  required?: boolean
  disabled?: boolean
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
}

export default function Textarea({
  id,
  name,
  value,
  placeholder,
  rows = 6,
  required = false,
  disabled = false,
  onChange,
  variant,
  className,
}: TextareaProps) {
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      placeholder={placeholder}
      rows={rows}
      required={required}
      disabled={disabled}
      onChange={onChange}
      className={`${textareaVariants({ variant })} ${className ?? ""}`}
    />
  )
}
