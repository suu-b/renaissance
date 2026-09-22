import { useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { FiGitCommit } from "react-icons/fi"
import Modal from "./Modal"

const commitToolVariants = cva(
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

type CommitToolProps = VariantProps<typeof commitToolVariants> & {
  className?: string
  onClick?: () => void
  confirm?: boolean
  confirmTitle?: string
  confirmContent?: string
}

// renamed from SaveTool to CommitTool
export default function CommitTool({
  size,
  className,
  onClick,
  confirm = false,
  confirmTitle = "Confirm Commit",
  confirmContent = "Are you sure you want to commit your changes?",
}: CommitToolProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = () => {
    if (confirm) {
      setIsModalOpen(true)
    } else if (onClick) {
      onClick()
    }
  }

  const handleConfirm = () => {
    setIsModalOpen(false)
    if (onClick) {
      onClick()
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <button
        className={`${commitToolVariants({ size })} bg-foreground ${className ?? ""}`}
        onClick={handleClick}
        title="Commit changes"
      >
        <FiGitCommit className="w-full h-full" />
      </button>
      {confirm && (
        <Modal
          isOpen={isModalOpen}
          title={confirmTitle}
          content={confirmContent}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}
