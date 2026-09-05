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
prototyp/essen-check.jsx  Referenz für Interaktion und Formulierungen
```

Die Kataloge liegen bewusst unter `daten/` statt unter `src/`: neue Lebensmittel
sollen reine Datenpflege sein und keinen Codeeingriff verlangen. Importiert werden
sie über den Alias `@daten/…`, der in `vite.config.ts` und `tsconfig.json` gesetzt ist.

## Geburtstermin

Der Termin steht nicht im Repo. Er wird über die
Umgebungsvariable `VITE_GEBURTSTERMIN` als ISO-Datum überschreibbar:

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

## Stand

Aufgaben 1 und 2 aus `SPEC.md` sind umgesetzt, dazu die Oberfläche auf der
Regelmaschine: Suche, Trefferliste, Ergebniskarte mit allen Varianten,
Alternativen, Trimester-Hinweise und Nulltreffer. 59 Tests.

Offen: der erweiterte Katalog (Aufgabe 3), die PWA-Hülle (Aufgabe 4) und das
Deployment (Aufgabe 5).

## Vorbehalt

Die Inhalte orientieren sich an den gängigen Schweizer Empfehlungen, sind aber
fachlich nicht verifiziert. Vor dem produktiven Einsatz von der Hebamme gegenlesen
lassen. Diese App ersetzt keine Beratung.
