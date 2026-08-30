import { cva, type VariantProps } from "class-variance-authority"
import { FiChevronRight } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

type BreadcrumbItem = {
  label: string
  path?: string
  onClick?: () => void
}

type BreadcrumbsProps = VariantProps<typeof breadcrumbsVariants> & {
  items: BreadcrumbItem[]
  className?: string
}

const breadcrumbsVariants = cva(
  "flex items-center gap-2",
  {
    variants: {
      variant: {
        default: "text-sm",
        large: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export default function Breadcrumbs({ items, variant, className }: BreadcrumbsProps) {
  const navigate = useNavigate()

  return (
    <nav className={`${breadcrumbsVariants({ variant })} ${className ?? ""}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <FiChevronRight className="text-muted-foreground text-xs" />
          )}
          {item.path || item.onClick ? (
            <button
              onClick={() => {
                if (item.onClick) {
                  item.onClick()
                } else if (item.path) {
                  navigate(item.path)
                }
              }}
              className={`${
                index === items.length - 1
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground transition-colors"
              }`}
            >
              {item.label}
            </button>
          ) : (
            <span
              className={`${
                index === items.length - 1
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
