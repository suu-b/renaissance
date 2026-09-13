import { Slate, Editable, withReact } from "slate-react"
import { createEditor } from "slate"
import { useMemo } from "react"
import { renderBlock, renderLeaf } from "harmonia-text-editor"
import type { RenderElementProps, RenderLeafProps } from "slate-react"
import "./harmonia-text-editor.css"

// Type assertion for the render functions
const renderBlockFn = renderBlock as (props: RenderElementProps) => React.JSX.Element
const renderLeafFn = renderLeaf as (props: RenderLeafProps) => React.JSX.Element

type EditorNode = {
  type: string
  children: Array<{ text: string }>
}

type SlateRendererProps = {
  content: EditorNode[]
  className?: string
}

export default function SlateRenderer({
  content,
  className,
}: SlateRendererProps) {
  const editor = useMemo(() => withReact(createEditor()), [])

  return (
    <div className={`slate-editor ${className ?? ""}`}>
      <Slate editor={editor} initialValue={content}>
        <Editable
          readOnly={true}
          renderElement={renderBlockFn}
          renderLeaf={renderLeafFn}
        />
      </Slate>
    </div>
  )
}
