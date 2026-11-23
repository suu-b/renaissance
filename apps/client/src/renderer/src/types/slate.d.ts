import { BaseEditor } from "slate"
import { ReactEditor } from "slate-react"
import { HistoryEditor } from "slate-history"

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

export type ParagraphElement = {
  type: "paragraph"
  align?: "left" | "center" | "right" | "justify"
  showBorders?: boolean
  children: CustomText[]
}

export type Heading1Element = {
  type: "heading1"
  align?: "left" | "center" | "right" | "justify"
  showBorders?: boolean
  children: CustomText[]
}

export type Heading2Element = {
  type: "heading2"
  align?: "left" | "center" | "right" | "justify"
  showBorders?: boolean
  children: CustomText[]
}

export type Heading3Element = {
  type: "heading3"
  align?: "left" | "center" | "right" | "justify"
  showBorders?: boolean
  children: CustomText[]
}

export type BulletedListElement = {
  type: "bulleted-list"
  align?: "left" | "center" | "right" | "justify"
  showBorders?: boolean
  children: CustomElement[]
}

export type NumberedListElement = {
  type: "numbered-list"
  align?: "left" | "center" | "right" | "justify"
  showBorders?: boolean
  children: CustomElement[]
}

export type ListItemElement = {
  type: "list-item"
  align?: "left" | "center" | "right" | "justify"
  showBorders?: boolean
  children: CustomText[]
}

export type CodeBlockElement = {
  type: "code-block"
  align?: "left" | "center" | "right" | "justify"
  showBorders?: boolean
  children: CustomText[]
}

export type CustomElement =
  | ParagraphElement
  | Heading1Element
  | Heading2Element
  | Heading3Element
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | CodeBlockElement

export type FormattedText = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  highlight?: boolean
  code?: boolean
}

export type CustomText = FormattedText

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}
