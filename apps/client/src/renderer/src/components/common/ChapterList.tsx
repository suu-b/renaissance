import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { cva, type VariantProps } from "class-variance-authority"
import { FiInbox, FiTrash2 } from "react-icons/fi"
import { type ChapterObject } from "@renaissance/shared"
import Card from "../ui/Card"
import Button from "../ui/Button"
import Pagination from "../ui/Pagination"
import Typography from "../ui/Typography"
import Checkbox from "../ui/Checkbox"

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
    searchTerm?: string
    onBulkDelete?: (chapterIds: string[]) => void
}

export default function ChapterList({
    size,
    itemsPerPage = 10,
    className,
    chapters,
    projectId,
    searchTerm = "",
    onBulkDelete,
}: ChapterListProps) {
    const displayChapters = chapters ?? []
    const navigate = useNavigate()

    const [currentPage, setCurrentPage] = useState(1)
    const [selectedChapters, setSelectedChapters] = useState<Set<string>>(
        new Set()
    )
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        setCurrentPage(1)
        setSelectedChapters(new Set())
    }, [searchTerm])

    const filteredChapters = useMemo(() => {
        if (!searchTerm) return displayChapters

        const lowerSearchTerm = searchTerm.toLowerCase()

        return displayChapters.filter(chapter =>
            chapter.name.toLowerCase().includes(lowerSearchTerm)
        )
    }, [displayChapters, searchTerm])

    const totalPages = Math.ceil(filteredChapters.length / itemsPerPage)

    const startIndex = (currentPage - 1) * itemsPerPage

    const currentChapters = filteredChapters.slice(
        startIndex,
        startIndex + itemsPerPage
    )

    const handlePrevious = () =>
        setCurrentPage(prev => Math.max(prev - 1, 1))

    const handleNext = () =>
        setCurrentPage(prev => Math.min(prev + 1, totalPages))

    const handleSelectChapter = (chapterId: string) => {
        setSelectedChapters(prev => {
            const newSet = new Set(prev)

            if (newSet.has(chapterId)) {
                newSet.delete(chapterId)
            } else {
                newSet.add(chapterId)
            }

            return newSet
        })
    }

    const handleSelectAll = () => {
        if (selectedChapters.size === currentChapters.length) {
            setSelectedChapters(new Set())
        } else {
            setSelectedChapters(
                new Set(currentChapters.map(chapter => chapter.id))
            )
        }
    }

    const handleBulkDelete = async () => {
        if (selectedChapters.size === 0 || !onBulkDelete || deleting) return

        setDeleting(true)

        try {
            await onBulkDelete(Array.from(selectedChapters))
            setSelectedChapters(new Set())
        } finally {
            setDeleting(false)
        }
    }

    const cardGap =
        size === "sm" ? "gap-1" : size === "lg" ? "gap-6" : "gap-4"

    return (
        <div
            className={`${chapterListVariants({ size })} ${
                className ?? ""
            }`}
        >
            <div className="mb-2 flex items-center justify-between">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredChapters.length}
                    itemsPerPage={itemsPerPage}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                />

                {onBulkDelete && selectedChapters.size > 0 && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={deleting}
                    >
                        <FiTrash2 />
                        {deleting
                            ? "Deleting..."
                            : `Delete ${selectedChapters.size} chapters`}
                    </Button>
                )}
            </div>

            {currentChapters.length > 0 && onBulkDelete && (
                <div className="mb-4 flex items-center gap-2">
                    <Checkbox
                        checked={
                            selectedChapters.size === currentChapters.length
                        }
                        onChange={handleSelectAll}
                    />

                    <Typography
                        variant="small"
                        className="text-muted-foreground"
                    >
                        Select all ({currentChapters.length})
                    </Typography>
                </div>
            )}

            <div className={`flex flex-col ${cardGap}`}>
                {filteredChapters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <FiInbox className="mb-2 text-3xl text-muted-foreground" />

                        <Typography
                            variant="muted"
                            className="text-sm text-muted-foreground"
                        >
                            {searchTerm
                                ? "No chapters match your search."
                                : "No chapters yet. Create your first chapter to get started!"}
                        </Typography>
                    </div>
                ) : (
                    currentChapters.map(chapter => (
                        <div
                            key={chapter.id}
                            className="flex items-start gap-3"
                        >
                            {onBulkDelete && (
                                <Checkbox
                                    checked={selectedChapters.has(chapter.id)}
                                    onChange={() =>
                                        handleSelectChapter(chapter.id)
                                    }
                                    className="mt-1"
                                />
                            )}

                            <div className="flex-1">
                                <Card
                                    size={size}
                                    title={chapter.name}
                                    subtitle=""
                                    lastUpdatedAt={new Date(
                                        chapter.updatedAt
                                    ).toLocaleDateString()}
                                    button={
                                        <div className="flex gap-2">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() =>
                                                    projectId &&
                                                    navigate(
                                                        `/project/${projectId}/chapter/${chapter.id}`
                                                    )
                                                }
                                            >
                                                Open
                                            </Button>
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}