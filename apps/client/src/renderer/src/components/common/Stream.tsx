import React from "react"
import Typography from "../ui/Typography"
import { FiUser } from "react-icons/fi"

type Contribution = {
  id: number
  name: string
  message: string
  time?: string
  avatar?: string
}

type StreamProps = {
  contributions: Contribution[]
  className?: string
}

export default function Stream({ contributions, className }: StreamProps): React.JSX.Element {
  return (
    <div className={`border border-foreground/20 rounded-lg p-4 ${className ?? ""}`}>
      <Typography variant="h4" className="mb-4">
        Stream
      </Typography>

      <div className="flex flex-col gap-3">
        {contributions.map((contribution) => (
          <div
            key={contribution.id}
            className="flex items-start gap-3 p-1 rounded-lg hover:bg-foreground/5 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
              <FiUser className="text-foreground/50 text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <Typography variant="p" className="leading-snug">
                <span className="font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                  {contribution.name}:
                </span>{" "}
                <span className="text-muted-foreground group-hover:text-foreground/70 transition-colors">
                  {contribution.message}
                </span>
              </Typography>
              {contribution.time && (
                <Typography variant="small" className="text-muted-foreground mt-1 text-xs">
                  {contribution.time}
                </Typography>
              )}
            </div>
          </div>
        ))}
      </div>

      {contributions.length === 0 && (
        <Typography variant="p" className="text-muted-foreground text-center py-4">
          No contributions yet
        </Typography>
      )}
    </div>
  )
}
