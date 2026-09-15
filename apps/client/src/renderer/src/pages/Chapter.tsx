import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Page from '@renderer/components/layout/Page'
import BackLink from '@renderer/components/ui/BackLink'
import ToolKit from '@renderer/components/common/ToolKit'
import ChapterReader from '@renderer/components/ui/ChapterReader'
import ChapterWriteView from '@renderer/components/common/ChapterWriteView'
import Modal from '@renderer/components/ui/Modal'
import Input from '@renderer/components/ui/Input'
import { useProject } from '@renderer/context/ProjectContext'
import { config } from '@renderer/config'

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
  const mode = searchParams.get('mode')

  const { getPreviousChapter, getNextChapter, deleteChapter } = useProject()

  const [content, setContent] = useState<EditorNode[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [chapterNumber, setChapterNumber] = useState(0)
  const [totalChapters, setTotalChapters] = useState(0)

  const [chapterName, setChapterName] = useState('')
  const [editChapterName, setEditChapterName] = useState('')

  const [showEditModal, setShowEditModal] = useState(false)

  const isWriteMode = mode === 'write'

  const draftKey = projectId && chapterId ? `renaissance:chapter:${projectId}:${chapterId}` : ''

  const previousChapter = chapterId ? getPreviousChapter(chapterId) : null

  const nextChapter = chapterId ? getNextChapter(chapterId) : null

  useEffect(() => {
    const fetchChapter = async () => {
      if (!projectId || !chapterId || !config.serverUrl) {
        setError('Chapter information is missing')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const [chapterResponse, metadataResponse] = await Promise.all([
          fetch(`${config.serverUrl}/api/v1/user/data/chapter/get`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              project: projectId,
              id: chapterId
            })
          }),

          fetch(`${config.serverUrl}/api/v1/user/data/chapter/metadata`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
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
          throw new Error(`Failed to fetch chapter metadata: ${metadataResponse.status}`)
        }

        const [chapterResult, metadataResult] = await Promise.all([
          chapterResponse.json(),
          metadataResponse.json()
        ])

        const chapter = chapterResult.data?.chapter || chapterResult.chapter

        const metadata: ChapterMetadata = metadataResult.data?.metadata || metadataResult.metadata

        if (!chapter) {
          throw new Error('Chapter not found')
        }

        if (!metadata) {
          throw new Error('Chapter metadata not found')
        }

        setChapterName(chapter.name || '')
        setChapterNumber(metadata.chapterNumber)
        setTotalChapters(metadata.chaptersNumber)

        const localDraft = draftKey ? localStorage.getItem(draftKey) : null

        if (localDraft) {
          try {
            const parsedDraft: EditorNode[] = JSON.parse(localDraft)

            if (Array.isArray(parsedDraft)) {
              setContent(parsedDraft)
              return
            }

            localStorage.removeItem(draftKey)
          } catch (error) {
            console.error('Failed to parse local chapter draft:', error)

            localStorage.removeItem(draftKey)
          }
        }

        setContent(chapter.content || [])
      } catch (error) {
        console.error('Failed to fetch chapter:', error)

        setError(error instanceof Error ? error.message : 'Failed to load chapter')
      } finally {
        setLoading(false)
      }
    }

    fetchChapter()
  }, [projectId, chapterId, draftKey])

  const handlePrevious = () => {
    if (previousChapter) {
      navigate(`/project/${projectId}/chapter/${previousChapter.id}?mode=${mode}`)
    }
  }

  const handleNext = () => {
    if (nextChapter) {
      navigate(`/project/${projectId}/chapter/${nextChapter.id}?mode=${mode}`)
    }
  }

  // ToolKit Edit button:
  // Opens the popup for changing the chapter name.
  const handleEditChapterName = () => {
    setError(null)
    setSuccess(null)
    setEditChapterName(chapterName)
    setShowEditModal(true)
  }

  // ChapterReader Edit button:
  // Keeps the original behavior of entering content edit mode.
  const handleEditContent = () => {
    if (!projectId || !chapterId) return

    navigate(`/project/${projectId}/chapter/${chapterId}?mode=write`)
  }

  // ToolKit Add button:
  // Opens the new chapter page.
  // const handleAddChapter = () => {
  //   if (!projectId) return

  //   navigate(`/project/${projectId}/new-chapter`)
  // }

  const cancelEdit = () => {
    if (updating) return

    setShowEditModal(false)
    setEditChapterName(chapterName)
    setError(null)
  }

  const handleUpdateChapter = async () => {
    if (!chapterId || !config.serverUrl) {
      setError('Chapter information is missing')
      return
    }

    const trimmedName = editChapterName.trim()

    if (!trimmedName) {
      setError('Chapter name is required')
      return
    }

    setUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`${config.serverUrl}/api/v1/user/data/chapter/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: chapterId,
          name: trimmedName
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error?.message || result.error || `Failed to update chapter: ${response.status}`
        )
      }

      setChapterName(trimmedName)
      setEditChapterName(trimmedName)
      setShowEditModal(false)

      setSuccess('Chapter name updated successfully')

      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (error) {
      console.error('Failed to update chapter:', error)

      setError(error instanceof Error ? error.message : 'Failed to update chapter')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!chapterId || !projectId) return

    try {
      await deleteChapter(chapterId)

      setSuccess('Chapter deleted successfully')

      setTimeout(() => {
        navigate(`/project/${projectId}`)
      }, 1000)
    } catch (error) {
      console.error('Failed to delete chapter:', error)

      setError(error instanceof Error ? error.message : 'Failed to delete chapter')
    }
  }

  const handleSave = async () => {
    if (!projectId || !chapterId || !config.serverUrl) {
      setError('Chapter information is missing')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`${config.serverUrl}/api/v1/user/data/chapter/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project: projectId,
          id: chapterId,
          content
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error?.message || result.error || `Failed to save chapter: ${response.status}`
        )
      }

      if (draftKey) {
        localStorage.removeItem(draftKey)
      }

      setSuccess('Chapter saved successfully')

      navigate(`/project/${projectId}/chapter/${chapterId}?mode=read`)
    } catch (error) {
      console.error('Failed to save chapter:', error)

      setError(error instanceof Error ? error.message : 'Failed to save chapter')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (draftKey) {
      localStorage.removeItem(draftKey)
    }

    navigate(`/project/${projectId}/chapter/${chapterId}?mode=read`)
  }

  const handleContentChange = (value: string) => {
    try {
      const parsedContent: EditorNode[] = JSON.parse(value)

      setContent(parsedContent)
      setError(null)
      setSuccess(null)

      if (draftKey) {
        localStorage.setItem(draftKey, JSON.stringify(parsedContent))
      }
    } catch (error) {
      console.error('Failed to parse editor content:', error)

      setError('Failed to process editor content')
    }
  }

  return (
    <Page alignment="default" className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <BackLink fallbackPath={`/project/${projectId}`} />
        </div>

        <ToolKit
          size="sm"
          confirm={true}
          confirmTitle="Delete Chapter"
          confirmContent="Are you sure you want to delete this chapter? This action cannot be undone."
          onDelete={handleDelete}
          onEdit={handleEditChapterName}
          onSave={handleSave}
          onCancel={handleCancel}
          saveConfirmTitle="Save Chapter"
          saveConfirmContent="Are you sure you want to save your changes to this chapter?"
          cancelConfirmTitle="Cancel Editing"
          cancelConfirmContent="Are you sure you want to cancel? Any unsaved changes will be lost."
          showSaveCancel={isWriteMode}
        />
      </div>

      <Modal
        isOpen={showEditModal}
        title="Edit Chapter"
        content=""
        onConfirm={handleUpdateChapter}
        onCancel={cancelEdit}
      >
        <div className="w-full space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="edit-chapter-name"
              className="block text-sm font-medium text-foreground"
            >
              Chapter Name
            </label>

            <Input
              id="edit-chapter-name"
              value={editChapterName}
              onChange={(event) => setEditChapterName(event.target.value)}
              placeholder="Enter chapter name"
              className="w-full"
              disabled={updating}
            />
          </div>

          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Chapter {chapterNumber} of {totalChapters}
            </p>
          </div>

          {updating && (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              Updating chapter...
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </Modal>

      {saving && (
        <div className="mb-4 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          Saving chapter...
        </div>
      )}

      {success && <div className="mb-4 text-sm text-green-600">{success}</div>}

      {error && !showEditModal && <div className="mb-4 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="py-10 text-center text-muted-foreground">Loading chapter...</div>
      ) : error && !content.length ? (
        <div className="py-10 text-center text-red-600">{error}</div>
      ) : isWriteMode ? (
        <ChapterWriteView
          title={chapterName || `Chapter ${chapterNumber}: The Beginning`}
          initialValue={content}
          onChange={handleContentChange}
          chapterNumber={chapterNumber}
          totalChapters={totalChapters}
        />
      ) : (
        <ChapterReader
          title={chapterName || `Chapter ${chapterNumber}: The Beginning`}
          content={content}
          chapterNumber={chapterNumber}
          totalChapters={totalChapters}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onEdit={handleEditContent}
        />
      )}
    </Page>
  )
}
