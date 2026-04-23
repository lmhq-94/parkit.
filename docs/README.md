# Project Documentation

This `docs/` folder contains high-level documentation for the Parkit monorepo.

## Contents

- [`api.md`](api.md) – API developer notes and quickstart.
- [`architecture.md`](architecture.md) – Architecture notes and backend overview.
- [`bd.md`](bd.md) – Base de datos: esquema Prisma y migraciones. Incluye diagrama ER [bd.drawio](bd.drawio).
- [`ci-cd.md`](ci-cd.md) – CI/CD pipeline, GitHub Actions, and local replication.
- [`deployment.md`](deployment.md) – Deployment guide for all applications (API, Web, Mobile).
- [`development-guide.md`](development-guide.md) – Getting started guide for new developers.
- [`env.md`](env.md) – Required environment variables and examples.
- [`mobile.md`](mobile.md) – Mobile apps (Expo, client & valet) quickstart.
- [`oauth.md`](oauth.md) – OAuth configuration guide (Google, Apple, Microsoft).
- [`openapi.yaml`](openapi.yaml) – OpenAPI specification for the HTTP API.
- [`../apps/mobile/mobile-valet/docs/OAUTH_SETUP.md`](../apps/mobile/mobile-valet/docs/OAUTH_SETUP.md) – OAuth configuration guide for mobile apps.

## How to use

- Edit the Markdown files here to document features, runbooks, and guides.
- Keep generated documentation (site builds, compiled assets) out of git.

To preview or publish a docs site, you can scaffold a static docs site generator (Docusaurus, MkDocs, or similar) and point it at this folder.
