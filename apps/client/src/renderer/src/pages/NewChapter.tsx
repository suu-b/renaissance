import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'

import Page from '../components/layout/Page'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import FormMessage from '../components/ui/FormMessage'
import Typography from '../components/ui/Typography'
import BackLink from '../components/ui/BackLink'

import { config } from '../config';

export default function NewChapter(): React.JSX.Element {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()

  const [formData, setFormData] = useState({
    name: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
          name: formData.name.trim()
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create chapter: ${response.status}`)
      }

      setSuccess(true)

      setTimeout(() => {
        navigate(`/project/${projectId}`)
      }, 2000)
    } catch (err) {
      console.error('Failed to create chapter:', err)
      setError('Failed to create chapter. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Page alignment="center">
        <div className="flex flex-col gap-4 max-w-[500px]">
          <div className="flex items-center gap-4 mb-2">
            <BackLink fallbackPath={`/project/${projectId}`} />
          </div>

          <Typography variant="h1">Chapter Created</Typography>

          <Typography variant="muted">
            Your chapter "{formData.name}" has been created successfully.
            You can now start writing your content.
          </Typography>

          <Button
            onClick={() => navigate(`/project/${projectId}`)}
            className="mt-4"
          >
            Go to Project <FiArrowUpRight size={15} />
          </Button>
        </div>
      </Page>
    )
  }

  return (
    <Page alignment="center">
      <div className="flex flex-col gap-4 max-w-[500px]">
        <div className="flex items-center gap-2 mb-2">
          <BackLink fallbackPath={`/project/${projectId}`} />
        </div>

        <div className="text-center">
          <Typography variant="h1">Create New Chapter</Typography>
        </div>

        <form
          className="flex flex-col gap-4 mt-6"
          onSubmit={handleSubmit}
        >
          <FormField
            label="Chapter Name"
            htmlFor="name"
            required
          >
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

          {error && (
            <FormMessage variant="error">
              {error}
            </FormMessage>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2"
          >
            {isLoading ? 'Creating...' : 'Create Chapter'}
            <FiArrowUpRight size={15} />
          </Button>
        </form>

        <FormMessage variant="note">
          Chapters help organize your project into manageable sections.
          Give your chapter a meaningful name to guide your writing.
        </FormMessage>
      </div>
    </Page>
  )
}