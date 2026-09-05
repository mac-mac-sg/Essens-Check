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
Eingaben werden abgewiesen, und ohne Termin bleibt die Anzeige leer.

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

250 Einträge mit 356 Varianten, entlang realer Suchbegriffe: Käsesorten,
Fischarten, Wurstwaren, Fertiggerichte, Restaurantklassiker, Getränke,
Süsswaren, Kräuter und Gewürze, verbreitete Mythen.

Kein Eintrag bringt eine eigene Bewertung mit. Jeder verweist über
Komponenten-Tags auf den Regelkatalog — die Urteile entstehen erst dort. Neue
Lebensmittel sind damit reine Datenpflege.

Zwei Prüfungen laufen bei jedem Testlauf mit: jedes verwendete Tag muss von
einer Regel oder von `unbedenkliche_tags` abgedeckt sein, und kein Eintrag darf
`unklar` ergeben. Ein Tippfehler in einem Tag fällt so sofort auf.

## Was noch nicht hinterlegt ist

Bewusst offen gelassen, weil der Regelkatalog dafür kein Prinzip kennt und
nichts erfunden werden soll:

- Süssstoffe wie Aspartam, Stevia und Sucralose
- Zusatzstoffe in Sportprodukten und Energydrinks über das Koffein hinaus
- Heilkräuter in Arzneidosis, im Unterschied zu Speise- und Teemengen

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

## Deployment

Die App läuft auf GitHub Pages — kein zusätzliches Konto, kein Server. Der
Workflow `.github/workflows/deploy.yml` baut bei jedem Push auf `main`, prüft
Typen, Unit-Tests und den Offline-Test, und veröffentlicht erst danach. Schlägt
eine Prüfung fehl, wird nichts ausgeliefert.

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
