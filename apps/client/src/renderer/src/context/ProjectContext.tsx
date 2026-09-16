import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import {
  ProjectSchema,
  type ChapterObject,
  type ProjectObject,
  GitCommit
} from '@renaissance/shared'
import { config } from '@renderer/config'

type ProjectContextValue = {
  project: ProjectObject | null
  chapters: ChapterObject[]
  history: GitCommit[]

  projectLoading: boolean
  chaptersLoading: boolean
  historyLoading: boolean

  projectError: string | null
  chaptersError: string | null
  historyError: string | null

  fetchProject: () => Promise<void>
  fetchChapters: () => Promise<void>
  fetchHistory: () => Promise<void>

  refreshProject: () => Promise<void>
  refreshChapters: () => Promise<void>
  refreshHistory: () => Promise<void>

  getChapterIndex: (chapterId: string) => number
  getPreviousChapter: (chapterId: string) => ChapterObject | null
  getNextChapter: (chapterId: string) => ChapterObject | null

  deleteChapter: (chapterId: string) => Promise<void>
  bulkDeleteChapters: (chapterIds: string[]) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

type ProjectProviderProps = {
  projectId: string | null
  children: ReactNode
}

export function ProjectProvider({ projectId, children }: ProjectProviderProps) {
  const [project, setProject] = useState<ProjectObject | null>(null)
  const [chapters, setChapters] = useState<ChapterObject[]>([])
  const [history, setHistory] = useState<GitCommit[]>([])

  const [projectLoading, setProjectLoading] = useState(false)
  const [chaptersLoading, setChaptersLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)

  const [projectError, setProjectError] = useState<string | null>(null)
  const [chaptersError, setChaptersError] = useState<string | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    if (!projectId || !config.serverUrl) return

    setProjectLoading(true)
    setProjectError(null)

    try {
      const response = await fetch(`${config.serverUrl}/api/v1/user/data/project/search/mine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filters: [
            {
              field: 'id',
              operator: 'eq',
              value: projectId
            }
          ],
          limit: 1
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error?.message || result.error || `Failed to fetch project: ${response.status}`
        )
      }

      const projects = result.data?.projects || result.projects || []

      if (!projects.length) {
        throw new Error('Project not found')
      }

      setProject(ProjectSchema.parse(projects[0]))
    } catch (err) {
      console.error('Failed to fetch project:', err)

      setProjectError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setProjectLoading(false)
    }
  }, [projectId])

  const fetchChapters = useCallback(async () => {
    if (!projectId || !config.serverUrl) return

    setChaptersLoading(true)
    setChaptersError(null)

    try {
      const response = await fetch(`${config.serverUrl}/api/v1/user/data/chapter/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project: projectId,
          limit: 100,
          offset: 0
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error?.message || result.error || `Failed to fetch chapters: ${response.status}`
        )
      }

      setChapters(result.data?.chapters || result.chapters || [])
    } catch (err) {
      console.error('Failed to fetch chapters:', err)

      setChaptersError(err instanceof Error ? err.message : 'Failed to load chapters')
    } finally {
      setChaptersLoading(false)
    }
  }, [projectId])

  const fetchHistory = useCallback(async () => {
    if (!projectId || !config.serverUrl) return

    setHistoryLoading(true)
    setHistoryError(null)

    try {
      const response = await fetch(`${config.serverUrl}/api/v1/user/data/project/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          limit: 30
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error?.message || result.error || `Failed to fetch history: ${response.status}`
        )
      }

      setHistory(result.data?.history || result.history || [])
    } catch (err) {
      console.error('Failed to fetch history:', err)

      setHistoryError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setHistoryLoading(false)
    }
  }, [projectId])

  const refreshProject = useCallback(async () => {
    await fetchProject()
  }, [fetchProject])

  const refreshChapters = useCallback(async () => {
    await fetchChapters()
  }, [fetchChapters])

  const refreshHistory = useCallback(async () => {
    await fetchHistory()
  }, [fetchHistory])

  const getChapterIndex = useCallback(
    (chapterId: string) => chapters.findIndex((chapter) => chapter.id === chapterId),
    [chapters]
  )

  const getPreviousChapter = useCallback(
    (chapterId: string) => {
      const index = chapters.findIndex((chapter) => chapter.id === chapterId)

      return index > 0 ? chapters[index - 1] : null
    },
    [chapters]
  )

  const getNextChapter = useCallback(
    (chapterId: string) => {
      const index = chapters.findIndex((chapter) => chapter.id === chapterId)

      return index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null
    },
    [chapters]
  )

  const deleteChapter = useCallback(
    async (chapterId: string) => {
      if (!config.serverUrl) return

      try {
        const response = await fetch(`${config.serverUrl}/api/v1/user/data/chapter/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: chapterId
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.error?.message || result.error || `Failed to delete chapter: ${response.status}`
          )
        }

        // Refresh only chapters.
        await refreshChapters()
      } catch (err) {
        console.error('Failed to delete chapter:', err)
        throw err
      }
    },
    [refreshChapters]
  )

  const bulkDeleteChapters = useCallback(
    async (chapterIds: string[]) => {
      if (!config.serverUrl) return

      try {
        const response = await fetch(`${config.serverUrl}/api/v1/user/data/chapter/bulk-delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ids: chapterIds
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.error?.message ||
              result.error ||
              `Failed to bulk delete chapters: ${response.status}`
          )
        }

        // Refresh only chapters.
        await refreshChapters()
      } catch (err) {
        console.error('Failed to bulk delete chapters:', err)
        throw err
      }
    },
    [refreshChapters]
  )

  const deleteProject = useCallback(async (projectIdToDelete: string) => {
    if (!config.serverUrl) return

    try {
      const response = await fetch(`${config.serverUrl}/api/v1/user/data/project/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: projectIdToDelete
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error?.message || result.error || `Failed to delete project: ${response.status}`
        )
      }

      // The caller can navigate away or explicitly fetch again.
    } catch (err) {
      console.error('Failed to delete project:', err)
      throw err
    }
  }, [])

  const value = useMemo<ProjectContextValue>(
    () => ({
      project,
      chapters,
      history,

      projectLoading,
      chaptersLoading,
      historyLoading,

      projectError,
      chaptersError,
      historyError,

      fetchProject,
      fetchChapters,
      fetchHistory,

      refreshProject,
      refreshChapters,
      refreshHistory,

      getChapterIndex,
      getPreviousChapter,
      getNextChapter,

      deleteChapter,
      bulkDeleteChapters,
      deleteProject
    }),
    [
      project,
      chapters,
      history,

      projectLoading,
      chaptersLoading,
      historyLoading,

      projectError,
      chaptersError,
      historyError,

      fetchProject,
      fetchChapters,
      fetchHistory,

      refreshProject,
      refreshChapters,
      refreshHistory,

      getChapterIndex,
      getPreviousChapter,
      getNextChapter,

      deleteChapter,
      bulkDeleteChapters,
      deleteProject
    ]
  )

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
