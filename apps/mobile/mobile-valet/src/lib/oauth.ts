import { Platform } from 'react-native';
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
const isAppleConfigured = () => Platform.OS === 'ios';

// Lazy loaded modules (to avoid crash if not configured)
let GoogleSignin: any = null;
let statusCodes: any = null;
let appleAuth: any = null;

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

const loadAppleModule = async () => {
  if (!isAppleConfigured()) return false;
  try {
    const module = await import('@invertase/react-native-apple-authentication');
    appleAuth = module.default;
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

// Apple OAuth
export const signInWithApple = async (): Promise<OAuthResponse> => {
  if (!isAppleConfigured()) {
    return { success: false, error: 'Apple Sign-In is only available on iOS' };
  }
  
  const loaded = await loadAppleModule();
  if (!loaded || !appleAuth) {
    return { success: false, error: 'Apple Sign-In module not available' };
  }

  try {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    if (!appleAuthRequestResponse.identityToken) {
      return { success: false, error: 'Apple Sign-In failed - no identity token' };
    }

    // Send token to backend for verification
    const response = await api.post('/auth/oauth/apple', {
      identityToken: appleAuthRequestResponse.identityToken,
      nonce: appleAuthRequestResponse.nonce,
    });

    const { user, token } = response.data.data;
    await setAuthToken(token);
    await saveUser(user);
    
    return { success: true, user, token };
  } catch (error: any) {
    if (error.code === appleAuth.Error.CANCELED) {
      return { success: false, error: 'Apple Sign-In was cancelled' };
    } else if (error.code === appleAuth.Error.FAILED) {
      return { success: false, error: 'Apple Sign-In failed' };
    } else if (error.code === appleAuth.Error.INVALID_RESPONSE) {
      return { success: false, error: 'Apple Sign-In invalid response' };
    } else if (error.code === appleAuth.Error.NOT_HANDLED) {
      return { success: false, error: 'Apple Sign-In not handled' };
    } else if (error.code === appleAuth.Error.UNKNOWN) {
      return { success: false, error: 'Apple Sign-In unknown error' };
    }
    return { success: false, error: error.message || 'Apple Sign-In failed' };
  }
};

// Microsoft OAuth (simplified implementation using web auth)
export const signInWithMicrosoft = async (): Promise<OAuthResponse> => {
  return { success: false, error: 'Microsoft OAuth not yet implemented for mobile' };
};

// Sign out from all providers
export const signOutFromOAuth = async () => {
  try {
    if (GoogleSignin) {
      await GoogleSignin.signOut();
    }
    // Apple and Microsoft don't require explicit sign-out on mobile
  } catch (error) {
    console.error('Error signing out from OAuth providers:', error);
  }
};
