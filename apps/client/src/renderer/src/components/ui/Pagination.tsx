import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

type PaginationProps = {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPrevious: () => void
  onNext: () => void
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPrevious,
  onNext,
  className,
}: PaginationProps) {
  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1

  const endItem = Math.min(
    currentPage * itemsPerPage,
    totalItems
  )

  return (
    <div
      className={`flex items-center justify-end gap-2 ${className ?? ""}`}
    >
      <span className="mr-1 text-xs text-foreground/50">
        {startItem}-{endItem} of {totalItems}
      </span>

      <button
        type="button"
        onClick={onPrevious}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="
          flex h-7 w-7 items-center justify-center rounded-md
          text-foreground/50
          transition-all duration-200
          hover:bg-foreground/5 hover:text-foreground
          disabled:pointer-events-none disabled:opacity-30
        "
      >
        <FiChevronLeft className="text-sm" />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="
          flex h-7 w-7 items-center justify-center rounded-md
          text-foreground/50
          transition-all duration-200
          hover:bg-foreground/5 hover:text-foreground
          disabled:pointer-events-none disabled:opacity-30
        "
      >
        <FiChevronRight className="text-sm" />
      </button>
    </div>
  )
}