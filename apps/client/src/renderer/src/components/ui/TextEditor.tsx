import { createMyEditor, HarmoniaTextEditor, renderBlock, renderLeaf } from "harmonia-text-editor"
import { useMemo } from "react"
import type { ReactNode } from "react"
import "./harmonia-text-editor.css"
import TextEditorToolbar from "./TextEditorToolbar"

// Type assertion for the render functions
const renderBlockFn = renderBlock as (props: any) => ReactNode
const renderLeafFn = renderLeaf as (props: any) => ReactNode

type TextEditorProps = {
  initialValue?: Array<{ type: string; children: Array<{ text: string }> }>
  onChange?: (value: string) => void
  className?: string
  showToolbar?: boolean
}

export default function TextEditor({
  initialValue,
  onChange,
  className,
  showToolbar = true,
}: TextEditorProps) {
  const editor = useMemo(() => createMyEditor(), [])

  const defaultInitialValue: Array<{ type: string; children: Array<{ text: string }> }> = [
    {
      type: "paragraph",
      children: [{ text: "Write from here..." }],
    },
  ]

  const handleTextChange = (value: string) => {
    if (onChange) {
      onChange(value)
    }
  }

  return (
    <div
      className={`w-full h-full outline-none ${className ?? ""}`}
      style={{
        minHeight: "100%",
        cursor: "text",
      }}
    >
      {showToolbar && <TextEditorToolbar editor={editor} />}
      <HarmoniaTextEditor
        editor={editor}
        initialValue={initialValue || defaultInitialValue}
        handleTextChange={handleTextChange}
        renderBlock={renderBlockFn}
        renderLeaf={renderLeafFn}
      />
    </div>
  )
}
