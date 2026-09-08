# UI-Redesign — September 2026

Dieses Dokument aktualisiert für die Oberfläche die entsprechenden Aussagen im UI-Abschnitt von `SPEC.md`. Fachliche Regeln, Bewertungslogik, Sicherheitsprinzipien und Datenmodell bleiben unverändert.

## Ziel

Die App ist primär ein Entscheidungswerkzeug im Laden: öffnen, Lebensmittel eingeben oder scannen, Antwort erfassen. Ergänzend bietet `Wissen` einen klar getrennten redaktionellen Bereich für Ernährungsthemen und Rezeptideen. Erklärung und Einstellungen treten hinter diesen Hauptflüssen zurück.

## Informationshierarchie

1. App-Titel und Untertitel.
2. Schwangerschaftsstatus ausschliesslich auf der Startseite `Suchen`.
3. Auf der Startseite Hero, Suchfeld und Verlauf.
4. Ergebnis mit Antwort vor Begründung.
5. `Wissen` als redaktioneller Bereich, getrennt von der Ja/Nein-Bewertung des Lebensmittelkatalogs.

## Materialsystem

- Grundfläche: warme Rosé-Neutrale aus der bestehenden Palette.
- Normale Inhalte möglichst ohne zusätzliche Kartenfläche.
- Verbundene Listen verwenden eine gemeinsame Fläche mit Trennlinien statt Einzelkarten.
- Getönte Flächen sind Urteilen und gezielten Zuständen vorbehalten.
- Milchglas wird auf sticky Suche und Bottom Navigation beschränkt; die Schwangerschaftskarte im Markenheader darf eine leicht transparente Markenfläche verwenden, weil dort keine Urteilsfarbe codiert wird.
- Das Bottom Sheet bleibt die höchste Oberflächenebene.

Die bestehende Light-/Dark-Palette und die Trennung von Markenfarbe und Ampelfarben bleiben unverändert.

## Markenheader

Die Startseite verwendet einen adaptiven, türkis-blaufarbenen Markenheader. Er ist die einzige grosse Markenfläche der App und enthält:

- das App-Signet,
- `Darf ich das?`,
- den Untertitel `Food Checker für die Schwangerschaft`,
- den Einstellungen-Knopf,
- den Schwangerschaftsstatus mit SSW, Trimester, verbleibenden Tagen und Fortschrittsbalken.

Der Schwangerschaftsstatus ist Teil derselben Markenfläche und keine weisse Einzelkarte mehr. Dadurch konkurriert er nicht mehr mit dem App-Titel. Der Header darf subtile abstrakte Hintergrundformen verwenden; keine Illustration trägt fachliche Bedeutung.

Auf `Liste`, `Wissen` und `Scannen` reduziert sich derselbe Markenheader auf eine kompakte Leiste mit Signet, Titel, Untertitel und Einstellungen. Schwangerschaftswoche und verbleibende Tage werden dort nicht wiederholt.

Die Türkis-Blaufläche ist reine Markenidentität. Statusfarben für `ok`, `bedingt`, `meiden` und `unklar` bleiben ausschliesslich den Lebensmittelurteilen vorbehalten.

## Start und Suche

Die Startseite verwendet wieder den grösseren Hero mit dem Satz `Ein Lebensmittel, eine klare Antwort.`. Darunter folgt das Suchfeld. Der Schwangerschaftsstatus mit Schwangerschaftswoche und verbleibenden Tagen steht nur auf dieser Startseite und ist in den Markenheader integriert.

Die Hintergrundkacheln `Schweizer Empfehlungen` und `Zubereitung entscheidet` stehen nicht mehr auf der Suchseite; diese Einordnung liegt im Einstellungs-Menü.

Treffer erscheinen als einzelne Karten mit Name, ausgeschriebenem Status und gegebenenfalls der entscheidenden Bedingung. Farbe wird nie allein zur Codierung verwendet.

## Ergebnis

Ein eindeutiges Urteil beginnt mit einer grossen, getönten Entscheidungsfläche. Erst danach folgen Risikoprinzip und Begründung.

Bei mehreren Varianten bleiben alle Varianten gleichzeitig sichtbar. Zubereitung und Urteil bilden eine leicht scannbare Matrix aus einzelnen getönten Blöcken. Es wird weiterhin keine vorgelagerte Rückfrage erzwungen.

## Bottom Sheet

Das Bottom Sheet bleibt erhalten und hat einen standardisierten Kopf mit Griff, Titel und sichtbarem Schliessen-Knopf. Die Ergebniskarte zeigt innerhalb des Sheets ihren Namen nicht ein zweites Mal. Beim Barcode-Scan kann dieselbe Ergebniskarte ausserhalb des Sheets weiterhin ihren eigenen Titel anzeigen.

Auch Wissensartikel und Rezepte öffnen ihre Detailansicht im Bottom Sheet, damit die Hauptnavigation im Hintergrund erhalten bleibt.

## Navigation

Die vier Hauptbereiche sind:

- `Suchen` — Startseite und Lebensmittelprüfung
- `Liste` — Kategorienbrowser der klar freigegebenen Lebensmittel
- `Wissen` — Ernährungsthemen und Rezeptideen
- `Scannen` — Barcode-Prüfung

Die Navigation bleibt in der Daumenzone. Das aktive Ziel trägt Farbe, Fettung und `aria-current`.

## Übersicht

`Was kann ich essen?` startet als kompakter Kategorienbrowser. Eine gewählte Kategorie öffnet eine verbundene Liste der klar freigegebenen Einträge. Schwangerschaftswoche und verbleibende Tage werden hier nicht wiederholt.

## Wissen

Der Bereich `Wissen` ist redaktionell und darf nicht wie ein Lebensmittelurteil wirken. Er besteht aus zwei Einstiegen:

### Ernährung in der Schwangerschaft

- kompakte Themenkarten
- kurze Einordnung auf der Karte
- Detailansicht mit wenigen Kernpunkten
- Quellenangabe und Stand der Information
- keine Ableitung eines konkreten Lebensmittelurteils aus allgemeinen Texten

Der erste Umfang umfasst acht Themen, darunter Folsäure, Vitamin D, Eisen, Jod, Koffein, Fisch & Omega-3, Listerien & Toxoplasmose sowie ausgewogene Ernährung.

### Rezeptideen

- visuelle Rezeptkarten mit Illustration, Zeit und wenigen Tags
- Detailansicht mit Zutaten, Zubereitung und einem eigenen Block `In der Schwangerschaft beachten`
- Zutaten mit vorhandenem Katalogbezug können direkt zur Suche übergeben werden
- keine pauschale Kennzeichnung `sicher in der Schwangerschaft`; stattdessen konkrete Zubereitungshinweise

Der Wissensbereich bleibt vollständig im App-Bundle und funktioniert offline. Er führt keine zusätzliche Netzwerkverbindung ein.

## Scanner

Der Scanner bleibt funktional unverändert. Schwangerschaftswoche und verbleibende Tage werden auf dieser Lasche nicht angezeigt.

## Einstellungen

Geburtstermin und Erscheinungsbild liegen im Einstellungen-Sheet. Der Einstellungen-Knopf bleibt oben rechts verfügbar. Das Sheet enthält:

- `App installieren`, wenn der Browser die PWA-Installation anbietet,
- Geburtstermin,
- Hell / Dunkel / Gerät,
- Informationen zur Einordnung und zu den Quellen.

Die Installationsaktion verwendet das native `beforeinstallprompt`-Ereignis des Browsers und erscheint nicht, wenn die App bereits im Standalone-Modus läuft oder der Browser keinen direkten Installationsdialog bereitstellt. Das Web-App-Manifest definiert `standalone` als bevorzugten Darstellungsmodus und verwendet die vorhandenen 192-, 512- und maskable Icons für den Homescreen.

Der medizinische Hinweis auf Hebamme oder Ärztin bleibt auf jedem Screen sichtbar.

## Barrierefreiheit

Bestehende Anforderungen bleiben bestehen:

- Status nie nur über Farbe
- ausreichend grosse Touch-Ziele
- sichtbare Fokuszustände
- `prefers-reduced-motion`
- `prefers-reduced-transparency`
- erhöhte Kontrasteinstellung
- Light und Dark Mode
