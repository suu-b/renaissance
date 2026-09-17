import { createContext, useContext, useMemo, useState, useCallback, useRef } from 'react'
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

  /**
   * Monotonically-increasing counter that identifies the "current" branch switch.
   * Each call to switchBranch captures the generation at the time of the call.
   * When the fetch pair resolves, it checks that its generation is still current
   * before committing any state — older (superseded) fetches are silently dropped.
   *
   * This prevents the "one step behind" bug where a slow fetch from a previous
   * branch overwrites the result of a newer one.
   */
  const switchGenRef = useRef(0)

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

      const targetBranchId = branchId || currentBranch
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
            branch: targetBranchId
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
    [projectId, currentBranch]
  )

  /*
   * Fetch history for an explicitly requested branch or current branch.
   */
  const fetchHistory = useCallback(
    async (branchId?: string) => {
      if (!projectId || !config.serverUrl) return

      const targetBranchId = branchId || currentBranch
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
            branchId: targetBranchId
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
    [projectId, currentBranch]
  )


  const fetchChaptersRef = useRef(fetchChapters)
  fetchChaptersRef.current = fetchChapters
  const fetchHistoryRef = useRef(fetchHistory)
  fetchHistoryRef.current = fetchHistory

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
        await Promise.all([
          fetchChaptersRef.current(defaultBranch),
          fetchHistoryRef.current(defaultBranch)
        ])
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
  }, [projectId])

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
   * Branch switching.
   *
   * Race-condition safety via generation counter:
   * - Each switch increments `switchGenRef` and captures that generation number.
   * - The chapters and history requests are issued in parallel.
   * - Before committing ANY state we check that our generation is still the
   *   current one.  If a newer switch has already started, we discard the
   *   results so the fresher data is never overwritten by a slower older fetch.
   * - `currentBranch` is set optimistically before the fetch so the dropdown
   *   immediately reflects the user's selection.
   *
   * NOTE: we fetch inline here (rather than via fetchChapters/fetchHistory)
   * because those helpers call setChapters/setHistory unconditionally inside
   * their own try/catch.  We need to gate the state update on the generation
   * check, which must happen *before* we call the setters.
   */
  const switchBranch = useCallback(
    async (branchId: string) => {
      if (!projectId || !config.serverUrl) return

      // Bump the generation counter; capture our generation before any awaits
      const gen = ++switchGenRef.current

      // Optimistically commit the new branch so the UI reflects it immediately
      setCurrentBranch(branchId)
      setChaptersLoading(true)
      setHistoryLoading(true)
      console.debug('Switching branch:', branchId, '(gen', gen + ')')

      try {
        const [chaptersRes, historyRes] = await Promise.all([
          fetch(`${config.serverUrl}/api/v1/user/data/chapter/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project: projectId, limit: 100, offset: 0, branch: branchId })
          }),
          fetch(`${config.serverUrl}/api/v1/user/data/project/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, limit: 30, branchId })
          })
        ])

        const [chaptersData, historyData] = await Promise.all([
          chaptersRes.json(),
          historyRes.json()
        ])

        // Stale-check: if a newer switch has already started, discard our results
        if (gen !== switchGenRef.current) {
          console.debug('Branch switch gen', gen, 'superseded — discarding results')
          return
        }

        if (chaptersRes.ok) {
          setChapters(chaptersData.data?.chapters || chaptersData.chapters || [])
          setChaptersError(null)
        } else {
          setChaptersError(
            chaptersData.error?.message || chaptersData.error || 'Failed to fetch chapters'
          )
        }

        if (historyRes.ok) {
          setHistory(historyData.data?.history || historyData.history || [])
          setHistoryError(null)
        } else {
          setHistoryError(
            historyData.error?.message || historyData.error || 'Failed to fetch history'
          )
        }
      } catch (err) {
        if (gen !== switchGenRef.current) return // superseded; ignore
        console.error('Failed to switch branch:', err)
        setChaptersError(err instanceof Error ? err.message : 'Failed to switch branch')
      } finally {
        if (gen === switchGenRef.current) {
          setChaptersLoading(false)
          setHistoryLoading(false)
        }
      }
    },
    [projectId] // stable across branch changes; only needs projectId
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
