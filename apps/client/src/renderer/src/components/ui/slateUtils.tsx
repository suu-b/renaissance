import type { JSX } from "react"
import { Editor, Transforms, Element as SlateElement } from "slate"
import type { RenderElementProps, RenderLeafProps } from "slate-react"
import type { CustomEditor, CustomElement, FormattedText } from "../../types/slate"

const LIST_TYPES = ["bulleted-list", "numbered-list"]

export const isMarkActive = (
  editor: CustomEditor | Editor,
  format: keyof Omit<FormattedText, "text">
): boolean => {
  const marks = Editor.marks(editor) as Record<string, boolean> | null
  return marks ? marks[format] === true : false
}

export const toggleMark = (
  editor: CustomEditor | Editor,
  format: keyof Omit<FormattedText, "text">
): void => {
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

export const isBlockActive = (
  editor: CustomEditor | Editor,
  format: string
): boolean => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n as CustomElement).type === format,
    })
  )

  return !!match
}

export const toggleBlock = (
  editor: CustomEditor | Editor,
  format: string
): void => {
  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes((n as CustomElement).type),
    split: true,
  })

  const newProperties: Partial<CustomElement> = {
    type: (isActive ? "paragraph" : isList ? "list-item" : format) as any,
  }

  Transforms.setNodes<CustomElement>(editor, newProperties)

  if (!isActive && isList) {
    const block: CustomElement = { type: format as any, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

export const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps): JSX.Element => {
  const customElement = element as CustomElement
  const alignClass = customElement.align
    ? customElement.align === "center"
      ? "text-center"
      : customElement.align === "right"
      ? "text-right"
      : customElement.align === "justify"
      ? "text-justify"
      : "text-left"
    : ""

  const borderClass = customElement.showBorders
    ? "border p-1 border-foreground/30 rounded"
    : ""

  switch (customElement.type) {
    case "heading1":
      return (
        <h1
          {...attributes}
          className={`text-3xl font-bold my-4 tracking-tight ${alignClass} ${borderClass}`}
        >
          {children}
        </h1>
      )
    case "heading2":
      return (
        <h2
          {...attributes}
          className={`text-2xl font-bold my-3 tracking-tight ${alignClass} ${borderClass}`}
        >
          {children}
        </h2>
      )
    case "heading3":
      return (
        <h3
          {...attributes}
          className={`text-xl font-semibold my-2 tracking-tight ${alignClass} ${borderClass}`}
        >
          {children}
        </h3>
      )
    case "bulleted-list":
      return (
        <ul
          {...attributes}
          className={`list-disc pl-6 my-2 space-y-1 ${alignClass} ${borderClass}`}
        >
          {children}
        </ul>
      )
    case "numbered-list":
      return (
        <ol
          {...attributes}
          className={`list-decimal pl-6 my-2 space-y-1 ${alignClass} ${borderClass}`}
        >
          {children}
        </ol>
      )
    case "list-item":
      return (
        <li {...attributes} className={`${alignClass} ${borderClass}`}>
          {children}
        </li>
      )
    case "code-block":
      return (
        <pre
          {...attributes}
          className="bg-foreground/5 text-foreground font-mono p-4 rounded-md my-3 overflow-x-auto text-sm border border-foreground/10"
        >
          <code>{children}</code>
        </pre>
      )
    case "paragraph":
    default:
      return (
        <p
          {...attributes}
          className={`text-base my-2 leading-relaxed ${alignClass} ${borderClass}`}
        >
          {children}
        </p>
      )
  }
}

export const renderLeaf = ({
  attributes,
  children,
  leaf,
}: RenderLeafProps): JSX.Element => {
  const formattedLeaf = leaf as FormattedText

  if (formattedLeaf.bold) {
    children = <strong className="font-bold">{children}</strong>
  }
  if (formattedLeaf.italic) {
    children = <em className="italic">{children}</em>
  }
  if (formattedLeaf.underline) {
    children = <u className="underline">{children}</u>
  }
  if (formattedLeaf.highlight) {
    children = (
      <mark className="bg-primary/30 text-foreground px-0.5 rounded">
        {children}
      </mark>
    )
  }
  if (formattedLeaf.code) {
    children = (
      <code className="bg-foreground/5 font-mono text-xs px-1.5 py-0.5 rounded border border-foreground/10">
        {children}
      </code>
    )
  }

  return <span {...attributes}>{children}</span>
}

export const toggleMarks = {
  toggleMark,
  isMarkActive,
}

export const toggleBlocks = {
  toggleHeading1: (editor: CustomEditor | Editor) => toggleBlock(editor, "heading1"),
  toggleHeading2: (editor: CustomEditor | Editor) => toggleBlock(editor, "heading2"),
  toggleHeading3: (editor: CustomEditor | Editor) => toggleBlock(editor, "heading3"),
  toggleParagraph: (editor: CustomEditor | Editor) => toggleBlock(editor, "paragraph"),
  toggleCodeBlock: (editor: CustomEditor | Editor) => toggleBlock(editor, "code-block"),
  insertHeading1: (editor: CustomEditor | Editor) => toggleBlock(editor, "heading1"),
  insertHeading2: (editor: CustomEditor | Editor) => toggleBlock(editor, "heading2"),
  insertHeading3: (editor: CustomEditor | Editor) => toggleBlock(editor, "heading3"),
  insertParagraph: (editor: CustomEditor | Editor) => toggleBlock(editor, "paragraph"),
  insertCodeBlock: (editor: CustomEditor | Editor) => toggleBlock(editor, "code-block"),
  isBlockActive,
}

export const toggleLists = {
  toggleList: (editor: CustomEditor | Editor, format: string) =>
    toggleBlock(editor, format),
  isListActive: (editor: CustomEditor | Editor, format: string) =>
    isBlockActive(editor, format),
}
