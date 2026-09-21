import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'

import Page from '../components/layout/Page'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import FormMessage from '../components/ui/FormMessage'
import Typography from '../components/ui/Typography'
import BackLink from '../components/ui/BackLink'
import { useToast } from '../components/ui/Toast'
import { useProject } from '../context/ProjectContext'
import { useBreadcrumb } from '../context/BreadcrumbContext'

import { config } from '../config'

export default function NewChapter(): React.JSX.Element {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { project, currentBranch, branches } = useProject()
  const { setBreadcrumbs } = useBreadcrumb()

  const { projectId } = useParams<{ projectId: string }>()

  useEffect(() => {
    const projectLabel = project?.name || 'Project'
    setBreadcrumbs([
      { label: 'Dashboard', path: '/dashboard' },
      { label: projectLabel, path: `/project/${projectId}` },
      { label: 'New Chapter' }
    ])
  }, [project, projectId, setBreadcrumbs])

  const [formData, setFormData] = useState({
    name: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Get current branch name
  const currentBranchName = branches.find(branch => branch.id === currentBranch)?.branchName || 'Unknown Branch'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (formData.name.trim().length < 1) {
      setError('Chapter name is required')
      setIsLoading(false)
      return
    }

    if (!currentBranch) {
      setError('No branch selected. Please select a branch first.')
      setIsLoading(false)
      return
    }

    try {
      if (!config.serverUrl) {
        throw new Error('Server URL is not configured')
      }

      const response = await fetch(`${config.serverUrl}/api/v1/user/data/chapter/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project: projectId,
          name: formData.name.trim(),
          branchId: currentBranch
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error?.message || result.error || `Failed to create chapter: ${response.status}`
        )
      }

      showToast("Chapter created successfully!", "info")
      navigate(`/project/${projectId}`)
    } catch (err) {
      console.error('Failed to create chapter:', err)
      setError(err instanceof Error ? err.message : 'Failed to create chapter. Please try again.')
      showToast('Failed to create chapter', 'alert')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Page alignment="center">
      <div className="flex flex-col gap-4 max-w-[500px]">
        <div className="flex items-center gap-2 mb-2">
          <BackLink fallbackPath={`/project/${projectId}`} />
          <div className="text-sm text-muted-foreground">
            Branch: <span className="font-medium text-foreground">{currentBranchName}</span>
          </div>
        </div>

        <div className="text-center">
          <Typography variant="h1">Create New Chapter</Typography>
        </div>

        <form className="flex flex-col gap-4 mt-6" onSubmit={handleSubmit}>
          <FormField label="Chapter Name" htmlFor="name" required>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Chapter 1: The Beginning"
              required
            />
          </FormField>

          {error && <FormMessage variant="error">{error}</FormMessage>}

          <Button type="submit" disabled={isLoading} className="mt-2">
            {isLoading ? 'Creating...' : 'Create Chapter'}
            <FiArrowUpRight size={15} />
          </Button>
        </form>

        <FormMessage variant="note">
          Chapters help organize your project into manageable sections. Give your chapter a
          meaningful name to guide your writing.
        </FormMessage>
      </div>
    </Page>
  )
}
