import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'

import Page from '../components/layout/Page'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Checkbox from '../components/ui/Checkbox'
import Button from '../components/ui/Button'
import FormMessage from '../components/ui/FormMessage'
import Typography from '../components/ui/Typography'
import BackLink from '../components/ui/BackLink'

export default function NewProject(): React.JSX.Element {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_private: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (formData.name.trim().length < 2) {
      setError('Project name must be at least 2 characters')
      setIsLoading(false)
      return
    }

    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters')
      setIsLoading(false)
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSuccess(true)
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      setError('Failed to create project. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  if (success) {
    return (
      <Page alignment="center">
        <div className="flex flex-col gap-4 max-w-[500px]">
          <div className="flex items-center gap-4 mb-2">
            <BackLink fallbackPath="/dashboard" />
          </div>
          <Typography variant="h1">Project Created</Typography>
          <Typography variant="muted">
            Your project "{formData.name}" has been created successfully. You can now begin your literary journey.
          </Typography>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="mt-4"
          >
            Go to Dashboard <FiArrowUpRight size={15} />
          </Button>
        </div>
      </Page>
    )
  }

  return (
    <Page alignment="center">
      <div className="flex flex-col gap-4 max-w-[500px]">
        <div className="flex items-center gap-2 mb-2">
          <BackLink fallbackPath="/dashboard" />
        </div>
        <div className="text-center">
          <Typography variant="h1">Create New Project</Typography>
        </div>
        
        <form className="flex flex-col gap-4 mt-6" onSubmit={handleSubmit}>
          <FormField
            label="Project Name"
            htmlFor="name"
            required
          >
            <Input 
              type="text" 
              id="name" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="A creative name for your project"
              required
            />
          </FormField>
          
          <FormField
            label="Description"
            htmlFor="description"
            required
          >
            <Textarea 
              id="description" 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project's purpose, themes, or story..."
              rows={5}
              required
            />
          </FormField>
          
          <FormField
            label="Privacy Settings"
            htmlFor="is_private"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id="is_private"
                name="is_private"
                checked={formData.is_private}
                onChange={handleChange}
              />
              <Typography variant="muted" className="text-sm">
                Make this project private (only you can see it)
              </Typography>
            </div>
          </FormField>
          
          {error && <FormMessage variant="error">{error}</FormMessage>}
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="mt-2"
          >
            {isLoading ? 'Creating...' : 'Create Project'} <FiArrowUpRight size={15} />
          </Button>
        </form>
        
        <FormMessage variant="note">
          Your project will be a quiet space for your literary work. Take your time to craft something meaningful.
        </FormMessage>
      </div>
    </Page>
  )
}
