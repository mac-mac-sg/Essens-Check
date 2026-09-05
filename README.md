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
src/engine/               Regelmaschine (Aufgabe 2)
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

## Stand

Aufgabe 1 aus `SPEC.md` ist umgesetzt: Projektgerüst, Datenmodell, Testaufbau.
Die Regelmaschine (Aufgabe 2), der erweiterte Katalog (Aufgabe 3), die PWA-Hülle
(Aufgabe 4) und das Deployment (Aufgabe 5) stehen aus.

Der in `SPEC.md` erwähnte Prototyp `prototyp/essen-check.jsx` liegt noch nicht vor
und wird separat nachgereicht.

## Vorbehalt

Die Inhalte orientieren sich an den gängigen Schweizer Empfehlungen, sind aber
fachlich nicht verifiziert. Vor dem produktiven Einsatz von der Hebamme gegenlesen
lassen. Diese App ersetzt keine Beratung.
