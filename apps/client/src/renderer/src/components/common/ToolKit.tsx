import { cva, type VariantProps } from "class-variance-authority"
import EditTool from "../ui/EditTool"
import DeleteTool from "../ui/DeleteTool"
import NewTool from "../ui/NewTool"
import SaveTool from "../ui/SaveTool"
import CancelTool from "../ui/CancelTool"

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
  onSave?: () => void
  onCancel?: () => void
  confirm?: boolean
  confirmTitle?: string
  confirmContent?: string
  saveConfirmTitle?: string
  saveConfirmContent?: string
  cancelConfirmTitle?: string
  cancelConfirmContent?: string
  showSaveCancel?: boolean
}

export default function ToolKit({
  size,
  className,
  onEdit,
  onDelete,
  onNew,
  onSave,
  onCancel,
  confirm,
  confirmTitle,
  confirmContent,
  saveConfirmTitle,
  saveConfirmContent,
  cancelConfirmTitle,
  cancelConfirmContent,
  showSaveCancel = false,
}: ToolKitProps) {
  return (
    <div className={`${toolKitVariants({ size })} ${className ?? ""}`}>
      {showSaveCancel ? (
        <>
          <SaveTool
            size={size}
            onClick={onSave}
            confirm={confirm}
            confirmTitle={saveConfirmTitle}
            confirmContent={saveConfirmContent}
          />
          <CancelTool
            size={size}
            onClick={onCancel}
            confirm={confirm}
            confirmTitle={cancelConfirmTitle}
            confirmContent={cancelConfirmContent}
          />
        </>
      ) : (
        <>
          <EditTool size={size} onClick={onEdit} />
          <DeleteTool
            size={size}
            onClick={onDelete}
            confirm={confirm}
            confirmTitle={confirmTitle}
            confirmContent={confirmContent}
          />
          <NewTool size={size} onClick={onNew} />
        </>
      )}
    </div>
  )
}
