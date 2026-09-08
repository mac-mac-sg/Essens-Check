# Darf ich das? — Bau-Spezifikation

Persönliche App für eine Schwangere. Sie tippt ein Lebensmittel ein und bekommt in
Sekunden eine eindeutige Antwort — auch offline, auch im Supermarkt-Untergeschoss.

Der errechnete Geburtstermin steht weder im Repo noch im ausgelieferten Bundle.
Er wird einmal in der App eingetragen und bleibt danach ausschliesslich im
Browser des Geräts. Ohne Termin bleibt die Suche vollständig nutzbar; es fehlen
nur die Wochenanzeige und die Hinweise zum Trimester.

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

**Ebene 1 — Regelkatalog** (`regeln.json`, liegt bei). 19 Risikoprinzipien.
Jede Regel kennt ihre Auslöser-Tags, einen Status und die Zustände, die sie
entschärfen. Diese Ebene ändert sich fast nie.

Neben den Regeln führt `regeln.json` eine Liste `grundsaetze`: was unabhängig
vom einzelnen Lebensmittel gilt und deshalb einmal zentral steht statt an jedem
betroffenen Eintrag. Zwei Grundsätze: die Käserinde, und was «durcherhitzt»
heisst (70 °C Kerntemperatur, zwei Minuten). Die Rindenfrage an jedem der acht
Hartkäse-Einträge zu stellen hätte aus acht klaren Ja acht bedingte gemacht,
und Hartkäse ist der Rückfallweg, auf dem fast jede Alternativenliste endet.

Der Abschnitt «Gilt immer», der sie auf dem Startbildschirm zeigte, ist auf
Wunsch entfernt. Die Angaben stehen weiter auf jeder betroffenen Karte; einen
zentralen Platz in der App haben sie derzeit nicht. Die fachliche Durchsicht
hatte die zentrale Führung ausdrücklich unter der Auflage bestätigt, dass die
Regel «in der App gut sichtbar» bleibt — siehe P17 in
`daten/offene-punkte.json`.

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
  "eigener_text": null,
  "zusatz_text": null
}
```

Jeder Eintrag trägt zusätzlich eine `gruppe` — eine grobe Warengruppe, die
ausschliesslich die Übersicht «Was kann ich essen?» gliedert. Auf die Bewertung
hat sie keinen Einfluss.

`eigener_text` überschreibt die generierte Begründung, wenn ein Eintrag eine
Formulierung braucht, die die Regel nicht hergibt. Sparsam einsetzen — sonst
zerfällt der Katalog wieder in eine Liste. Der Ersatz gilt für **alle**
Varianten und ist deshalb nur zulässig, wo alle dasselbe Urteil tragen. Sonst
steht derselbe Satz einmal unter einem Ja und einmal unter einem Nein: «Halloumi
wird gebraten und ist damit unbedenklich» stand so über dem roten Urteil für den
rohen Würfel. Ein Test hält das offen.

`zusatz_text` ergänzt die Begründung, statt sie zu ersetzen. Er gilt dem
Eintrag, nicht der einzelnen Zubereitung, und steht deshalb einmal unter allen
Varianten — bei drei Varianten stünde derselbe Absatz sonst dreimal auf einem
Bildschirm. Das ist der Ort für alles, was zum Eintrag gehört, aber die Regel
nicht ersetzt: Einordnung, Erkennungsmerkmal, Verweis auf einen zweiten Eintrag
mit gegenläufigem Urteil — etwa vom verordneten Jodpräparat auf die
Jod-Obergrenze bei Algen und zurück.

Für Listen gibt es einen fünften Zustand neben den vier Urteilen: `gemischt`.
Er sagt, dass die Varianten eines Eintrags verschieden urteilen und die Zeile
deshalb kein Urteil zeigen kann — mit der Frage, die entscheidet, als zweiter
Zeile. Er ist keine Bewertung und trägt deshalb keine Ampelfarbe (siehe
`src/engine/listenzeile.ts`).

## Auswertungslogik

Pro Variante:
1. Für jede Komponente alle Regeln sammeln, deren `trifft_auf` das Tag enthält.
2. Zustand der Komponente gegen `entschaerfung` prüfen, Status entsprechend herabstufen.
   `nicht_entschaerfbar_durch` blockiert das (Quecksilber verschwindet nicht durch Kochen).
3. Der Status mit dem höchsten Vorrang gewinnt — die Reihenfolge steht in
   `status_rangfolge`, hinten schlägt vorn. Dasselbe gilt, wo mehrere Regeln
   dasselbe Tag treffen oder mehrere Entschärfungen auf denselben Zustand
   passen: bei Widerspruch oder Mehrdeutigkeit greift stets das strengere
   Argument. Trifft eine Regel, schlägt sie eine Freigabe aus `unbedenkliche_tags`.
   Eine Komponentenliste ohne Einträge ergibt `unklar`, nie `ok`.

   Die Reihenfolge lautet `ok`, `bedingt`, `unklar`, `meiden` und ist keine
   reine Schweregrad-Skala. `unklar` schlägt `ok` und `bedingt`, weil Unwissen
   nie zur Freigabe oder zur blossen Einschränkung werden darf. `meiden`
   schlägt `unklar`, weil ein unbewerteter Bestandteil sonst ein bekanntes Nein
   verdeckte — die Karte sagte «Nicht bewertet», obwohl die App das
   Entscheidende weiss.
4. Begründungen der auslösenden Regeln zusammenführen, Duplikate entfernen.
   `eigener_text` tritt an ihre Stelle; `zusatz_text` steht einmal unter der
   ganzen Karte.
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

Türkis-Blau als Marke, kühle helle Neutrale als Grund. Die Palette steht als
Wahrheit in `src/styles.css`; diese Tabelle ist ihre Abschrift.

| Rolle | Hell | Dunkel |
|---|---|---|
| Grundfläche | `#F8FAFA` | `#0e1517` |
| Warme Tönung (Hero, Verlauf) | `#EEF5F5` | `#111D20` |
| Karten | `#FFFFFF` | `#172124` |
| Text | `#152024` | `#EDF5F6` |
| Text zweitrangig | `#3D4B50` | `#C4D0D3` |
| Text gedämpft | `#607177` | `#98A9AD` |
| Marke (Flächen, Aktionen) | `#075F74` | `#032F3B` |
| Akzent (Schrift, Fokusring) | `#006579` | `#79DCE5` |
| Ja | `#17603C` auf `#DCEFE2` | `#79C99A` auf `#16321F` |
| Bedingt | `#7A5311` auf `#F6ECD8` | `#E6BA66` auf `#352815` |
| Nein | `#C4161B` auf `#FCDCDB` | `#FF9187` auf `#5A221C` |
| Unklar | `#5A5257` auf `#EAE5E6` | `#ACA3A7` auf `#302A2D` |
| Linien | `#DCE7E8` | `#28363A` |

Die Markenfarbe ist rot, und Rot ist in dieser App die Farbe für «Besser
nicht». Das ist die gefährlichste Stelle der Palette und wird auf drei Wegen
gehalten:

- **Farbton.** Die Marke ist pflaumig (330 Grad hell, 317 Grad dunkel), das
  Ampelrot scharlachrot (358 beziehungsweise 5 Grad).
- **Helligkeit.** Die Marke ist sehr dunkel, das Ampelrot deutlich heller.
- **Rolle.** Die Marke erscheint ausschliesslich als Fläche — der gewählte
  Filterchip, eine Aktion, der Fortschrittsstreifen. Das Urteil erscheint ausschliesslich als Schrift auf heller
  Tönung. Sie treffen nie aufeinander.

`src/palette.test.ts` liest beide Paletten aus `styles.css` und misst das nach.
Wer die Marke aufhellt oder das Ampelrot abdunkelt, bis beide dasselbe Rot
sind, bekommt einen roten Testlauf.

Ocker steht bewusst zurück und ist als dritte Farbe nur für `bedingt`
zugelassen. Rot-Grün-Schwäche abfangen: jedes Urteil trägt immer auch das Wort,
nie nur die Farbe. Für Listenzeilen ohne eindeutiges Urteil gibt es gar keine
Farbe — nur das Wort «Kommt drauf an» und einen halb grünen, halb roten Punkt,
der sagt, dass beides darin steckt.

**Dunkles Schema.** Die Markenfarben sind als dunkle Schrift auf hellen
Tönungen entworfen und wären auf dunklem Grund unlesbar. Das Verhältnis kehrt
sich deshalb um: aufgehellte Farbe auf dunkler Tönung derselben Buntheit.

Voreingestellt ist **Hell**, nicht die Systemvorgabe: viele Geräte stehen
dauerhaft auf Dunkel, und die App soll beim ersten Öffnen so aussehen, wie sie
entworfen ist. Ein Schieberegler in der Fusszeile stellt auf Dunkel um,
«Dem Gerät folgen» übergibt an `prefers-color-scheme`. Jede der drei Wahlen
liegt im `localStorage` und gilt ab dann — auch «system», sonst hielte sie nur
bis zum Schliessen der App.
Die Stellung steht zusätzlich als Wort daneben — nie Farbe allein.
Solange dem Gerät gefolgt wird, zieht ein Wechsel dort sofort nach.

Technisch entscheidet ein Attribut am Wurzelelement, nicht die Medienabfrage:
ein Skript in `index.html` setzt es vor dem ersten Malen, sonst erschiene die
App kurz hell, bevor React das dunkle Schema setzt. Die Palette steht damit
einmal da, statt für Systemvorgabe und Schalterwahl doppelt gepflegt zu werden.

**Elemente**

- **Hero** auf der Startansicht: was die App tut, in Titel und zwei Sätzen.
  Milchglas über der warmen Tönung. Direkt darunter das Suchfeld — wer die App
  öffnet, will etwas nachschlagen. Eine Legende der vier Stufen stand hier
  einmal und ist weg: sie erklärt sich auf der ersten Karte von selbst.
- **Verlauf** statt einer Liste häufiger Begriffe: die letzten fünf
  nachgeschlagenen Lebensmittel, das Jüngste zuoberst, mit ihrem Urteil.
  Gemerkt wird beim Öffnen einer Karte, nicht beim Tippen. Der Verlauf bleibt
  auf dem Gerät wie der Geburtstermin und lässt sich mit einem Griff leeren —
  eine Liste nachgeschlagener Lebensmittel verrät auf einem geteilten Gerät
  etwas über eine Schwangerschaft. Ist er leer, erscheint der Abschnitt gar
  nicht.
- **Zwei Hinweiskacheln** am Ende der Startansicht — woran sich die Auskunft
  misst, und dass die Zubereitung entscheidet. Hintergrund, kein Einstieg.
- **Suchleiste** als Pille, klebt am oberen Rand. In einem Laden ist sie das
  Einzige, was zählt, und darf nie erst wieder gesucht werden müssen. Der
  sichere Bereich des Geräts steckt in ihrem Innenabstand, nicht im Versatz:
  sonst liefe auf einem Gerät mit Aussparung Inhalt oberhalb der Leiste durch.
- **Trefferzeilen** als Karten mit Name, Urteil und — wo es keines gibt — der
  Frage, die entscheidet.
- **Blatt von unten** für Detail und Terminformular: kommt von unten, geht nach
  unten, lässt sich am Griff eins zu eins ziehen, federt über der Oberkante und
  geht bei genug Weg oder genug Tempo zu. Dazu ein sichtbarer Schliessen-Knopf —
  Ziehen, Escape und der Schleier tun dasselbe, aber keines davon ist zu sehen.
  Die Ansicht dahinter bleibt stehen. Bei reduzierter Bewegung entfällt das
  Ziehen — das Stylesheet setzt dort jede Transformation zurück, das Blatt
  liesse sich sonst anfassen und bliebe stehen.
- **Navigationsleiste** mit den drei Zielen Suchen, Liste und Scannen,
  schwebend in der Daumenzone. Vorher waren Liste und Scanner nur vom
  Startbildschirm aus erreichbar: wer gesucht hatte, musste erst zurück. Sie
  liegt unter dem Blatt, damit der Schleier sie mitverdunkelt, und über ihr
  bleibt Platz für die Fusszeile — der Hinweis auf Hebamme und Ärztin darf
  nicht darunter enden. Das aktive Ziel trägt Farbe, Fettung und
  `aria-current`.
- **Filterreihe** über der Übersicht: waagrecht scrollbare Chips für «Alle»
  und die zwölf Warengruppen. Ohne Filter bleiben die Gruppen zugeklappt; ist
  eine gewählt, steht ihre Liste direkt da — ein Behälter um genau einen Inhalt
  wäre nur ein Griff mehr.
- **Leerer Zustand** ohne Urteilsmarke: gestrichelte Kante, keine Ampelfarbe.
  Ein Suchbegriff, den der Katalog nicht kennt, ist keine Bewertung, sah aber
  wie eine aus, solange «Nichts gefunden» dieselbe Marke trug wie «Nicht
  bewertet».

Kontrast AA gilt in beiden Schemata und ist in beiden zu messen, nicht zu
schätzen: das dunkle Türkis-Blau als Schriftfarbe käme auf dunklem Grund auf
1.3:1.

**Typografie**: eine Familie, moderne Grotesk. Drei Gewichte — 500 für leise
Beschriftungen, 600 für Titel und Namen, 700 für Urteilswörter und Marken.
Urteilswort deutlich grösser gesetzt als der Fliesstext. Keine Versalien-Labels
ausser bei kurzen Zwischentiteln.

Ein viertes Gewicht, 650, stand einmal auf den Urteilswörtern. Es setzt einen
variablen Schriftschnitt voraus: auf iOS stellt `-apple-system` es dar, überall
sonst rundet der Browser auf 700 — gemessen im Browser, wo 600, 650, 700 und
800 dieselbe Breite ergeben. Ein Gewicht, das nur auf einer Plattform existiert,
ist keine Stufe der Skala.

**Aufbau**

1. Kopf ohne Balken: der Stand als Pille, darunter «Darf ich das?» und
   «Food Checker für die Schwangerschaft». Das stand vorher in einer klebenden
   türkis-blauroten Leiste — eine zweite Fläche über der Startansicht, die dem
   Einstieg die Ruhe nahm. Jetzt steht der Text direkt auf dem Grund und
   scrollt mit ihm weg.

   Die Pille nennt Woche und verbleibende Zeit und führt zugleich zum
   Geburtstermin; der Stand ist damit anfassbar statt nur lesbar. Ist kein
   Termin eingetragen, steht dort die Einladung, einen zu erfassen — nie eine
   geratene Woche. In der Pille zeigt ein drei Pixel hoher Streifen, wie weit
   die Schwangerschaft ist. Er sass zuerst als Füllung in der Fläche; dort
   drückte er den gemessenen Kontrast der leisen Zeile auf 4.03 und damit unter
   AA. Als eigener Streifen liegt kein Text darauf.
2. Hero darunter, solange nicht gesucht wird.
3. Suchfeld als Pille darunter, beim Start fokussiert, klebt beim Scrollen am
   oberen Rand.
4. Verlauf: die letzten fünf nachgeschlagenen Lebensmittel mit ihrem Urteil.
5. Trefferliste ab zwei Zeichen, dieselben Zeilen.
6. Ergebniskarte im Blatt von unten: Name, dann bei Zubereitungsabhängigkeit
   **alle Varianten untereinander sichtbar**, jede mit eigener Marke
   (Ja / Bedingt / Nein) und einer Zeile Begründung. Keine Rückfrage
   vorschalten — sie soll auf einen Blick sehen, dass die Zubereitung der
   entscheidende Faktor ist.
7. Alternativen darunter.
8. Fusszeile mit dem Hinweis auf Hebamme und Ärztin, auf jedem Screen sichtbar.

Über jeder Begründung steht das Risikoprinzip, das sie ausgelöst hat. Der
Katalog wird nie vollständig sein; wer das Muster kennt, kann ein nicht
hinterlegtes Lebensmittel selbst einordnen.

**Strichcode** (Erweiterung). Über die Kamera lassen sich EAN-8 und EAN-13
lesen. Jeder gelesene Code wird bei **Open Food Facts** nachgeschlagen — das ist
die einzige Stelle, an der Daten das Gerät verlassen; der Dienst erfährt dabei,
welches Produkt gerade gescannt wird. Es gibt keinen lokalen Zwischenspeicher
und keinen Schalter.

Zeigt der Produktname eindeutig auf einen Katalogeintrag, erscheint direkt das
Urteil, mit dem gescannten Namen und dem zugeordneten Eintrag als Herkunftszeile
darüber. Eindeutig heisst: alleiniger Treffer oder mindestens doppelt so schwer
wie der nächste. Bei Gleichstand oder ohne Fund kommt die Auswahl — ohne zu
wissen, wovon die Rede ist, lässt sich keine Einschätzung zeigen.

Bei der Zuordnung eines Produktnamens zählen nur Wortanfänge. Zeichenfolgen
mitten im Wort erzeugen bei fremden Namen nur Unsinn — «Latte» steckt in
«Himbeerblättertee», «Cola» in «Mousse au chocolat», «Rot» in «Brot» — und
verhinderten mehrfach, dass sich der richtige Eintrag durchsetzt.

Die Grenze der Zuordnung ist benannt, nicht wegoptimiert: ein Produktname, der
nur über ein Geschmackswort trifft, führt zum falschen Eintrag. «Danone Actimel
Erdbeere» landet bei «Erdbeeren und Beeren». Über den Anteil am Produktnamen ist
das nicht zu trennen — gemessen liegt dieser Fall bei 38 Prozent, der richtige
Treffer «Migros Räucherlachs» ebenfalls. Deshalb nennt die Herkunftszeile die
Zuordnung ausdrücklich, und «Anderes Lebensmittel» führt zurück zur Auswahl.

Die Prüfziffer wird geprüft, damit ein Lesefehler nicht nachgeschlagen wird. Wo
der Browser keine Strichcodes lesen kann, sagt die App das offen.

**Grenzen über die Mahlzeit hinaus.** Manche Regeln meinen ein Budget, keine
einzelne Portion: Koffein pro Tag, Thunfisch pro Woche, Lakritze nicht täglich.
Eine Auskunft pro Lebensmittel verschweigt das — zwei Tassen Kaffee sind je
einzeln unbedenklich und zusammen schon die Tagesgrenze. Regeln tragen dafür
ein Feld `grenze`, das die Karte abgesetzt zeigt. Ist die Regel entschärft,
verschwindet die Grenze mit ihr: «unbegrenzt möglich» und «zählt aufs
Tagesbudget» im selben Atemzug wäre ein Widerspruch.

**Rückfrage bei Komposita.** Findet die Suche nichts, wird geprüft, ob ein
Katalogbegriff *im* Suchwort steckt — «Kalbsbratwurst» enthält «Bratwurst».
Das ist ausdrücklich eine Rückfrage und nie ein Urteil: die Zerlegung deutscher
Komposita ist mit Zeichenketten nicht verlässlich zu haben. «Leberkäse» enthält
«Leber» und ist doch eine Brühwurst, «Austernpilze» enthalten «Austern» und
sind ein Pilz, «Onigiri» enthält «Nigiri» und ist ein Reisball. Sie wählt aus,
oder sie wählt nichts.

**Mehrwortsuche.** Eine Eingabe wird zuerst als Ganzes gesucht. Bleibt sie ohne
Treffer und besteht aus mehreren Wörtern, entscheiden die einzelnen Wörter.
«Tatar vom Lachs» stand sonst im Nichts, obwohl beide Wörter im Katalog liegen —
und gerade dort steht ein Nein. Erfunden wird dabei nichts: «blauer himmel»
bleibt ein Nulltreffer.

**Umgekehrte Frage.** Vom Startbildschirm aus erreichbar: «Was kann ich essen?»
listet nach Warengruppe, was ein klares Ja hat, mit der Zubereitung, unter der
es gilt. Die Gruppen sind zugeklappt — zwölf Titel auf einen Blick statt
246 Einträge am Stück. Geöffnet wird die Gruppe eine zusammenhängende Fläche
mit Haarlinien zwischen den Zeilen — als blosse Textzeilen auf dem Seitengrund
waren dreissig Einträge nicht auseinanderzuhalten. `bedingt` bleibt draussen — eine Liste, die zum Zugreifen einlädt, darf
nichts enthalten, das noch eine Einschränkung mitbringt.

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
