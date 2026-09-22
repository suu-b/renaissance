import { cva, type VariantProps } from "class-variance-authority"
import EditTool from "../ui/EditTool"
import DeleteTool from "../ui/DeleteTool"
import NewTool from "../ui/NewTool"
import CommitTool from "../ui/CommitTool"
import LocalSaveTool from "../ui/LocalSaveTool"
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
  onLocalSave?: () => void
  onCommit?: () => void
  onCancel?: () => void
  confirm?: boolean
  confirmTitle?: string
  confirmContent?: string
  commitConfirm?: boolean
  commitConfirmTitle?: string
  commitConfirmContent?: string
  cancelConfirmTitle?: string
  cancelConfirmContent?: string
  showSaveCancel?: boolean
  showLocalSave?: boolean
  showCommit?: boolean
  showNew?: boolean
}

export default function ToolKit({
  size,
  className,
  onEdit,
  onDelete,
  onNew,
  onLocalSave,
  onCommit,
  onCancel,
  confirm,
  confirmTitle,
  confirmContent,
  commitConfirm = true,
  commitConfirmTitle = "Commit Changes",
  commitConfirmContent = "Are you sure you want to commit your changes?",
  cancelConfirmTitle,
  cancelConfirmContent,
  showSaveCancel = false,
  showLocalSave = false,
  showCommit = false,
  showNew = true,
}: ToolKitProps) {
  return (
    <div className={`${toolKitVariants({ size })} ${className ?? ""}`}>
      {showSaveCancel ? (
        <>
          {showLocalSave && <LocalSaveTool size={size} onClick={onLocalSave} />}
          {showCommit && (
            <CommitTool
              size={size}
              onClick={onCommit}
              confirm={commitConfirm}
              confirmTitle={commitConfirmTitle}
              confirmContent={commitConfirmContent}
            />
          )}
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
          {showNew && <NewTool size={size} onClick={onNew} />}
        </>
      )}
    </div>
  )
}
