import React from "react"
import pfp from "../../assets/pfp.jpeg"

import Image from "../ui/Image"
import Typography from "../ui/Typography"
import Button from "../ui/Button"
import ControlPanel from "./ControlPanel"

export default function TopBar(): React.JSX.Element {
  return (
    <div className="flex justify-between items-center py-2 px-5 border-b border-gray-200 mx-5">
      <Typography variant="h3" >
        Renaissance
      </Typography>
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" external href="http://localhost:3000/feedback">
          Feedback
        </Button>
        <div className="relative group">
          <Image src={pfp} alt="Profile" variant="pfp" size="sm" className="ring-2 ring-transparent group-hover:ring-indigo-200 transition-all duration-200" />
        </div>
        <ControlPanel />
      </div>
    </div>
  )
}
