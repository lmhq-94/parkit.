# Project Documentation

This `docs/` folder contains high-level documentation for the Parkit monorepo.

## Contents

- [`api.md`](api.md) – API developer notes and quickstart.
- [`architecture.md`](architecture.md) – Architecture notes and backend overview.
- [`bd.md`](bd.md) – Base de datos: esquema Prisma y migraciones. Incluye diagrama ER [bd.drawio](bd.drawio).
- [`ci-cd.md`](ci-cd.md) – CI/CD pipeline, GitHub Actions, and local replication.
- [`env.md`](env.md) – Required environment variables and examples.
- [`mobile.md`](mobile.md) – Mobile apps (Expo, client & valet) quickstart.
- [`openapi.yaml`](openapi.yaml) – OpenAPI specification for the HTTP API.

## How to use

- Edit the Markdown files here to document features, runbooks, and guides.
- Keep generated documentation (site builds, compiled assets) out of git.

To preview or publish a docs site, you can scaffold a static docs site generator (Docusaurus, MkDocs, or similar) and point it at this folder.
