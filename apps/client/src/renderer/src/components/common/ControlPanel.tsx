import React from "react"
import { FiMinus, FiCopy, FiX } from "react-icons/fi"

type ControlPanelProps = {
  className?: string
}

export default function ControlPanel({ className }: ControlPanelProps): React.JSX.Element {
  const handleMinimize = () => {
    window.api.minimizeWindow()
  }

  const handleWindowControl = () => {
    window.api.toggleMaximizeWindow()
  }

  const handleClose = () => {
    window.api.closeWindow()
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <button
        onClick={handleMinimize}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-foreground/10 transition-colors text-foreground/70 hover:text-foreground"
        title="Minimize"
      >
        <FiMinus className="text-sm" />
      </button>
      <button
        onClick={handleWindowControl}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-foreground/10 transition-colors text-foreground/70 hover:text-foreground"
        title="Maximize"
      >
        <FiCopy className="text-sm" />
      </button>
      <button
        onClick={handleClose}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-foreground/10 transition-colors text-foreground/70 hover:text-foreground"
        title="Close"
      >
        <FiX className="text-sm" />
      </button>
    </div>
  )
}
