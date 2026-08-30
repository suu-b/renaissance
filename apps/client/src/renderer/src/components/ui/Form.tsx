'use client'

import { useState } from 'react'
import { FiArrowUpRight } from 'react-icons/fi'
import FormField from './FormField'
import Input from './Input'
import Select from './Select'
import Textarea from './Textarea'
import Button from './Button'
import FormMessage from './FormMessage'

export default function Form() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedbackType: 'general',
    subject: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Basic validation
    if (formData.message.length < 10) {
      setError('Please provide more details in your message (at least 10 characters)')
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSuccess(true)
    } catch (err) {
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <main>
        <section className="join-hero">
          <div className="join-container">
            <h1>Thank You</h1>
            <p>Your feedback has been received. We appreciate your thoughts and will review them carefully to improve Renaissance.</p>
            <Button 
              onClick={() => window.close()}
            >
              Close <FiArrowUpRight size={15} />
            </Button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main>
      <section className="join-hero">
        <div className="join-container">
          <h1>Share Your Thoughts</h1>
          <p>Help us shape the future of Renaissance. Your feedback drives our literary journey forward.</p>
          
          <form className="join-form" onSubmit={handleSubmit}>
            <FormField
              label="Name (optional)"
              htmlFor="name"
            >
              <Input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                placeholder="How should we address you?"
              />
            </FormField>
            
            <FormField
              label="Email (optional)"
              htmlFor="email"
            >
              <Input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                placeholder="For follow-up if needed"
              />
            </FormField>
            
            <FormField
              label="Feedback Type"
              htmlFor="feedbackType"
            >
              <Select 
                id="feedbackType" 
                name="feedbackType" 
                value={formData.feedbackType}
                onChange={handleChange}
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="ux">User Experience</option>
                <option value="content">Content Suggestions</option>
              </Select>
            </FormField>
            
            <FormField
              label="Subject"
              htmlFor="subject"
              required
            >
              <Input 
                type="text" 
                id="subject" 
                name="subject" 
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief summary of your feedback"
                required
              />
            </FormField>
            
            <FormField
              label="Your Message"
              htmlFor="message"
              required
            >
              <Textarea 
                id="message" 
                name="message" 
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your experience, ideas, or suggestions..."
                rows={6}
                required
              />
            </FormField>
            
            {error && <FormMessage variant="error">{error}</FormMessage>}
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="px-5 py-3 text-xs mt-2"
            >
              {isLoading ? 'Submitting...' : 'Submit Feedback'} <FiArrowUpRight size={15} />
            </Button>
          </form>
          
          <FormMessage variant="note">
            Your feedback helps us create a better literary experience. We read every submission carefully.
          </FormMessage>
        </div>
      </section>
    </main>
  )
}
