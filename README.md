# Darf ich das essen?

Private, offline lauffähige App für die Schwangerschaft: Lebensmittel eingeben,
eindeutige Antwort bekommen. Keine Konten, keine Telemetrie, keine externen Dienste.

Die verbindliche Beschreibung steht in [`SPEC.md`](SPEC.md), die Arbeitsregeln in
[`CLAUDE.md`](CLAUDE.md).

## Befehle

| Befehl | Zweck |
|---|---|
| `npm install` | Abhängigkeiten installieren |
| `npm run dev` | Entwicklungsserver |
| `npm test` | Unit-Tests einmalig |
| `npm run test:watch` | Tests im Watch-Modus |
| `npm run typecheck` | Nur Typprüfung |
| `npm run build` | Typprüfung und Produktionsbuild nach `dist/` |
| `npm run preview` | Gebaute App lokal ausliefern |
| `npm run test:offline` | Offline-Test im simulierten Flugmodus (nach `build`) |
| `npm run pruefstand katalog` | Alle Katalogeinträge mit ihrem Urteil, zum Gegenlesen |
| `npm run pruefstand suche <begriff> …` | Was die Suche zu einem Begriff liefert |
| `npm run pruefstand produkt "<name>" …` | Was ein Produktname aus der Datenbank auslöst |
| `npm run karte <id> …` | Eine Ergebniskarte so, wie die App sie ausgibt |

## Aufbau

```
daten/regeln.json         Risikoprinzipien — ändern sich fast nie
daten/lebensmittel.json   Lebensmittelkatalog — verweist über Tags auf die Regeln
src/typen.ts              Datenmodell
src/daten.ts              Typisierter Zugang zu beiden Katalogen
src/schwangerschaft.ts    Schwangerschaftswoche und Trimester
src/engine/bewerten.ts    Regelmaschine
src/engine/suchen.ts      Normalisierung und Matching
src/ampel.ts              Beschriftung und Farbe je Urteil
src/Ergebniskarte.tsx     Ergebnisdarstellung
src/App.tsx               Suche und Zusammenbau
public/                   Icons und Favicon
scripts/offline-test.mjs  Offline-Test
prototyp/essen-check.jsx  Referenz für Interaktion und Formulierungen
```

Die Kataloge liegen bewusst unter `daten/` statt unter `src/`: neue Lebensmittel
sollen reine Datenpflege sein und keinen Codeeingriff verlangen. Importiert werden
sie über den Alias `@daten/…`, der in `vite.config.ts` und `tsconfig.json` gesetzt ist.

## Geburtstermin

Der Termin steht nirgends im Repo und auch nicht in der veröffentlichten App.
Er wird beim ersten Start einmal eingetragen und liegt danach nur im
`localStorage` des Geräts — er wird nirgendwohin übertragen, und wer die
veröffentlichte Seite aufruft, sieht keine Woche.

Ohne Termin funktioniert die Suche unverändert; es fehlen die Wochenanzeige und
die Hinweise zum Trimester. Eine falsche Woche wird nie angezeigt: unplausible
Eingaben werden abgewiesen, ohne Termin bleibt die Anzeige leer, und ein
beschädigter Wert im Speicher gilt als kein Termin. Ein solcher Wert ergab
zuvor eine Wochenanzeige aus «NaN» — sichtbar im Kopf jeder Ansicht.

Für die lokale Entwicklung lässt sich ein Termin über `VITE_GEBURTSTERMIN`
vorgeben; gesetzt ist die Variable nicht.

```
VITE_GEBURTSTERMIN=2030-01-01 npm run dev
```

## Bewertung

Ein Tag, das keine Regel auslöst, wird nur dann `ok`, wenn es in
`unbedenkliche_tags` steht. Alles andere ohne Regeltreffer ergibt `unklar` —
«kein Treffer» wird nie stillschweigend zu einem Ja.

Die Suche vergleicht ausschliesslich Teilzeichenketten von Name und Synonymen.
Umlaute, Akzente und Grossschreibung sind egal, Wortähnlichkeit wird nicht
ausgewertet: ein Tippfehler liefert lieber einen Nulltreffer als ein falsches
Urteil.

## Im Zweifel das strengere Argument

Widersprechen sich zwei Regeln oder ist eine Angabe mehrdeutig, greift die
strengere Lesart. Konkret heisst das:

- Treffen mehrere Regeln dasselbe Tag, gewinnt die schlechteste Bewertung.
- Passen mehrere Entschärfungen auf denselben Zustand, greift die strengste.
- Trifft eine Regel, schlägt sie eine Freigabe aus `unbedenkliche_tags`.
- Eine Variante ohne Komponenten ergibt `unklar`, nie `ok`.

Sichtbarster Fall: auf `rohmilch-weichkaese` greifen zwei Regeln.
`listerien-weichkaese` stuft `pasteurisiert` auf `bedingt` herab,
`listerien-nicht-erhitzt` kennt für diesen Zustand keine Entschärfung und bleibt
bei `meiden`. Camembert aus pasteurisierter Milch ist deshalb `meiden` — beide
Begründungen werden angezeigt, damit die strengere Einstufung nachvollziehbar
bleibt. Das ist so gewollt und durch Tests festgehalten.

## Verhältnis zum Prototyp

`prototyp/essen-check.jsx` bleibt unverändert als Referenz liegen, samt seiner
transkribierten Umlaute — korrigiert werden sie bei der Übernahme in Katalog und
Oberfläche, nicht in der Vorlage.

Übernommen sind Interaktion, Ampelbeschriftung, Alternativenblock und die
Formulierungen. Drei bewusste Abweichungen:

- Das Urteilswort steht grösser als der Fliesstext, wie `SPEC.md` es verlangt.
  Der Prototyp setzt es kleiner.
- Der Nulltreffer verweist nur auf die Hebamme. Der Prototyp bittet zusätzlich,
  den Begriff zu melden — ein Feedback-Kanal ist in v1 ausdrücklich kein Ziel.
- Die Urteile stammen aus dem Regelkatalog statt aus dem Eintrag. Wo sich beide
  unterscheiden, gilt die strengere Auskunft.

## Katalog

256 Einträge mit 369 Varianten, entlang realer Suchbegriffe: Käsesorten,
Fischarten, Wurstwaren, Fertiggerichte, Restaurantklassiker, Getränke,
Süsswaren, Kräuter und Gewürze, verbreitete Mythen.

Kein Eintrag bringt eine eigene Bewertung mit. Jeder verweist über
Komponenten-Tags auf den Regelkatalog — die Urteile entstehen erst dort. Neue
Lebensmittel sind damit reine Datenpflege.

Zwei Prüfungen laufen bei jedem Testlauf mit: jedes verwendete Tag muss von
einer Regel oder von `unbedenkliche_tags` abgedeckt sein, und kein Eintrag darf
`unklar` ergeben. Ein Tippfehler in einem Tag fällt so sofort auf.

## Zwei Wege zur Antwort

Die Suche beantwortet «darf ich X essen?». Über den Startbildschirm ist
zusätzlich die umgekehrte Frage erreichbar: **«Was kann ich essen?»** listet
nach Warengruppe, was ein klares Ja hat — mit der Zubereitung, unter der es
gilt. Camembert erscheint dort als «Überbacken», nicht als Camembert.

Aufgenommen wird nur `ok`. `bedingt` bleibt draussen, weil eine Liste zum
Zugreifen nichts enthalten darf, das noch eine Einschränkung mitbringt.

Über jeder Begründung steht ausserdem das **Risikoprinzip**, das sie ausgelöst
hat — Listerien, Toxoplasmose, Quecksilber. Der Katalog wird nie vollständig
sein; wer das Muster kennt, kann ein nicht hinterlegtes Lebensmittel selbst
einordnen.

## Strichcode

Die App liest EAN-8 und EAN-13 über die Kamera und schlägt **jeden** Code bei
Open Food Facts nach. Das ist die einzige Stelle, an der Daten das Gerät
verlassen: der Dienst erfährt, welches Produkt gerade gescannt wird.

Zeigt der Produktname eindeutig auf einen Katalogeintrag, erscheint direkt das
Urteil. Eindeutig heisst: alleiniger Treffer oder mindestens doppelt so schwer
wie der nächste — eine Schwelle, die an echten Produktnamen geeicht ist. Bei
Gleichstand kommt die Auswahl statt eines geratenen Urteils: «Zweifel Paprika
Chips» trifft Tomaten, Gewürze und Chips gleich stark, und ein automatisches
Urteil wäre dort falsch.

Gelesen wird über die native `BarcodeDetector`-Schnittstelle des Browsers,
nicht über eine Bibliothek — das hält das Bundle klein. Sie fehlt auf iOS und
auf Linux-Desktops; dort sagt die App es offen und die Suche bleibt der Weg.

Die Prüfziffer jedes Codes wird geprüft, damit ein Lesefehler der Kamera gar
nicht erst nachgeschlagen wird.

## Was noch nicht hinterlegt ist

Bewusst offen gelassen, weil der Regelkatalog dafür kein Prinzip kennt und
nichts erfunden werden soll:

- Süssstoffe wie Aspartam, Stevia und Sucralose
- Zusatzstoffe in Sportprodukten und Energydrinks über das Koffein hinaus
- Heilkräuter in Arzneidosis, im Unterschied zu Speise- und Teemengen
- Nährstoffpräparate über die hinterlegten hinaus — Folsäure, Eisen, Omega-3,
  Magnesium, Kalzium, Jod, Vitamin D und Vitamin A sind erfasst, weiteres nicht
- Marken- und Produktnamen; der Katalog kennt Lebensmittel, keine Hersteller
- Alles, was kein Lebensmittel ist: Medikamente, Rauchen, Sauna

Eine Suche danach liefert einen Nulltreffer mit dem Verweis auf die Hebamme.
Das ist gewollt: lieber keine Auskunft als eine geratene.

## PWA und Offline

Die App ist eine statische PWA. Kataloge und Code liegen vollständig im Bundle,
der Service Worker legt alles ab — nach dem ersten Laden braucht sie kein Netz
mehr. Über das Manifest legt sie sich auf den Homescreen.

Icons entstehen aus `public/icon.svg`. Die gerasterten PNG liegen daneben und
sind eingecheckt, damit der Build ohne Bildwerkzeuge auskommt. Die Variante
`icon-maskable-512.png` hält das Zeichen auf 78 Prozent, damit Android es beim
Zuschneiden auf runde Kacheln nicht anschneidet.

Der Offline-Test läuft gegen den echten Build:

```
npm run build && npm run test:offline
```

Er lässt den Service Worker ablegen, kappt die Verbindung und prüft dann
Neuladevorgang, Suche, Urteil und Kaltstart in einem frischen Tab. Gegengeprüft
mit absichtlich beschädigtem Service Worker — dann schlägt er fehl.

## Gestaltung

Die Palette ist durch `SPEC.md` vorgegeben und bleibt unangetastet. Die
Bauweise darüber folgt zwei Grundsätzen:

- **Flächen statt Ränder.** Getönte Abstufungen und eine weiche Schattenstufe
  gliedern die Oberfläche; 1px-Umrandungen gibt es nur noch unter
  `prefers-contrast: more`.
- **Grössenabhängige Typografie.** Grosse Schrift bekommt negatives Tracking
  und enge Zeilen, kleine etwas mehr Laufweite. Hierarchie entsteht aus
  Gewicht, Grösse und Zeilenabstand zusammen, nicht aus der Grösse allein.

Bewegung ist bewusst knapp gehalten. Was oft gesehen wird, wird nicht
animiert — die Trefferliste aktualisiert sich bei jedem Tastendruck und bleibt
deshalb völlig ruhig. Animiert sind nur die Druckrückmeldung auf tippbaren
Flächen und das Erscheinen der Ergebniskarte. Alles unter 200 ms, nur
`transform` und `opacity`, mit einer Kurve mit Zug statt der weichen
CSS-Vorgaben.

Unter `prefers-reduced-motion` bleiben Farb- und Deckkraftwechsel erhalten,
Verschiebungen fallen weg — reduzierte Bewegung heisst sanfter, nicht gar
keine Rückmeldung.

Das dunkle Schema folgt voreingestellt `prefers-color-scheme`; ein
Schieberegler in der Fusszeile überschreibt das, «Dem Gerät folgen» stellt die
Automatik wieder her. Die Urteilsfarben stehen deshalb in `styles.css` und
nicht mehr im TypeScript: ein Inline-Style kennt das Farbschema nicht. Die
Komponenten setzen `data-status`, das Stylesheet entscheidet über die Farbe.
Kontraste sind in beiden Schemata gemessen, alle Textpaare liegen über AA.

Der Schalterknopf bewegt sich über `left`, nicht über `transform`: unter
`prefers-reduced-motion` setzt das Stylesheet jede Transformation zurück, und
der Knopf bliebe sonst am falschen Ende stehen. Ausgeschaltet lag die Fläche
bei 1.15 gegen den Grund und 1.26 gegen den Knopf — der Schalter war kaum zu
sehen. Beide Stellungen tragen jetzt als volle Fläche (3.36 und 3.68 gegen den
Grund), und die Stellung steht als Wort daneben.

Die Skills unter `.agents/skills/` sind eingecheckt, damit spätere Arbeit an
der Oberfläche auf derselben Grundlage aufsetzt.

## Deployment

Die App läuft auf GitHub Pages — kein zusätzliches Konto, kein Server.

`.github/workflows/deploy.yml` trennt Prüfen und Veröffentlichen:

| Auslöser | Was passiert |
|---|---|
| Pull Request | Typprüfung, Unit-Tests, Build und Offline-Test |
| Push auf `main` | dieselben Prüfungen, danach das Deployment |

Die Prüfungen laufen damit **vor** dem Merge, nicht erst währenddessen.
Veröffentlicht wird nur bei einem Push auf `main` und nur, wenn alles
durchgelaufen ist — schlägt eine Prüfung fehl, wird nichts ausgeliefert.

Einmalig von Hand einzuschalten:

1. Im Repo auf **Settings → Pages**
2. Unter **Source** den Eintrag **GitHub Actions** wählen

Danach liegt die App unter `https://mac-mac-sg.github.io/Essens-Check/`.

GitHub Pages liefert Projektseiten unter dem Repo-Pfad aus, nicht unter der
Wurzel. Der Pfad steht deshalb als `base` in `vite.config.ts` und ebenso im
Offline-Test — was lokal geprüft wird, ist genau das, was deployt wird. Wird das
Repo je umbenannt, muss er an beiden Stellen mitgeändert werden.

## Stand

Alle fünf Aufgaben aus `SPEC.md` sind umgesetzt. 64 Unit-Tests und
5 Offline-Prüfungen.

## Vorbehalt

Die Inhalte orientieren sich an den gängigen Schweizer Empfehlungen, sind aber
fachlich nicht verifiziert. Vor dem produktiven Einsatz von der Hebamme gegenlesen
lassen. Diese App ersetzt keine Beratung.
