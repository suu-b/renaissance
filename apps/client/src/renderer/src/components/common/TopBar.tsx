import React from "react"
import pfp from "../../assets/pfp.jpeg"
import { FiMenu } from "react-icons/fi"

import Image from "../ui/Image"
import Typography from "../ui/Typography"
import Button from "../ui/Button"
import ControlPanel from "./ControlPanel"
import UserProfilePopover, { UserProfile } from "../ui/UserProfilePopover"
import Breadcrumbs from "../ui/Breadcrumbs"

type BreadcrumbItem = {
  label: string
  path?: string
  onClick?: () => void
}

type TopBarProps = {
  onMenuClick?: () => void
  breadcrumbs?: BreadcrumbItem[]
}

export default function TopBar({ onMenuClick, breadcrumbs }: TopBarProps): React.JSX.Element {
  const mockUser: UserProfile = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    location: "San Francisco, CA",
    projectCount: 12,
    avatar: pfp
  }

  return (
    <div className="flex justify-between items-center py-2 px-5 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-foreground/10 transition-colors text-foreground/70 hover:text-foreground"
          title="Toggle Sidebar"
        >
          <FiMenu className="text-lg" />
        </button>
        <Typography variant="h3" >
          Renaissance
        </Typography>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="h-6 w-px bg-foreground/20 mx-2" />
        )}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} />
        )}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" external href="http://localhost:3000/feedback">
          Feedback
        </Button>
        <UserProfilePopover user={mockUser}>
          <div className="relative group cursor-pointer">
            <Image src={pfp} alt="Profile" variant="pfp" size="sm" className="ring-2 ring-transparent group-hover:ring-indigo-200 transition-all duration-200" />
          </div>
        </UserProfilePopover>
        <ControlPanel />
      </div>
    </div>
  )
}
