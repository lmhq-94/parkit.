# API Developer Notes

Notes for developing and running the API at `apps/api`.

## Quick start (local)

1. Install dependencies (from repo root):

```bash
npm install
npm --prefix apps/api install
```

2. Set environment variables (see [env.md](env.md)).

3. Run migrations (see [bd.md](bd.md) for details):

```bash
npm --prefix apps/api run prisma migrate deploy
# or during development
npm --prefix apps/api run prisma migrate dev
```

4. Start dev server:

```bash
npm --prefix apps/api run dev
```

## Key conventions

- JWT tokens must include `userId`, `role`, and optionally `companyId` (omitted for SUPER_ADMIN).
- Controllers expect `req.user.companyId` for company-scoped routes (populated by auth middleware or by the `x-company-id` header for SUPER_ADMIN).
- **SUPER_ADMIN:** Can access all companies. For company-scoped endpoints (users, parkings, etc.) must send the header `x-company-id: <companyId>` to specify which company to act on.

## OpenAPI

- [openapi.yaml](openapi.yaml) is the API OpenAPI spec. Use it with Swagger UI or Redoc.
