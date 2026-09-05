import { generic_client } from "./genericClient";
import { UserProfile } from "../types/auth";

export async function getAuthStatus(): Promise<boolean> {
  // const response = await generic_client.get("/auth/status");
  // return response.data;

  // DUMMY CODE BELOW:
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 3000);
  });
}

export async function getCurrentUser(): Promise<UserProfile> {
  // const response = await generic_client.get("/auth/status");
  // return response.data;

  // DUMMY CODE BELOW:
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "1",
        username: "test",
        name: "Test User",
        email: "test@example.com",
        location: "Mandi, Himachal Pradesh",
        projectCount: 3,
      });
    }, 3000);
  });
}

export async function login(credentials: any): Promise<boolean> {
  // return generic_client.post("/auth/login", credentials);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 3000);
  });
}

// export function logout() {
//   return generic_client.post("/auth/logout", null);
// }