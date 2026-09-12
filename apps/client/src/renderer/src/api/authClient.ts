import { config } from "../config";
import { UserProfile } from "../types/auth";

export async function getAuthStatus(): Promise<boolean> {
  const email = localStorage.getItem('user_email');
  return !!email;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const email = localStorage.getItem('user_email');
  
  if (!email) {
    throw new Error('No user email found');
  }

  if (!config.serverUrl) {
    throw new Error('Local server is not available');
  }

  try {
    const response = await fetch(`${config.serverUrl}/api/v1/user/auth/me?email=${encodeURIComponent(email)}`);

    if (!response.ok) {
      throw new Error('Failed to get user data');
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return {
        id: data.data.id || '',
        username: data.data.username || email?.split('@')[0] || '',
        name: data.data.display_name || data.data.username || email?.split('@')[0] || '',
        email: data.data.email || email || '',
        location: data.data.location || '',
        projectCount: data.data.projectCount || 0,
        avatar: data.data.avatar_url
      };
    }
    
    // Fallback to stored email if API response is unexpected
    return {
      id: '',
      username: email?.split('@')[0] || '',
      name: email?.split('@')[0] || '',
      email: email || '',
      location: '',
      projectCount: 0,
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    // Fallback to stored email
    return {
      id: '',
      username: email?.split('@')[0] || '',
      name: email?.split('@')[0] || '',
      email: email || '',
      location: '',
      projectCount: 0,
    };
  }
}