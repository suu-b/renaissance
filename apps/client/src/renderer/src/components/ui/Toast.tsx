import React, { useEffect, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import Typography from "./Typography"

const toastVariants = cva(
  "fixed bottom-8 right-8 z-50 max-w-sm w-auto px-5 py-3 rounded-lg shadow-lg transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        info: "bg-foreground text-white",
        alert: "bg-foreground text-white border-2 border-dashed border-white/30",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

type ToastProps = VariantProps<typeof toastVariants> & {
  message: string
  isVisible: boolean
  onClose: () => void
  className?: string
}

export default function Toast({
  variant,
  message,
  isVisible,
  onClose,
  className,
}: ToastProps) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
    } else {
      // Allow exit animation to complete before removing from DOM
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isVisible])

  useEffect(() => {
    if (isVisible) {
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isVisible, onClose])

  if (!shouldRender) return null

  return (
    <div
      className={`${toastVariants({ variant })} ${className ?? ""} ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
    >
      <Typography variant="muted" className="text-white">
        {message}
      </Typography>
    </div>
  )
}

// Toast context and hook for managing toasts
type ToastContextType = {
  showToast: (message: string, variant?: "info" | "alert") => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    message: string
    variant: "info" | "alert"
    isVisible: boolean
  } | null>(null)

  const showToast = (message: string, variant: "info" | "alert" = "info") => {
    setToast({ message, variant, isVisible: true })
  }

  const handleClose = () => {
    setToast((prev) => (prev ? { ...prev, isVisible: false } : null))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          isVisible={toast.isVisible}
          onClose={handleClose}
        />
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
