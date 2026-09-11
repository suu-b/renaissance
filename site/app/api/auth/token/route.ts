import { NextRequest, NextResponse } from 'next/server'
import { getAuthCode, deleteAuthCode } from '@/lib/authStore'
import crypto from 'crypto'

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
    const { grant_type, code, code_verifier, redirect_uri } = body

    // Validate grant type
    if (grant_type !== 'authorization_code') {
      return NextResponse.json({
        success: false,
        error: { message: 'Unsupported grant_type' }
      }, { status: 400, headers: corsHeaders })
    }

    // Validate required parameters
    if (!code || !code_verifier || !redirect_uri) {
      return NextResponse.json({
        success: false,
        error: { message: 'Missing required parameters' }
      }, { status: 400, headers: corsHeaders })
    }

    // Retrieve authorization code
    const authCodeData = getAuthCode(code)
    if (!authCodeData) {
      return NextResponse.json({
        success: false,
        error: { message: 'Invalid or expired authorization code' }
      }, { status: 401, headers: corsHeaders })
    }

    // Verify code verifier against challenge
    const expectedChallenge = generateCodeChallenge(code_verifier)
    if (authCodeData.codeChallenge !== expectedChallenge) {
      deleteAuthCode(code) // Delete invalid code
      return NextResponse.json({
        success: false,
        error: { message: 'Invalid code_verifier' }
      }, { status: 401, headers: corsHeaders })
    }

    // Return the tokens that were stored during authorization
    const tokens = {
      access_token: authCodeData.accessToken,
      refresh_token: authCodeData.refreshToken,
      user_id: authCodeData.userId,
      email: authCodeData.email
    }

    // Delete the used authorization code
    deleteAuthCode(code)

    return NextResponse.json({
      success: true,
      data: tokens
    }, { headers: corsHeaders })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: 'Internal server error' }
    }, { status: 500, headers: corsHeaders })
  }
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url')
}