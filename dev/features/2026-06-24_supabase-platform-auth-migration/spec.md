# Spec: Supabase Platform and Social Login Migration

## Status

IMPLEMENTED

## Purpose/Goal

Consolidate Bonsai Tracker around a simpler managed platform setup while keeping early-stage operating costs low. The desired direction is to use Supabase as the central platform for database, storage, and potentially authentication, and to replace the current magic-link-first login experience with social login.

## Current Situation

1. The app currently uses Next.js Pages Router, TypeScript, Prisma, Tailwind, and NextAuth.
2. Authentication currently uses NextAuth with an email magic-link provider in [`lib/auth.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/auth.ts).
3. The Prisma schema already contains NextAuth-compatible `User`, `Account`, `Session`, and `VerificationToken` models in [`prisma/schema.prisma`](/Users/maius/Projekte/Bonsai-Tracker/prisma/schema.prisma).
4. Supabase is already present as a dependency and is used for upload storage via [`lib/storage/supabase.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/storage/supabase.ts).
5. Product data is relational and currently accessed server-side through Prisma.
6. The current magic-link flow creates friction for the intended audience because users must wait for an email, find it, understand that it replaces a password, and return to the app.
7. Magic-link deliverability is operationally fragile compared with OAuth login because email can land in spam or be delayed.
8. The project is still in an early MVP/beta phase and should avoid fixed monthly infrastructure cost until there are real users or a revenue model.

## Product Decision

The preferred product direction is:

1. Use social login, especially Google Login, as the primary login method.
2. Remove magic link from the primary user-facing login path.
3. Keep cost low during MVP/beta by using Supabase Free where acceptable.
4. Treat Supabase Pro as a later production-readiness step once the app has real usage, public launch pressure, paying users, or stronger availability requirements.
5. Avoid maintaining two separate database systems long term.
6. Prefer Supabase Postgres as the hosted Postgres database if the project is moved onto Supabase infrastructure.

## Functional Requirements

1. Users should be able to sign in with Google as the primary login option.
2. The login UI should no longer present magic link as the main authentication path.
3. Closed-beta gating must remain enforceable for social login users.
4. Social login must not allow new users to bypass the existing waitlist, allowlist, or capacity rules.
5. Existing user data must remain linked to the correct application user after any auth migration.
6. The app must avoid operating against two independent production databases.
7. Supabase-hosted Postgres may become the primary relational database while Prisma remains the server-side data access layer.
8. Supabase Auth may be adopted later if the team decides to consolidate authentication fully into Supabase.
9. Supabase Free may be used during MVP/beta, with a small keepalive job acceptable for development or early beta continuity.
10. If Supabase Free is used with real beta users, the operator must understand that the project can be paused for low activity and that production-grade guarantees are not included.
11. Regular database exports or backups must be planned before storing meaningful user data only in Supabase Free.

## Technical Constraints

1. Supabase is not a replacement for Postgres; it provides managed Postgres plus related platform services.
2. Prisma should remain the default data access layer unless a separate approved spec replaces it with direct Supabase client access and Row Level Security.
3. The current NextAuth schema already supports OAuth accounts through the `Account` model.
4. Adding Google Login through NextAuth is likely lower risk than immediately replacing NextAuth with Supabase Auth.
5. A full Supabase Auth migration would require replacing session handling, API authorization, client session usage, and user identity mapping.
6. The current API authorization helper [`lib/authz.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/authz.ts) depends on the current session model and must be updated if NextAuth is replaced.
7. Any auth migration must preserve ownership boundaries for bonsais, reminders, posts, comments, likes, and profile data.
8. Supabase Free can pause projects with low activity. This is acceptable for MVP/beta only, not as a final production reliability model.
9. `workflows/` must not be changed as part of this work.

## Recommended Roadmap

### Phase 1: Low-risk social login

1. Add Google provider to the existing NextAuth setup.
2. Apply the existing signup-gating rules to Google sign-ins.
3. Update the landing/login UI so Google is the primary sign-in action.
4. Remove or de-emphasize magic link from the visible UI.
5. Keep the existing Prisma user model and app data model unchanged.
6. Update privacy documentation for Google login.

### Phase 2: Supabase Postgres consolidation

1. Move the relational database to Supabase Postgres.
2. Keep Prisma and existing migrations as the application schema mechanism.
3. Ensure only one production Postgres database is authoritative.
4. Verify existing Supabase Storage integration still points to the intended project.
5. Document connection strings, migration process, backups, restore process, and environment variables.

### Phase 3: Operating model for MVP/beta

1. Continue with Supabase Free while the app has no meaningful revenue and only limited beta usage.
2. Add a small scheduled keepalive only for MVP/beta continuity, for example a harmless healthcheck or lightweight database read every 5-6 days.
3. Add a manual or scripted export process so beta data is not solely dependent on Free-tier project retention.
4. Track the decision point for upgrading to Supabase Pro.

### Phase 4: Optional Supabase Auth migration

1. Evaluate whether replacing NextAuth with Supabase Auth still provides enough benefit after Google Login and Supabase Postgres are already in place.
2. If approved, create a separate detailed migration spec.
3. Migrate auth only after user identity mapping, rollback behavior, session handling, API authorization, and account linking are fully specified.

## Acceptance Criteria

This backlog item is ready for implementation planning when:

1. The team confirms whether the first implementation step is NextAuth Google Login or direct Supabase Auth migration.
2. The team confirms whether magic link should be removed entirely from the UI or retained as a hidden/operator fallback.
3. The team confirms whether Supabase Postgres should become the production database before, after, or alongside Google Login.
4. The team accepts Supabase Free as an MVP/beta cost decision and records the upgrade trigger for Supabase Pro.
5. The team accepts that a keepalive job is allowed for MVP/beta but is not the long-term production reliability strategy.
6. A backup/export process is defined before meaningful beta data is stored only in Supabase Free.
7. Signup-gating behavior for social login is explicitly specified and testable.
8. Existing users can be migrated or linked without losing their bonsai, reminder, post, comment, like, or profile ownership.

## Out-of-Scope

1. Implementing Google Login in this backlog note.
2. Migrating the database in this backlog note.
3. Replacing NextAuth with Supabase Auth without a separate approved implementation plan.
4. Replacing Prisma with direct Supabase client access.
5. Building a billing or subscription model.
6. Guaranteeing production availability on Supabase Free.
7. Changing `workflows/`.

## Resolved Questions

1. The first implementation uses Google Login through existing NextAuth.
2. Apple Login is deferred; Google is sufficient for MVP/beta.
3. Existing magic-link users may continue using email login only when the fallback UI/env configuration is enabled.
4. Supabase Pro is triggered by public launch, paying users, meaningful stored user data, or unacceptable pause risk.
5. During active Free-tier beta operation, database exports should happen at least weekly and before migrations or larger releases.

## Review Notes

1. The current recommended path is incremental: Google Login through NextAuth first, Supabase Postgres consolidation second, Supabase Auth only if the platform-consolidation benefit is worth the additional migration risk.
2. Supabase Free is acceptable for an early MVP/beta with limited users and no revenue model, provided the team accepts the pause risk and keeps backups/exports.
3. Supabase Pro should be planned for public production usage, paying users, or any point where unexpected pausing is no longer acceptable.
