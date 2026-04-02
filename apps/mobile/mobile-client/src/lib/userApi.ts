import client from "./api";

export interface AppPreferences {
  theme?: "light" | "dark" | "system";
  locale?: "es" | "en";
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  avatarUrl?: string | null;
  appPreferences?: AppPreferences;
}

export async function updateProfile(data: UpdateProfileData) {
  const response = await client.patch("/users/me", data);
  return response.data;
}
