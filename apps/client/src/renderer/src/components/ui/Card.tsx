import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import Typography from "./Typography"
import { FiUser } from "react-icons/fi"

const cardVariants = cva(
  "border border-foreground/20 rounded-lg",
  {
    variants: {
      size: {
        xsm: "p-3 border-0",
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
  lastUpdatedBy?: string
  lastUpdatedAt?: string
}

export default function Card({
  title,
  subtitle,
  button,
  children,
  size,
  className,
  lastUpdatedBy,
  lastUpdatedAt,
}: CardProps) {
  const titleVariant =
    size === "xsm" ? "muted" : size === "lg" ? "h2" : "h3"

  const subtitleVariant =
    size === "xsm" ? "small" : "p"

  const titleMargin =
    size === "xsm" ? "mb-0" : size === "lg" ? "mb-3" : "mb-2"

  return (
    <div className={`${cardVariants({ size })} ${className ?? ""}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Typography variant={titleVariant} className={titleMargin}>
            {title}
          </Typography>

          <Typography variant={subtitleVariant} className={size === "xsm" ? "text-muted-foreground line-clamp-1" : ""}>
            {subtitle}
          </Typography>
        </div>

        {size !== "xsm" && (lastUpdatedBy || lastUpdatedAt) && (
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center">
              <FiUser className="text-foreground/50 text-xs" />
            </div>
            <div className="text-right">
              <Typography variant="small" className="text-muted-foreground">
                {lastUpdatedBy && (
                  <span className="font-semibold text-foreground/80">{lastUpdatedBy}</span>
                )}
                {lastUpdatedBy && lastUpdatedAt && <span className="mx-1">·</span>}
                {lastUpdatedAt && (
                  <span className="text-foreground/70">{lastUpdatedAt}</span>
                )}
              </Typography>
            </div>
          </div>
        )}
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
