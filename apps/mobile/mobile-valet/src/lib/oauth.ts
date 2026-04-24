import api, { setAuthToken } from './api';
import { saveUser } from './auth';
import type { User } from '@parkit/shared';

export interface OAuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// Check if OAuth is configured
const isGoogleConfigured = () => !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const _isFacebookConfigured = () => !!process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;

// Lazy loaded modules (to avoid crash if not configured)
let GoogleSignin: any = null;
let statusCodes: any = null;

const loadGoogleModule = async () => {
  if (!isGoogleConfigured()) return false;
  try {
    const module = await import('@react-native-google-signin/google-signin');
    GoogleSignin = module.GoogleSignin;
    statusCodes = module.statusCodes;
    return true;
  } catch {
    return false;
  }
};

// Initialize Google Sign-In
export const initializeGoogleSignIn = async () => {
  if (!isGoogleConfigured()) return;
  const loaded = await loadGoogleModule();
  if (!loaded || !GoogleSignin) return;
  
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
};

// Google OAuth
export const signInWithGoogle = async (): Promise<OAuthResponse> => {
  if (!isGoogleConfigured()) {
    return { success: false, error: 'Google Sign-In not configured' };
  }
  
  const loaded = await loadGoogleModule();
  if (!loaded || !GoogleSignin) {
    return { success: false, error: 'Google Sign-In module not available' };
  }

  try {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signIn();
    
    // Get tokens for backend verification
    const tokens = await GoogleSignin.getTokens();
    
    // Send token to backend for verification
    const response = await api.post('/auth/oauth/google', {
      idToken: tokens.idToken,
      accessToken: tokens.accessToken,
    });

    const { user, token } = response.data.data;
    await setAuthToken(token);
    await saveUser(user);
    
    return { success: true, user, token };
  } catch (error: any) {
    if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
      return { success: false, error: 'Google sign-in was cancelled' };
    } else if (error.code === statusCodes?.IN_PROGRESS) {
      return { success: false, error: 'Google sign-in is already in progress' };
    } else if (error.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
      return { success: false, error: 'Google Play Services not available' };
    }
    return { success: false, error: error.message || 'Google sign-in failed' };
  }
};

// Facebook OAuth (Web-based using backend redirect flow)
export const signInWithFacebook = async (): Promise<OAuthResponse> => {
  return { success: false, error: 'Facebook OAuth not yet implemented for mobile' };
};

// Microsoft OAuth (Web-based using backend redirect flow)
export const signInWithMicrosoft = async (): Promise<OAuthResponse> => {
  return { success: false, error: 'Microsoft OAuth not yet implemented for mobile' };
};

// Sign out from all providers
export const signOutFromOAuth = async () => {
  try {
    if (GoogleSignin) {
      await GoogleSignin.signOut();
    }
  } catch (error) {
    // Silently ignore OAuth sign-out errors
  }
};
