import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import Typography from "./Typography"
import { FiUser } from "react-icons/fi"

const listItemVariants = cva(
  "hover:bg-foreground/5 cursor-pointer transition-colors group",
  {
    variants: {
      size: {
        sm: "py-3 px-6",
        md: "py-4 px-8",
        lg: "py-5 px-10",
      },
      isLast: {
        true: "",
        false: "border-b border-foreground/20",
      },
    },
    defaultVariants: {
      size: "md",
      isLast: false,
    },
  }
)

type ListItemProps = VariantProps<typeof listItemVariants> & {
  title: string
  onClick?: () => void
  children?: React.ReactNode
  className?: string
  lastUpdatedBy?: string
  lastUpdatedAt?: string
  isLast?: boolean
}

export default function ListItem({
  title,
  onClick,
  children,
  size,
  className,
  lastUpdatedBy,
  lastUpdatedAt,
  isLast,
}: ListItemProps) {
  const titleMargin =
    size === "lg" ? "mb-3" : "mb-2"

  return (
    <div
      className={`${listItemVariants({ size, isLast })} ${className ?? ""}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Typography variant="p" className={`${titleMargin} group-hover:text-foreground`}>
            {title}
          </Typography>
        </div>

        {lastUpdatedBy || lastUpdatedAt && (
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

      {children}
    </div>
  )
}
