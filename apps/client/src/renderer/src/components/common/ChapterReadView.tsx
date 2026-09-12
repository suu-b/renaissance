import ChapterReader from "../ui/ChapterReader"

type EditorNode = {
  type: string
  children: Array<{ text: string }>
}

type ChapterReadViewProps = {
  title: string
  content: EditorNode[]
  chapterNumber: number
  totalChapters: number
  onPrevious: () => void
  onNext: () => void
}

export default function ChapterReadView({
  title,
  content,
  chapterNumber,
  totalChapters,
  onPrevious,
  onNext,
}: ChapterReadViewProps) {
  const textContent = content
    .map(node => node.children.map(child => child.text).join(""))
    .join("\n\n")

  return (
    <ChapterReader
      title={title}
      content={textContent}
      chapterNumber={chapterNumber}
      totalChapters={totalChapters}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}
