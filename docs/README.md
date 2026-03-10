# Project Documentation

This `docs/` folder contains high-level documentation for the Parkit monorepo.

## Contents

- `architecture/` - architecture notes and backend overview.
- `bd/parkit.sql` - canonical SQL schema for the core domain.
- `openapi.yaml` - API OpenAPI specification for the HTTP contract.
- `api/` - API-specific developer notes and quickstart.
- `env.md` - required environment variables and examples.
- `ci-cd.md` - CI/CD pipeline, GitHub Actions, and local replication.

## How to use

- Edit the Markdown files here to document features, runbooks, and guides.
- Keep generated documentation (site builds, compiled assets) out of git.

To preview or publish a docs site, you can scaffold a static docs site generator (Docusaurus, MkDocs, or similar) and point it at this folder.
