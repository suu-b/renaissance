import React from "react"
import { FiMenu, FiUser } from "react-icons/fi"

import Image from "../ui/Image"
import Typography from "../ui/Typography"
import Button from "../ui/Button"
import ControlPanel from "./ControlPanel"
import UserProfilePopover from "../ui/UserProfilePopover"
import Breadcrumbs from "../ui/Breadcrumbs"

import { useAuth } from "../../auth/AuthContext"

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
  const { user } = useAuth()

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
        {user && (
          <UserProfilePopover user={user}>
            <div className="relative group cursor-pointer">
              {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                variant="pfp"
                size="sm"
                className="ring-2 ring-transparent group-hover:ring-indigo-200 transition-all duration-200"
              />
            ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-foreground/10 text-foreground/60 ring-2 ring-transparent group-hover:ring-indigo-200 transition-all duration-200">
              <FiUser className="text-xl" />
            </div>
            )}
            </div>
          </UserProfilePopover>
        )}
        <ControlPanel />
      </div>
    </div>
  )
}
