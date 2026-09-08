# Medikamente in «Darf ich das?»

Stand: 08.09.2026

Der Medikamentenbereich ist fachlich und technisch vom Lebensmittel-Regelwerk getrennt. Die gemeinsame Oberfläche dient nur dem schnellen Nachschlagen; Produktidentifikation und Schwangerschaftsbewertung folgen eigenen Regeln.

## Datenfluss

1. **Swissmedic-Produktdaten** identifizieren Schweizer Präparate, Sequenzen, Wirkstoffe, Stärken, Arzneiformen und Packungen.
2. Der monatlich versionierte Snapshot liegt als `daten/medikament-produkte.json` im Bundle. Zur Laufzeit erfolgt **keine Swissmedic-Netzwerkabfrage**.
3. Ein explizites Mapping verbindet Swissmedic-Wirkstoffe mit dem kuratierten lokalen Medikamentenkatalog.
4. Die Schwangerschaftsbewertung stammt ausschliesslich aus `daten/medikamente.json` und der Engine `src/medikamente/bewerten.ts`.
5. Produktdaten allein erzeugen nie eine medizinische Aussage.

## Sicherheitsgrenzen

- Kein Wirkstoff, keine Dosis, kein Anwendungsprofil und keine Schwangerschaftswoche werden geraten.
- Ein Produkt ist nur grundsätzlich automatisch bewertbar, wenn **alle** von Swissmedic deklarierten Wirkstoffe auf lokal kuratierte Wirkstoffe gemappt sind.
- Ein bekannter Bestandteil darf ein Kombinationspräparat mit unbekanntem zweitem Wirkstoff nie freigeben.
- Auch vollständig gemappte Kombinationspräparate erhalten **kein aus Einzelurteilen errechnetes Gesamturteil**. Einzelwirkstoffe dürfen separat angesehen werden, ausdrücklich ohne Freigabe des Gesamtprodukts.
- Die Swissmedic-Arzneiform muss sich eindeutig einem im Wirkstoffprofil hinterlegten Darreichungsweg zuordnen lassen. Eine lokale Form, etwa ein Gel, erbt kein systemisches Tablettenurteil.
- Wenn mehrere Anwendungsprofile möglich sind, muss die Nutzerin auswählen. Beispiel: Acetylsalicylsäure als ärztlich verordnete Low-dose-Therapie versus analgetische Anwendung.
- Ändert sich die Bewertung im Schwangerschaftsverlauf, ist die aktuelle SSW erforderlich. Ohne hinterlegten Geburtstermin bleibt das Urteil offen.
- «Bereits eingenommen» ist eine eigene Perspektive und wird nicht aus dem Status für eine geplante Einnahme abgeleitet.
- Verordnete Medikamente nie eigenständig beginnen, absetzen oder in der Dosis verändern.
- Die App ersetzt keine ärztliche, pharmazeutische oder hebammengeleitete Beratung.

## Statussystem

Medikamente verwenden nicht die Lebensmittel-Ampel «Ja / Bedingt / Nein / Unklar».

- `geeignet` — im konkret hinterlegten Kontext geeignet
- `mit_einschraenkung` — möglich, aber mit hinterlegter Einschränkung
- `nur_nach_ruecksprache` — individuelle fachliche Rücksprache erforderlich
- `nicht_empfohlen` — in diesem Kontext nicht anwenden
- `nicht_bewertet` — keine ausreichende lokale Bewertung

Zusätzlich kann die Engine **gar keinen Status** liefern, wenn zuerst Profil oder SSW geklärt werden müssen.

## Aktueller Umfang

Der sichtbare Medikamentenbereich basiert auf zehn kuratierten Wirkstoffen:

- Paracetamol
- Ibuprofen
- Diclofenac
- Acetylsalicylsäure
- Amoxicillin
- Cetirizin
- Loratadin
- Omeprazol
- Metoclopramid
- Xylometazolin

Der Swissmedic-Snapshot kann wesentlich mehr Schweizer Präparate enthalten, aber nur Produkte mit Bezug zu diesen kuratierten Wirkstoffen erscheinen in der Medikamentensuche.

## Oberfläche

Die Hauptnavigation bleibt `Suchen · Liste · Wissen · Scannen`. Innerhalb von **Suchen** gibt es den Umschalter `Lebensmittel · Medikamente`.

Die Medikamentensuche findet:

- lokale Wirkstoffe und Synonyme,
- Schweizer Handelspräparate aus dem Swissmedic-Snapshot.

Der Scanner bleibt vorerst ein Lebensmittel-Scanner über Open Food Facts. Medikamentenpackungen werden in dieser Phase nicht über den Barcode bewertet.

## Aktualisierung

Swissmedic veröffentlicht die maschinenlesbaren Arzneimitteldaten monatlich. `scripts/swissmedic-aktualisieren.sh` und der zugehörige GitHub-Actions-Workflow erzeugen einen neuen Snapshot. Änderungen werden getestet und über einen separaten Update-Branch beziehungsweise Pull Request übernommen.

Eine Erweiterung um neue Wirkstoffe erfordert zuerst die fachliche Kuratierung in `daten/medikamente.json` samt Tests. Ein grösserer Swissmedic-Produktbestand allein erweitert die medizinische Abdeckung nicht.
