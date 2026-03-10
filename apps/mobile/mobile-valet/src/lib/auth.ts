import * as SecureStore from 'expo-secure-store';
import type { User } from "@parkit/shared";

export type { User };

export const saveUser = async (user: User) => {
  await SecureStore.setItemAsync('user', JSON.stringify(user));
};

export const getStoredUser = async (): Promise<User | null> => {
  const user = await SecureStore.getItemAsync('user');
  return user ? JSON.parse(user) : null;
};

export const clearUser = async () => {
  await SecureStore.deleteItemAsync('user');
};
