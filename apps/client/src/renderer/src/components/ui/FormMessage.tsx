import { cva, type VariantProps } from "class-variance-authority"

const formMessageVariants = cva(
  "text-xs",
  {
    variants: {
      variant: {
        error: "text-destructive mt-1",
        note: "text-muted text-center mt-3",
      },
    },
    defaultVariants: {
      variant: "error",
    },
  }
)

type FormMessageProps = VariantProps<typeof formMessageVariants> & {
  children: React.ReactNode
  className?: string
}

export default function FormMessage({
  children,
  variant,
  className,
}: FormMessageProps) {
  return (
    <p className={`${formMessageVariants({ variant })} ${className ?? ""}`}>
      {children}
    </p>
  )
}
