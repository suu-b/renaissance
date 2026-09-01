import { cva, type VariantProps } from "class-variance-authority"
import { FiPlus } from "react-icons/fi"

const newToolVariants = cva(
  "flex items-center justify-center rounded border border-white/50 text-white transition-all duration-300 ease-out cursor-pointer",
  {
    variants: {
      size: {
        sm: "w-8 h-8 p-1.5",
        lg: "w-12 h-12 p-2.5",
        xl: "w-16 h-16 p-3.5",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  }
)

type NewToolProps = VariantProps<typeof newToolVariants> & {
  className?: string
  onClick?: () => void
}

export default function NewTool({
  size,
  className,
  onClick,
}: NewToolProps) {
  return (
    <button
      className={`${newToolVariants({ size })} bg-foreground ${className ?? ""}`}
      onClick={onClick}
    >
      <FiPlus className="w-full h-full" />
    </button>
  )
}
