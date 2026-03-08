# Spec: Homepage Bonsai Copy Refinement

## Status

IMPLEMENTED

## Purpose/Goal

Die Startseite soll sprachlich glaubwuerdiger und fachlich klarer fuer Bonsai-Enthusiasten wirken. Die aktuellen Texte sollen weniger generisch, weniger technisch-abstrakt und naeher an der tatsaechlichen Praxis rund um Pflege, Gestaltung und Entwicklung von Bonsai formuliert werden.

## Current Situation

1. Die Hero-Copy in `/work/pages/index.tsx` nutzt Formulierungen wie "Pflegeverlaeufe" und "UTC-normalisierte Datensaetze", die technisch und kuenstlich wirken.
2. Die Wortwahl beschreibt die Anwendung eher aus System- als aus Nutzerperspektive.
3. Fuer Bonsai-interessierte Besucher ist die Absicht zwar erkennbar, aber nicht in einer Sprache, die nach echter Praxis und Fachnaehe klingt.

## Functional Requirements

1. Die Startseite muss weiterhin klar vermitteln, dass die Anwendung Bonsai-Dokumentation und Pflegeorganisation unterstuetzt.
2. Die Hero-Ueberschrift muss verstaendlicher, natuerlicher und zielgruppennaher formuliert werden.
3. Der beschreibende Absatz unter der Hero-Ueberschrift muss konkrete Bonsai-relevante Inhalte nennen, die fachlich sinnvoll klingen.
4. Die Login-/Beta-Sektion muss sprachlich zur ueberarbeiteten Hero-Copy passen.
5. Die Textaenderung darf keine bestehende Funktionalitaet, Struktur oder Interaktion der Startseite veraendern.

## Technical Constraints

1. Die Aenderung beschraenkt sich auf Copy-Text in `/work/pages/index.tsx`.
2. Bestehende Komponentenstruktur, State-Logik und API-Aufrufe bleiben unveraendert.
3. `workflows/` wird nicht geaendert.

## Acceptance Criteria

1. Die Hero-Ueberschrift verwendet natuerliche Sprache ohne klar KI-typische oder uebertechnische Begriffe.
2. Der Fliesstext nennt Bonsai-relevante Arbeitsablaeufe wie Giessen, Duengen, Umtopfen, Schnitt oder Entwicklung nachvollziehbar.
3. Die Beta-/Login-Texte lesen sich konsistent mit dem restlichen Ton der Startseite.
4. Die Seite rendert weiterhin ohne funktionale Regression.

## Out-of-Scope

1. Layout-, Design- oder Struktur-Aenderungen an der Startseite.
2. Aenderungen an Login-, Waitlist- oder Authentifizierungslogik.
3. Neue Inhalte ausserhalb der bestehenden Startseiten-Texte.
