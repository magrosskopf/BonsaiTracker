# Testcases: Signup Gating & Closed Beta

## Ziel

Diese Testfaelle verifizieren die eingefuehrten Aenderungen fuer:

1. Closed-Beta Signup-Gating
2. DB-Allowlist + Waitlist
3. Hard-Cap (`MAX_TOTAL_USERS`)
4. Rate-Limits (Signup + Waitlist)
5. Autoritative Absicherung in NextAuth-Callbacks

## Voraussetzungen

1. Migration angewendet: `20260305000100_signup_gating`
2. Relevante ENV-Werte gesetzt:
   - `SIGNUP_ENABLED=true`
   - `MAX_TOTAL_USERS=100` (oder kleiner fuer Tests, z. B. `2`)
   - `WAITLIST_ENABLED=true`
   - `SIGNUP_RATE_LIMIT_WINDOW_SECONDS=900`
   - `SIGNUP_RATE_LIMIT_MAX_PER_IP=10`
   - `SIGNUP_RATE_LIMIT_MAX_PER_EMAIL=5`
3. Testdaten:
   - `existing_user@example.com` existiert bereits in `User`
   - `allowlisted_user@example.com` ist in `SignupAllowlist`
   - `new_user@example.com` ist weder in `User` noch in `SignupAllowlist`

## Testfall 1: Bestehender User kann weiter normal einloggen

1. Auf `/` im Login-Formular `existing_user@example.com` eintragen.
2. Login absenden.
3. Erwartung:
   - Precheck erlaubt den Flow.
   - Magic-Link wird versendet.
   - Kein Waitlist-Zwang.

## Testfall 2: Nicht-allowlisteter neuer User wird geblockt

1. Auf `/` `new_user@example.com` im Login-Formular eintragen.
2. Login absenden.
3. Erwartung:
   - Precheck antwortet mit `allowed=false`.
   - UI zeigt "nur mit Freigabe" / Waitlist-Hinweis.
   - Kein Magic-Link wird versendet.

## Testfall 3: Allowlist-User darf sich neu registrieren

1. Auf `/` `allowlisted_user@example.com` im Login-Formular eintragen.
2. Login absenden.
3. Erwartung:
   - Precheck antwortet mit `allowed=true`.
   - Magic-Link wird versendet.
   - Nach Klick auf Link wird User in `User` angelegt.

## Testfall 4: Waitlist-Request wird angelegt/aktualisiert

1. Auf `/` im Waitlist-Formular `new_user@example.com` absenden.
2. Request ein zweites Mal absenden.
3. Erwartung:
   - API `POST /api/access-requests` liefert Erfolg.
   - In `WaitlistRequest` existiert genau ein Datensatz fuer die E-Mail (Upsert).
   - `sourceIp`/`userAgent` sind gesetzt oder aktualisiert.

## Testfall 5: Waitlist kann per Script freigegeben werden

1. Ausfuehren:
   - `node scripts/approve-waitlist.js --email new_user@example.com`
2. Erwartung:
   - Eintrag in `SignupAllowlist` vorhanden.
   - `WaitlistRequest.status` ist `APPROVED`.
3. Danach Login fuer diese E-Mail erneut testen.
4. Erwartung:
   - Signup ist erlaubt.

## Testfall 6: Hard-Cap blockiert neue Registrierungen

1. `MAX_TOTAL_USERS=2` setzen.
2. Sicherstellen, dass bereits 2 User in `User` existieren.
3. Mit allowlisteter, aber noch nicht registrierter E-Mail Login starten.
4. Erwartung:
   - Precheck `allowed=false` mit "Beta voll".
   - Kein Magic-Link.
   - Bestehende User koennen sich trotzdem weiterhin einloggen.

## Testfall 7: Hard-Cap bleibt unter parallelen Signup-Versuchen stabil

1. `MAX_TOTAL_USERS=2` und nur 1 bestehender User.
2. Zwei allowlistete neue E-Mails nahezu gleichzeitig antriggern (z. B. zwei Browser-Sessions).
3. Erwartung:
   - Genau eine E-Mail bekommt final einen Slot/Magic-Link.
   - Die zweite wird wegen Kapazitaet abgelehnt.
   - Gesamtzahl neuer User ueberschreitet Cap nicht.

## Testfall 8: Signup-Rate-Limit (IP) greift

1. `SIGNUP_RATE_LIMIT_MAX_PER_IP=1` fuer schnellen Test setzen.
2. Zwei verschiedene neue E-Mails nacheinander von derselben IP im Login-Formular absenden.
3. Erwartung:
   - Erste Anfrage normal verarbeitet.
   - Zweite Anfrage wird mit Rate-Limit-Message abgewiesen.

## Testfall 9: Signup-Rate-Limit (E-Mail) greift

1. `SIGNUP_RATE_LIMIT_MAX_PER_EMAIL=1` setzen.
2. Gleiche neue E-Mail zweimal im Login-Formular absenden.
3. Erwartung:
   - Zweiter Versuch wird durch E-Mail-Limit abgewiesen.

## Testfall 10: Waitlist-Rate-Limit greift

1. `SIGNUP_RATE_LIMIT_MAX_PER_IP=1` setzen.
2. Waitlist-Formular zweimal direkt hintereinander absenden.
3. Erwartung:
   - Zweiter Request liefert `429 RATE_LIMITED`.

## Testfall 11: Sicherheits-BYPASS direkt gegen NextAuth-Endpunkt

1. Ohne Precheck direkt `POST /api/auth/signin/email` fuer nicht-allowlistete neue E-Mail senden.
2. Erwartung:
   - SignIn-Callback blockiert.
   - Kein Magic-Link wird versendet.

## Testfall 12: Signup deaktiviert

1. `SIGNUP_ENABLED=false` setzen.
2. Neue allowlistete E-Mail versucht Login.
3. Erwartung:
   - Signup geblockt.
   - Bestehender User-Login funktioniert weiterhin.

## Testfall 13: Waitlist deaktiviert

1. `WAITLIST_ENABLED=false` setzen.
2. `POST /api/access-requests` senden.
3. Erwartung:
   - API liefert `submitted=false` mit "Warteliste geschlossen".

## Testfall 14: Slot-Reservation-Cleanup (TTL)

1. Signup fuer neue allowlistete E-Mail starten, Link nicht klicken.
2. `SIGNUP_SLOT_RESERVATION_TTL_SECONDS` kurz setzen (z. B. `30`).
3. Nach Ablauf TTL erneut Signup fuer andere allowlistete E-Mail testen.
4. Erwartung:
   - Abgelaufener Slot wird freigegeben.
   - Neue Anfrage kann Slot wieder nutzen.

## Testfall 15: E-Mail-Normalisierung

1. Dieselbe E-Mail in Varianten testen (`User@Example.com`, ` user@example.com `).
2. Erwartung:
   - Logik behandelt alle Varianten als dieselbe Identitaet.
   - Keine doppelten Waitlist-/Allowlist-Eintraege nur wegen Schreibweise.

## Regression-Checks

1. `npm run typecheck`
2. `npm test`
3. `npm run build`
4. Smoke-Test Kernseiten: `/`, `/dashboard`, `/feed`
