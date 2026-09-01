import { cva, type VariantProps } from "class-variance-authority"
import { FiTrash } from "react-icons/fi"

const deleteToolVariants = cva(
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

type DeleteToolProps = VariantProps<typeof deleteToolVariants> & {
  className?: string
  onClick?: () => void
}

export default function DeleteTool({
  size,
  className,
  onClick,
}: DeleteToolProps) {
  return (
    <button
      className={`${deleteToolVariants({ size })} bg-foreground ${className ?? ""}`}
      onClick={onClick}
    >
      <FiTrash className="w-full h-full" />
    </button>
  )
}
