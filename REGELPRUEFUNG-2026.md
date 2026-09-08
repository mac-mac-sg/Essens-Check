# Regelprüfung Schweiz — Stand 08.09.2026

Diese Notiz dokumentiert den erneuten Abgleich des Regelsets mit aktuellen Schweizer Primärquellen. Massstab ist die im Projekt festgelegte Sicherheitsregel: **keine Freigabe erfinden; bei fehlender belastbarer Schweizer Einzelvorgabe `unklar` statt eines geratenen Ja.**

## Primärquellen

- Schweizerische Gesellschaft für Ernährung (SGE): *Ernährung während der Schwangerschaft*, aktuelle Fassung: https://www.sge-ssn.ch/media/02apbag5/sge_mb_schwangerschaft_de.pdf
- Bundesamt für Lebensmittelsicherheit und Veterinärwesen (BLV): Ernährung in Schwangerschaft und Stillzeit: https://www.blv.admin.ch/de/ernaehrung-schwangere-und-stillende
- Bundesamt für Gesundheit (BAG): Toxoplasmose: https://www.bag.admin.ch/de/toxoplasmose-de
- Bundesamt für Gesundheit (BAG): Listeriose: https://www.bag.admin.ch/de/listeriose
- BLV: Blei im Wildfleisch: https://www.blv.admin.ch/de/blei
- BLV: Jodiertes Salz / Algen: https://www.blv.admin.ch/de/jodiertes-salz
- BLV: Bedarf an Nahrungsergänzungsmitteln: https://www.blv.admin.ch/de/bedarf-nahrungsergaenzungsmitteln
- Swissmedic: Fencheltee für Schwangere, Säuglinge und Kinder unter 4 Jahren, 06.03.2024: https://www.swissmedic.ch/swissmedic/de/home/news/mitteilungen/fencheltee-fuer-schwangere-kinder-unter-4-jahren.html

Swissmedic wird beim Fenchel nur ergänzend verwendet: Die Behörde weist selbst darauf hin, dass als Lebensmittel verkaufte Fencheltees nicht in ihre Zuständigkeit fallen. Deshalb ergibt diese Quelle in der App **kein pauschales Nein**, sondern `unklar`.

## Umgesetzte Korrekturen

| Thema | Vorher | Neu | Grund |
|---|---|---|---|
| Energy Drinks | `bedingt` über Koffein | `meiden` | SGE empfiehlt Verzicht |
| Tonic / Bitter Lemon | als unproblematisch beschrieben | `meiden` | SGE empfiehlt Verzicht auf chininhaltige Getränke |
| Ginger Ale | mit Tonic zusammengefasst | eigener Eintrag `ok` | normales Ginger Ale ist nicht automatisch chininhaltig |
| Tiefgefrorenes rohes Fleisch | nach 3 Tagen bei −18 °C `bedingt` | bleibt `meiden` | aktuelle BAG-Verbraucherempfehlung nennt Tiefkühlen nicht als Freigabe |
| Nori / Algen | kleine Menge `ok` | mindestens `bedingt` | BLV: Algen nur sparsam konsumieren |
| Mikro-/Blaualgenpräparate | pauschal `meiden` | `unklar` | keine belastbare Schweizer Grundlage für ein generelles Verbot aller Produkte |
| Softeis aus Maschine | `bedingt` | `unklar` | keine spezifische Schweizer Schwangerschaftsempfehlung |
| Lakritze | konkrete Häufigkeitsregel | `unklar` | keine aktuelle Schweizer Mengen-/Häufigkeitsgrenze hinterlegt |
| Salbei/Himbeerblätter/Zimtrinde | trimesterabhängige Freigabe | `unklar`, kein Trimesterhinweis | keine belastbare aktuelle Schweizer Trimesterregel |
| Fencheltee | als sichere Alternative geführt | `unklar`, nicht mehr als Alternative | Swissmedic-Warnsignal betrifft Arzneimittel; Lebensmittelzuständigkeit ausdrücklich ausgenommen |
| Innereien ausser Leber | `bedingt` aufgrund ausländischer Quellen | `unklar` | aktuelle Schweizer Schwangerschaftsempfehlung enthält keine pauschale Regel für alle Innereien |
| Leber | ganze Schwangerschaft `meiden` | 1. Trimester `meiden`, danach `bedingt` bei bekanntem Trimester | SGE-Verzicht ausdrücklich bis Ende des dritten Monats |
| Wildfleisch | durchgegart `ok` | immer `meiden` | BLV empfiehlt Schwangeren vorsorglich vollständigen Verzicht wegen Blei |
| Thunfisch | auch Konserve wochenbegrenzt | nur frischer Thunfisch `bedingt`; Konserve `ok` | aktuelle SGE-Mengenbegrenzung nennt ausdrücklich frischen Thunfisch |
| Hecht | pauschal wochenbegrenzt | nur ausländischer Hecht `bedingt`; unbekannte Herkunft `unklar` | SGE nennt ausdrücklich ausländischen Hecht |
| Ostsee-Lachs / Ostsee-Hering | nicht sauber nach Herkunft getrennt | `meiden` als eigene Herkunftsvarianten | SGE nennt beide ausdrücklich zum vollständigen Verzicht |
| Rotbarsch | mengenbegrenzt | gegart `ok` | SGE nennt Rotbarsch ausdrücklich als möglichst schadstoffarm |
| Weisser Heilbutt | mengenbegrenzt | gegart `ok`; unklare Art `unklar` | SGE nennt ausdrücklich weissen Heilbutt als möglichst schadstoffarm |
| Makrele / Zander / Seeteufel | aus nicht-schweizerischen Ableitungen mengenbegrenzt | gegart `ok`, roh `meiden` | aktuelle Schweizer Liste nennt dafür keine zusätzliche Mengenbegrenzung |
| Tintenfisch | zusätzlich mengenbegrenzt | gegart `ok`, roh `meiden` | Schweizer Empfehlung unterscheidet hier nach Garung, nicht nach einer Schadstoff-Wochengrenze |
| generisches `milch-pasteurisiert` | Text konnte als Freigabe aller pasteurisierten Milchprodukte gelesen werden | Text ausdrücklich auf sichere Kategorien begrenzt | Weich-/Halbhart-/Feta-Regeln bleiben strenger |
| generische Dioxinregel | pauschales `meiden` für Aal/fetten Fisch | `unklar`, bis Art/Herkunft konkret belegt ist | aktuelle SGE arbeitet mit konkreten Arten/Herkünften |

## Technische Umsetzung

Die Basiskataloge `daten/regeln.json` und `daten/lebensmittel.json` bleiben als historisch nachvollziehbarer Stand erhalten. `daten/korrekturen.json` bildet die fachlich neu entschiedenen Änderungen darüber ab. `src/daten.ts` wendet diese Patches generisch anhand stabiler IDs an und bricht bei unbekannten Patch-Zielen ab.

Für die Leber wurde die Regelmaschine um `trimester_status` ergänzt. Der normale Regelstatus bleibt der **strengere Rückfallwert**, wenn kein Geburtstermin bekannt ist. Eine Lockerung erfolgt nur bei tatsächlich bekanntem Trimester.

Alle geänderten Urteile sind durch Regressionstests abgedeckt.