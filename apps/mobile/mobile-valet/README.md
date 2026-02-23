# ParKit Valet – React Native Mobile App

Ultra-minimal valet operations interface for real-time parking management.

## 🎯 Features

- **Assigned Tickets**: View active ticket assignments with vehicle plate & location
- **Status Flow**: `assigned` → `in-transit` → `completed`
- **One-Tap Actions**: Start move, complete delivery, view location
- **Real-Time Sync**: Refresh to fetch updated assignments
- **Offline Awareness**: SecureStore for token persistence

## 📦 Tech Stack

- **Framework**: React Native 0.76 + Expo 52
- **Language**: TypeScript 5.3.3 (strict mode)
- **Navigation**: Expo Router v4 (file-based routing)
- **State**: Zustand (auth + ticket state)
- **Storage**: expo-secure-store (encrypted)
- **API**: Axios with auto JWT injection

## 🚀 Quick Start

```bash
cd apps/mobile/mobile-valet
npm install
npm run start
```

### Run on iOS
```bash
npm run ios
```

### Run on Android
```bash
npm run android
```

### Run on Web
```bash
npm run web
```

## 📁 Project Structure

```
src/
  app/
    _layout.tsx      # Root + auth hydration
    index.tsx        # Ticket assignments list (main screen)
    login.tsx        # Valet login
  lib/
    api.ts           # Axios client + auto JWT injection + token management
    auth.ts          # SecureStore user persistence helpers
    store.ts         # Zustand stores (auth, ticket filter)
app.config.ts        # Expo configuration
tsconfig.json        # TypeScript (strict mode)
```

## 🔐 Authentication

1. **Login**: Email + password → `/auth/login`
2. **Token Storage**: SecureStore (encrypted)
3. **Auto-Inject**: Axios interceptor adds `Authorization: Bearer {token}`
4. **401 Handling**: Auto-logout, redirect to login
5. **Root Hydration**: Load stored user on app start

## 📱 Screens

### Login (`/login`)
- Email field (pre-filled: `valet@parkit.local`)
- Password field (pre-filled: `password123`)
- Demo credentials for testing

### Assigned Tickets (`/`)
- **FlatList** of active assignments
- **Ticket Card** per assignment:
  - Vehicle plate (monospace font)
  - Status badge (color-coded)
  - Location (with pin emoji)
  - Action buttons (context-based)
- **Pull-to-refresh**
- **Status buttons:**
  - `assigned` → "START MOVE" (blue)
  - `in-transit` → "COMPLETE" (green)
  - `completed` → ✓ badge (gray)
- **Logout** button (top-right)

## 🔌 API Endpoints (to implement)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Valet login |
| GET | `/valets/{id}/assignments` | Fetch assigned tickets |
| PATCH | `/assignments/{id}/status` | Update ticket status |
| POST | `/assignments/{id}/damage-report` | Submit damage report |

## 🎨 Color Scheme

- Primary: `#0066FF` (blue)
- Success: `#10B981` (green)
- Warning: `#FFA500` (orange)
- Error: `#EF4444` (red)
- Background: `#F9FAFB` (light gray)

## 🔐 Environment Variables

```
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_API_TIMEOUT=10000
```

## 📋 TODO

- [ ] Fetch real assignments from API
- [ ] WebSocket for real-time updates
- [ ] GPS tracking for in-transit vehicles
- [ ] Damage report photo capture
- [ ] Push notifications for new assignments
- [ ] Offline queue for status updates
- [ ] EAS builds for iOS/Android

## 🚀 Deployment

### EAS Build (production)
```bash
eas build --platform ios --auto-submit
eas build --platform android --auto-submit
```

### Development
```bash
npm run start  # Metro bundler
```

## 📄 License

MIT – ParKit © 2025
