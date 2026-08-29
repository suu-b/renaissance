import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import Typography from "./Typography"

const cardVariants = cva(
  "border border-foreground/20 rounded-lg",
  {
    variants: {
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

type CardProps = VariantProps<typeof cardVariants> & {
  title: string
  subtitle: string
  button?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export default function Card({
  title,
  subtitle,
  button,
  children,
  size,
  className,
}: CardProps) {
  const titleVariant =
    size === "sm" ? "h3" : size === "lg" ? "h2" : "h3"

  const subtitleVariant =
    size === "sm" ? "muted" : "p"

  const titleMargin =
    size === "sm" ? "mb-1" : size === "lg" ? "mb-3" : "mb-2"

  return (
    <div className={`${cardVariants({ size })} ${className ?? ""}`}>
      <div>
        <Typography variant={titleVariant} className={titleMargin}>
          {title}
        </Typography>

        <Typography variant={subtitleVariant}>
          {subtitle}
        </Typography>
      </div>

      {button && (
        <div className="mt-4 flex justify-end">
          {button}
        </div>
      )}

      {children}
    </div>
  )
}
