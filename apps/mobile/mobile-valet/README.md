# Parkit Valet – React Native Mobile App

Ultra-minimal valet operations interface for real-time parking management.

This is part of the Parkit monorepo. For the main project overview, see the [root README.md](../../README.md).

For other apps in this monorepo:
- [Backend API](../../apps/api/README.md)
- [Web Admin Dashboard](../../apps/web/README.md)
- [Mobile Customer App](../mobile-customer/README.md)

## 🎯 Features

- **Multi-role Support**: Receptionist and Driver workflows
- **Ticket Management**: Receive, park, and return vehicles
- **Real-time Sync**: Live ticket updates and status changes
- **Vehicle Recognition**: Card scanning for vehicle details
- **Push Notifications**: Real-time alerts for queue updates
- **Location Services**: GPS-based parking selection
- **Profile Management**: Staff profile with avatar, license types, and expiry
- **Multi-language Support**: i18n with Spanish and English
- **Dark/Light Mode**: Theme support with accessibility options
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

Tras añadir módulos nativos (`react-native-keyboard-controller`, `react-native-reanimated`, etc.), hace falta **reconstruir** el cliente nativo: `npx expo prebuild --clean` o `npm run generate-native`, luego `npm run ios` / `npm run android`. Con Metro en desarrollo, reinicia con caché limpia si algo falla: `npx expo start -c`.

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

### Home (`/home`)
- Dashboard with role-specific actions
- Driver: Parking queue and delivery queue management
- Receptionist: Receive and return vehicle workflows
- Parking location selection with GPS
- Queue alert notifications
- Settings and logout

### Profile (`/profile`)
- Staff profile management
- Avatar upload (camera or gallery)
- Role selection (Receptionist/Driver)
- License type selection (for drivers)
- License expiry date picker
- Personal information (name, email, phone)

### Receive (`/receive`)
- Vehicle entry workflow
- Card scanning for vehicle details
- Manual vehicle entry (brand, model, color, plate)
- Damage reporting with photos
- Key assignment

### Return/Pickup (`/return-pickup`)
- Vehicle return workflow
- Ticket lookup by plate or ticket number
- Damage verification
- Key handoff confirmation

### Tickets (`/tickets`)
- Active tickets list
- Queue management (parking/delivery)
- Ticket status updates
- Ticket details view

### Settings (`/settings`)
- Language selection
- Theme toggle (dark/light)
- Accessibility options (text scale, reduce motion)
- App information

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Staff login |
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update user profile |
| GET | `/valets/me` | Get valet staff info |
| PATCH | `/valets/me` | Update valet staff info |
| POST | `/valets/me/presence` | Update presence status |
| GET | `/parkings` | List parking locations |
| GET | `/tickets` | List tickets |
| POST | `/tickets` | Create new ticket |
| PATCH | `/tickets/:id` | Update ticket status |
| GET | `/notifications/user/:id/unread-count` | Get unread notification count |
| PATCH | `/notifications/:id/read` | Mark notification as read |

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

- [ ] Enhanced damage reporting with multiple photos
- [ ] Offline queue for status updates
- [ ] Advanced ticket filtering and search
- [ ] Barcode/QR code scanning for tickets
- [ ] Voice commands for hands-free operation
- [ ] Analytics dashboard for valet performance
- [ ] Integration with payment processing

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
