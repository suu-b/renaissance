import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { FiPlus } from "react-icons/fi";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Pagination from "../ui/Pagination";
import Typography from "../ui/Typography";
import type { ProjectObject } from "@renaissance/shared";

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
});

type ProjectListProps = VariantProps<typeof projectListVariants> & {
  itemsPerPage?: number;
  className?: string;
  projects?: ProjectObject[];
  searchTerm?: string;
};

export default function ProjectList({
  size,
  itemsPerPage = 10,
  className,
  projects = [],
  searchTerm = "",
}: ProjectListProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects
    const lowerSearchTerm = searchTerm.toLowerCase()
    return projects.filter(project =>
      project.name.toLowerCase().includes(lowerSearchTerm) ||
      (project.description && project.description.toLowerCase().includes(lowerSearchTerm))
    )
  }, [projects, searchTerm])

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) =>
      Math.min(prev + 1, totalPages)
    );
  };

  const cardGap =
    size === "sm"
      ? "gap-1"
      : size === "lg"
        ? "gap-6"
        : "gap-4";

  return (
    <div className={`${projectListVariants({ size })} ${className ?? ""}`}>
      <div className="mb-2 flex items-center justify-between">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProjects.length}
          itemsPerPage={itemsPerPage}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />

        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/new-project")}
          >
            Create
            <FiPlus />
          </Button>

          {location.pathname !== "/my-projects" &&
            location.pathname !== "/projects" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  navigate("/my-projects")
                }
              >
                See All
              </Button>
            )}
        </div>
      </div>

      <div className={`flex flex-col ${cardGap}`}>
        {filteredProjects.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Typography variant="muted" className="text-muted-foreground text-sm">
              {searchTerm ? "No projects match your search." : "No Project Yet! Damn - create one!"}
            </Typography>
          </div>
        ) : (
          currentProjects.map((project) => (
            <Card
              key={project.id}
              size={size}
              title={project.name}
              subtitle={
                project.description ||
                "No description"
              }
              lastUpdatedBy={
                project.owner.displayName
              }
              lastUpdatedAt={project.updatedAt.toLocaleDateString()}
              button={
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={() => navigate(`/project/${project.id}`)}>
                    Open
                  </Button>
                </div>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}