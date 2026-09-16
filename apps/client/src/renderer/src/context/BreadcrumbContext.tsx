import { createContext, useContext, useState, type ReactNode } from "react"

export type BreadcrumbItem = {
  label: string
  path?: string
  onClick?: () => void
}

type BreadcrumbContextValue = {
  breadcrumbs: BreadcrumbItem[]
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)

type BreadcrumbProviderProps = {
  children: ReactNode
}

export function BreadcrumbProvider({ children }: BreadcrumbProviderProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  const value: BreadcrumbContextValue = {
    breadcrumbs,
    setBreadcrumbs,
  }

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext)

  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider")
  }

  return context
}
