# UI-Redesign — September 2026

Dieses Dokument aktualisiert für die Oberfläche die entsprechenden Aussagen im UI-Abschnitt von `SPEC.md`. Fachliche Regeln, Bewertungslogik, Sicherheitsprinzipien und Datenmodell bleiben unverändert.

## Ziel

Die App ist primär ein Entscheidungswerkzeug im Laden: öffnen, Lebensmittel eingeben oder scannen, Antwort erfassen. Erklärung und Einstellungen treten hinter diesen Hauptfluss zurück.

## Informationshierarchie

1. App-Titel und Untertitel.
2. Kompakter Schwangerschaftsstatus als Kontext, nicht als Hauptinhalt.
3. Suchfeld unmittelbar danach und beim Start fokussiert.
4. Eine einzige kurze Erklärung unter der Suche.
5. Verlauf und Hintergrundinformationen erst darunter.
6. Ergebnis mit Antwort vor Begründung.

## Materialsystem

- Grundfläche: warme Rosé-Neutrale aus der bestehenden Palette.
- Normale Inhalte möglichst ohne zusätzliche Kartenfläche.
- Verbundene Listen verwenden eine gemeinsame Fläche mit Trennlinien statt Einzelkarten.
- Getönte Flächen sind Urteilen und gezielten Zuständen vorbehalten.
- Milchglas wird auf sticky Suche und Bottom Navigation beschränkt.
- Das Bottom Sheet bleibt die höchste Oberflächenebene.

Die bestehende Light-/Dark-Palette und die Trennung von Markenfarbe und Ampelfarben bleiben unverändert.

## Start und Suche

Der frühere Hero als grosse Glasfläche entfällt. Unter der Suche steht nur eine kurze Orientierung. Das Suchfeld ist die visuell dominante Aktion.

Treffer erscheinen in einer verbundenen Liste. Jede Zeile zeigt Name, ausgeschriebenen Status und gegebenenfalls die entscheidende Bedingung. Farbe wird nie allein zur Codierung verwendet.

## Ergebnis

Ein eindeutiges Urteil beginnt mit einer grossen, getönten Entscheidungsfläche. Erst danach folgen Risikoprinzip und Begründung.

Bei mehreren Varianten bleiben alle Varianten gleichzeitig sichtbar. Zubereitung und Urteil bilden eine leicht scannbare Matrix aus einzelnen getönten Blöcken. Es wird weiterhin keine vorgelagerte Rückfrage erzwungen.

## Bottom Sheet

Das Bottom Sheet bleibt erhalten und bekommt einen standardisierten Kopf mit Griff, Titel und sichtbarem Schliessen-Knopf. Die Ergebniskarte zeigt innerhalb des Sheets ihren Namen nicht ein zweites Mal. Beim Barcode-Scan kann dieselbe Ergebniskarte ausserhalb des Sheets weiterhin ihren eigenen Titel anzeigen.

## Navigation

Die drei Ziele bleiben `Suchen`, `Liste`, `Scannen`. Die Navigation bleibt in der Daumenzone, wird aber visuell ruhiger und konkurriert weniger mit dem Inhalt.

## Übersicht

`Was kann ich essen?` startet als kompakter Kategorienbrowser. Eine gewählte Kategorie öffnet eine verbundene Liste der klar freigegebenen Einträge. Dadurch entfällt die Kombination aus horizontaler Filterleiste und zwölf Accordions.

## Einstellungen

Geburtstermin und Erscheinungsbild liegen nicht mehr im Footer. Ein Einstellungen-Knopf im Kopf öffnet ein eigenes Bottom Sheet mit:

- Geburtstermin
- Hell / Dunkel / Gerät
- Informationen zur Einordnung und zu den Quellen

Der medizinische Hinweis auf Hebamme oder Ärztin bleibt auf jedem Screen sichtbar. Auf der leeren Startansicht steht er in den Hintergrundinformationen; auf den übrigen Ansichten in der Fusszeile.

## Barrierefreiheit

Bestehende Anforderungen bleiben bestehen:

- Status nie nur über Farbe
- ausreichend grosse Touch-Ziele
- sichtbare Fokuszustände
- `prefers-reduced-motion`
- `prefers-reduced-transparency`
- erhöhte Kontrasteinstellung
- Light und Dark Mode
