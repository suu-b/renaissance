import React from "react"
import Card from "../ui/Card"
import Typography from "../ui/Typography"

type Project = {
  id: number
  title: string
  subtitle: string
  lastUpdatedBy?: string
  lastUpdatedAt?: string
}

type ExploreProps = {
  className?: string
}

export default function Explore({ className }: ExploreProps): React.JSX.Element {
  // Sample trending projects data
  const trendingProjects: Project[] = [
    {
      id: 1,
      title: "The Martian Chronicles",
      subtitle: "Science fiction novel about Mars colonization",
      lastUpdatedBy: "Alice",
      lastUpdatedAt: "2 hrs ago"
    },
    {
      id: 2,
      title: "Design Patterns",
      subtitle: "Software design patterns and best practices",
      lastUpdatedBy: "Bob",
      lastUpdatedAt: "5 hrs ago"
    },
    {
      id: 3,
      title: "Machine Learning Basics",
      subtitle: "Introduction to ML algorithms and concepts",
      lastUpdatedBy: "Charlie",
      lastUpdatedAt: "1 day ago"
    },
    {
      id: 4,
      title: "React Tutorial",
      subtitle: "Complete guide to React development",
      lastUpdatedBy: "Diana",
      lastUpdatedAt: "2 days ago"
    },
    {
      id: 5,
      title: "Philosophy Notes",
      subtitle: "Study notes on ancient philosophy",
      lastUpdatedBy: "Eve",
      lastUpdatedAt: "3 days ago"
    }
  ]

  return (
    <div className={`border border-foreground/20 rounded-lg p-4 ${className ?? ""}`}>
      <Typography variant="h3" className="mb-4">
        Explore
      </Typography>

      <div className="flex flex-col gap-2">
        {trendingProjects.map((project) => (
          <Card
            key={project.id}
            title={project.title}
            subtitle={project.subtitle}
            size="xsm"
            lastUpdatedBy={project.lastUpdatedBy}
            lastUpdatedAt={project.lastUpdatedAt}
          />
        ))}
      </div>
    </div>
  )
}
