'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function OAuthLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const [isSuccess, setIsSuccess] = useState(false)
  const [callbackLink, setCallbackLink] = useState('')
  
  // OAuth parameters from Electron
  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const codeChallenge = searchParams.get('code_challenge')
  const state = searchParams.get('state')
  const responseType = searchParams.get('response_type')

  useEffect(() => {
    // Validate required OAuth parameters
    if (!clientId || !redirectUri || !codeChallenge || !state) {
      setError('Invalid OAuth request. Missing required parameters.')
    }
  }, [clientId, redirectUri, codeChallenge, state])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Step 1: Authenticate with remote service
      const authResponse = await fetch('http://localhost:8080/api/v1/user/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      console.log('Auth response status:', authResponse.status, authResponse.statusText)

      if (!authResponse.ok) {
        const errorText = await authResponse.text()
        console.error('Auth request failed:', errorText)
        setError(`Authentication failed: ${authResponse.status} ${authResponse.statusText}`)
        setIsLoading(false)
        return
      }

      const authData = await authResponse.json()

      console.log('Auth response:', authData)

      if (!authData.success) {
        setError(authData.error?.message || 'Authentication failed')
        setIsLoading(false)
        return
      }

      // Validate the response structure
      if (!authData.data?.user?.id || !authData.data?.session?.accessToken) {
        console.error('Invalid auth response structure:', authData)
        setError('Invalid authentication response structure')
        setIsLoading(false)
        return
      }

      // Step 2: Generate authorization code
      const authorizeResponse = await fetch('/api/auth/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          code_challenge: codeChallenge,
          state: state,
          user_id: authData.data.user.id,
          email: authData.data.user.email,
          access_token: authData.data.session.accessToken,
          refresh_token: authData.data.session.refreshToken
        })
      })

      const authorizeData = await authorizeResponse.json()

      console.log('Authorize response:', authorizeData)

      if (!authorizeData.success) {
        setError(`Failed to generate authorization code: ${authorizeData.error?.message || 'Unknown error'}`)
        setIsLoading(false)
        return
      }

      // Step 3: Redirect back to Electron with authorization code
      const callbackUrl = new URL(redirectUri!)
      callbackUrl.searchParams.set('code', authorizeData.data.code)
      callbackUrl.searchParams.set('state', state!)
      
      const targetUrl = callbackUrl.toString()
      setCallbackLink(targetUrl)
      setIsSuccess(true)

      // Attempt automatic redirect
      window.location.href = targetUrl

    } catch (err) {
      setError('Authentication failed. Please try again.')
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full space-y-4">
          <h1 className="text-2xl font-bold text-green-600">Authenticated Successfully!</h1>
          <p className="text-gray-600">Redirecting back to Renaissance desktop app...</p>
          {callbackLink && (
            <div>
              <a
                href={callbackLink}
                className="inline-block px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-md shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Open Renaissance App
              </a>
            </div>
          )}
          <p className="text-xs text-gray-400">If the app doesn't open automatically, click the button above.</p>
        </div>
      </div>
    )
  }

  if (error && !formData.email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">OAuth Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign in to Renaissance</h1>
          <p className="mt-2 text-gray-600">Authenticate to continue to the desktop app</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center">
          <a href="/join" className="text-blue-600 hover:text-blue-800">
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </div>
  )
}
