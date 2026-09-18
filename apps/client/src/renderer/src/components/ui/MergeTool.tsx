import { cva, type VariantProps } from "class-variance-authority"
import { MdCallMerge } from "react-icons/md"

const mergeToolVariants = cva(
  "flex items-center justify-center rounded border border-white/50 text-white transition-all duration-300 ease-out",
  {
    variants: {
      size: {
        sm: "w-8 h-8 p-1.5",
        lg: "w-12 h-12 p-2.5",
        xl: "w-16 h-16 p-3.5",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "cursor-pointer",
      },
    },
    defaultVariants: {
      size: "lg",
      disabled: false,
    },
  }
)

type MergeToolProps = VariantProps<typeof mergeToolVariants> & {
  className?: string
  onClick?: () => void
  title?: string
  disabled?: boolean
}

export default function MergeTool({
  size,
  className,
  onClick,
  title = "Merge to main",
  disabled = false,
}: MergeToolProps) {
  return (
    <button
      className={`${mergeToolVariants({ size, disabled })} bg-foreground ${className ?? ""}`}
      onClick={disabled ? undefined : onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
    >
      <MdCallMerge className="w-full h-full" />
    </button>
  )
}
