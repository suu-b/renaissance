import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Checkbox from "../ui/Checkbox";

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
  onDelete?: (projectId: string) => Promise<void>;
  onBulkDelete?: (projectIds: string[]) => void;
};

export default function ProjectList({
  size,
  itemsPerPage = 10,
  className,
  projects = [],
  searchTerm = "",
  onBulkDelete,
}: ProjectListProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedProjects(new Set());
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

  const handleSelectProject = (projectId: string) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProjects.size === currentProjects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(currentProjects.map(project => project.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedProjects.size === 0 || !onBulkDelete) return;

    onBulkDelete(Array.from(selectedProjects));
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
          {onBulkDelete && selectedProjects.size > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBulkDelete}
            >
              <FiTrash2 />
              Delete projects
            </Button>
          )}

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

      {currentProjects.length > 0 && onBulkDelete && (
        <div className="mb-4 flex items-center gap-2">
          <Checkbox
            checked={selectedProjects.size === currentProjects.length}
            onChange={handleSelectAll}
          />
          <Typography variant="small" className="text-muted-foreground">
            Select all ({currentProjects.length})
          </Typography>
        </div>
      )}

      <div className={`flex flex-col ${cardGap}`}>
        {filteredProjects.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Typography variant="muted" className="text-muted-foreground text-sm">
              {searchTerm ? "No projects match your search." : "No Project Yet! Damn - create one!"}
            </Typography>
          </div>
        ) : (
          currentProjects.map((project) => (
            <div key={project.id} className="flex items-start gap-3">
              {onBulkDelete && (
                <Checkbox
                  checked={selectedProjects.has(project.id)}
                  onChange={() => handleSelectProject(project.id)}
                  className="mt-1"
                />
              )}
              <div className="flex-1">
                <Card
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}