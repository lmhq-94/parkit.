# Parkit API

Backend API for Parkit parking management system.

This is part of the Parkit monorepo. For the main project overview, see the [root README.md](../../README.md).

For other apps in this monorepo:
- [Web Admin Dashboard](../web/README.md)
- [Mobile Valet App](../mobile/mobile-valet/README.md)
- [Mobile Customer App](../mobile/mobile-customer/README.md)

## Features

- 🔐 JWT-based authentication with role-based access control
- 🏢 Multi-tenant architecture (company isolation)
- 👥 User management (admin, staff, customers)
- 🅿️ Parking facility management
- 🚗 Vehicle registry
- 📅 Booking system
- 🎫 Ticket lifecycle management
- 👨‍💼 Valet staff management
- 💳 Payment processing
- 🔔 Notification system (push, SMS, email)
- 📊 Dashboard analytics
- 📝 Audit logging

## Tech Stack

- **Runtime:** Node.js 18+
- **Language:** TypeScript (strict mode)
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL (Neon)
- **Authentication:** JWT
- **Validation:** Custom middleware

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Neon account)

### Installation

```bash
cd apps/api
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/parkit
JWT_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=development
```

### Database Setup

```bash
# Run migrations
npm run prisma migrate deploy

# Or for development with interactive migration
npm run prisma migrate dev

# Open Prisma Studio (optional)
npm run prisma studio
```

### Development

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app.ts                  # Express app setup
├── server.ts               # Server entry point
├── config/
│   └── env.ts              # Environment configuration
├── modules/                # Business logic modules
│   ├── audit/              # Audit logging
│   ├── auth/               # Authentication & JWT
│   ├── bookings/           # Booking management
│   ├── companies/          # Company/tenant management
│   ├── customers/          # Customer management
│   ├── dashboard/          # Dashboard analytics
│   ├── notifications/      # Notification system
│   ├── parkings/           # Parking facilities
│   ├── payments/           # Payment processing
│   ├── pushNotifications/  # Push notification tokens
│   ├── tickets/            # Parking tickets
│   ├── users/              # User management
│   ├── valets/             # Valet staff
│   └── vehicles/           # Vehicle registry
├── shared/
│   ├── middleware/         # Auth & validation middleware
│   ├── utils/              # Helper functions
│   └── prisma.ts           # Prisma client
└── types/
    └── express.d.ts        # Express request types
prisma/
├── schema.prisma           # Database schema
└── migrations/             # Database migrations
```

## API Modules

### Core Modules

- **auth**: JWT authentication, login, logout
- **users**: User CRUD, profile management
- **companies**: Multi-tenant company management
- **customers**: Customer management
- **valets**: Valet staff management, presence tracking

### Operations Modules

- **parkings**: Parking locations, slots, configuration
- **vehicles**: Vehicle registry, characteristics
- **bookings**: Booking system, availability
- **tickets**: Ticket lifecycle, status updates
- **payments**: Payment processing, transactions

### Support Modules

- **notifications**: Push, SMS, email notifications
- **pushNotifications**: Push token management
- **dashboard**: Analytics and reporting
- **audit**: Audit logging for critical operations

## Authentication

### JWT Tokens

The API uses JWT tokens for authentication. Required claims:
- `userId`: User ID
- `role`: User role (SUPER_ADMIN, ADMIN, STAFF, CUSTOMER)
- `companyId`: Company ID (optional for SUPER_ADMIN)

### Role-Based Access Control

| Role | Scope | Description |
|------|-------|-------------|
| SUPER_ADMIN | Global | Can manage all companies. Must send `x-company-id` header for company-scoped operations. |
| ADMIN | Single company | Can manage only their assigned company. |
| STAFF | Single company | Operational access within the company. |
| CUSTOMER | Single company | End user access. |

### Authentication Flow

1. Client sends credentials to `/auth/login`
2. Server validates and returns JWT token
3. Client includes token in `Authorization: Bearer {token}` header
4. Middleware validates token and populates `req.user`
5. Protected routes check permissions based on role

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh JWT token

### Users

- `GET /users/me` - Get current user
- `PATCH /users/me` - Update current user
- `GET /users` - List users (admin only)
- `POST /users` - Create user (admin only)

### Companies

- `GET /companies` - List companies (SUPER_ADMIN only)
- `POST /companies` - Create company (SUPER_ADMIN only)
- `GET /companies/:id` - Get company details
- `PATCH /companies/:id` - Update company

### Parkings

- `GET /parkings` - List parkings
- `POST /parkings` - Create parking
- `GET /parkings/:id` - Get parking details
- `PATCH /parkings/:id` - Update parking

### Tickets

- `GET /tickets` - List tickets
- `POST /tickets` - Create ticket
- `GET /tickets/:id` - Get ticket details
- `PATCH /tickets/:id` - Update ticket status

### Valets

- `GET /valets/me` - Get current valet info
- `PATCH /valets/me` - Update valet info
- `POST /valets/me/presence` - Update presence status

### Notifications

- `GET /notifications/user/:id/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read

## Database

### Schema

The database schema is defined in `prisma/schema.prisma` using Prisma ORM.

Key entities:
- Company (multi-tenant root)
- User (authentication)
- Customer (end users)
- Valet (staff)
- Parking (locations)
- Vehicle (registry)
- Booking (reservations)
- Ticket (operations)
- Payment (transactions)
- Notification (alerts)

### Migrations

```bash
# Create a new migration
npm run prisma migrate dev --name migration_name

# Apply migrations in production
npm run prisma migrate deploy

# Reset database (development only)
npm run prisma migrate reset
```

## Development

### Available Commands

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Run compiled JavaScript
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run test         # Run tests
npm run prisma studio # Open Prisma Studio GUI
```

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- No `any` types - use explicit types or DTO types
- Follow existing module structure

### Adding a New Module

1. Create folder in `src/modules/`
2. Follow existing module structure:
   - `controller.ts` - Request handlers
   - `service.ts` - Business logic
   - `routes.ts` - Route definitions
   - `validation.ts` - Request validation
3. Register routes in `src/app.ts`
4. Add to Prisma schema if needed
5. Create migration

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `JWT_SECRET` | Yes | - | Secret for JWT signing |
| `PORT` | No | 3000 | API server port |
| `NODE_ENV` | No | development | Environment (development/production) |

## Security

- JWT tokens with expiration
- Role-based access control
- Input validation on all endpoints
- SQL injection prevention via Prisma ORM
- CORS configuration
- Rate limiting (recommended for production)
- Never commit `.env` or secrets

## Testing

```bash
npm run test
```

Tests should cover:
- Authentication flows
- Permission checks
- Business logic
- Edge cases

## Documentation

For detailed API documentation:
- [OpenAPI spec](../../docs/openapi.yaml)
- [API developer notes](../../docs/api.md)
- [Architecture overview](../../docs/architecture.md)
- [Database schema](../../docs/bd.md)
- [Environment variables](../../docs/env.md)

## License

MIT

## Support

For issues or questions, contact the development team.
