import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react"
import type { ReactNode } from "react"
import { ProjectSchema, type ChapterObject, type ProjectObject, GitCommit } from "@renaissance/shared"
import { config } from "@renderer/config"

type ProjectContextValue = {
    project: ProjectObject | null
    chapters: ChapterObject[]
    loading: boolean
    error: string | null
    refreshChapters: () => Promise<void>
    getChapterIndex: (chapterId: string) => number
    getPreviousChapter: (chapterId: string) => ChapterObject | null
    getNextChapter: (chapterId: string) => ChapterObject | null
    history: GitCommit[]
    historyLoading: boolean
    fetchHistory: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

type ProjectProviderProps = {
    projectId: string | null
    children: ReactNode
}

export function ProjectProvider({
    projectId,
    children
}: ProjectProviderProps) {
    const [project, setProject] = useState<ProjectObject | null>(null)
    const [chapters, setChapters] = useState<ChapterObject[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [history, setHistory] = useState<GitCommit[]>([])
    const [historyLoading, setHistoryLoading] = useState(false)

    const refreshChapters = async () => {
        if (!projectId || !config.serverUrl) return

        const response = await fetch(
            `${config.serverUrl}/api/v1/user/data/chapter/search`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project: projectId,
                    limit: 100,
                    offset: 0
                })
            }
        )

        const result = await response.json()

        if (!response.ok) {
            throw new Error(
                result.error?.message ||
                result.error ||
                `Failed to fetch chapters: ${response.status}`
            )
        }

        setChapters(result.data?.chapters || result.chapters || [])
    }

    const fetchHistory = useCallback(async () => {
        if (!projectId || !config.serverUrl) return
        setHistoryLoading(true)
        try {
            const response = await fetch(
                `${config.serverUrl}/api/v1/user/data/project/history`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        projectId,
                        limit: 30
                    })
                }
            )
            const result = await response.json()
            if (!response.ok) {
                throw new Error(
                    result.error?.message ||
                    result.error ||
                    `Failed to fetch history: ${response.status}`
                )
            }

            const historyData = result.data?.history || result.history || []
            setHistory(historyData)
        } catch (err) {
            console.error("Failed to fetch history:", err)
        } finally {
            setHistoryLoading(false)
        }
    }, [projectId, config.serverUrl])

    useEffect(() => {
        if (!projectId || !config.serverUrl) {
            setProject(null)
            setChapters([])
            setError(null)
            setLoading(false)
            return
        }

        const fetchProject = async () => {
            setLoading(true)
            setError(null)

            try {
                const projectResponse = await fetch(
                    `${config.serverUrl}/api/v1/user/data/project/search/mine`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            filters: [
                                {
                                    field: "id",
                                    operator: "eq",
                                    value: projectId
                                }
                            ],
                            limit: 1
                        })
                    }
                )

                if (!projectResponse.ok) {
                    throw new Error(
                        `Failed to fetch project: ${projectResponse.status}`
                    )
                }

                const projectResult = await projectResponse.json()
                const projects =
                    projectResult.data?.projects ||
                    projectResult.projects ||
                    []

                if (!projects.length) {
                    throw new Error("Project not found")
                }

                setProject(ProjectSchema.parse(projects[0]))

                await refreshChapters()
            } catch (err) {
                console.error("Failed to fetch project data:", err)
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load project"
                )
            } finally {
                setLoading(false)
            }
        }

        fetchProject()
        fetchHistory()
    }, [projectId])

    const getChapterIndex = (chapterId: string) =>
        chapters.findIndex(chapter => chapter.id === chapterId)

    const getPreviousChapter = (chapterId: string) => {
        const index = getChapterIndex(chapterId)
        return index > 0 ? chapters[index - 1] : null
    }

    const getNextChapter = (chapterId: string) => {
        const index = getChapterIndex(chapterId)
        return index >= 0 && index < chapters.length - 1
            ? chapters[index + 1]
            : null
    }

    const value = useMemo<ProjectContextValue>(() => ({
        project,
        chapters,
        loading,
        error,
        refreshChapters,
        getChapterIndex,
        getPreviousChapter,
        getNextChapter,
        history,
        historyLoading,
        fetchHistory
    }), [project, chapters, loading, error, history, historyLoading, fetchHistory])

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    )
}

export function useProject() {
    const context = useContext(ProjectContext)

    if (!context) {
        throw new Error("useProject must be used within a ProjectProvider")
    }

    return context
}