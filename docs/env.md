# Environment Variables

List of environment variables used by the API and how to set them.

## Required (examples)

- `DATABASE_URL` – Postgres connection string for Prisma (e.g. `postgresql://user:pass@host:5432/dbname`).
- `JWT_SECRET` – Secret used to sign JWTs (keep private).
- `PORT` – Port for the API (default: `3000`).

## Optional / framework

- `NODE_ENV` – `development` | `production`.

## Example

Create a `.env` file at `apps/api/.env` with:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/parkit
JWT_SECRET=super-secret
PORT=3000
NODE_ENV=development
```

## Security

- Do not commit `.env` or any secrets. Ensure `.env` is in `.gitignore`.
