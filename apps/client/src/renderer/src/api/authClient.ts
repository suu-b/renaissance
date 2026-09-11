import { generic_client } from "./genericClient";
import { UserProfile } from "../types/auth";

export async function getAuthStatus(): Promise<boolean> {
  const token = localStorage.getItem('access_token');
  return !!token;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');
  const email = localStorage.getItem('email');
  
  if (!token) {
    throw new Error('No access token found');
  }

  try {
    const response = await fetch('http://localhost:8080/api/v1/user/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user data');
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return {
        id: data.data.id || userId || '',
        username: data.data.username || email?.split('@')[0] || '',
        name: data.data.display_name || data.data.username || email?.split('@')[0] || '',
        email: data.data.email || email || '',
        location: data.data.location || '',
        projectCount: data.data.projectCount || 0,
        avatar: data.data.avatar_url
      };
    }
    
    // Fallback to stored data if API response is unexpected
    return {
      id: userId || '',
      username: email?.split('@')[0] || '',
      name: email?.split('@')[0] || '',
      email: email || '',
      location: '',
      projectCount: 0,
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    // Fallback to stored data
    return {
      id: userId || '',
      username: email?.split('@')[0] || '',
      name: email?.split('@')[0] || '',
      email: email || '',
      location: '',
      projectCount: 0,
    };
  }
}

// OAuth login is now handled by the OAuth flow
// export function logout() {
//   return generic_client.post("/auth/logout", null);
// }