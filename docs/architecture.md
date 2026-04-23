# Architecture

High-level architecture notes for the backend and platform.

## Overview

- **Backend:** Express + TypeScript + Prisma (Postgres)
- **Modules:** audit, auth, bookings, companies, customers, dashboard, notifications, parkings, payments, pushNotifications, tickets, users, valets, vehicles
- **Multi-tenant:** `companyId` is used to scope most resources.

## Schema and migrations

- The canonical schema is in `apps/api/prisma/schema.prisma`.
- Migrations live in `apps/api/prisma/migrations/`.
- To apply migrations locally: `npm --prefix apps/api run prisma migrate dev`.

For database details and schema reference, see [bd.md](bd.md).
