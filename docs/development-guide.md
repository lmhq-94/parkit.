# Development Guide

Guide for new developers joining the Parkit project.

## Overview

Parkit is a B2B2C parking and valet management platform built as a monorepo with:
- Backend API (Node.js/Express/TypeScript)
- Web Dashboard (Next.js)
- Mobile Apps (React Native/Expo)

## Prerequisites

### Required

- **Node.js** 18+ and npm
- **Git**
- **PostgreSQL** (or Neon account for serverless hosting)
- **Code Editor**: VS Code recommended

### Recommended

- **VS Code Extensions**:
  - ESLint
  - Prettier
  - Prisma
  - Draw.io Integration (for viewing bd.drawio)
  - Expo Tools (for mobile development)

- **Mobile Development** (if working on mobile apps):
  - Xcode (for iOS) - macOS only
  - Android Studio (for Android)
  - Expo CLI: `npm install -g expo-cli`

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/your-org/parkit.git
cd parkit
```

### 2. Install Dependencies

```bash
# Root dependencies
npm install

# API dependencies
npm --prefix apps/api install

# Web dependencies
npm --prefix apps/web install

# Mobile valet dependencies
npm --prefix apps/mobile/mobile-valet install

# Mobile customer dependencies
npm --prefix apps/mobile/mobile-customer install
```

### 3. Configure Environment

#### API

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/parkit
JWT_SECRET=dev-secret-change-in-production
PORT=3000
NODE_ENV=development
```

#### Web

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXTAUTH_SECRET=dev-secret
NEXTAUTH_URL=http://localhost:3000
```

#### Mobile Valet

```bash
cp apps/mobile/mobile-valet/.env.example apps/mobile/mobile-valet/.env
```

Edit `apps/mobile/mobile-valet/.env`:
```bash
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_API_TIMEOUT=10000
```

#### Mobile Customer

```bash
cp apps/mobile/mobile-customer/.env.example apps/mobile/mobile-customer/.env
```

Edit `apps/mobile/mobile-customer/.env`:
```bash
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

### 4. Setup Database

```bash
cd apps/api
npm run prisma migrate deploy
```

### 5. Start Development Servers

#### API (Terminal 1)

```bash
cd apps/api
npm run dev
```

API will be available at `http://localhost:3000`

#### Web (Terminal 2)

```bash
cd apps/web
npm run dev
```

Web will be available at `http://localhost:3000`

#### Mobile Valet (Terminal 3)

```bash
cd apps/mobile/mobile-valet
npm run start
```

Follow Expo CLI instructions to open in simulator/emulator.

#### Mobile Customer (Terminal 4)

```bash
cd apps/mobile/mobile-customer
npm run start
```

Follow Expo CLI instructions to open in simulator/emulator.

## Project Structure

```
parkit/
├── apps/
│   ├── api/              # Backend API
│   │   ├── src/
│   │   │   ├── modules/  # Business logic modules
│   │   │   └── shared/   # Shared utilities
│   │   ├── prisma/       # Database schema & migrations
│   │   └── package.json
│   ├── web/              # Web dashboard
│   │   ├── src/
│   │   │   ├── app/      # Next.js App Router
│   │   │   └── lib/      # Utilities
│   │   └── package.json
│   └── mobile/           # Mobile apps
│       ├── mobile-valet/     # Valet operations app
│       │   ├── src/
│       │   │   ├── app/      # Expo Router pages
│       │   │   ├── lib/      # Utilities
│       │   │   └── components/
│       │   └── package.json
│       └── mobile-customer/  # Customer app
│           ├── src/
│           │   ├── app/
│           │   └── lib/
│           └── package.json
├── packages/
│   └── shared/           # Shared types & utilities
├── docs/                 # Documentation
└── package.json          # Root package
```

## Key Concepts

### Multi-Tenancy

The platform uses a multi-tenant architecture where:
- **Companies** are isolated tenants
- Most data is scoped by `companyId`
- SUPER_ADMIN can access all companies
- Other roles are scoped to their assigned company

### Roles

- **SUPER_ADMIN** - Global admin, can manage all companies
- **ADMIN** - Company admin, manages their assigned company
- **STAFF** - Operational staff (valets, receptionists)
- **CUSTOMER** - End users

### Authentication

- JWT-based authentication
- Tokens include: `userId`, `role`, `companyId`
- API middleware validates tokens and populates `req.user`
- Mobile apps use SecureStore for token persistence

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Edit code in appropriate app directory
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation if needed

### 3. Test Locally

```bash
# Run linting
npm run lint

# Run tests
npm run test

# Build to verify
npm run build
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: description of your changes"
```

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactor
- `docs:` - Documentation only
- `chore:` - Dependencies, tooling

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create pull request against `development` branch.

## Code Style

### TypeScript

- Strict mode enabled
- No `any` types - use explicit types or DTO types
- Use interfaces for object shapes
- Use type aliases for unions/primitives

### ESLint

- Configured in each app
- Run `npm run lint` to check
- Run `npm run lint:fix` to auto-fix

### Prettier

- Auto-formats code
- Runs on pre-commit hooks
- Configure in `.prettierrc` if needed

## Common Tasks

### Adding a New API Endpoint

1. Create controller in `apps/api/src/modules/[module]/controller.ts`
2. Add business logic in `service.ts`
3. Define routes in `routes.ts`
4. Add validation in `validation.ts`
5. Register routes in `apps/api/src/app.ts`
6. Update Prisma schema if needed
7. Create migration: `npm run prisma migrate dev --name description`

### Adding a New Web Page

1. Create folder in `apps/web/src/app/dashboard/[page-name]/`
2. Create `page.tsx`
3. Add route to `DashboardSidebar` navigation
4. Implement API calls using `apiClient`

### Adding a New Mobile Screen

1. Create file in `apps/mobile/mobile-valet/src/app/[screen-name].tsx`
2. Add navigation in existing screens
3. Implement API calls using `api`
4. Add i18n keys if needed

### Database Schema Changes

1. Edit `apps/api/prisma/schema.prisma`
2. Create migration: `npm run prisma migrate dev --name description`
3. Test migration locally
4. Commit migration files

## Testing

### API Testing

```bash
cd apps/api
npm run test
```

### Web Testing

```bash
cd apps/web
npm run test
```

### Mobile Testing

```bash
cd apps/mobile/mobile-valet
npm run test
```

## Debugging

### API

- Use VS Code debugger
- Add breakpoints in TypeScript files
- Check logs: `pm2 logs parkit-api` (if using PM2)

### Web

- Use VS Code debugger
- Use React DevTools
- Check browser console

### Mobile

- Use Expo DevTools
- Press `j` in terminal to open debugger
- Use React Native Debugger
- Check Metro bundler logs

## Useful Commands

### API

```bash
cd apps/api
npm run dev          # Start dev server
npm run build        # Build TypeScript
npm run start        # Run compiled JS
npm run lint         # Run ESLint
npm run prisma studio # Open Prisma Studio
npm run prisma migrate dev # Create migration
npm run prisma migrate deploy # Apply migrations
```

### Web

```bash
cd apps/web
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript
```

### Mobile

```bash
cd apps/mobile/mobile-valet
npm run start        # Start Expo
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run web          # Run in browser
npx expo prebuild    # Generate native code
```

## Documentation

- [README.md](../README.md) - Main project overview
- [api.md](api.md) - API development notes
- [architecture.md](architecture.md) - Architecture overview
- [bd.md](bd.md) - Database schema
- [env.md](env.md) - Environment variables
- [mobile.md](mobile.md) - Mobile apps quickstart
- [oauth.md](oauth.md) - OAuth configuration
- [deployment.md](deployment.md) - Deployment guide

## Getting Help

### Internal Resources

- Check existing code for patterns
- Read module-specific documentation
- Review similar implementations

### External Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express Documentation](https://expressjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)

### Asking Questions

1. Search existing GitHub issues
2. Check documentation
3. Ask in team communication channel
4. Create GitHub issue if it's a bug
5. Create discussion if it's a question

## Best Practices

### Code Quality

- Write clean, readable code
- Add comments for complex logic
- Follow existing patterns
- Keep functions small and focused
- Use meaningful variable names

### Performance

- Optimize database queries
- Use caching where appropriate
- Avoid unnecessary re-renders in React
- Lazy load components when needed

### Security

- Never commit secrets
- Validate all inputs
- Use parameterized queries (Prisma handles this)
- Implement proper authentication
- Follow OWASP guidelines

### Collaboration

- Write descriptive commit messages
- Update documentation with changes
- Review PRs thoroughly
- Be responsive to feedback
- Help others when possible

## Next Steps

After completing this guide:

1. Explore the codebase
2. Make a small change to understand the workflow
3. Read module-specific documentation
4. Join team communication channels
5. Start contributing to issues

Welcome to the Parkit team! 🚗
