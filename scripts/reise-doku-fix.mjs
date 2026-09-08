import { readFileSync, writeFileSync } from 'node:fs'

function lese(pfad) { return readFileSync(pfad, 'utf8') }
function schreibe(pfad, text) { writeFileSync(pfad, text, 'utf8') }
function ersetze(text, alt, neu, name) {
  if (!text.includes(alt)) throw new Error(`Fehlt: ${name}`)
  return text.replace(alt, neu)
}

let spec = lese('SPEC.md')
spec = spec.replace('| Warme Tönung (Hero, Verlauf) |', '| Kühle Tönung (Hero, Verlauf) |')
const altFarbe = `Die Markenfarbe ist rot, und Rot ist in dieser App die Farbe für «Besser\nnicht». Das ist die gefährlichste Stelle der Palette und wird auf drei Wegen\ngehalten:\n\n- **Farbton.** Die Marke ist pflaumig (330 Grad hell, 317 Grad dunkel), das\n  Ampelrot scharlachrot (358 beziehungsweise 5 Grad).\n- **Helligkeit.** Die Marke ist sehr dunkel, das Ampelrot deutlich heller.\n- **Rolle.** Die Marke erscheint ausschliesslich als Fläche — der gewählte\n  Filterchip, eine Aktion, der Fortschrittsstreifen. Das Urteil erscheint ausschliesslich als Schrift auf heller\n  Tönung. Sie treffen nie aufeinander.\n\n\`src/palette.test.ts\` liest beide Paletten aus \`styles.css\` und misst das nach.\nWer die Marke aufhellt oder das Ampelrot abdunkelt, bis beide dasselbe Rot\nsind, bekommt einen roten Testlauf.`
const neuFarbe = `Die Markenfarbe ist bewusst **blau-türkis** und damit klar von den semantischen\nUrteilfarben getrennt. Besonders wichtig ist der Abstand zum grünen «Ja»: Das\nTürkis bleibt deutlich auf der blauen Seite und darf nicht in ein Sicherheitsgrün\nkippen. Rot, Ocker und Grau bleiben ausschliesslich den Urteilen vorbehalten.\n\n- **Farbton.** Türkis-Blau und das grüne «Ja» haben einen messbaren Farbtonabstand.\n- **Rolle.** Die Marke erscheint als Headerfläche, Aktion, Fokussignal und\n  Fortschrittsstreifen. Ein Urteil trägt dagegen immer seine eigene Farbe und das\n  ausgeschriebene Statuswort.\n- **Test.** \`src/palette.test.ts\` liest beide Paletten direkt aus \`styles.css\` und\n  prüft Kontrast sowie den Farbtonabstand der Marke zu «Ja» und «Nein».`
spec = ersetze(spec, altFarbe, neuFarbe, 'alte Markenfarberklärung')
spec = spec.replaceAll('warme Tönung', 'kühle Tönung').replaceAll('warmen Tönung', 'kühlen Tönung')
schreibe('SPEC.md', spec)

let design = lese('DESIGN-REDESIGN.md')
design = design
  .replace('Ergänzend bietet `Wissen` einen klar getrennten redaktionellen Bereich für Ernährungsthemen und Rezeptideen.', 'Ergänzend bietet `Wissen` einen klar getrennten redaktionellen Bereich für Ernährungsthemen, Rezeptideen sowie Orientierung für unterwegs und auf Reisen.')
  .replace('- Grundfläche: warme Rosé-Neutrale aus der bestehenden Palette.', '- Grundfläche: kühle, sehr helle Neutrale aus der bestehenden Palette.')
  .replace('Die bestehende Light-/Dark-Palette und die Trennung von Markenfarbe und Ampelfarben bleiben unverändert.', 'Light und Dark Mode verwenden dieselbe blau-türkise Markenidentität. Die semantischen Ampelfarben bleiben davon klar getrennt.')
  .replace('- `Wissen` — Ernährungsthemen und Rezeptideen', '- `Wissen` — Ernährung, Rezeptideen sowie Unterwegs & Reisen')
  .replace('Der Bereich `Wissen` ist redaktionell und darf nicht wie ein Lebensmittelurteil wirken. Er besteht aus zwei Einstiegen:', 'Der Bereich `Wissen` ist redaktionell und darf nicht wie ein Lebensmittelurteil wirken. Er besteht aus drei Einstiegen:')

const rezeptEnde = `Der Wissensbereich bleibt vollständig im App-Bundle und funktioniert offline. Er führt keine zusätzliche Netzwerkverbindung ein.`
const unterwegsBlock = `### Unterwegs & Reisen\n\n- sechs kompakte Themen für Wandern, Naturtage und Reisen\n- Bewegung und Höhenlage, Sonne und Hitze, Zecken, Lebensmittel-/Trinkwasserhygiene, Reiseplanung/lange Wege sowie Malaria/Zika und Mückenschutz\n- aktuelle Schweizer Quellen: BAG, Gesundheitsförderung Schweiz und HealthyTravel / Schweizerisches Expertenkomitee für Reisemedizin\n- keine statische Länderrisikoliste in der App; veränderliche Malaria-/Zika-Lagen werden ausdrücklich zur aktuellen Reisemedizinquelle verwiesen\n- keine individuelle Reisefreigabe oder medizinische Risikobeurteilung\n\n${rezeptEnde}`
design = ersetze(design, rezeptEnde, unterwegsBlock, 'Wissensbereich-Ende')
schreibe('DESIGN-REDESIGN.md', design)

for (const pfad of ['public/icon.svg', 'public/favicon.svg']) {
  let svg = lese(pfad)
  if (pfad.endsWith('icon.svg')) svg = svg.replace('aria-label="Darf ich das essen?"', 'aria-label="Darf ich das?"')
  schreibe(pfad, svg)
}

console.log('Dokumentation und Icon-Beschriftung aktualisiert.')
