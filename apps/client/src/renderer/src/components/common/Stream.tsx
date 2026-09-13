import React from "react"
import Typography from "../ui/Typography"
import { FiGitCommit } from "react-icons/fi"
import type { GitCommit } from "@renaissance/shared"

type Contribution = {
  id: number
  name: string
  message: string
  time?: string
  avatar?: string
}

type StreamProps = {
  contributions?: Contribution[]
  history?: GitCommit[]
  className?: string
}

export default function Stream({
  contributions,
  history,
  className,
}: StreamProps): React.JSX.Element {
  return (
    <div
      className={`border border-foreground/20 rounded-lg p-4 ${
        className ?? ""
      }`}
    >
      <Typography variant="h4" className="mb-4">
        Stream
      </Typography>

      <div className="flex flex-col gap-1 overflow-y-auto max-h-96">
        {history && history.length > 0 ? (
          history.map((commit) => (
            <div
              key={commit.hash}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-foreground/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                <FiGitCommit className="text-foreground/50 text-sm" />
              </div>

              <div className="min-w-0">
                <Typography
                  variant="muted"
                  className="text-foreground/90 leading-snug"
                >
                  {commit.message}
                </Typography>

                <Typography
                  variant="small"
                  className="text-muted-foreground font-mono mt-1"
                >
                  {commit.hash.slice(0, 7)}
                </Typography>
              </div>
            </div>
          ))
        ) : contributions && contributions.length > 0 ? (
          contributions.map((contribution) => (
            <div
              key={contribution.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-foreground/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                <FiGitCommit className="text-foreground/50 text-sm" />
              </div>

              <div className="min-w-0">
                <Typography variant="p" className="leading-snug">
                  {contribution.message}
                </Typography>
              </div>
            </div>
          ))
        ) : (
          <Typography
            variant="p"
            className="text-muted-foreground text-center py-4"
          >
            No activity yet
          </Typography>
        )}
      </div>
    </div>
  )
}
