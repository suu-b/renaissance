import { toggleMarks, toggleBlocks, toggleLists } from "harmonia-text-editor"
import { FiBold, FiItalic, FiUnderline, FiList, FiMinus, FiRotateCcw, FiRotateCw } from "react-icons/fi"
import { HistoryEditor } from "slate-history"

type TextEditorToolbarProps = {
  editor: any
}

export default function TextEditorToolbar({ editor }: TextEditorToolbarProps) {
  const isMarkActive = (format: string) => toggleMarks.isMarkActive(editor, format)

  const ToolbarButton = ({ onClick, active, disabled, children }: { onClick: () => void; active?: boolean; disabled?: boolean; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded hover:bg-foreground/10 transition-colors ${active ? "bg-foreground text-background" : "text-foreground"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  )

  const handleUndo = () => {
    HistoryEditor.undo(editor)
  }

  const handleRedo = () => {
    HistoryEditor.redo(editor)
  }

  const canUndo = HistoryEditor.isHistoryEditor(editor) && editor.history.undos.length > 0
  const canRedo = HistoryEditor.isHistoryEditor(editor) && editor.history.redos.length > 0

  return (
    <div className="flex flex-wrap gap-2 p-3 mb-4 bg-foreground/5 rounded-lg">
      {/* Undo/Redo */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={handleUndo}
          disabled={!canUndo}
        >
          <FiRotateCcw className="text-sm" />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleRedo}
          disabled={!canRedo}
        >
          <FiRotateCw className="text-sm" />
        </ToolbarButton>
      </div>

      <div className="w-px bg-foreground/20 mx-1" />

      {/* Inline formatting */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={() => toggleMarks.toggleMark(editor, "bold")}
          active={isMarkActive("bold")}
        >
          <FiBold className="text-sm" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => toggleMarks.toggleMark(editor, "italic")}
          active={isMarkActive("italic")}
        >
          <FiItalic className="text-sm" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => toggleMarks.toggleMark(editor, "underline")}
          active={isMarkActive("underline")}
        >
          <FiUnderline className="text-sm" />
        </ToolbarButton>
      </div>

      <div className="w-px bg-foreground/20 mx-1" />

      {/* Block elements */}
      <div className="flex gap-1">
        <ToolbarButton onClick={() => toggleBlocks.insertHeading1(editor)}>
          <span className="text-xs font-bold">H1</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleBlocks.insertHeading2(editor)}>
          <span className="text-xs font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleBlocks.insertHeading3(editor)}>
          <span className="text-xs font-bold">H3</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleBlocks.insertParagraph(editor)}>
          <span className="text-xs">P</span>
        </ToolbarButton>
      </div>

      <div className="w-px bg-foreground/20 mx-1" />

      {/* Lists */}
      <div className="flex gap-1">
        <ToolbarButton onClick={() => toggleLists.toggleList(editor, "numbered-list")}>
          <FiList className="text-sm" />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleLists.toggleList(editor, "bulleted-list")}>
          <FiMinus className="text-sm" />
        </ToolbarButton>
      </div>
    </div>
  )
}
