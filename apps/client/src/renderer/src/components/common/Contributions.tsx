import React from "react"
import { FiInbox } from "react-icons/fi"
import Image from "../ui/Image"
import Typography from "../ui/Typography"
import pfp from "../../assets/pfp.jpeg"

type Contributor = {
  id: number
  name: string
  avatar?: string
}

type ContributionsProps = {
  contributors: Contributor[]
  className?: string
}

export default function Contributions({ contributors, className }: ContributionsProps): React.JSX.Element {
  return (
    <div
      className={`w-full rounded-lg border border-foreground/10 bg-gradient-to-br from-gray-50 to-white ${className ?? ""}`}
    >
      <div className="p-3">
        <Typography variant="h3" className="mb-3">
          Contributions
        </Typography>

        <div className="flex flex-wrap gap-1">
          {contributors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center w-full">
              <FiInbox className="text-3xl text-muted-foreground mb-2" />
              <Typography variant="small" className="text-muted-foreground">
                No contributors yet
              </Typography>
            </div>
          ) : (
            contributors.map((contributor) => (
              <div
                key={contributor.id}
                className="flex items-center justify-center"
              >
                <Image
                  src={contributor.avatar || pfp}
                  alt={contributor.name}
                  variant="pfp"
                  size="sm"
                  className="w-8 h-8"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
