import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import Page from '../components/layout/Page'
import Typography from '../components/ui/Typography'
import ChapterList from '../components/common/ChapterList'
import SearchBar from '../components/ui/SearchBar'
import BackLink from '../components/ui/BackLink'
import Contributions from '../components/common/Contributions'
import Stream from '../components/common/Stream'
import ToolKit from '../components/common/ToolKit'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import { useProject } from '../context/ProjectContext'
import { config } from '../config'

import Veil from '../components/ui/Veil'

export default function Project() {
  const navigate = useNavigate()
  const { project, chapters, loading, history, deleteProject, bulkDeleteChapters } = useProject()
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [projectsToDelete, setProjectsToDelete] = useState<string[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editIsPrivate, setEditIsPrivate] = useState(false)
  const [updating, setUpdating] = useState(false)

  const handleDelete = async () => {
    if (!project?.id) return

    try {
      await deleteProject(project.id)
      setSuccess('Project deleted successfully')

      // Navigate to dashboard after successful deletion
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Failed to delete project:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete project')
    }
  }

  const handleBulkDeleteChapters = async (chapterIds: string[]) => {
    try {
      await bulkDeleteChapters(chapterIds)
      setSuccess(`Successfully deleted ${chapterIds.length} chapters`)
    } catch (error) {
      console.error('Failed to bulk delete chapters:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete chapters')
    }
  }

  const handleBulkDeleteChaptersWithConfirm = (chapterIds: string[]) => {
    if (chapterIds.length === 0) return
    setProjectsToDelete(chapterIds)
    setShowDeleteConfirm(true)
  }

  const confirmBulkDelete = async () => {
    setShowDeleteConfirm(false)
    await handleBulkDeleteChapters(projectsToDelete)
    setProjectsToDelete([])
  }

  const cancelBulkDelete = () => {
    setShowDeleteConfirm(false)
    setProjectsToDelete([])
  }

  const handleEdit = () => {
    if (!project) return
    setEditName(project.name)
    setEditDescription(project.description)
    setEditIsPrivate(project.isPrivate)
    setShowEditModal(true)
  }

  const handleUpdateProject = async () => {
    if (!project?.id || !config.serverUrl) return

    setUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`${config.serverUrl}/api/v1/user/data/project/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: project.id,
          name: editName,
          description: editDescription,
          isPrivate: editIsPrivate
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error?.message || result.error || `Failed to update project: ${response.status}`
        )
      }

      setSuccess('Project updated successfully')
      setShowEditModal(false)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Failed to update project:', error)
      setError(error instanceof Error ? error.message : 'Failed to update project')
    } finally {
      setUpdating(false)
    }
  }

  const cancelEdit = () => {
    setShowEditModal(false)
    setEditName('')
    setEditDescription('')
    setEditIsPrivate(false)
  }

  return (
    <Page alignment="default" className="flex gap-4">
      <div className="mx-auto w-[60vw]">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <BackLink fallbackPath="/dashboard" />
          </div>

          <ToolKit
            size="sm"
            confirm={true}
            confirmTitle="Delete Project"
            confirmContent="Are you sure you want to delete this project? This action cannot be undone."
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>

        <Typography variant="h1" className="my-6">
          {loading ? 'Loading...' : project?.name || `Project ${project?.id}`}
        </Typography>

        {success && <div className="mb-4 text-sm text-green-600">{success}</div>}

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

        <div className="flex items-center gap-2 mb-4">
          <SearchBar
            placeholder="Search chapters..."
            size="md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(`/project/${project?.id}/new-chapter`)}
          >
            <FiPlus /> New Chapter
          </Button>
        </div>

        <ChapterList
          size="md"
          itemsPerPage={5}
          projectId={project?.id}
          chapters={chapters}
          searchTerm={searchTerm}
          onBulkDelete={handleBulkDeleteChaptersWithConfirm}
        />
      </div>

      <div className="mx-auto w-[25vw]">
        <div className="mb-4 p-4 rounded-lg border border-foreground/10 bg-gradient-to-br from-gray-50 to-white">
          <Typography variant="h4" className="mb-3">
            Project Details
          </Typography>

          <div className="flex flex-col gap-2">
            <Typography variant="muted" className="text-muted-foreground">
              Owner:{' '}
              <span className="text-foreground font-semibold">
                {project?.owner.displayName || 'Unknown'}
              </span>
            </Typography>

            <Typography variant="muted" className="text-muted-foreground">
              Created:{' '}
              <span className="text-foreground font-semibold">
                {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </Typography>

            <Typography variant="muted" className="text-muted-foreground">
              Last Updated:{' '}
              <span className="text-foreground font-semibold">
                {project?.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Unknown'}
              </span>
            </Typography>

            <Typography variant="muted" className="text-muted-foreground">
              Status:{' '}
              <span className="text-foreground font-semibold">
                {project?.isPrivate ? 'Private' : 'Public'}
              </span>
            </Typography>
            <Typography variant="muted" className="text-muted-foreground">
              Contributors:{' '}
              <span className="text-foreground font-semibold">
                {project?.contributors?.length || 0}
              </span>
            </Typography>

            <Typography variant="muted" className="text-muted-foreground">
              Chapters: <span className="text-foreground font-semibold">{chapters.length}</span>
            </Typography>
          </div>

          <div className="mt-4 pt-4 border-t border-foreground/10">
            <Typography variant="h4" className="mb-2">
              Description
            </Typography>

            <Typography variant="p" className="text-sm text-muted-foreground leading-relaxed">
              {project?.description || 'No description available.'}
            </Typography>
          </div>
        </div>

        <Stream history={history} className="mb-4" />

        <Veil className="rounded-lg">
          <Contributions
            contributors={
              project?.contributors?.map((c, index) => ({
                id: parseInt(c.id.replace(/-/g, '').substring(0, 8), 16) || index,
                name: c.displayName,
                avatar: c.avatarUrl
              })) || []
            }
          />
        </Veil>
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        title="Delete Chapters"
        content={`Are you sure you want to delete ${projectsToDelete.length} chapter${projectsToDelete.length > 1 ? 's' : ''}? This action cannot be undone.`}
        onConfirm={confirmBulkDelete}
        onCancel={cancelBulkDelete}
      />

      <Modal
        isOpen={showEditModal}
        title="Edit Project"
        content=""
        onConfirm={handleUpdateProject}
        onCancel={cancelEdit}
      >
        <div className="w-full space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="edit-project-name"
              className="block text-sm font-medium text-foreground"
            >
              Project Name
            </label>

            <Input
              id="edit-project-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter project name"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="edit-project-description"
              className="block text-sm font-medium text-foreground"
            >
              Description
            </label>

            <Textarea
              id="edit-project-description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Enter project description"
              rows={4}
              className="w-full resize-none"
            />
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <input
              type="checkbox"
              id="isPrivate"
              checked={editIsPrivate}
              onChange={(e) => setEditIsPrivate(e.target.checked)}
              className="h-4 w-4 shrink-0 cursor-pointer"
            />

            <label htmlFor="isPrivate" className="cursor-pointer text-sm font-medium">
              Private Project
            </label>
          </div>

          {updating && (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              Updating project...
            </div>
          )}
        </div>
      </Modal>
    </Page>
  )
}
