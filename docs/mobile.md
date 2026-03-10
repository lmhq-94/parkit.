# Mobile Apps (Expo + React Native)

This project includes two Expo-based mobile apps under `apps/mobile/`:

- `mobile-client/` – Customer-facing app for end users.
- `mobile-valet/` – Valet/operations app for staff.

## Prerequisites

- Node.js and npm (see root `README.md`).
- Expo CLI (optional but recommended):

```bash
npm install -g expo-cli
```

## Running the customer app

From the repo root:

```bash
cd apps/mobile/mobile-client
npm install
npm run start        # or: npm run android / npm run ios / npm run web
```

## Running the valet app

From the repo root:

```bash
cd apps/mobile/mobile-valet
npm install
npm run start        # or: npm run android / npm run ios / npm run web
```

Both apps share types and UI components from the `@parkit/shared` package (`packages/shared`).

