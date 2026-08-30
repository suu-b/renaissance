import { useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { cva, type VariantProps } from 'class-variance-authority'

const backLinkVariants = cva(
  "inline-flex items-center gap-2 font-semibold uppercase tracking-wider transition-all duration-300 ease-out cursor-pointer leading-none",
  {
    variants: {
      variant: {
        default: "text-foreground hover:text-primary hover:-translate-x-1",
        primary: "text-primary hover:text-primary/80 hover:-translate-x-1",
        secondary: "text-muted hover:text-foreground hover:-translate-x-1",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

type BackLinkProps = VariantProps<typeof backLinkVariants> & {
  label?: string
  fallbackPath?: string
  className?: string
  onClick?: () => void
}

export default function BackLink({
  label = "Back",
  variant,
  size,
  fallbackPath = '/dashboard',
  className,
  onClick,
}: BackLinkProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    
    // Try to go back in history, if not possible go to fallback
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallbackPath)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`${backLinkVariants({ variant, size })} ${className ?? ""}`}
    >
      <FiArrowLeft className="text-sm" />
      {label}
    </button>
  )
}
