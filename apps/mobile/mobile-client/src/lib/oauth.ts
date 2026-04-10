import api, { setAuthToken } from './api';
import * as AuthSession from 'expo-auth-session';
import { makeRedirectUri } from 'expo-auth-session';
import type { User } from '@parkit/shared';

export interface OAuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// Check if OAuth is configured
const isGoogleConfigured = () => !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const isFacebookConfigured = () => !!process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;
const isMicrosoftConfigured = () => !!process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID;

// API URL for web-based OAuth fallback
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

// ============================================================================
// Google OAuth (Native)
// ============================================================================

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

// ============================================================================
// Facebook OAuth (Web-based using backend redirect flow)
// ============================================================================

export const signInWithFacebook = async (): Promise<OAuthResponse> => {
  if (!isFacebookConfigured()) {
    return { success: false, error: 'Facebook Sign-In not configured' };
  }

  try {
    // Use web-based OAuth through backend
    const redirectUrl = makeRedirectUri({
      scheme: 'com.parkit.client',
      path: 'auth/facebook/callback',
    });

    const authUrl = `${API_URL}/auth/facebook?mobile=true&redirect_uri=${encodeURIComponent(redirectUrl)}`;

    const result = await AuthSession.startAsync({
      authUrl,
      returnUrl: redirectUrl,
    });

    if (result.type === 'success' && result.params.token) {
      // Token received from backend callback
      const token = result.params.token;
      setAuthToken(token);

      // Fetch user info
      const userResponse = await api.get('/auth/me');
      const user = userResponse.data.data;

      return { success: true, user, token };
    }

    return { success: false, error: 'Facebook authentication failed' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Facebook sign-in failed' };
  }
};

// ============================================================================
// Microsoft OAuth (Web-based using backend redirect flow)
// ============================================================================

export const signInWithMicrosoft = async (): Promise<OAuthResponse> => {
  if (!isMicrosoftConfigured()) {
    return { success: false, error: 'Microsoft Sign-In not configured' };
  }

  try {
    // Use web-based OAuth through backend
    const redirectUrl = makeRedirectUri({
      scheme: 'com.parkit.client',
      path: 'auth/microsoft/callback',
    });

    const authUrl = `${API_URL}/auth/microsoft?mobile=true&redirect_uri=${encodeURIComponent(redirectUrl)}`;

    const result = await AuthSession.startAsync({
      authUrl,
      returnUrl: redirectUrl,
    });

    if (result.type === 'success' && result.params.token) {
      // Token received from backend callback
      const token = result.params.token;
      setAuthToken(token);

      // Fetch user info
      const userResponse = await api.get('/auth/me');
      const user = userResponse.data.data;

      return { success: true, user, token };
    }

    return { success: false, error: 'Microsoft authentication failed' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Microsoft sign-in failed' };
  }
};

// ============================================================================
// Sign out from all providers
// ============================================================================

export const signOutFromOAuth = async () => {
  try {
    if (GoogleSignin) {
      await GoogleSignin.signOut();
    }
  } catch (error) {
    console.error('Error signing out from OAuth providers:', error);
  }
};
