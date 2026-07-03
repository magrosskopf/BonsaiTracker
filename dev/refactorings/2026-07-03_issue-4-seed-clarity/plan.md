# Refactoring Plan: Issue 4 Seed Clarity

**Status**: APPROVED
**Created**: 2026-07-03
**Last Modified**: 2026-07-03

## Approval

- Direkte Ausfuehrung durch den Benutzer in dieser Review-Aufgabe angefordert.

## Steps

1. Seed-Identitaeten und wiederkehrende Literalwerte in benannte Konstanten verschieben.
2. Grosse Bonsai-, Reminder-, SubEntry- und Post-Payloads in kleine Builder-Funktionen extrahieren.
3. `main()` auf eine lineare, gut lesbare Seed-Abfolge reduzieren.
4. Vollstaendige Repo-Checks erneut ausfuehren.

## Safety

- Kein API- oder Verhaltensaenderungsspielraum.
- Alle Aenderungen bleiben innerhalb von `prisma/seed.ts` plus Workflow-Artefakten.
- Verifikation ueber `npm test`, `npm run typecheck` und `npm run build`.
