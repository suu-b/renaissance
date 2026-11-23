import type { ReactNode } from "react"
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiMinus,
  FiRotateCcw,
  FiRotateCw,
  FiCode,
} from "react-icons/fi"
import { HistoryEditor } from "slate-history"
import { useSlate } from "slate-react"
import { isMarkActive, toggleMark, isBlockActive, toggleBlock } from "./slateUtils"
import type { CustomEditor } from "../../types/slate"

type TextEditorToolbarProps = {
  editor?: any
}

export default function TextEditorToolbar({ editor: propEditor }: TextEditorToolbarProps) {
  const slateEditor = useSlate()
  const editor = (propEditor || slateEditor) as CustomEditor

  const handleUndo = () => {
    HistoryEditor.undo(editor)
  }

  const handleRedo = () => {
    HistoryEditor.redo(editor)
  }

  const canUndo =
    HistoryEditor.isHistoryEditor(editor) && editor.history.undos.length > 0
  const canRedo =
    HistoryEditor.isHistoryEditor(editor) && editor.history.redos.length > 0

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    title,
    children,
  }: {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    title?: string
    children: ReactNode
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault()
        if (!disabled) onClick()
      }}
      disabled={disabled}
      className={`px-2.5 py-1.5 rounded transition-all flex items-center justify-center text-sm font-medium ${
        active
          ? "bg-foreground text-background shadow-xs"
          : "text-foreground/80 hover:text-foreground hover:bg-foreground/10"
      } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  )

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 mb-4 bg-foreground/[0.03] border border-foreground/10 rounded-lg backdrop-blur-xs select-none">
      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <FiRotateCcw className="text-sm" />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <FiRotateCw className="text-sm" />
        </ToolbarButton>
      </div>

      <div className="w-px h-5 bg-foreground/15 mx-1" />

      {/* Inline Marks */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => toggleMark(editor, "bold")}
          active={isMarkActive(editor, "bold")}
          title="Bold (Ctrl+B)"
        >
          <FiBold className="text-sm" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => toggleMark(editor, "italic")}
          active={isMarkActive(editor, "italic")}
          title="Italic (Ctrl+I)"
        >
          <FiItalic className="text-sm" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => toggleMark(editor, "underline")}
          active={isMarkActive(editor, "underline")}
          title="Underline (Ctrl+U)"
        >
          <FiUnderline className="text-sm" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => toggleMark(editor, "code")}
          active={isMarkActive(editor, "code")}
          title="Inline Code"
        >
          <span className="text-xs font-mono">&lt;&gt;</span>
        </ToolbarButton>
      </div>

      <div className="w-px h-5 bg-foreground/15 mx-1" />

      {/* Block Elements */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => toggleBlock(editor, "heading1")}
          active={isBlockActive(editor, "heading1")}
          title="Heading 1"
        >
          <span className="text-xs font-bold">H1</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => toggleBlock(editor, "heading2")}
          active={isBlockActive(editor, "heading2")}
          title="Heading 2"
        >
          <span className="text-xs font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => toggleBlock(editor, "heading3")}
          active={isBlockActive(editor, "heading3")}
          title="Heading 3"
        >
          <span className="text-xs font-bold">H3</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => toggleBlock(editor, "paragraph")}
          active={isBlockActive(editor, "paragraph")}
          title="Paragraph"
        >
          <span className="text-xs font-medium">P</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => toggleBlock(editor, "code-block")}
          active={isBlockActive(editor, "code-block")}
          title="Code Block"
        >
          <FiCode className="text-sm" />
        </ToolbarButton>
      </div>

      <div className="w-px h-5 bg-foreground/15 mx-1" />

      {/* Lists */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => toggleBlock(editor, "numbered-list")}
          active={isBlockActive(editor, "numbered-list")}
          title="Numbered List"
        >
          <FiList className="text-sm" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => toggleBlock(editor, "bulleted-list")}
          active={isBlockActive(editor, "bulleted-list")}
          title="Bulleted List"
        >
          <FiMinus className="text-sm" />
        </ToolbarButton>
      </div>
    </div>
  )
}
