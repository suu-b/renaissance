import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cva, type VariantProps } from "class-variance-authority"
import { FiPlus } from "react-icons/fi"
import Card from "../ui/Card"
import Button from "../ui/Button"
import Pagination from "../ui/Pagination"

type Project = {
  id: number
  title: string
  subtitle: string
  lastUpdatedBy?: string
  lastUpdatedAt?: string
}

const staticProjects: Project[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Project ${i + 1}`,
  subtitle: `Description for project ${i + 1}. This is a placeholder project description.`,
  lastUpdatedBy: "Shubham",
  lastUpdatedAt: `${Math.floor(Math.random() * 24) + 1}h ago`,
}))

const projectListVariants = cva("flex flex-col", {
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

type ProjectListProps = VariantProps<typeof projectListVariants> & {
  itemsPerPage?: number
  className?: string
}

export default function ProjectList({
  size,
  itemsPerPage = 10,
  className,
}: ProjectListProps) {
  const navigate = useNavigate()
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
      ? "gap-1"
      : size === "lg"
        ? "gap-6"
        : "gap-4"

  return (
    <div className={`${projectListVariants({ size })} ${className ?? ""}`}>
      <div className="mb-2 flex items-center justify-between">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={staticProjects.length}
          itemsPerPage={itemsPerPage}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/new-project')}>
            Create
            <FiPlus />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => console.log("See All clicked")}>
            See All
          </Button>
        </div>
      </div>

      <div className={`flex flex-col ${cardGap}`}>
        {currentProjects.map((project) => (
          <Card
            key={project.id}
            size={size}
            title={project.title}
            subtitle={project.subtitle}
            lastUpdatedBy={project.lastUpdatedBy}
            lastUpdatedAt={project.lastUpdatedAt}
            button={
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={() => navigate(`/project/${project.id}`)}>
                  Open
                </Button>
              </div>
            }
          />
        ))}
      </div>
    </div>
  )
}
