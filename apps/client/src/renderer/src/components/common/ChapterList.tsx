import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cva, type VariantProps } from "class-variance-authority"
import { FiInbox } from "react-icons/fi"
import { type ChapterObject } from "@renaissance/shared"
import Card from "../ui/Card"
import Button from "../ui/Button"
import Pagination from "../ui/Pagination"
import Typography from "../ui/Typography"

const chapterListVariants = cva("flex flex-col", {
    variants: {
        size: { sm: "gap-1", md: "gap-4", lg: "gap-6" },
    },
    defaultVariants: { size: "md" },
})

type ChapterListProps = VariantProps<typeof chapterListVariants> & {
    itemsPerPage?: number
    className?: string
    chapters?: ChapterObject[]
    projectId?: string
}

export default function ChapterList({ size, itemsPerPage = 10, className, chapters, projectId }: ChapterListProps) {
    const displayChapters = chapters ?? []
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.ceil(displayChapters.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentChapters = displayChapters.slice(startIndex, startIndex + itemsPerPage)

    const handlePrevious = () => setCurrentPage(prev => Math.max(prev - 1, 1))
    const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))

    const cardGap = size === "sm" ? "gap-1" : size === "lg" ? "gap-6" : "gap-4"

    return (
        <div className={`${chapterListVariants({ size })} ${className ?? ""}`}>
            <div className="mb-2 flex items-center justify-between">
                <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={displayChapters.length} itemsPerPage={itemsPerPage} onPrevious={handlePrevious} onNext={handleNext} />
            </div>

            <div className={`flex flex-col ${cardGap}`}>
                {currentChapters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <FiInbox className="text-3xl text-muted-foreground mb-2" />
                        <Typography variant="muted" className="text-muted-foreground text-sm">
                            No chapters yet. Create your first chapter to get started!
                        </Typography>
                    </div>
                ) : (
                    currentChapters.map(chapter => (
                        <Card
                            key={chapter.id}
                            size={size}
                            title={chapter.name}
                            subtitle={``}
                            lastUpdatedAt={new Date(chapter.updatedAt).toLocaleDateString()}
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
