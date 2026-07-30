# AGENTS

## Pflicht vor jeder Aufgabe

Lies immer zuerst [workflows/README.md](/work/workflows/README.md).

Nutze danach zwingend den dort passenden Workflow und folge ihm vollstaendig:

- Feature, Aenderung, Bugfix: [workflows/feature-development.md](/work/workflows/feature-development.md)
- Produktionsproblem, akuter Fix: [workflows/hot-fix.md](/work/workflows/hot-fix.md)
- Refactoring, strukturelle Verbesserung mit Tests: [workflows/refactoring.md](/work/workflows/refactoring.md)

## Arbeitsregel

Ohne vorherige Workflow-Auswahl wird keine Aufgabe begonnen. Bei Unsicherheit entscheidet `workflows/README.md`.
Wenn die Zuordnung trotzdem unklar bleibt, wird standardmaessig [workflows/feature-development.md](/work/workflows/feature-development.md) verwendet.

`workflows/` ist zentral vorgegeben und wird nicht geaendert, ausser die Aufgabe verlangt das explizit.

## Projekt kurz

- Stack: Next.js Pages Router, TypeScript, Supabase CLI/SDK, Tailwind
- UI: `pages/`, `components/`, `styles/`
- Backend: `pages/api/`, `lib/`
- Datenmodell: `supabase/migrations/`, generierte Typen in `types/supabase.ts`
- Tests: `tests/`

## Nuetzliche Checks

- Tests: `npm test`
- DB-Tests: `npm run test:db`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
