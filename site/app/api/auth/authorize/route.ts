import { NextRequest, NextResponse } from 'next/server'
import { saveAuthCode, cleanupExpiredCodes } from '@/lib/authStore'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_id, redirect_uri, code_challenge, state, user_id, email, access_token, refresh_token } = body

    console.log('Authorize request received:', { client_id, redirect_uri, code_challenge, state, user_id, hasAccessToken: !!access_token })

    if (!client_id || !redirect_uri || !code_challenge || !state || !user_id || !access_token) {
      console.log('Missing required parameters:', { client_id, redirect_uri, code_challenge, state, user_id, hasAccessToken: !!access_token })
      return NextResponse.json({
        success: false,
        error: { message: 'Missing required parameters' }
      }, { status: 400, headers: corsHeaders })
    }

    if (client_id !== 'renaissance-desktop') {
      console.log('Invalid client_id:', client_id)
      return NextResponse.json({
        success: false,
        error: { message: 'Invalid client_id' }
      }, { status: 401, headers: corsHeaders })
    }

    if (!redirect_uri.startsWith('renaissance://') && !redirect_uri.startsWith('http://localhost:')) {
      console.log('Invalid redirect_uri:', redirect_uri)
      return NextResponse.json({
        success: false,
        error: { message: 'Invalid redirect_uri' }
      }, { status: 401, headers: corsHeaders })
    }

    const code = generateAuthCode()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 min

    saveAuthCode(code, {
      codeChallenge: code_challenge,
      userId: user_id,
      email: email,
      accessToken: access_token,
      refreshToken: refresh_token || '',
      expiresAt
    })

    // Clean up expired codes
    cleanupExpiredCodes()

    return NextResponse.json({
      success: true,
      data: { code }
    }, { headers: corsHeaders })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: 'Internal server error' }
    }, { status: 500, headers: corsHeaders })
  }
}

function generateAuthCode(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36)
}