'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

export default function JoinPage() {
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    // Generate username from display name if not provided
    const username = formData.username || formData.displayName.toLowerCase().replace(/\s+/g, '')

    try {
      const response = await fetch('http://localhost:8080/api/v1/user/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          username: username
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error?.message || 'Registration failed')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <main>
        <section className="join-hero">
          <div className="join-container">
            <h1>Welcome to Renaissance</h1>
            <p>Your account has been created successfully. You can now begin your literary journey.</p>
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
          <h1>Join Renaissance</h1>
          <p>Begin your literary journey in a space designed for thoughtful creation.</p>
          
          <form className="join-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input 
                type="text" 
                id="displayName" 
                name="displayName" 
                value={formData.displayName}
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="username">Username (optional)</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                value={formData.username}
                onChange={handleChange}
                placeholder="Auto-generated from display name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
              />
            </div>
            
            {error && <p className="form-error">{error}</p>}
            
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'} <ArrowUpRight size={15} />
            </button>
          </form>
          
          <p className="form-note">
            By joining, you agree to create meaningful literature and respect the quiet space we've built.
          </p>
        </div>
      </section>
    </main>
  )
}
