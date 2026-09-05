import React, { useState, useRef } from "react"
import Typography from "./Typography"
import Button from "./Button"
import { FiMapPin, FiFolder, FiMail } from "react-icons/fi"
import { UserProfile } from "../../types/auth"

type UserProfilePopoverProps = {
  user: UserProfile
  children: React.ReactNode
  className?: string
}

export default function UserProfilePopover({ user, children, className }: UserProfilePopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<{ left: string; right?: string }>({ left: '0' })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const popoverWidth = 288 // w-72 = 18rem = 288px
      const windowWidth = window.innerWidth
      
      // Check if popover would go off the right edge
      if (containerRect.right + popoverWidth > windowWidth) {
        // Align to right edge instead
        setPosition({ left: 'auto', right: '0' })
      } else {
        setPosition({ left: '0', right: 'auto' })
      }
      
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    setIsOpen(false)
  }

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isOpen && (
        <div
          className={`absolute top-full mt-1 z-50 w-72 bg-background border border-foreground/15 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200 ease-in-out ${className ?? ""}`}
          style={{ left: position.left, right: position.right }}
        >
          <div className="p-5 space-y-4">
            {/* Name */}
            <div>
              <Typography variant="h4" className="text-foreground/90">
                {user.name}
              </Typography>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 text-foreground/60">
              <FiMail className="text-sm" />
              <Typography variant="small" className="truncate">
                {user.email}
              </Typography>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-foreground/60">
              <FiMapPin className="text-sm" />
              <Typography variant="small">
                {user.location}
              </Typography>
            </div>

            {/* Project Count */}
            <div className="flex items-center gap-2 text-foreground/60">
              <FiFolder className="text-sm" />
              <Typography variant="small">
                {user.projectCount} {user.projectCount === 1 ? 'project' : 'projects'}
              </Typography>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="px-5 pb-5 pt-2">
            <Button variant="secondary" size="sm" className="w-full">
              See Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
