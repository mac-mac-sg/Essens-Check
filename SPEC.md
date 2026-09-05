# Darf ich das essen? — Bau-Spezifikation

Persönliche App für eine Schwangere. Sie tippt ein Lebensmittel ein und bekommt in
Sekunden eine eindeutige Antwort — auch offline, auch im Supermarkt-Untergeschoss.

Der errechnete Geburtstermin wird konfiguriert, nicht im Code hinterlegt.

## Ziel und Nicht-Ziele

**Ziel:** Eindeutigkeit ersetzt Recherche. Der Vorteil gegenüber einer Google-Suche
ist nicht die Datenmenge, sondern dass keine widersprüchlichen Forenmeinungen
interpretiert werden müssen.

**Nicht-Ziele in v1:**
- kein Tracking, keine Verlaufsspeicherung, keine Favoriten
- kein Feedback-Kanal für nicht gefundene Begriffe
- kein LLM zur Laufzeit
- keine Benutzerkonten

## Architektur

Statische PWA. Alle Daten im Bundle, Auswertung vollständig im Browser.
Kein Backend, keine Datenbank, keine Netzwerkabhängigkeit nach dem ersten Laden.

```
/src
  App.tsx              Suche, Ergebnisdarstellung, Wochenanzeige
  engine/bewerten.ts   Regelmaschine
  engine/suchen.ts     Normalisierung und Matching
  daten/regeln.json    Risikoprinzipien (liegt bei)
  daten/lebensmittel.json  Katalog
/public
  manifest.json, icons, service-worker
```

Stack: Vite + React + TypeScript. Service Worker via `vite-plugin-pwa`.

## Datenmodell

Zwei Ebenen, die zusammen die Abdeckung erzeugen:

**Ebene 1 — Regelkatalog** (`regeln.json`, liegt bei). Rund 15 Risikoprinzipien.
Jede Regel kennt ihre Auslöser-Tags, einen Status und die Zustände, die sie
entschärfen. Diese Ebene ändert sich fast nie.

**Ebene 2 — Lebensmittelkatalog** (`lebensmittel.json`). Jeder Eintrag verweist über
Komponenten auf Regeln, statt eine eigene Bewertung mitzubringen:

```json
{
  "id": "vitello-tonnato",
  "name": "Vitello tonnato",
  "synonyme": ["kalbfleisch mit thunfischsauce"],
  "varianten": [
    {
      "label": "Aus dem Restaurant",
      "komponenten": [
        { "tag": "fleisch-durchgegart" },
        { "tag": "ei-roh" },
        { "tag": "raubfisch-mittel", "zustand": "durcherhitzt" }
      ]
    },
    {
      "label": "Gekaufte Sauce",
      "komponenten": [
        { "tag": "fleisch-durchgegart" },
        { "tag": "ei-roh", "zustand": "pasteurisiert" }
      ]
    }
  ],
  "alternativen": ["..."],
  "eigener_text": null
}
```

`eigener_text` überschreibt die generierte Begründung, wenn ein Eintrag eine
Formulierung braucht, die die Regel nicht hergibt. Sparsam einsetzen — sonst
zerfällt der Katalog wieder in eine Liste.

## Auswertungslogik

Pro Variante:
1. Für jede Komponente alle Regeln sammeln, deren `trifft_auf` das Tag enthält.
2. Zustand der Komponente gegen `entschaerfung` prüfen, Status entsprechend herabstufen.
   `nicht_entschaerfbar_durch` blockiert das (Quecksilber verschwindet nicht durch Kochen).
3. Schlechtester Status aller Komponenten gewinnt.
4. Begründungen der auslösenden Regeln zusammenführen, Duplikate entfernen.
5. Regeln mit `trimester_gewichtung` erzeugen nur im passenden Trimester einen
   zusätzlichen Hinweis.

Vier Kategorien, kein Punktescore: `ok`, `bedingt`, `meiden`, `unklar`.

## Nulltreffer

Kein Raten, keine Ableitung über Wortähnlichkeit. Anzeige: nicht hinterlegt,
mit dem Verweis, im Zweifel die Hebamme zu fragen. Eine falsch geratene
Freigabe ist der einzige echte Schadensfall dieser App.

## UI

Modern, ruhig, im Supermarkt bei schlechtem Licht und mit einer Hand bedienbar.

**Farben**

| Rolle | Hex |
|---|---|
| Grundfläche | `#F4F5F2` |
| Karten | `#FFFFFF` |
| Text | `#16211C` |
| Text gedämpft | `#5F6B62` |
| Tannengrün (Ja, Kopfzeile) | `#14432F` |
| Grünfläche | `#DBE7DE` |
| Weinrot (Nein) | `#7A1E28` |
| Rotfläche | `#F0DCDE` |
| Ocker (Bedingt) | `#7A5311` |
| Ockerfläche | `#EFE6D5` |
| Linien | `#D8DAD2` |

Rot und Grün sind gleichzeitig Markenfarben und Ampelsemantik — das ist gewollt.
Ocker steht bewusst zurück und ist als dritte Farbe nur für `bedingt` zugelassen.
Rot-Grün-Schwäche abfangen: jedes Urteil trägt immer auch das Wort, nie nur die Farbe.

**Typografie**: eine Familie, moderne Grotesk. Urteilswort deutlich grösser
gesetzt als der Fliesstext. Keine Versalien-Labels.

**Aufbau**

1. Kopfzeile in Tannengrün: Titel links, Schwangerschaftswoche und Trimester rechts.
2. Suchfeld direkt darunter, beim Start fokussiert. Häufige Begriffe als Chips.
3. Trefferliste ab zwei Zeichen.
4. Ergebniskarte: Name, dann bei Zubereitungsabhängigkeit **alle Varianten
   untereinander sichtbar**, jede mit eigener Marke (Ja / Bedingt / Nein) und
   einer Zeile Begründung. Keine Rückfrage vorschalten — sie soll auf einen Blick
   sehen, dass die Zubereitung der entscheidende Faktor ist.
5. Alternativen darunter.
6. Fusszeile mit dem Hinweis auf Hebamme und Ärztin, auf jedem Screen sichtbar.

Barrierefrei bis Kontrast AA, Tastaturfokus sichtbar, `prefers-reduced-motion`
respektiert. Bewegung nur als Antwort auf eine Eingabe.

## Betrieb

Deployment als statische Seite auf Cloudflare Pages oder Vercel, gekoppelt an das
GitHub-Repository. Push auf `main` deployt. Kostenlos, kein Server zu warten.
Über das Manifest legt sie sich die App auf den Homescreen; der Service Worker
macht sie offline lauffähig.

## Aufgaben

1. Repo aufsetzen, Prototyp `prototyp/essen-check.jsx` als Referenz für Interaktion
   und Formulierungen lesen.
2. Regelmaschine bauen, mit Unit-Tests gegen `daten/lebensmittel.json`. Der
   Startkatalog deckt jede Regel und jedes Variantenmuster mindestens einmal ab
   und dient als Testgrundlage.
3. Katalog auf rund 250 Einträge erweitern, entlang realer Suchbegriffe:
   Käsesorten, Fischarten, Wurstwaren, Fertiggerichte, Restaurantklassiker,
   Getränke, Süsswaren, Kräuter und Gewürze, verbreitete Mythen. Formulierungen
   aus dem Prototyp übernehmen, dabei die dort transkribierten Umlaute auf
   korrekte Schreibweise bringen.
4. PWA-Hülle, Icons, Offline-Test im Flugmodus.
5. Deployment einrichten.

## Qualitätsvorbehalt

Die Inhalte orientieren sich an den gängigen Schweizer Empfehlungen, sind aber
nicht fachlich verifiziert. Vor dem produktiven Einsatz einmal von der Hebamme
gegenlesen lassen. Keine Inhalte erfinden: was nicht belegt ist, wird `unklar`.
