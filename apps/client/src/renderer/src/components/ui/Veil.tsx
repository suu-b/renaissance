import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import Typography from "./Typography"

const veilVariants = cva(
  "absolute inset-0 z-10 flex items-center justify-center rounded-lg border border-foreground/10 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "bg-background/80",
        light: "bg-background/60",
        dark: "bg-background/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type VeilProps = VariantProps<typeof veilVariants> & {
  children: React.ReactNode
  message?: string
  className?: string
  show?: boolean
}

export default function Veil({
  children,
  message = "Work in Progress",
  variant,
  className,
  show = true,
}: VeilProps) {
  return (
    <div className="relative">
      {children}
      {show && (
        <div className={`${veilVariants({ variant })} ${className ?? ""}`}>
          <div className="flex max-w-sm flex-col items-center justify-center px-6 py-8 text-center">
            <Typography
              variant="h3"
              className="font-semibold leading-tight text-foreground/80"
            >
              {message}
            </Typography>

            <Typography
              variant="muted"
              className="mt-3 max-w-xs leading-relaxed text-foreground/60"
            >
              This feature is under development
            </Typography>
          </div>
        </div>
      )}
    </div>
  )
}

