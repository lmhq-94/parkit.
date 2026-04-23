# Parkit Client Mobile App

Expo-based React Native app for Parkit customers to manage bookings and tickets.

This is part of the Parkit monorepo. For the main project overview, see the [root README.md](../../README.md).

For other apps in this monorepo:
- [Backend API](../../apps/api/README.md)
- [Web Admin Dashboard](../../apps/web/README.md)
- [Mobile Valet App](../mobile-valet/README.md)

## Features

- 🔐 JWT authentication
- 🚗 Vehicle management
- 📅 Booking management
- 🎫 Active ticket tracking
- 👤 Profile management
- 🔔 Real-time notifications (ready)
- 📍 GPS integration (ready)

## Tech Stack

- **Framework:** React Native with Expo
- **Router:** Expo Router (file-based routing)
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Storage:** AsyncStorage
- **UI Components:** Native (React Native)

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

```bash
cd apps/mobile/mobile-customer
npm install
```

### Environment Setup

Create `.env.local`:

```
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

### Development

```bash
npm run start

# Then press:
# i - iOS simulator
# a - Android emulator
# w - Web browser
```

### Build

```bash
# Development build
expo build --platform ios --type simulator
expo build --platform android --type apk

# Production
eas build --platform ios
eas build --platform android
```

## Project Structure

```
src/
├── app/                        # Expo Router pages
│   ├── (tabs)/                # Tabbed navigation
│   │   ├── index.tsx          # Profile tab
│   │   ├── vehicles.tsx       # Vehicles tab
│   │   ├── bookings.tsx       # Bookings tab
│   │   ├── tickets.tsx        # Tickets tab
│   │   └── _layout.tsx        # Tab layout
│   ├── login.tsx              # Login screen
│   └── _layout.tsx            # Root layout & auth check
├── lib/
│   ├── api.ts                 # Axios client
│   ├── auth.ts                # Auth helpers & AsyncStorage
│   └── store.ts               # Zustand stores
```

## Key Features

### Authentication
- JWT-based with token storage in AsyncStorage
- Auto-token injection in API requests
- Auto-redirect to login if token expires

### Navigation
- Tab-based navigation (Profile, Vehicles, Bookings, Tickets)
- Deep linking support
- Stack + Tabs combination

### Data Persistence
- User & token stored in AsyncStorage
- Hydration on app launch

### State Management

```typescript
// Auth store
const { user, token, setUser, logout, hydrate } = useAuthStore();

// Booking store
const { selectedVehicleId, selectVehicle } = useBookingStore();
```

## API Integration

All API calls use the configured Axios client:

```typescript
import apiClient from "@/lib/api";

// Login
const response = await apiClient.post("/auth/login", { email, password });

// Get bookings
const bookings = await apiClient.get("/bookings");

// Update ticket
await apiClient.patch("/tickets/123", { status: "DELIVERED" });
```

## Styling

Uses React Native's `StyleSheet` for performance. Color scheme:
- Primary: `#0066FF`
- Success: `#34C759`
- Warning: `#FF9500`
- Error: `#FF3B30`
- Background: `#f5f5f5`

## Development Tips

### Debugging

```bash
# Expo DevTools
# Press 'j' in terminal to open debugger

# React Native Debugger
npm install -g react-native-debugger
```

### Hot Reload

- Edit any file → auto-reload
- Ctrl+Shift+R to manually reload
- Ctrl+D to access menu

### Testing

```bash
npm run test
```

## Deployment

### EAS (Recommended)

```bash
npm install -g eas-cli
eas login
eas build
eas submit
```

### Manual Build

```bash
# iOS (requires macOS + Xcode)
expo run:ios

# Android
expo run:android
```

## Future Enhancements

- [ ] Push notifications (Expo Notifications)
- [ ] GPS tracking (Expo Location)
- [ ] Camera for damage reports (Expo Camera)
- [ ] Payment integration (Stripe, EasyPost)
- [ ] Analytics (Segment)
- [ ] Error tracking (Sentry)

## Support

For issues or questions, contact the development team.
