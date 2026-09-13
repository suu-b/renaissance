import { useEffect, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import Page from "@renderer/components/layout/Page"
import BackLink from "@renderer/components/ui/BackLink"
import ToolKit from "@renderer/components/common/ToolKit"
import ChapterReader from "@renderer/components/ui/ChapterReader"
import ChapterWriteView from "@renderer/components/common/ChapterWriteView"
import { useProject } from "@renderer/context/ProjectContext"
import { config } from "@renderer/config"

type EditorNode = {
  type: string
  children: Array<{ text: string }>
}

type ChapterMetadata = {
  chaptersNumber: number
  chapterNumber: number
}

export default function Chapter() {
  const { projectId, chapterId } = useParams<{
    projectId: string
    chapterId: string
  }>()

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get("mode")

  const {
    getPreviousChapter,
    getNextChapter
  } = useProject()

  const [content, setContent] = useState<EditorNode[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [chapterNumber, setChapterNumber] = useState(0)
  const [totalChapters, setTotalChapters] = useState(0)

  const isWriteMode = mode === "write"

  const draftKey =
    projectId && chapterId
      ? `renaissance:chapter:${projectId}:${chapterId}` :''

  const previousChapter = chapterId
    ? getPreviousChapter(chapterId)
    : null

  const nextChapter = chapterId
    ? getNextChapter(chapterId)
    : null

  useEffect(() => {
    const fetchChapter = async () => {
      if (!projectId || !chapterId || !config.serverUrl) {
        setError("Chapter information is missing")
        setLoading(false)
        return
      }

      try {
        const [chapterResponse, metadataResponse] = await Promise.all([
          fetch(`${config.serverUrl}/api/v1/user/data/chapter/get`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              project: projectId,
              id: chapterId
            })
          }),
          fetch(`${config.serverUrl}/api/v1/user/data/chapter/metadata`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              project: projectId,
              id: chapterId
            })
          })
        ])

        if (!chapterResponse.ok) {
          throw new Error(`Failed to fetch chapter: ${chapterResponse.status}`)
        }

        if (!metadataResponse.ok) {
          throw new Error(
            `Failed to fetch chapter metadata: ${metadataResponse.status}`
          )
        }

        const [chapterResult, metadataResult] = await Promise.all([
          chapterResponse.json(),
          metadataResponse.json()
        ])

        const chapter = chapterResult.data?.chapter || chapterResult.chapter
        const metadata: ChapterMetadata =
          metadataResult.data?.metadata || metadataResult.metadata

        if (!chapter) {
          throw new Error("Chapter not found")
        }

        if (!metadata) {
          throw new Error("Chapter metadata not found")
        }

        setChapterNumber(metadata.chapterNumber)
        setTotalChapters(metadata.chaptersNumber)

        const localDraft = draftKey
          ? localStorage.getItem(draftKey)
          : null

        if (localDraft) {
          try {
            const parsedDraft: EditorNode[] = JSON.parse(localDraft)

            if (Array.isArray(parsedDraft)) {
              setContent(parsedDraft)
              return
            }

            localStorage.removeItem(draftKey)
          } catch (error) {
            console.error("Failed to parse local chapter draft:", error)
            localStorage.removeItem(draftKey)
          }
        }

        setContent(chapter.content || [])
      } catch (error) {
        console.error("Failed to fetch chapter:", error)
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load chapter"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchChapter()
  }, [projectId, chapterId, draftKey])

  const handlePrevious = () => {
    if (previousChapter) {
      navigate(
        `/project/${projectId}/chapter/${previousChapter.id}?mode=${mode}`
      )
    }
  }

  const handleNext = () => {
    if (nextChapter) {
      navigate(
        `/project/${projectId}/chapter/${nextChapter.id}?mode=${mode}`
      )
    }
  }

  const handleEdit = () => {
    setError(null)
    setSuccess(null)

    navigate(
      `/project/${projectId}/chapter/${chapterId}?mode=write`
    )
  }

  const handleDelete = () => {
    console.log("Delete chapter", chapterId)
  }

  const handleSave = async () => {
    if (!projectId || !chapterId || !config.serverUrl) {
      setError("Chapter information is missing")
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(
        `${config.serverUrl}/api/v1/user/data/chapter/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            project: projectId,
            id: chapterId,
            content
          })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error?.message ||
          result.error ||
          `Failed to save chapter: ${response.status}`
        )
      }

      if (draftKey) {
        localStorage.removeItem(draftKey)
      }

      setSuccess("Chapter saved successfully")

      navigate(
        `/project/${projectId}/chapter/${chapterId}?mode=read`
      )
    } catch (error) {
      console.error("Failed to save chapter:", error)

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save chapter"
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (draftKey) {
      localStorage.removeItem(draftKey)
    }

    navigate(
      `/project/${projectId}/chapter/${chapterId}?mode=read`
    )
  }

  const handleContentChange = (value: string) => {
    try {
      const parsedContent: EditorNode[] = JSON.parse(value)

      setContent(parsedContent)
      setError(null)
      setSuccess(null)

      if (draftKey) {
        localStorage.setItem(
          draftKey,
          JSON.stringify(parsedContent)
        )
      }
    } catch (error) {
      console.error("Failed to parse editor content:", error)
      setError("Failed to process editor content")
    }
  }

  return (
    <Page alignment="default" className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <BackLink fallbackPath={`/project/${projectId}`} />
        </div>

        <ToolKit
          size="sm"
          confirm={true}
          confirmTitle="Delete Chapter"
          confirmContent="Are you sure you want to delete this chapter? This action cannot be undone."
          onDelete={handleDelete}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          saveConfirmTitle="Save Chapter"
          saveConfirmContent="Are you sure you want to save your changes to this chapter?"
          cancelConfirmTitle="Cancel Editing"
          cancelConfirmContent="Are you sure you want to cancel? Any unsaved changes will be lost."
          showSaveCancel={isWriteMode}
        />
      </div>

      {saving && (
        <div className="mb-4 text-sm text-muted-foreground">
          Saving chapter...
        </div>
      )}

      {success && (
        <div className="mb-4 text-sm text-green-600">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading chapter...</div>
      ) : error && !content.length ? (
        <div>{error}</div>
      ) : isWriteMode ? (
        <ChapterWriteView
          title={`Chapter ${chapterNumber}: The Beginning`}
          initialValue={content}
          onChange={handleContentChange}
          chapterNumber={chapterNumber}
          totalChapters={totalChapters}
        />
      ) : (
        <ChapterReader
          title={`Chapter ${chapterNumber}: The Beginning`}
          content={content}
          chapterNumber={chapterNumber}
          totalChapters={totalChapters}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onEdit={handleEdit}
        />
      )}
    </Page>
  )
}