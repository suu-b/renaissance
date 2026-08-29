import { useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import Card from "../ui/Card"
import Button from "../ui/Button"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

type Project = {
  id: number
  title: string
  subtitle: string
}

const staticProjects: Project[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Project ${i + 1}`,
  subtitle: `Description for project ${i + 1}. This is a placeholder project description.`,
}))

const projectListVariants = cva("flex flex-col", {
  variants: {
    size: {
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

type ProjectListProps = VariantProps<typeof projectListVariants> & {
  itemsPerPage?: number
  className?: string
}

export default function ProjectList({
  size,
  itemsPerPage = 10,
  className,
}: ProjectListProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(staticProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProjects = staticProjects.slice(startIndex, endIndex)

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const cardGap =
    size === "sm"
      ? "gap-2"
      : size === "lg"
        ? "gap-6"
        : "gap-4"

  const buttonSize =
    size === "sm"
      ? "sm"
      : size === "lg"
        ? "lg"
        : "md"

  return (
    <div className={`${projectListVariants({ size })} ${className ?? ""}`}>
      <div className={`flex flex-col ${cardGap}`}>
        {currentProjects.map((project) => (
          <Card
            key={project.id}
            size={size}
            title={project.title}
            subtitle={project.subtitle}
            button={
              <div className="flex gap-4">
                <Button variant="primary" size="sm">
                  Open
                </Button>
                <Button variant="secondary" size="sm">
                  Delete
                </Button>
              </div>
            }
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="secondary"
          size={buttonSize}
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          <FiChevronLeft />
        </Button>

        <span className="text-sm text-muted-foreground">
          {startIndex + 1}-{Math.min(endIndex, staticProjects.length)} of{" "}
          {staticProjects.length}
        </span>

        <Button
          variant="secondary"
          size={buttonSize}
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          <FiChevronRight />
        </Button>
      </div>
    </div>
  )
}
