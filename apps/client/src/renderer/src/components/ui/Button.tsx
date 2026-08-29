import {cva, type VariantProps } from "class-variance-authority"
import { FiExternalLink } from "react-icons/fi"

const buttonVariants = cva("inline-flex items-center justify-center gap-3 font-semibold uppercase tracking-wider transition-all duration-300 ease-out cursor-pointer leading-none", {
  variants: {
    variant: {
      primary: "bg-primary text-foreground hover:bg-primary/90 hover:-translate-y-0.5",
      secondary: "border border-foreground text-foreground hover:bg-foreground/5 hover:-translate-y-0.5",
      ghost: "text-foreground hover:bg-foreground/3",
    },
    size: {
      sm: "px-6 py-3 text-xs min-w-[130px]",
      md: "px-8 py-4 text-sm min-w-[150px]",
      lg: "px-10 py-5 text-base min-w-[170px]",
    },
  },

  defaultVariants: {
    variant: "primary",
    size: "md",
  },
})

type ButtonProps = VariantProps<typeof buttonVariants> & {
  children: React.ReactNode
  className?: string
  external?: boolean
  href?: string
  disabled?: boolean
  onClick?: () => void
}

export default function Button({
  variant,
  size,
  children,
  className,
  external = false,
  href,
  disabled = false,
  onClick,
}: ButtonProps) {
  const classes = `${buttonVariants({ variant, size })} ${className ?? ""}`
  
  if (href) {
    return (
      <button disabled={disabled}>
        <a
          href={href}
          className={classes}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {children}
          {external && <FiExternalLink className="text-sm" />}
        </a>
      </button>
    )
  }

  return (
    <button className={classes} onClick={onClick} disabled={disabled}>
      {children}
      {external && <FiExternalLink className="text-sm" />}
    </button>
  )
}