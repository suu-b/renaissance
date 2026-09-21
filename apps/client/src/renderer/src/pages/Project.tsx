import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'

import Page from '../components/layout/Page'
import Typography from '../components/ui/Typography'
import ChapterList from '../components/common/ChapterList'
import SearchBar from '../components/ui/SearchBar'
import BackLink from '../components/ui/BackLink'
import Stream from '../components/common/Stream'
import ToolKit from '../components/common/ToolKit'
import NewTool from '../components/ui/NewTool'
import MergeTool from '../components/ui/MergeTool'
import MergeWizard from '../components/common/MergeWizard'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import { useToast } from '../components/ui/Toast'
import SearchableDropdown from '../components/ui/SearchableDropdown'

import { useProject } from '../context/ProjectContext'
import { useBreadcrumb } from '../context/BreadcrumbContext'

import { config } from '../config'

export default function Project() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const {
    project,
    chapters,
    history,
    branches,
    currentBranch,
    fetchProject,
    fetchBranches,
    deleteProject,
    bulkDeleteChapters,
    refreshProject,
    createBranch,
    switchBranch,
  } = useProject()
  const { setBreadcrumbs } = useBreadcrumb()

  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [projectsToDelete, setProjectsToDelete] = useState<string[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editIsPrivate, setEditIsPrivate] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [showNewBranchModal, setShowNewBranchModal] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [creatingBranch, setCreatingBranch] = useState(false)
  const [showMergeWizard, setShowMergeWizard] = useState(false)

  // Ensure the default branch is always in the dropdown options.
  // If it is missing from the server response (e.g. still loading), we do not
  // inject a fake entry — we simply use the raw branches list.
  const allBranches = useMemo(() => {
    if (!project?.defaultBranch) return branches
    const hasDefault = branches.some((b) => b.id === project.defaultBranch)
    if (hasDefault) return branches
    // The default branch is not yet in the list — omit it rather than
    // injecting a stub without a branchName; the list will correct itself
    // once fetchBranches completes.
    return branches
  }, [branches, project?.defaultBranch])

  useEffect(() => {
    console.log('Fetching latest project...')
    fetchProject()
  }, [fetchProject])

  useEffect(() => {
    if (project) {
      console.log('Fetching branches...')
      fetchBranches()
    }
  }, [project, fetchBranches])

  useEffect(() => {
    if (project) {
      setBreadcrumbs([
        { label: 'Dashboard', path: '/dashboard' },
        { label: project.name || 'Project Details' }
      ])
    }
  }, [project, setBreadcrumbs])

  const handleDelete = async () => {
    if (!project?.id) return
    try {
      await deleteProject(project.id)
      showToast('Project deleted successfully', 'info')
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to delete project:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete project')
      showToast('Failed to delete project', 'alert')
    }
  }

  const handleBulkDeleteChapters = async (chapterIds: string[]) => {
    try {
      await bulkDeleteChapters(chapterIds)
      showToast(`Successfully deleted ${chapterIds.length} chapters`, 'info')
    } catch (error) {
      console.error('Failed to bulk delete chapters:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete chapters')
      showToast('Failed to delete chapters', 'alert')
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

    try {
      const response = await fetch(`${config.serverUrl}/api/v1/user/data/project/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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

      setShowEditModal(false)
      showToast('Project updated successfully', 'info')
      await refreshProject()
    } catch (error) {
      console.error('Failed to update project:', error)

      setError(error instanceof Error ? error.message : 'Failed to update project')
      showToast('Failed to update project', 'alert')
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

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      showToast('Branch name cannot be empty', 'alert')
      return
    }

    setCreatingBranch(true)
    setError(null)

    try {
      await createBranch(newBranchName.trim())
      setShowNewBranchModal(false)
      setNewBranchName('')
      showToast('Branch created successfully', 'info')
    } catch (error) {
      console.error('Failed to create branch:', error)
      setError(error instanceof Error ? error.message : 'Failed to create branch')
      showToast('Failed to create branch', 'alert')
    } finally {
      setCreatingBranch(false)
    }
  }

  const handleBranchSelect = async (branchName: string) => {
    const selectedBranch = allBranches.find((branch) => branch.branchName === branchName)
    if (!selectedBranch || selectedBranch.id === currentBranch) return

    try {
      await switchBranch(selectedBranch.id)
      // showToast(`Switched to branch ${branchName}`, 'info')
    } catch (error) {
      console.error('Failed to switch branch:', error)
      setError(error instanceof Error ? error.message : 'Failed to switch branch')
      showToast('Failed to switch branch', 'alert')
    }
  }

  const cancelNewBranch = () => {
    setShowNewBranchModal(false)
    setNewBranchName('')
  }

  return (
    <Page alignment="default" className="flex gap-4">
      <div className="mx-auto w-[60vw]">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <BackLink fallbackPath="/dashboard" />
          </div>
          {/* <Contributions
            contributors={
              project?.contributors?.map((c, index) => ({
                id: parseInt(c.id.replace(/-/g, '').substring(0, 8), 16) || index,
                name: c.displayName,
                avatar: c.avatarUrl
              })) || []
            }
          /> */}
        </div>

        <div className="mb-6 flex justify-between items-center gap-4">
          <Typography variant="h1">
            {project?.name}
          </Typography>

          <div className="flex gap-3 justify-center items-center shrink-0">
            <SearchableDropdown
              options={allBranches.map((branch) => branch.branchName)}
              value={allBranches.find((branch) => branch.id === currentBranch)?.branchName}
              defaultIndex={allBranches.findIndex((branch) => branch.id === currentBranch)}
              onSelect={handleBranchSelect}
              variant="default"
            />
            <NewTool
              size="sm"
              onClick={() => setShowNewBranchModal(true)}
            />
            <MergeTool
              size="sm"
              onClick={() => setShowMergeWizard(true)}
              disabled={currentBranch === project?.defaultBranch}
            />
            <ToolKit
              size="sm"
              confirm={true}
              confirmTitle="Delete Project"
              confirmContent="Are you sure you want to delete this project? This action cannot be undone."
              onDelete={handleDelete}
              onEdit={handleEdit}
              showNew={false}
            />
          </div>
        </div>

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
          itemsPerPage={8}
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

        <Stream history={history} projectId={project?.id} className="mb-4" />
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        title="Delete Chapters"
        content={`Are you sure you want to delete ${projectsToDelete.length} chapter${projectsToDelete.length > 1 ? 's' : ''}? This action cannot be undone.`}
        onConfirm={confirmBulkDelete}
        onCancel={cancelBulkDelete}
      />

      <Modal
        isOpen={showNewBranchModal}
        title="Create New Branch"
        content=""
        onConfirm={handleCreateBranch}
        onCancel={cancelNewBranch}
      >
        <div className="w-full space-y-6">
          <div className="space-y-2">
            <label htmlFor="new-branch-name" className="block text-sm font-medium text-foreground">
              Branch Name
            </label>

            <Input
              id="new-branch-name"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="Enter branch name"
              className="w-full"
            />
          </div>

          {creatingBranch && (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              Creating branch...
            </div>
          )}
        </div>
      </Modal>

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

      <MergeWizard
        isOpen={showMergeWizard}
        projectId={project?.id || undefined}
        branchName={allBranches.find((branch) => branch.id === currentBranch)?.branchName || 'feature-branch'}
        currentBranchId={currentBranch ?? undefined}
        mainBranchId={project?.defaultBranch ?? undefined}
        mainBranchName={allBranches.find((branch) => branch.id === project?.defaultBranch)?.branchName ?? undefined}
        onClose={() => setShowMergeWizard(false)}
      />
    </Page>
  )
}
