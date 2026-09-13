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
  return (
    <ChapterReader
      title={title}
      content={content}
      chapterNumber={chapterNumber}
      totalChapters={totalChapters}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}
