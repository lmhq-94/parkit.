# Architecture

This folder contains high-level architecture notes for the backend and platform.

The **canonical SQL schema** is maintained in `docs/bd/parkit.sql`, which mirrors the domain modeled in Prisma.

Overview:

- Backend: Express + TypeScript + Prisma (Postgres)
- Modules: audit, auth, bookings, clients, companies, notifications, parkings, tickets, users, valets, vehicles
- Multi-tenant: `companyId` is used to scope most resources.

Migrations:

- Prisma schema and migrations are in `apps/api/prisma/`.
- To apply migrations locally: `npm --prefix apps/api run prisma migrate dev`.
