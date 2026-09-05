import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cva, type VariantProps } from "class-variance-authority"
import { FiPlus, FiInbox } from "react-icons/fi"
import Card from "../ui/Card"
import Button from "../ui/Button"
import Pagination from "../ui/Pagination"
import Typography from "../ui/Typography"

type Chapter = {
  id: number
  title: string
  description: string
  lastUpdatedBy?: string
  lastUpdatedAt?: string
}

export const staticChapters: Chapter[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Chapter ${i + 1}`,
  description: `Description for chapter ${i + 1}. This is a placeholder chapter description that provides an overview of the content in this chapter.`,
  lastUpdatedBy: "Shubham",
  lastUpdatedAt: `${Math.floor(Math.random() * 24) + 1}h ago`,
}))

const chapterListVariants = cva("flex flex-col", {
  variants: {
    size: {
      sm: "gap-1",
      md: "gap-4",
      lg: "gap-6",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

type ChapterListProps = VariantProps<typeof chapterListVariants> & {
  itemsPerPage?: number
  className?: string
  chapters?: Chapter[]
  projectId?: string
}

export default function ChapterList({
  size,
  itemsPerPage = 10,
  className,
  chapters = staticChapters,
  projectId,
}: ChapterListProps) {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(chapters.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentChapters = chapters.slice(startIndex, endIndex)

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const cardGap =
    size === "sm"
      ? "gap-1"
      : size === "lg"
        ? "gap-6"
        : "gap-4"

  return (
    <div className={`${chapterListVariants({ size })} ${className ?? ""}`}>
      <div className="mb-2 flex items-center justify-between">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={chapters.length}
          itemsPerPage={itemsPerPage}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>

      <div className={`flex flex-col ${cardGap}`}>
        {currentChapters.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Typography variant="muted" className="text-muted-foreground text-sm">
              No Chapter Yet! Damn - create one!
            </Typography>
          </div>
        ) : (
          currentChapters.map((chapter) => (
            <Card
              key={chapter.id}
              size={size}
              title={chapter.title}
              subtitle={chapter.description}
              lastUpdatedBy={chapter.lastUpdatedBy}
              lastUpdatedAt={chapter.lastUpdatedAt}
              button={
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={() => projectId && navigate(`/project/${projectId}/chapter/${chapter.id}`)}>
                    Open
                  </Button>
                </div>
              }
            />
          ))
        )}
      </div>
    </div>
  )
}
