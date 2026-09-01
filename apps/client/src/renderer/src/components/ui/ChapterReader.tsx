import React from "react"
import Typography from "./Typography"
import Button from "./Button"
import { FiArrowLeft, FiArrowRight, FiEdit } from "react-icons/fi"

type ChapterReaderProps = {
  title: string
  content: string
  chapterNumber: number
  totalChapters: number
  onPrevious?: () => void
  onNext?: () => void
  onEdit?: () => void
  className?: string
}

export default function ChapterReader({
  title,
  content,
  chapterNumber,
  totalChapters,
  onPrevious,
  onNext,
  onEdit,
  className,
}: ChapterReaderProps): React.JSX.Element {
  return (
    <div className={`max-w-3xl mx-auto ${className ?? ""}`}>
      {/* Chapter Header */}
      <div className="mb-8">
        <Typography variant="small" className="text-muted-foreground uppercase tracking-wider mb-2">
          Chapter {chapterNumber} of {totalChapters}
        </Typography>
        <Typography variant="h1" className="mb-4">
          {title}
        </Typography>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={chapterNumber === 1}
            className="flex items-center gap-2"
          >
            <FiArrowLeft className="text-sm" />
            Previous
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={chapterNumber === totalChapters}
            className="flex items-center gap-2"
          >
            Next
            <FiArrowRight className="text-sm" />
          </Button>
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <FiEdit className="text-sm" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Chapter Content */}
      <div className="leading-relaxed text-lg">
        <Typography variant="p" className="text-foreground whitespace-pre-wrap">
          {content}
        </Typography>
      </div>

      {/* Chapter Footer Navigation */}
      <div className="mt-12 pt-8 border-t border-foreground/10 flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={chapterNumber === 1}
          className="flex items-center gap-2"
        >
          <FiArrowLeft className="text-sm" />
          Previous Chapter
        </Button>
        <Typography variant="small" className="text-muted-foreground">
          {chapterNumber} / {totalChapters}
        </Typography>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={chapterNumber === totalChapters}
          className="flex items-center gap-2"
        >
          Next Chapter
          <FiArrowRight className="text-sm" />
        </Button>
      </div>
    </div>
  )
}
