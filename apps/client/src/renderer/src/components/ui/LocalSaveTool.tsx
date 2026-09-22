import { cva, type VariantProps } from "class-variance-authority"
import { FiHardDrive } from "react-icons/fi"

const localSaveToolVariants = cva(
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

type LocalSaveToolProps = VariantProps<typeof localSaveToolVariants> & {
  className?: string
  onClick?: () => void
}

export default function LocalSaveTool({
  size,
  className,
  onClick,
}: LocalSaveToolProps) {
  return (
    <button
      className={`${localSaveToolVariants({ size })} bg-foreground ${className ?? ""}`}
      onClick={onClick}
      title="Save to local storage"
    >
      <FiHardDrive className="w-full h-full" />
    </button>
  )
}
