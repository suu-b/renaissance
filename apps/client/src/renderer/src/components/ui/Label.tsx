import { cva, type VariantProps } from "class-variance-authority"

const labelVariants = cva(
  "text-xs font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "text-muted",
        error: "text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type LabelProps = VariantProps<typeof labelVariants> & {
  children: React.ReactNode
  htmlFor?: string
  className?: string
}

export default function Label({
  children,
  htmlFor,
  variant,
  className,
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`${labelVariants({ variant })} ${className ?? ""}`}
    >
      {children}
    </label>
  )
}
