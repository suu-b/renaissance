import Button from "./Button"
import Typography from "./Typography"

type ModalProps = {
  isOpen: boolean
  title: string
  content: string
  onConfirm: () => void
  onCancel?: () => void
  className?: string
}

export default function Modal({
  title,
  content,
  onConfirm,
  onCancel,
  isOpen,
  className,
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-auto ${className ?? ""} transition-opacity duration-300`}
    >
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-background border border-foreground/20 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <Typography variant="h3" className="mb-4">
          {title}
        </Typography>
        <Typography variant="p" className="text-muted-foreground mb-6">
          {content}
        </Typography>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}
