# OAuth Setup Guide for Mobile Valet App

This guide explains how to configure OAuth providers for the mobile valet application.

## Google OAuth Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable APIs**
   - Enable Google Sign-In API
   - Enable Google+ API (if needed)

3. **Create OAuth Credentials**
   - Go to Credentials > Create Credentials > OAuth client ID
   - Select "Web application" (for React Native, we use web client ID)
   - Add authorized redirect URIs:
     - Development: `http://localhost:19006`
     - Production: Your app's domain

4. **Configure App**
   - Copy the Web client ID
   - Add to `.env`: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_client_id_here`

## Apple Sign-In Setup (iOS Only)

1. **Apple Developer Account**
   - Go to [Apple Developer Portal](https://developer.apple.com/)
   - Navigate to Certificates, Identifiers & Profiles

2. **Create App ID**
   - Create a new App ID with Sign In with Apple capability
   - Note the Bundle ID (must match your app's bundle ID)

3. **Configure in Xcode**
   - Open your project in Xcode
   - Go to Signing & Capabilities
   - Add "Sign In with Apple" capability
   - Ensure Bundle ID matches the one in Apple Developer Portal

## Microsoft OAuth Setup

1. **Azure AD App Registration**
   - Go to [Azure Portal](https://portal.azure.com/)
   - Navigate to Azure Active Directory > App registrations
   - Create new registration

2. **Configure App**
   - Set redirect URI: `msauth.com.parkit.mobile://auth`
   - Add "Microsoft Graph" permissions (User.Read, email, profile)
   - Note the Application (client) ID

3. **Configure App**
   - Copy the Application (client) ID
   - Add to `.env`: `EXPO_PUBLIC_MICROSOFT_CLIENT_ID=your_client_id_here`

## Backend Configuration

Ensure your backend supports OAuth endpoints:

- `POST /auth/oauth/google` - Handle Google OAuth tokens
- `POST /auth/oauth/apple` - Handle Apple OAuth tokens  
- `POST /auth/oauth/microsoft` - Handle Microsoft OAuth tokens

## Testing

1. **Google Sign-In**
   - Works on both iOS and Android
   - Requires Google Play Services on Android
   - Test with different Google accounts

2. **Apple Sign-In**
   - iOS only
   - Test with real Apple ID (cannot use simulator for full flow)
   - Test both existing and new Apple ID creation

3. **Microsoft Sign-In**
   - Currently shows "not implemented" message
   - Can be enhanced with WebBrowser for OAuth flow

## Troubleshooting

### Common Issues

1. **Google Sign-In**
   - "Google Play Services not available" - Install/update Google Play Services
   - "Web client type required" - Ensure using Web client ID, not Android

2. **Apple Sign-In**
   - "Not handled" - Ensure Sign In with Apple capability is added in Xcode
   - Bundle ID mismatch - Check Bundle ID matches Apple Developer Portal

3. **General**
   - Network errors - Check API URL configuration
   - Token verification fails - Ensure backend OAuth endpoints are configured

### Debug Mode

Enable debug logging by setting:
```javascript
// In your OAuth utility
console.log('OAuth Debug:', { provider, error, result });
```

## Security Notes

- Never commit client secrets to version control
- Use environment variables for sensitive configuration
- Implement proper token validation on backend
- Consider adding rate limiting for OAuth endpoints
- Regularly rotate OAuth client secrets
