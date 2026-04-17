import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "@parkit/shared";
import { setAuthToken, clearAuthToken } from "./api";

export type { User };

const USER_KEY = "parkit_user";
const TOKEN_KEY = "parkit_token";

export const saveUser = async (user: User, token: string) => {
  try {
    await AsyncStorage.multiSet([
      [USER_KEY, JSON.stringify(user)],
      [TOKEN_KEY, token],
    ]);
    setAuthToken(token);
  } catch (error) {
    console.error("Failed to save user:", error);
  }
};

export const getStoredUser = async (): Promise<User | null> => {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to get user:", error);
    return null;
  }
};

export const getStoredToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      setAuthToken(token);
    }
    return token;
  } catch (error) {
    console.error("Failed to get token:", error);
    return null;
  }
};

export const clearUser = async () => {
  try {
    await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
    clearAuthToken();
  } catch (error) {
    console.error("Failed to clear user:", error);
  }
};
