import { cva, type VariantProps } from "class-variance-authority"
import EditTool from "../ui/EditTool"
import DeleteTool from "../ui/DeleteTool"
import NewTool from "../ui/NewTool"

const toolKitVariants = cva(
  "flex items-center gap-3",
  {
    variants: {
      size: {
        sm: "gap-2",
        lg: "gap-3",
        xl: "gap-4",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  }
)

type ToolKitProps = VariantProps<typeof toolKitVariants> & {
  className?: string
  onEdit?: () => void
  onDelete?: () => void
  onNew?: () => void
}

export default function ToolKit({
  size,
  className,
  onEdit,
  onDelete,
  onNew,
}: ToolKitProps) {
  return (
    <div className={`${toolKitVariants({ size })} ${className ?? ""}`}>
      <EditTool size={size} onClick={onEdit} />
      <DeleteTool size={size} onClick={onDelete} />
      <NewTool size={size} onClick={onNew} />
    </div>
  )
}
