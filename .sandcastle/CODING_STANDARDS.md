# Coding Standards

These standards apply to Bonsai Tracker changes reviewed by Sandcastle.

## Style

- Use TypeScript with strict types. Avoid `any`, unsafe casts, and unchecked nullable values.
- Keep UI copy in German unless a technical identifier or external service requires English.
- Use the existing Next.js Pages Router structure: `pages/`, `pages/api/`, `components/`, `lib/`, `styles/`.
- Do not introduce the App Router or a new UI framework.
- Prefer small, explicit functions over clever compact code. Avoid nested ternaries.
- Keep naming conventional: camelCase for variables/functions, PascalCase for React components and exported types.
- Use existing local helpers and patterns before adding abstractions.

## Testing

- Add or update tests in `tests/` for changed behavior, validation, auth, ownership, storage, or API contracts.
- Run `npm test` before committing.
- Run `npm run typecheck` before committing.
- Run `npm run build` for changes that affect Next.js pages, API routes, Prisma generation, configuration, or runtime behavior.
- Test names should describe the expected behavior, not implementation details.

## Architecture

- Respect the project stack: Next.js 15 Pages Router, React 19, Prisma, PostgreSQL, Tailwind CSS 3, DaisyUI 5, NextAuth v4.
- Keep API route responses, status codes, DTOs, and validation rules consistent with `SPEC.md` and existing tests.
- Preserve auth and ownership checks on all user-owned business data.
- Never commit real secrets from `.env`, `.env.local`, Codex auth files, or logs.
- Use Prisma for relational data access. Avoid raw SQL unless there is a clear reason and it is parameterized.
- Treat uploads and media paths carefully. Do not expose private storage directly when `/api/media/*` should mediate access.
- Bonsais are soft-deleted; sub-entries are physically deleted unless the relevant spec explicitly changes this.
- Keep local beta behavior compatible with the documented Supabase Storage and healthcheck decisions.
- Keep changes scoped to the assigned issue. Do not perform broad refactors unless required by the task.
