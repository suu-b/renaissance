import { useMemo } from "react"
import { createEditor, type Descendant } from "slate"
import { Slate, Editable, withReact } from "slate-react"
import { renderElement, renderLeaf } from "./slateUtils"
import "./slate-editor.css"

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

  const initialValue: Descendant[] = useMemo(() => {
    if (content && content.length > 0) {
      return content as unknown as Descendant[]
    }
    return [
      {
        type: "paragraph",
        children: [{ text: "" }],
      },
    ] as Descendant[]
  }, [content])

  return (
    <div className={`slate-editor ${className ?? ""}`}>
      <Slate editor={editor} initialValue={initialValue}>
        <Editable
          readOnly={true}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </Slate>
    </div>
  )
}
