import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Page from '@renderer/components/layout/Page'
import BackLink from '@renderer/components/ui/BackLink'
import ToolKit from '@renderer/components/common/ToolKit'
import ChapterReader from '@renderer/components/ui/ChapterReader'
import ChapterWriteView from '@renderer/components/common/ChapterWriteView'
import Modal from '@renderer/components/ui/Modal'
import Input from '@renderer/components/ui/Input'
import { useToast } from '@renderer/components/ui/Toast'
import { useProject } from '@renderer/context/ProjectContext'
import { useBreadcrumb } from '@renderer/context/BreadcrumbContext'
import { config } from '@renderer/config'

type EditorNode = {
  type: string
  children: Array<{ text: string }>
}

export default function Chapter() {
  const { projectId, chapterId } = useParams<{
    projectId: string
    chapterId: string
  }>()

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode')
  const { showToast } = useToast()

  const { getPreviousChapter, getNextChapter, deleteChapter, project, currentBranch, branches } = useProject()
  const { setBreadcrumbs } = useBreadcrumb()

  const [content, setContent] = useState<EditorNode[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const [chapterName, setChapterName] = useState('')
  const [editChapterName, setEditChapterName] = useState('')

  const [showEditModal, setShowEditModal] = useState(false)
  const [showSavePopover, setShowSavePopover] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const isWriteMode = mode === 'write'

  const draftKey = projectId && chapterId ? `renaissance:chapter:${projectId}:${chapterId}` : ''

  // Get current branch name
  const currentBranchName = branches.find(branch => branch.id === currentBranch)?.branchName || 'Unknown Branch'

  useEffect(() => {
    const projectLabel = project?.name || 'Project'
    const chapterLabel = chapterName || 'Chapter'
    const modeLabel = isWriteMode ? ' (Editing)' : ''

    setBreadcrumbs([
      { label: 'Dashboard', path: '/dashboard' },
      { label: projectLabel, path: `/project/${projectId}` },
      { label: `${chapterLabel}${modeLabel}` }
    ])
  }, [project, projectId, chapterName, isWriteMode, setBreadcrumbs])

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
        const chapterResponse = await fetch(`${config.serverUrl}/api/v1/user/data/chapter/get`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            project: projectId,
            id: chapterId
          })
        })

        if (!chapterResponse.ok) {
          throw new Error(`Failed to fetch chapter: ${chapterResponse.status}`)
        }

        const chapterResult = await chapterResponse.json()

        const chapter = chapterResult.data?.chapter || chapterResult.chapter

        if (!chapter) {
          throw new Error('Chapter not found')
        }

        setChapterName(chapter.name || '')

        const localDraft = draftKey ? localStorage.getItem(draftKey) : null

        if (localDraft) {
          try {
            const parsedDraft: EditorNode[] = JSON.parse(localDraft)

            if (Array.isArray(parsedDraft)) {
              setContent(parsedDraft)
              showToast('Loaded from local draft', 'info')
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

      showToast('Chapter name updated successfully', 'info')
    } catch (error) {
      console.error('Failed to update chapter:', error)

      setError(error instanceof Error ? error.message : 'Failed to update chapter')
      showToast('Failed to update chapter', 'alert')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!chapterId || !projectId) return

    try {
      await deleteChapter(chapterId)

      showToast('Chapter deleted successfully', 'info')
      navigate(`/project/${projectId}`)
    } catch (error) {
      console.error('Failed to delete chapter:', error)

      setError(error instanceof Error ? error.message : 'Failed to delete chapter')
      showToast('Failed to delete chapter', 'alert')
    }
  }

  const handleSave = () => {
    setShowSavePopover(true)
    setSaveMessage('')
  }

  const handleSaveWithMessage = async () => {
    if (!projectId || !chapterId || !config.serverUrl) {
      setError('Chapter information is missing')
      return
    }

    setSaving(true)
    setError(null)
    setShowSavePopover(false)

    try {
      const response = await fetch(`${config.serverUrl}/api/v1/user/data/chapter/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project: projectId,
          id: chapterId,
          content,
          message: saveMessage.trim() || undefined,
          branchId: currentBranch || undefined
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

      showToast('Chapter saved successfully', 'info')
      navigate(`/project/${projectId}/chapter/${chapterId}?mode=read`)
    } catch (error) {
      console.error('Failed to save chapter:', error)

      setError(error instanceof Error ? error.message : 'Failed to save chapter')
      showToast('Failed to save chapter', 'alert')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelSave = () => {
    setShowSavePopover(false)
    setSaveMessage('')
  }

  const handleCancel = () => {
    if (draftKey && localStorage.getItem(draftKey)) {
      localStorage.removeItem(draftKey)
      showToast('Draft discarded', 'info')
    }

    navigate(`/project/${projectId}/chapter/${chapterId}?mode=read`)
  }

  const handleContentChange = (value: string) => {
    try {
      const parsedContent: EditorNode[] = JSON.parse(value)

      setContent(parsedContent)
      setError(null)

      if (draftKey) {
        localStorage.setItem(draftKey, JSON.stringify(parsedContent))
      }
    } catch (error) {
      console.error('Failed to parse editor content:', error)

      setError('Failed to process editor content')
    }
  }

  return (
    <Page alignment="default" className="mx-auto max-w-4xl min-h-[70vh]">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <BackLink fallbackPath={`/project/${projectId}`} />
          <div className="mt-2 text-sm text-muted-foreground">
            Branch: <span className="font-medium text-foreground">{currentBranchName}</span>
          </div>
        </div>

        <div className="relative">
          <ToolKit
            size="sm"
            confirm={true}
            confirmTitle="Delete Chapter"
            confirmContent="Are you sure you want to delete this chapter? This action cannot be undone."
            onDelete={handleDelete}
            onEdit={handleEditChapterName}
            onSave={handleSave}
            onCancel={handleCancel}
            saveConfirm={false}
            cancelConfirmTitle="Cancel Editing"
            cancelConfirmContent="Are you sure you want to cancel? Any unsaved changes will be lost."
            showSaveCancel={isWriteMode}
            showNew={false}
          />

          {showSavePopover && (
            <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-background border border-foreground/15 rounded-lg shadow-lg backdrop-blur-sm">
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground/90 mb-1">
                    Commit Message (Optional)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add a custom message for this save, or leave empty
                  </p>
                </div>

                <Input
                  value={saveMessage}
                  onChange={(e) => setSaveMessage(e.target.value)}
                  placeholder="We have a horrible alternative tho lol"
                  className="w-full"
                  disabled={saving}
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleCancelSave}
                    disabled={saving}
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-md border border-foreground/20 text-foreground/80 hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveWithMessage}
                    disabled={saving}
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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
      
      {loading ? (
        <div className="py-10 text-center text-muted-foreground">Loading chapter...</div>
      ) : error && !content.length ? (
        <div className="py-10 text-center text-red-600">{error}</div>
      ) : isWriteMode ? (
        <ChapterWriteView
          title={chapterName || 'Chapter'}
          initialValue={content}
          onChange={handleContentChange}
        />
      ) : (
        <ChapterReader
          title={chapterName || 'Chapter'}
          content={content}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onEdit={handleEditContent}
        />
      )}
    </Page>
  )
}
