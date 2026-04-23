# OAuth Configuration

Guide for configuring OAuth providers (Google, Apple, Microsoft) for the Parkit platform.

## Overview

Parkit supports OAuth authentication for mobile apps to allow users to sign in with their existing accounts from major providers.

## Supported Providers

- **Google Sign-In** - Works on both iOS and Android
- **Apple Sign-In** - iOS only (required by Apple for apps with third-party sign-in)
- **Microsoft Sign-In** - Available for enterprise integration

## Google OAuth Setup

### 1. Create Google Cloud Project

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing one

### 2. Enable APIs

- Enable Google Sign-In API
- Enable Google+ API (if needed)

### 3. Create OAuth Credentials

- Go to Credentials > Create Credentials > OAuth client ID
- Select "Web application" (for React Native, we use web client ID)
- Add authorized redirect URIs:
  - Development: `http://localhost:19006`
  - Production: Your app's domain

### 4. Configure App

- Copy the Web client ID
- Add to mobile app `.env`:
  ```
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_client_id_here
  ```

### 5. Testing

- Works on both iOS and Android
- Requires Google Play Services on Android
- Test with different Google accounts

## Apple Sign-In Setup (iOS Only)

### 1. Apple Developer Account

- Go to [Apple Developer Portal](https://developer.apple.com/)
- Navigate to Certificates, Identifiers & Profiles

### 2. Create App ID

- Create a new App ID with Sign In with Apple capability
- Note the Bundle ID (must match your app's bundle ID)

### 3. Configure in Xcode

- Open your project in Xcode
- Go to Signing & Capabilities
- Add "Sign In with Apple" capability
- Ensure Bundle ID matches the one in Apple Developer Portal

### 4. Testing

- iOS only
- Test with real Apple ID (cannot use simulator for full flow)
- Test both existing and new Apple ID creation

## Microsoft OAuth Setup

### 1. Azure AD App Registration

- Go to [Azure Portal](https://portal.azure.com/)
- Navigate to Azure Active Directory > App registrations
- Create new registration

### 2. Configure App

- Set redirect URI: `msauth.com.parkit.mobile://auth`
- Add "Microsoft Graph" permissions (User.Read, email, profile)
- Note the Application (client) ID

### 3. Configure App

- Copy the Application (client) ID
- Add to mobile app `.env`:
  ```
  EXPO_PUBLIC_MICROSOFT_CLIENT_ID=your_client_id_here
  ```

### 4. Current Status

- Currently shows "not implemented" message in mobile apps
- Can be enhanced with WebBrowser for OAuth flow

## Backend Configuration

Ensure your backend supports OAuth endpoints:

- `POST /auth/oauth/google` - Handle Google OAuth tokens
- `POST /auth/oauth/apple` - Handle Apple OAuth tokens  
- `POST /auth/oauth/microsoft` - Handle Microsoft OAuth tokens

## Troubleshooting

### Common Issues

#### Google Sign-In

- **"Google Play Services not available"** - Install/update Google Play Services
- **"Web client type required"** - Ensure using Web client ID, not Android
- **"Network error"** - Check API URL configuration

#### Apple Sign-In

- **"Not handled"** - Ensure Sign In with Apple capability is added in Xcode
- **Bundle ID mismatch** - Check Bundle ID matches Apple Developer Portal
- **Simulator issues** - Test on real device for full flow

#### Microsoft Sign-In

- **"Not implemented"** - Currently not fully implemented in mobile apps
- **Redirect URI mismatch** - Verify redirect URI matches Azure AD configuration

### Debug Mode

For debugging OAuth flows, add proper error handling and logging in your OAuth utility:

```javascript
// In your OAuth utility
// Add proper error handling and logging as needed
try {
  const result = await signInWithGoogleAsync();
  // Handle success
} catch (error) {
  // Log error appropriately (not console.log in production)
  console.error('OAuth error:', error);
}
```

## Security Notes

- Never commit client secrets to version control
- Use environment variables for sensitive configuration
- Implement proper token validation on backend
- Consider adding rate limiting for OAuth endpoints
- Regularly rotate OAuth client secrets
- Use HTTPS in production
- Validate redirect URIs strictly

## Environment Variables

### Mobile Apps

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
```

### Backend

If backend needs to validate OAuth tokens:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

## Additional Resources

- [Google Sign-In for React Native](https://developers.google.com/identity/sign-in/web/sign-in)
- [Apple Sign-In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Microsoft Identity Platform](https://docs.microsoft.com/azure/active-directory/develop/)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)

## Mobile App Specific

For mobile app-specific OAuth implementation details, see:
- [Mobile Valet OAuth Setup](../apps/mobile/mobile-valet/docs/OAUTH_SETUP.md)
