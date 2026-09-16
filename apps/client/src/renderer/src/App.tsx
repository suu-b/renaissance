import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { FiLayout, FiFolder, FiGrid } from "react-icons/fi"
// import { FiCompass, FiBook } from "react-icons/fi" // Commented out since sidebar items are disabled

import Welcome from "./pages/Welcome"
import Dashboard from "./pages/Dashboard"
import NewProject from "./pages/NewProject"
import NewChapter from "./pages/NewChapter"
import CommitDiff from "./pages/CommitDiff"

import TopBar from "./components/common/TopBar"
import Sidebar, { SidebarItem } from "./components/common/Sidebar"
import Project from "./pages/Project"
import Projects from "./pages/Projects"
import Chapter from "./pages/Chapter"
import ProjectLayout from "./pages/ProjectLayout"
import { BreadcrumbProvider, useBreadcrumb, type BreadcrumbItem } from "./context/BreadcrumbContext"

function App(): React.JSX.Element {
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
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
      <AppWithProvider 
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
  const { setBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    const path = location.pathname

    if (path === '/dashboard') {
      setBreadcrumbs([{ label: 'Dashboard' }])
    } else if (path.startsWith('/project/')) {
      const segments = path.split('/').filter(Boolean)
      const projectId = segments[1]
      
      if (segments.length > 2 && segments[2] === 'new-chapter') {
        setBreadcrumbs([
          { label: 'Dashboard', path: '/dashboard' },
          { label: `Project ${projectId}`, path: `/project/${projectId}` },
          { label: 'New Chapter' }
        ])
      } else if (segments.length > 2 && segments[2] === 'chapter') {
        const chapterId = segments[3]
        const chapterNumber = parseInt(chapterId || "1")
        setBreadcrumbs([
          { label: 'Dashboard', path: '/dashboard' },
          { label: `Project ${projectId}`, path: `/project/${projectId}` },
          { label: `Chapter ${chapterNumber}` }
        ])
      } else {
        setBreadcrumbs([
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Project Details' }
        ])
      }
    } else {
      setBreadcrumbs([])
    }
  }, [location, setBreadcrumbs])

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
            <Route path="/projects" element={<Projects />} />
            <Route path="/my-projects" element={<Projects />} />
            <Route path="/project/:projectId" element={<ProjectLayout />}>
              <Route index element={<Project />} />
              <Route path="new-chapter" element={<NewChapter />} />
              <Route path="chapter/:chapterId" element={<Chapter />} />
            </Route>
            <Route path="/project/:projectId/diff/:hash" element={<CommitDiff />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function AppWithProvider({ sidebarItems, isSidebarExpanded, setIsSidebarExpanded }: { 
  sidebarItems: SidebarItem[], 
  isSidebarExpanded: boolean,
  setIsSidebarExpanded: (expanded: boolean) => void 
}): React.JSX.Element {
  return (
    <BreadcrumbProvider>
      <AppContent 
        sidebarItems={sidebarItems} 
        isSidebarExpanded={isSidebarExpanded} 
        setIsSidebarExpanded={setIsSidebarExpanded}
      />
    </BreadcrumbProvider>
  )
}

export default App
