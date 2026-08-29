import React from "react"
import johnKeats from "../../assets/john_keats.jpg"

import Image from "../ui/Image"
import Typography from "../ui/Typography"

type ArtistOfTheDayProps = {
  className?: string
}

export default function ArtistOfTheDay({ className }: ArtistOfTheDayProps): React.JSX.Element {
  return (
  <div
    className={`w-full rounded-lg border border-foreground/10 bg-gradient-to-br from-gray-50 to-white ${className ?? ""}`}
  >
    <div className="flex items-center gap-4 p-4">
      <Image
        src={johnKeats}
        alt="John Keats"
        variant="default"
        className="shrink-0 w-24 h-24 rounded-lg object-cover"
      />

      <div className="flex-1 min-w-0">
        <Typography variant="h2" className="mb-2">
          Artist of The Day!
        </Typography>

        <Typography
          variant="p"
          className="leading-relaxed text-muted-foreground"
        >
          <span className="font-semibold text-foreground">
            John Keats
          </span>
        </Typography>
      </div>
    </div>
  </div>
)
}
