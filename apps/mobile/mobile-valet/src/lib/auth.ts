import * as SecureStore from 'expo-secure-store';
import type { User, Locale } from "@parkit/shared";
import api, { setAuthToken, clearAuthToken } from './api';

export type { User };

export const translateError = (errorMessage: string, locale: Locale, t: (locale: Locale, key: string) => string): string => {
  const lowerError = errorMessage.toLowerCase();
  
  if (lowerError.includes('invalid credentials') || lowerError.includes('incorrect password')) {
    return t(locale, 'auth.login.failed');
  }
  if (lowerError.includes('user not found') || lowerError.includes('email not found')) {
    return t(locale, 'auth.login.failed');
  }
  if (lowerError.includes('email already exists') || lowerError.includes('user already exists')) {
    return t(locale, 'auth.signup.emailExists');
  }
  if (lowerError.includes('company inactive')) {
    return t(locale, 'auth.errorCompanyInactive');
  }
  if (lowerError.includes('account pending') || lowerError.includes('pending activation')) {
    return t(locale, 'auth.errorAccountPending');
  }
  if (lowerError.includes('invalid invite') || lowerError.includes('invitation')) {
    return t(locale, 'auth.errorInvalidInvite');
  }
  if (lowerError.includes('invalid reset') || lowerError.includes('reset link')) {
    return t(locale, 'auth.errorInvalidReset');
  }
  if (lowerError.includes('invalid code')) {
    return t(locale, 'auth.errorInvalidCode');
  }
  
  // Default fallback
  return t(locale, 'auth.errorGeneric');
};

export const saveUser = async (user: User) => {
  await SecureStore.setItemAsync('user', JSON.stringify(user));
};

export const saveCredentials = async (email: string, password: string) => {
  await SecureStore.setItemAsync('rememberedEmail', email);
  await SecureStore.setItemAsync('rememberedPassword', password);
};

export const getStoredCredentials = async (): Promise<{ email: string; password: string } | null> => {
  const email = await SecureStore.getItemAsync('rememberedEmail');
  const password = await SecureStore.getItemAsync('rememberedPassword');
  if (email && password) {
    return { email, password };
  }
  return null;
};

export const clearCredentials = async () => {
  await SecureStore.deleteItemAsync('rememberedEmail');
  await SecureStore.deleteItemAsync('rememberedPassword');
};

export const getStoredUser = async (): Promise<User | null> => {
  const user = await SecureStore.getItemAsync('user');
  return user ? JSON.parse(user) : null;
};

export const clearUser = async () => {
  await SecureStore.deleteItemAsync('user');
};

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  valetStaffRole: 'RECEPTIONIST' | 'DRIVER';
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data.data;
    
    await setAuthToken(token);
    await saveUser(user);
    
    // Save credentials if remember me is checked
    if (credentials.rememberMe) {
      await saveCredentials(credentials.email, credentials.password);
    } else {
      await clearCredentials();
    }
    
    return { success: true, user, token };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    return { success: false, error: errorMessage };
  }
};

export const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/signup', credentials);
    const { user, token } = response.data.data;
    
    await setAuthToken(token);
    await saveUser(user);
    
    return { success: true, user, token };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
    return { success: false, error: errorMessage };
  }
};

export const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await api.post('/auth/forgot-password', { email });
    return { success: true };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
    return { success: false, error: errorMessage };
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    await clearAuthToken();
    await clearUser();
    await clearCredentials();
  }
};
