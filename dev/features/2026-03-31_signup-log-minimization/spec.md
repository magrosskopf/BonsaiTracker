Status: IMPLEMENTED
Last Modified: 2026-03-31

# Spec: Minimierung personenbezogener Signup-Logs

## Purpose/Goal

Die Anwendung soll bei abgelehnten Signup- bzw. Freigabepruefungen keine Klartext-E-Mail-Adressen mehr in Standard-Logs schreiben. Ziel ist die Datenminimierung in operativen Logs, ohne die technische Nachvollziehbarkeit des Signup-Flows zu verlieren.

## Functional Requirements

1. Ablehnungen im Signup-Guard duerfen keine rohe E-Mail-Adresse mehr in Logs enthalten.
2. Die Logs sollen weiterhin den fachlichen Ablehnungsgrund enthalten, damit Betriebs- und Debugging-Sichtbarkeit erhalten bleibt.
3. Fehlerlogs fuer echte Ausnahmen duerfen bestehen bleiben, sollen aber moeglichst ueber die vorhandene Observability-Helferschicht laufen.
4. Das Verhalten des Signup-/Login-Flows fuer Nutzer darf sich nicht aendern.

## Technical Constraints

1. Kein neues Datenmodell und keine neue Persistenz fuer Audit-Logs.
2. Keine Aenderung an API-Vertraegen oder Nutzerantworten.
3. Die Aenderung soll lokal auf die bestehenden Logging-Stellen im Auth-Flow begrenzt bleiben.

## Acceptance Criteria

1. In den bisherigen `signup denied`-Logs wird keine Klartext-E-Mail mehr ausgegeben.
2. Die Logs enthalten weiterhin den Ablehnungsgrund.
3. Der Auth-Flow compiliert unveraendert und `npm run typecheck` bleibt gruen.

## Out-of-Scope

1. Ein vollstaendiges Logging-Refactoring im gesamten Projekt.
2. Ein separates Security-Audit-Log-System.
3. Ein neues Hashing-/Pseudonymisierungskonzept fuer alle personenbezogenen Logs im Projekt.
