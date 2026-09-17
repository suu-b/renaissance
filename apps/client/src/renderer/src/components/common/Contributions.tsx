import React from "react"
import Image from "../ui/Image"
import pfp from "../../assets/pfp.jpeg"

type Contributor = {
  id: number | string
  name: string
  avatar?: string
}

type ContributionsProps = {
  contributors?: Contributor[]
  className?: string
  maxVisible?: number
}

const DEFAULT_MOCK_CONTRIBUTORS: Contributor[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Contributor ${i + 1}`,
  avatar: pfp,
}))

export default function Contributions({
  contributors,
  className,
  maxVisible = 7,
}: ContributionsProps): React.JSX.Element {
  const list = contributors && contributors.length > 0 ? contributors : DEFAULT_MOCK_CONTRIBUTORS
  const visibleContributors = list.slice(0, maxVisible)
  const extraCount = list.length > maxVisible ? list.length - maxVisible : 0

  return (
    <div className={`flex items-center -space-x-2 py-1 px-1 ${className ?? ""}`}>
      {visibleContributors.map((contributor) => (
        <div
          key={contributor.id}
          className="relative inline-block rounded-full ring-2 ring-background transition-transform hover:z-10 hover:scale-105"
          title={contributor.name}
        >
          <Image
            src={contributor.avatar || pfp}
            alt={contributor.name}
            variant="pfp"
            size="sm"
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
      ))}

      {extraCount > 0 && (
        <div
          className="relative inline-flex w-8 h-8 rounded-full bg-foreground/10 text-foreground font-medium text-xs items-center justify-center border-2 border-background shadow-xs shrink-0 select-none z-0"
          title={`${extraCount} more contributors`}
        >
          +{extraCount}
        </div>
      )}
    </div>
  )
}
