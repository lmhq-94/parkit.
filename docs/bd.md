# Base de datos

Referencia del esquema y migraciones de la base de datos del backend.

## Diagrama ER

Puedes abrir [bd.drawio](bd.drawio) en [draw.io](https://app.diagrams.net/) o en VS Code (extensión Draw.io) para ver el diagrama entidad-relación del schema. Incluye las tablas principales (Company, User, Client, Valet, Parking, Vehicle, Booking, Ticket, etc.) y sus relaciones.

## Esquema

- **Definición:** `apps/api/prisma/schema.prisma` (Prisma)
- **Motor:** PostgreSQL

El dominio está modelado con Prisma; el esquema define entidades, relaciones y alcance multi-tenant (`companyId` en la mayoría de tablas).

## Migraciones

- **Ubicación:** `apps/api/prisma/migrations/`
- **Aplicar en desarrollo:** `npm --prefix apps/api run prisma migrate dev`
- **Aplicar en producción:** `npm --prefix apps/api run prisma migrate deploy`

Asegúrate de tener `DATABASE_URL` configurado (ver [env.md](env.md)).

## Conexión

La API usa la variable de entorno `DATABASE_URL` para conectarse a Postgres. Sin ella, Prisma y el servidor no pueden arrancar.
