# Medikamente · Phase 2: Schweizer Produktdaten

## Ziel

Phase 2 verbindet den kuratierten Schwangerschafts-Wirkstoffkatalog aus Phase 1 mit dem offiziellen Schweizer Arzneimittelbestand von Swissmedic.

Die sichtbare Medikamentensuche bleibt weiterhin deaktiviert. Zuerst wird ein reproduzierbarer, testbarer Produktsnapshot aufgebaut.

## Quelle

Verwendet wird der monatliche Open-Government-Data-Export von Swissmedic:

`https://ogd.swissmedic.cloud/ogd-arzneimittel/Daten/OGD.zip`

Der Import verarbeitet ausschliesslich die offiziellen strukturierten XML-Daten:

- Präparate
- Sequenzen/Dosisstärken
- Deklarationen der Stoffe
- Packungen
- Stoff-Synonyme
- User-Defined-Codes
- Export-Datum

AIPS bleibt für Fach- und Patienteninformationen vorgesehen, ist aber nicht die Quelle für die Produkt-Stammdatenzuordnung.

## Datenfluss

```text
Swissmedic OGD.zip
       ↓
Download ausserhalb der App
       ↓
XML-Parser / Code-Auflösung
       ↓
alle Wirkstoffe einer Sequenz erhalten
       ↓
explizites Mapping auf kuratierte Wirkstoff-IDs
       ↓
daten/medikament-produkte.json
       ↓
Runtime-Validierung und Produktsuche
```

Die App selbst ruft Swissmedic nicht live auf. Der erzeugte Snapshot wird wie der übrige Katalog mit der PWA ausgeliefert und ist offline verfügbar.

## Sicherheitsprinzip für Kombinationspräparate

Ein bekannter Wirkstoff genügt nicht für eine automatische Bewertung.

Beispiel:

```text
Paracetamol + unbekannter zweiter Wirkstoff
```

Das Produkt darf über den Handelsnamen gefunden werden, erhält aber:

```text
vollstaendig_gemappt = false
```

und ist damit für eine spätere automatische Schwangerschaftsbewertung gesperrt.

Erst wenn **alle** von Swissmedic als Wirkstoff deklarierten Stoffe auf fachlich bewertete lokale Wirkstoffe zeigen, kann ein Produkt grundsätzlich weiter bewertet werden. Darreichungsform, Dosisprofil und SSW müssen danach weiterhin passen.

## Explizites Wirkstoff-Mapping

`daten/medikament-wirkstoff-mapping.json` verbindet offizielle Swissmedic-Stoffnamen mit den zehn Pilot-Wirkstoffen aus Phase 1.

Das Mapping ist absichtlich eng. Nicht erkannte Stoffe werden nicht über Ähnlichkeit geraten. Eine neue Schreibweise oder ein neuer Wirkstoff muss bewusst ergänzt und getestet werden.

## Aktualisierung lokal

```bash
npm run medikamente:swissmedic
```

Der Befehl lädt den aktuellen Swissmedic-OGD-Export, entpackt ihn in ein temporäres Verzeichnis und erzeugt:

```text
daten/medikament-produkte.json
```

Für einen bereits lokal entpackten OGD-Export:

```bash
npm run medikamente:swissmedic:import -- /pfad/zum/ogd daten/medikament-produkte.json
```

## Freigabekriterien vor Phase 3

Die Medikamenten-UX wird erst angeschlossen, wenn mindestens folgende Punkte erfüllt sind:

1. Der echte Swissmedic-Snapshot wird in CI reproduzierbar erzeugt.
2. Bekannte Schweizer Referenzprodukte wie Dafalgan und Algifor werden korrekt auf die Pilot-Wirkstoffe gemappt.
3. Kombinationspräparate mit unbekannten Wirkstoffen sind nachweislich gesperrt.
4. Produktstatus, Packungsstatus und Stoffkategorien werden über die Swissmedic-Code-Tabellen aufgelöst statt geraten.
5. Der monatliche Update-Prozess erzeugt eine prüfbare Änderung und überschreibt den kuratierten Schwangerschaftskatalog nicht.
6. Erst danach wird die Medikamentensuche in die App eingebaut.
