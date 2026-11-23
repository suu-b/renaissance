import { useMemo, useCallback } from "react"
import { createEditor, type Descendant } from "slate"
import { Slate, Editable, withReact } from "slate-react"
import { withHistory } from "slate-history"
import TextEditorToolbar from "./TextEditorToolbar"
import { renderElement, renderLeaf, toggleMark } from "./slateUtils"
import "./slate-editor.css"

type TextEditorProps = {
  initialValue?: Array<{ type: string; children: Array<{ text: string }> }>
  onChange?: (value: string) => void
  className?: string
  showToolbar?: boolean
  placeholder?: string
}

export default function TextEditor({
  initialValue,
  onChange,
  className,
  showToolbar = true,
  placeholder = "Write from here...",
}: TextEditorProps) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  const defaultInitialValue: Descendant[] = useMemo(
    () => [
      {
        type: "paragraph",
        children: [{ text: "" }],
      },
    ],
    []
  )

  const value: Descendant[] = useMemo(() => {
    if (initialValue && initialValue.length > 0) {
      return initialValue as unknown as Descendant[]
    }
    return defaultInitialValue
  }, [initialValue, defaultInitialValue])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!event.ctrlKey && !event.metaKey) {
        return
      }

      switch (event.key.toLowerCase()) {
        case "b": {
          event.preventDefault()
          toggleMark(editor, "bold")
          break
        }
        case "i": {
          event.preventDefault()
          toggleMark(editor, "italic")
          break
        }
        case "u": {
          event.preventDefault()
          toggleMark(editor, "underline")
          break
        }
      }
    },
    [editor]
  )

  const handleChange = useCallback(
    (val: Descendant[]) => {
      // Only fire onChange if there were AST changes, not just selection changes
      const isAstChange = editor.operations.some((op) => op.type !== "set_selection")
      if (isAstChange && onChange) {
        onChange(JSON.stringify(val))
      }
    },
    [editor, onChange]
  )

  return (
    <div
      className={`w-full h-full flex flex-col ${className ?? ""}`}
      style={{
        minHeight: "100%",
        cursor: "text",
      }}
    >
      <Slate editor={editor} initialValue={value} onChange={handleChange}>
        {showToolbar && <TextEditorToolbar editor={editor} />}
        <div className="flex-1 slate-editor">
          <Editable
            className="outline-none min-h-[300px] leading-relaxed"
            placeholder={placeholder}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={handleKeyDown}
            spellCheck
            autoFocus
          />
        </div>
      </Slate>
    </div>
  )
}
