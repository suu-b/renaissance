import { useState } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { FiLayout, FiFolder, FiGrid } from "react-icons/fi"
// import { FiCompass, FiBook } from "react-icons/fi" // Commented out since sidebar items are disabled

import Welcome from "./pages/Welcome"
import Dashboard from "./pages/Dashboard"
import NewProject from "./pages/NewProject"

import TopBar from "./components/common/TopBar"
import Sidebar, { SidebarItem } from "./components/common/Sidebar"
import Project from "./pages/Project"
import Projects from "./pages/Projects"
import Chapter from "./pages/Chapter"

type BreadcrumbItem = {
  label: string
  path?: string
  onClick?: () => void
}

function App(): React.JSX.Element {
  const port: number | null = window.api.getServerPort()
  const serverUrl = port ? `http://127.0.0.1:${port}`: null
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  console.log('Server port:', port)
  console.log('Server URL:', serverUrl)

  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <FiLayout />
    },
    {
      title: "My Projects",
      path: "/my-projects",
      icon: <FiFolder />
    },
    {
      title: "All Projects",
      path: "/projects",
      icon: <FiGrid />
    },
    // {
    //   title: "Explore Hub",
    //   path: "/explore",
    //   icon: <FiCompass />
    // },
    // {
    //   title: "Documentation",
    //   path: "/documentation",
    //   icon: <FiBook />
    // }
  ]

  return (
    <BrowserRouter>
      <AppContent 
        sidebarItems={sidebarItems} 
        isSidebarExpanded={isSidebarExpanded} 
        setIsSidebarExpanded={setIsSidebarExpanded}
      />
    </BrowserRouter>
  )
}

function AppContent({ sidebarItems, isSidebarExpanded, setIsSidebarExpanded }: { 
  sidebarItems: SidebarItem[], 
  isSidebarExpanded: boolean,
  setIsSidebarExpanded: (expanded: boolean) => void 
}): React.JSX.Element {
  const location = useLocation()

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname

    if (path === '/dashboard') {
      return [{ label: 'Dashboard' }]
    }

    if (path.startsWith('/project/')) {
      const segments = path.split('/').filter(Boolean)
      const projectId = segments[1]
      
      if (segments.length > 2 && segments[2] === 'chapter') {
        const chapterId = segments[3]
        const chapterNumber = parseInt(chapterId || "1")
        return [
          { label: 'Dashboard', path: '/dashboard' },
          { label: `Project ${projectId}`, path: `/project/${projectId}` },
          { label: `Chapter ${chapterNumber}` }
        ]
      }
      return [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Project Details' }
      ]
    }

    return []
  }

  const isWelcomePage = location.pathname === "/"

    if (isWelcomePage) {
      return (
        <Routes>
          <Route path="/" element={<Welcome />} />
        </Routes>
      )
    }

  return (
    <div className="flex flex-col h-screen">
      <TopBar 
        onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)} 
        breadcrumbs={getBreadcrumbs()}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          items={sidebarItems} 
          isExpanded={isSidebarExpanded} 
        />
        <main className="flex-1 overflow-auto transition-all duration-500 ease-in-out">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-project" element={<NewProject />} />
            <Route path="/project/:id" element={<Project />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/my-projects" element={<Projects mine={true} />} />
            <Route path="/project/:projectId/chapter/:chapterId" element={<Chapter />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
