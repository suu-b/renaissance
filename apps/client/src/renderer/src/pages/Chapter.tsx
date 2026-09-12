import { useEffect, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import Page from "@renderer/components/layout/Page"
import BackLink from "@renderer/components/ui/BackLink"
import ToolKit from "@renderer/components/common/ToolKit"
import ChapterReader from "@renderer/components/ui/ChapterReader"
import ChapterWriteView from "@renderer/components/common/ChapterWriteView"
import { config } from "@renderer/config"

type EditorNode = {
  type: string
  children: Array<{ text: string }>
}

export default function Chapter() {
  const { projectId, chapterId } = useParams<{ projectId: string; chapterId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get("mode")

  const [content, setContent] = useState<EditorNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const chapterNumber = 1
  const totalChapters = 20
  const isWriteMode = mode === "write"

  useEffect(() => {
    const fetchChapter = async () => {
      if (!projectId || !chapterId || !config.serverUrl) {
        setError("Chapter information is missing")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${config.serverUrl}/api/v1/user/data/chapter/get`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              project: projectId,
              id: chapterId
            })
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch chapter: ${response.status}`)
        }

        const result = await response.json()
        const chapter = result.data?.chapter || result.chapter

        if (!chapter) {
          throw new Error("Chapter not found")
        }

        setContent(chapter.content || [])
      } catch (error) {
        console.error("Failed to fetch chapter:", error)
        setError("Failed to load chapter")
      } finally {
        setLoading(false)
      }
    }

    fetchChapter()
  }, [projectId, chapterId])

  const handlePrevious = () => {
    if (chapterNumber > 1) {
      navigate(`/project/${projectId}/chapter/${chapterNumber - 1}?mode=${mode}`)
    }
  }

  const handleNext = () => {
    if (chapterNumber < totalChapters) {
      navigate(`/project/${projectId}/chapter/${chapterNumber + 1}?mode=${mode}`)
    }
  }

  const handleEdit = () => {
    navigate(`/project/${projectId}/chapter/${chapterId}?mode=write`)
  }

  const handleDelete = () => {
    console.log("Delete chapter", chapterId)
  }

  const handleSave = () => {
    console.log("Save chapter", content)
    navigate(`/project/${projectId}/chapter/${chapterId}?mode=read`)
  }

  const handleCancel = () => {
    navigate(`/project/${projectId}/chapter/${chapterId}?mode=read`)
  }

  const handleContentChange = (value: string) => {
    try {
      const parsedContent: EditorNode[] = JSON.parse(value)
      setContent(parsedContent)
    } catch (error) {
      console.error("Failed to parse editor content:", error)
    }
  }

  const readerContent = content
    .map(node => node.children.map(child => child.text).join(""))
    .join("\n\n")

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

      {loading ? (
        <div>Loading chapter...</div>
      ) : error ? (
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
          content={readerContent}
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
