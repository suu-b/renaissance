import React from "react"
import { Link } from "react-router-dom"
import Typography from "../ui/Typography"

export type SidebarItem = {
  title: string
  path: string
  icon?: React.ReactNode
}

type SidebarProps = {
  items: SidebarItem[]
  isExpanded: boolean
  className?: string
}

export default function Sidebar({ items, isExpanded, className }: SidebarProps): React.JSX.Element {
  return (
    <div
      className={`h-full bg-background border-r border-foreground/20 flex flex-col transition-all duration-500 ease-in-out flex-shrink-0 overflow-hidden ${
        isExpanded ? "w-48" : "w-16"
      } ${className ?? ""}`}
    >
      
      {/* Navigation Items */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-foreground/5 transition-colors text-foreground/80 hover:text-foreground transition-all ease-in-out"
                title={!isExpanded ? item.title : undefined}
              >
                {item.icon && <span className="text-foreground/60 flex-shrink-0">{item.icon}</span>}
                {isExpanded && <Typography variant="p" className="whitespace-nowrap">{item.title}</Typography>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer */}
      {isExpanded && (
        <div className="p-4 border-t border-foreground/20 overflow-hidden">
          <Typography variant="small" className="text-muted-foreground whitespace-nowrap">
            © 2024 Renaissance
          </Typography>
        </div>
      )}
    </div>
  )
}
