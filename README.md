# Parkit

parkit. is a **B2B2C parking and valet management platform** designed for companies
that operate parking facilities, valet services, or hybrid parking models.

The platform connects **companies**, **customers**, and **valet staff**
through a unified ecosystem composed of a backend API, a web-based
administration dashboard, and mobile applications.

Its primary goal is to **modernize parking operations**, **reduce operational friction**,
improve the **end-customer experience**, and give companies **full control**
over their parking infrastructure, branding, and users.

---

## Key Concepts

### Companies

Organizations that operate or manage parking facilities and valet services.

Each company acts as an isolated tenant and can define:

- One or more parking locations
- Parking types (open, covered, tower, underground, elevator, etc.)
- Capacity, slot types, and operational rules
- Booking requirements (booking vs. walk-in)
- Company branding (logo, colors, themes)
- Language preferences and UI themes
- Customers and valet staff associated with the company

---

### Customers

End users who receive parking services or benefits through a company.

Customers can:

- Register and manage one or multiple vehicles
- Store vehicle characteristics and dimensions
- Make bookings when required by a parking facility
- Receive tickets and notifications
- Interact with the system mainly through the mobile app

Customers do not manage infrastructure, only their personal usage.

---

### Valets

Operational staff responsible for handling vehicles and executing parking operations.

Valets:

- Are linked to a company
- Can be assigned to parkings dynamically
- Participate in ticket workflows (receive, park, deliver)
- Can report damages and operational events
- Operate mainly through a mobile-focused experience

---

### Roles and permissions

| Role | Scope | Description |
| ------ | ------- | ------------- |
| **SUPER_ADMIN** | Global | Can manage all companies and all data. No company assigned; when acting on a specific company must send the `x-company-id` header. Only role that can list all companies (GET `/companies`) and create companies (POST `/companies`). |
| **ADMIN** | Single company | Can manage only the company they belong to (users, parkings, clients, etc.). |
| **STAFF** | Single company | Operational access within the company (e.g. valets). |
| **CUSTOMER** | Single company | End users (bookings, tickets, vehicles). |

Super admin users are created via **seed** or internal tooling (e.g. `superadmin@parkit.cr` in seed). For API calls that require a company context (e.g. list users of a company), SUPER_ADMIN must send the header **`x-company-id: <companyId>`**.

---

## Core Features

- Multi-company (multi-tenant) architecture
- Company and parking management
- Support for multiple parking types and rules
- Slot-based and capacity-based parking models
- Vehicle registration (optional dimensions, manual entry)
- Optional booking system
  - Booking-based or no-booking parkings
- Ticket lifecycle management
- Valet assignment and traceability
- Damage reporting with photo evidence
- Audit logs for critical operations
- Notification system
  - Push
  - SMS
  - Email
- Multi-language support
- Light / Dark mode
- Company-specific branding and theming

---

## Applications

parkit. is structured as a **multi-application platform**:

### Backend API

The core of the system:

- Business logic
- Database access
- Authentication and authorization
- Validation and domain rules
- Integrations with external services

---

### Web App

Company-facing administration dashboard.

Used to:

- Manage parkings and parking slots
- Manage customers and valet staff
- Configure branding and company preferences
- Define operational rules
- Monitor activity and performance

---

### Mobile App

Mobile-first experience optimized for operational usage.

Includes:

- Customer-focused flows
  - Vehicle management
  - Bookings
  - Tickets
- Valet-focused flows
  - Active tickets
  - Assignments
  - Damage reporting
  - Status changes

---

## Architecture

This repository follows a **monorepo architecture** to keep all applications
and shared logic aligned.

```text
parkit/
├── apps/
│   ├── api/                           # Backend API (Express + TypeScript + Prisma)
│   │   ├── src/
│   │   │   ├── app.ts                # Express app setup
│   │   │   ├── server.ts             # Server entry point
│   │   │   ├── config/
│   │   │   │   └── env.ts            # Environment configuration
│   │   │   ├── modules/              # Business logic modules
│   │   │   │   ├── audit/            # Audit logging
│   │   │   │   ├── auth/             # Authentication & JWT
│   │   │   │   ├── bookings/         # Booking management
│   │   │   │   ├── clients/          # Customer management
│   │   │   │   ├── companies/        # Company/tenant management
│   │   │   │   ├── notifications/    # Notification system
│   │   │   │   ├── parkings/         # Parking facilities
│   │   │   │   ├── tickets/          # Parking tickets
│   │   │   │   ├── users/            # User management
│   │   │   │   ├── valets/           # Valet staff
│   │   │   │   └── vehicles/         # Vehicle registry
│   │   │   ├── shared/
│   │   │   │   ├── middleware/       # Auth & validation middleware
│   │   │   │   ├── utils/            # Helper functions
│   │   │   │   └── prisma.ts         # Prisma client
│   │   │   └── types/
│   │   │       └── express.d.ts      # Express request types
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database schema
│   │   │   └── migrations/           # Database migrations
│   │   ├── dist/                     # Compiled JavaScript (generated)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .eslintrc.cjs
│   ├── web/                          # Web admin dashboard (Next.js)
│   └── mobile/                       # Mobile apps (React Native)
│       ├── mobile-customer/            # Customer-facing app
│       └── mobile-valet/             # Valet/operations app
├── packages/
│   └── shared/                        # Shared types, UI components & utilities
├── docs/
│   ├── README.md                      # Documentation index
│   ├── api.md                         # API developer notes & quickstart
│   ├── architecture.md                # Architecture overview
│   ├── bd.md                          # Base de datos (esquema y migraciones)
│   ├── ci-cd.md                       # CI/CD pipeline details
│   ├── env.md                         # Environment variables reference
│   ├── mobile.md                      # Mobile apps (Expo) quickstart
│   └── openapi.yaml                   # OpenAPI specification
├── tsconfig.json                      # Root TypeScript config
├── package.json                       # Root package manifest
├── package-lock.json
├── .gitignore
├── LICENSE
└── README.md                          # This file
```

**Key files:**

- `apps/api/src/app.ts` – Express app initialization
- `apps/api/prisma/schema.prisma` – Prisma database schema
- `apps/api/.eslintrc.cjs` – Linting configuration
- `docs/openapi.yaml` – API specification
- `apps/api/prisma/schema.prisma` – Database schema (Prisma)

---

## Technology Stack

### Backend

- **Node.js** – Runtime environment
- **TypeScript** – Strongly typed backend development
- **Express** – HTTP server and API foundation
- **Prisma ORM** – Type-safe database access and migrations
- **PostgreSQL** – Relational database
- **Neon** – Serverless PostgreSQL hosting

### Database

- **PostgreSQL (Neon)**
  - UUID-based primary keys
  - Strong relational model
  - Enum-based domain constraints
  - Designed for multi-tenant company usage

### Web

- **Next.js** – React-based web application
- **TypeScript**
- **Modern UI system** (TBD)
- Company administration dashboard

### Mobile

- **React Native**
- **TypeScript**
- Separate UX flows for:
  - Customers
  - Valet staff

### Tooling & Architecture

- **Monorepo structure**
- **Shared packages** for types and utilities
- **Environment-based configuration**
- **GitHub** for version control

---

## Project Status

🚧 **Early development**

The project is currently focused on:

- Database design
- Backend foundations
- Core system architecture
- Developer experience and scalability

Features and applications will be incrementally built following
a backend-first approach.

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** (or Neon account for serverless hosting)
- Git

### Local Setup

1. Clone the repository:

```bash
git clone https://github.com/Paradoxia-Labs/parkit.git
cd parkit
```

1. Install dependencies:

```bash
npm install
npm --prefix apps/api install
```

1. Configure environment variables (see `docs/env.md`):

```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your DATABASE_URL and JWT_SECRET
```

1. Run database migrations:

```bash
npm --prefix apps/api run prisma migrate deploy
```

1. Start the API in development mode:

```bash
npm --prefix apps/api run dev
```

The API will be available at `http://localhost:3000`.

---

## Development

### Key directories

- `apps/api/` – Express backend API
- `apps/web/` – Next.js web dashboard
- `apps/mobile/` – React Native mobile app
- `packages/shared/` – Shared types and utilities
- `docs/` – Documentation (architecture, API, env vars, etc.)

### Available commands

**API**:

```bash
cd apps/api
npm run dev          # Start development server (ts-node-dev)
npm run build        # Build TypeScript
npm run start        # Run compiled JavaScript
npm run lint         # Run ESLint with autofix
npm run prisma migrate dev  # Create and apply migrations interactively
npm run prisma studio      # Open Prisma Studio GUI
```

**Root**:

```bash
npm install          # Install all dependencies
npm run build        # Build all packages
npm run lint         # Lint all packages
```

### Code style & Quality

- **TypeScript** – Strict mode enabled
- **ESLint** – Enforces code quality
- **Prettier** – Auto-formats code
- **No `any` types** – Use explicit types or DTO types

---

## Architecture Overview

The system uses a **multi-tenant** design:

- **Companies** – organizations that manage parking facilities
- **Customers** – end users who book or use parking
- **Valets** – staff who handle parking operations

All data is scoped by `companyId` to ensure isolation and multi-tenancy.

### Authentication

- JWT-based authentication
- Required JWT claims: `userId`, `role`, `companyId`
- Populated by `requireAuth` middleware on protected routes

### Database Schema

- PostgreSQL with Prisma ORM
- Migrations managed in `apps/api/prisma/migrations/`
- Current schema: `apps/api/prisma/schema.prisma`

---

## Documentation

All project documentation is in the `docs/` folder:

- `docs/README.md` – Documentation index
- `docs/api.md` – API developer notes and quickstart
- `docs/architecture.md` – System architecture and backend overview
- `docs/bd.md` – Base de datos (esquema y migraciones)
- `docs/ci-cd.md` – CI/CD pipeline (GitHub Actions)
- `docs/env.md` – Environment variables reference
- `docs/mobile.md` – Mobile apps quickstart (client & valet)
- `docs/openapi.yaml` – OpenAPI spec

---

## Contributing

We welcome contributions! Please:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m "feat: describe your changes"`
3. Ensure code passes linting and builds: `npm run build && npm run lint`
4. Push and open a pull request against `development` branch
5. Include a clear description of changes and rationale

### Commit message conventions

- `feat:` – new feature
- `fix:` – bug fix
- `refactor:` – code refactor
- `docs:` – documentation only
- `chore:` – dependencies, tooling

---

## License

[Add license here – e.g., MIT, Apache 2.0, proprietary]

---

## Support & Contact

For questions, issues, or feedback:

- Open an issue on GitHub
- Contact: Luis Herrera Quesada

---

## Author

Luis Herrera Quesada
