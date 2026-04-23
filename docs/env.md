# Environment Variables

List of environment variables used by the API and mobile apps.

## API Variables

### Required (examples)

- `DATABASE_URL` – Postgres connection string for Prisma (e.g. `postgresql://user:pass@host:5432/dbname`).
- `JWT_SECRET` – Secret used to sign JWTs (keep private).
- `PORT` – Port for the API (default: `3000`).

### Optional / framework

- `NODE_ENV` – `development` | `production`.

### Example

Create a `.env` file at `apps/api/.env` with:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/parkit
JWT_SECRET=super-secret
PORT=3000
NODE_ENV=development
```

## Mobile App Variables

### Mobile Valet App

Create a `.env` file at `apps/mobile/mobile-valet/.env` with:

```
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_API_TIMEOUT=10000
```

### Mobile Customer App

Create a `.env` file at `apps/mobile/mobile-customer/.env` with:

```
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

### OAuth Variables (Mobile Apps)

For OAuth integration (Google, Apple, Microsoft), add to mobile app `.env`:

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
```

See [OAUTH_SETUP.md](../apps/mobile/mobile-valet/docs/OAUTH_SETUP.md) for detailed OAuth configuration.

## Web App Variables

Create a `.env.local` file at `apps/web/.env.local` with:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

## Security

- Do not commit `.env` or any secrets. Ensure `.env` is in `.gitignore`.
- Use different secrets for development and production.
- Rotate secrets regularly.
- Never commit OAuth client secrets to version control.
