import Typography from "../ui/Typography"
import TextEditor from "../ui/TextEditor"

type ChapterWriteViewProps = {
  title: string
  initialValue: Array<{ type: string; children: Array<{ text: string }> }>
  onChange: (value: string) => void
  chapterNumber: number
  totalChapters: number
}

export default function ChapterWriteView({
  title,
  initialValue,
  onChange,
  chapterNumber,
  totalChapters,
}: ChapterWriteViewProps) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Chapter Header */}
      <div className="mb-8">
        <Typography variant="small" className="text-muted-foreground uppercase tracking-wider mb-2">
          Chapter {chapterNumber} of {totalChapters}
        </Typography>
        <Typography variant="h1" className="mb-4">
          {title}
        </Typography>
      </div>

      {/* Chapter Content Editor */}
      <div className="leading-relaxed text-lg">
        <div className="min-h-[500px]">
          <TextEditor
            initialValue={initialValue}
            onChange={onChange}
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
}
