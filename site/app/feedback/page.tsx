'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

export default function FeedbackPage() {
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
            <button 
              className="submit-button"
              onClick={() => window.close()}
            >
              Close <ArrowUpRight size={15} />
            </button>
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
            <div className="form-group">
              <label htmlFor="name">Name (optional)</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                placeholder="How should we address you?"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email (optional)</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                placeholder="For follow-up if needed"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="feedbackType">Feedback Type</label>
              <select 
                id="feedbackType" 
                name="feedbackType" 
                value={formData.feedbackType}
                onChange={handleChange}
                className="form-select"
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="ux">User Experience</option>
                <option value="content">Content Suggestions</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief summary of your feedback"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Your Message</label>
              <textarea 
                id="message" 
                name="message" 
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your experience, ideas, or suggestions..."
                rows={6}
                required
                className="form-textarea"
              />
            </div>
            
            {error && <p className="form-error">{error}</p>}
            
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Feedback'} <ArrowUpRight size={15} />
            </button>
          </form>
          
          <p className="form-note">
            Your feedback helps us create a better literary experience. We read every submission carefully.
          </p>
        </div>
      </section>
    </main>
  )
}
