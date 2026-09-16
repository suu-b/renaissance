import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import {
  ProjectSchema,
  type ChapterObject,
  type ProjectObject,
  GitCommit
} from '@renaissance/shared'
import { config } from '@renderer/config'

type Branch = {
  id: string
  branchName: string
}

type ProjectContextValue = {
  project: ProjectObject | null
  chapters: ChapterObject[]
  history: GitCommit[]
  branches: Branch[]
  currentBranch: string | null

  projectLoading: boolean
  chaptersLoading: boolean
  historyLoading: boolean
  branchesLoading: boolean

  projectError: string | null
  chaptersError: string | null
  historyError: string | null
  branchesError: string | null

  fetchProject: () => Promise<void>
  fetchChapters: (branchId?: string) => Promise<void>
  fetchHistory: (branchId?: string) => Promise<void>
  fetchBranches: () => Promise<void>

  refreshProject: () => Promise<void>
  refreshChapters: (branchId?: string) => Promise<void>
  refreshHistory: (branchId?: string) => Promise<void>
  refreshBranches: () => Promise<void>

  getChapterIndex: (chapterId: string) => number
  getPreviousChapter: (chapterId: string) => ChapterObject | null
  getNextChapter: (chapterId: string) => ChapterObject | null

  deleteChapter: (chapterId: string) => Promise<void>
  bulkDeleteChapters: (chapterIds: string[]) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  deleteBranch: (branchId: string) => Promise<void>
  switchBranch: (branchId: string) => Promise<void>
  createBranch: (branchName: string) => Promise<void>
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
  const [branches, setBranches] = useState<Branch[]>([])
  const [currentBranch, setCurrentBranch] = useState<string | null>(null)

  const [projectLoading, setProjectLoading] = useState(false)
  const [chaptersLoading, setChaptersLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [branchesLoading, setBranchesLoading] = useState(false)

  const [projectError, setProjectError] = useState<string | null>(null)
  const [chaptersError, setChaptersError] = useState<string | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [branchesError, setBranchesError] = useState<string | null>(null)

  /*
   * Fetch chapters for an explicitly requested branch.
   *
   * Important:
   * This function does NOT depend on currentBranch.
   * That keeps its identity stable when the user switches branches.
   */
  const fetchChapters = useCallback(
    async (branchId?: string) => {
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
            offset: 0,
            branch: branchId
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
    },
    [projectId]
  )

  /*
   * Fetch history for an explicitly requested branch.
   *
   * Important:
   * This function does NOT depend on currentBranch.
   */
  const fetchHistory = useCallback(
    async (branchId?: string) => {
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
            limit: 30,
            branchId
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
    },
    [projectId]
  )

  /*
   * Fetch the project itself.
   *
   * This is intentionally independent of currentBranch.
   * Loading the project should establish the initial default branch,
   * but changing branches must not cause this function to be recreated.
   */
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

      const projectData = ProjectSchema.parse(projects[0])

      setProject(projectData)

      const defaultBranch =
        (
          projectData as ProjectObject & {
            defaultBranch?: string
          }
        ).defaultBranch ?? null

      setCurrentBranch(defaultBranch)

      if (defaultBranch) {
        await Promise.all([fetchChapters(defaultBranch), fetchHistory(defaultBranch)])
      } else {
        setChapters([])
        setHistory([])
      }
    } catch (err) {
      console.error('Failed to fetch project:', err)

      setProjectError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setProjectLoading(false)
    }
  }, [projectId, fetchChapters, fetchHistory])

  const fetchBranches = useCallback(async () => {
    if (!projectId || !config.serverUrl) return

    setBranchesLoading(true)
    setBranchesError(null)

    try {
      const response = await fetch(`${config.serverUrl}/api/v1/user/data/project/branches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error?.message || result.error || `Failed to fetch branches: ${response.status}`
        )
      }

      setBranches(result.data?.branches || result.branches || [])
    } catch (err) {
      console.error('Failed to fetch branches:', err)

      setBranchesError(err instanceof Error ? err.message : 'Failed to load branches')
    } finally {
      setBranchesLoading(false)
    }
  }, [projectId])

  const refreshProject = useCallback(async () => {
    await fetchProject()
  }, [fetchProject])

  const refreshChapters = useCallback(
    async (branchId?: string) => {
      await fetchChapters(branchId ?? currentBranch ?? undefined)
    },
    [fetchChapters, currentBranch]
  )

  const refreshHistory = useCallback(
    async (branchId?: string) => {
      await fetchHistory(branchId ?? currentBranch ?? undefined)
    },
    [fetchHistory, currentBranch]
  )

  const refreshBranches = useCallback(async () => {
    await fetchBranches()
  }, [fetchBranches])

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

        await Promise.all([
          refreshChapters(currentBranch ?? undefined),
          refreshHistory(currentBranch ?? undefined)
        ])
      } catch (err) {
        console.error('Failed to delete chapter:', err)
        throw err
      }
    },
    [refreshChapters, refreshHistory, currentBranch]
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

        await Promise.all([
          refreshChapters(currentBranch ?? undefined),
          refreshHistory(currentBranch ?? undefined)
        ])
      } catch (err) {
        console.error('Failed to bulk delete chapters:', err)
        throw err
      }
    },
    [refreshChapters, refreshHistory, currentBranch]
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
    } catch (err) {
      console.error('Failed to delete project:', err)
      throw err
    }
  }, [])

  const deleteBranch = useCallback(
    async (branchId: string) => {
      if (!config.serverUrl) return

      try {
        const response = await fetch(`${config.serverUrl}/api/v1/user/data/project/branch/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            branchId
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.error?.message || result.error || `Failed to delete branch: ${response.status}`
          )
        }

        await refreshBranches()

        if (currentBranch === branchId && project) {
          const defaultBranch =
            (
              project as ProjectObject & {
                defaultBranch?: string
              }
            ).defaultBranch ?? null

          setCurrentBranch(defaultBranch)

          if (defaultBranch) {
            await Promise.all([fetchChapters(defaultBranch), fetchHistory(defaultBranch)])
          } else {
            setChapters([])
            setHistory([])
          }
        }
      } catch (err) {
        console.error('Failed to delete branch:', err)
        throw err
      }
    },
    [currentBranch, project, refreshBranches, fetchChapters, fetchHistory]
  )

  /*
   * Branch switching explicitly passes the selected branch to both
   * requests. It does not depend on React state having updated yet.
   */
  const switchBranch = useCallback(
    async (branchId: string) => {
      setCurrentBranch(branchId)

      await Promise.all([fetchChapters(branchId), fetchHistory(branchId)])
    },
    [fetchChapters, fetchHistory]
  )

  const createBranch = useCallback(
    async (branchName: string) => {
      if (!projectId || !config.serverUrl) return

      try {
        const response = await fetch(`${config.serverUrl}/api/v1/user/data/project/branch/new`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            projectId,
            branchName
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.error?.message || result.error || `Failed to create branch: ${response.status}`
          )
        }

        const newBranchId = result.data?.id || result.id

        if (!newBranchId) {
          throw new Error('Branch was created but no branch ID was returned')
        }

        await switchBranch(newBranchId)
        await refreshBranches()
      } catch (err) {
        console.error('Failed to create branch:', err)
        throw err
      }
    },
    [projectId, switchBranch, refreshBranches]
  )

  const value = useMemo<ProjectContextValue>(
    () => ({
      project,
      chapters,
      history,
      branches,
      currentBranch,

      projectLoading,
      chaptersLoading,
      historyLoading,
      branchesLoading,

      projectError,
      chaptersError,
      historyError,
      branchesError,

      fetchProject,
      fetchChapters,
      fetchHistory,
      fetchBranches,

      refreshProject,
      refreshChapters,
      refreshHistory,
      refreshBranches,

      getChapterIndex,
      getPreviousChapter,
      getNextChapter,

      deleteChapter,
      bulkDeleteChapters,
      deleteProject,
      deleteBranch,
      switchBranch,
      createBranch
    }),
    [
      project,
      chapters,
      history,
      branches,
      currentBranch,

      projectLoading,
      chaptersLoading,
      historyLoading,
      branchesLoading,

      projectError,
      chaptersError,
      historyError,
      branchesError,

      fetchProject,
      fetchChapters,
      fetchHistory,
      fetchBranches,

      refreshProject,
      refreshChapters,
      refreshHistory,
      refreshBranches,

      getChapterIndex,
      getPreviousChapter,
      getNextChapter,

      deleteChapter,
      bulkDeleteChapters,
      deleteProject,
      deleteBranch,
      switchBranch,
      createBranch
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
