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
src/App.tsx               Oberfläche
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

## Offener Punkt im Regelkatalog

Auf das Tag `rohmilch-weichkaese` greifen zwei Regeln. `listerien-weichkaese`
stuft den Zustand `pasteurisiert` auf `bedingt` herab, `listerien-nicht-erhitzt`
kennt für diesen Zustand keine Entschärfung und bleibt bei `meiden`. Da der
schlechteste Status gewinnt, ist Camembert aus pasteurisierter Milch heute
`meiden`. Das widerspricht dem Entschärfungstext der zweiten Regel und gehört
in die Durchsicht durch die Hebamme.

## Stand

Aufgaben 1 und 2 aus `SPEC.md` sind umgesetzt: Projektgerüst, Datenmodell,
Regelmaschine und Suche mit 50 Tests. Der erweiterte Katalog (Aufgabe 3), die
PWA-Hülle (Aufgabe 4) und das Deployment (Aufgabe 5) stehen aus. Die Oberfläche
zeigt bisher nur Kopf- und Fusszeile.

Der in `SPEC.md` erwähnte Prototyp `prototyp/essen-check.jsx` liegt noch nicht vor
und wird separat nachgereicht.

## Vorbehalt

Die Inhalte orientieren sich an den gängigen Schweizer Empfehlungen, sind aber
fachlich nicht verifiziert. Vor dem produktiven Einsatz von der Hebamme gegenlesen
lassen. Diese App ersetzt keine Beratung.
