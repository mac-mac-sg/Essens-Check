import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

function lese(pfad) {
  return readFileSync(pfad, 'utf8')
}

function schreibe(pfad, inhalt) {
  writeFileSync(pfad, inhalt, 'utf8')
}

function ersetze(inhalt, alt, neu, beschreibung = alt) {
  if (!inhalt.includes(alt)) throw new Error(`Migration: «${beschreibung}» nicht gefunden`)
  return inhalt.replace(alt, neu)
}

function farbenErsetzen(inhalt) {
  const mapping = new Map([
    ['#faf7f7', '#f8fafa'],
    ['#f4ecee', '#eef5f5'],
    ['#1e1418', '#152024'],
    ['#4a3b40', '#3d4b50'],
    ['#6b5c63', '#607177'],
    ['#8a7b81', '#7d8c91'],
    ['#a3939a', '#91a0a4'],
    ['#4e0f2f', '#075f74'],
    ['#33071e', '#033c4c'],
    ['#8e1a45', '#006579'],
    ['#e8dde1', '#dce7e8'],
    ['#ded0d5', '#d1dee0'],
    ['#f1e9ec', '#edf4f4'],
    ['#e8dee2', '#e3ecee'],
    ['#8c7c83', '#7d8d92'],
    ['#141013', '#0e1517'],
    ['#1b1418', '#111d20'],
    ['#1f191c', '#172124'],
    ['#f0e9eb', '#edf5f6'],
    ['#cbbfc4', '#c4d0d3'],
    ['#a3959b', '#98a9ad'],
    ['#8b7d83', '#819398'],
    ['#837478', '#75898e'],
    ['#22061a', '#032f3b'],
    ['#150310', '#011f29'],
    ['#b8386a', '#0a7486'],
    ['#f0a5c0', '#79dce5'],
    ['#332a2e', '#28363a'],
    ['#43383d', '#34464b'],
    ['#262024', '#1d2a2d'],
    ['#2f282c', '#263438'],
    ['#6b5d63', '#607176'],
  ])
  let ausgabe = inhalt
  for (const [alt, neu] of mapping) {
    ausgabe = ausgabe.replaceAll(alt, neu).replaceAll(alt.toUpperCase(), neu.toUpperCase())
  }
  return ausgabe
}

// 1) Zentrale Palette: kühle Neutrale + blau-lastiges Türkis. Urteilfarben bleiben unverändert.
{
  let css = lese('src/styles.css')
  css = farbenErsetzen(css)
  css = css
    .replaceAll('tiefes Burgunder als Marke, warme Rosé-Neutrale als Grund', 'blau-lastiges Türkis als Marke, kühle Neutrale als Grund')
    .replaceAll('Die Marke ist bewusst pflaumig (Farbton 330 Grad)', 'Die Marke ist bewusst blau-türkis (Farbton rund 190 Grad)')
    .replaceAll('Beide sind\n * rot, und genau darin liegt die Gefahr: Rot ist in dieser App die Farbe für\n * «Besser nicht». Getrennt werden sie über Farbton, Helligkeit und Rolle — die', 'Damit liegt sie klar ausserhalb des grünen «Ja» und des roten «Nein». Getrennt werden\n * Marke und Urteilfarben zusätzlich über Rolle und Beschriftung — die')
    .replaceAll('Burgunder als Schriftfarbe auf Hellem. Im Dunkeln aufgehellt.', 'Türkis-Blau als Schriftfarbe auf Hellem. Im Dunkeln aufgehellt.')
    .replaceAll('das dunkle Burgunder träfe dort den Grund', 'das dunkle Türkis träfe dort den Grund')
    .replaceAll('Auf dunklem Grund trägt das dunkle Burgunder als Fläche nicht.', 'Auf dunklem Grund trägt das sehr dunkle Türkis als Fläche nicht.')
    .replaceAll('rgba(48, 12, 26', 'rgba(9, 48, 58')
    .replaceAll('rgba(30, 20, 24', 'rgba(14, 24, 27')
    .replaceAll('rgba(78, 15, 47', 'rgba(7, 95, 116')
    .replaceAll('rgba(38, 30, 34', 'rgba(22, 33, 36')
    .replaceAll('rgba(240, 165, 192', 'rgba(121, 220, 229')
  schreibe('src/styles.css', css)
}

// 2) Der adaptive Markenheader enthält bewusst einige feste Verläufe.
{
  let css = lese('src/redesign-fixes.css')
  const mapping = new Map([
    ['#62143c', '#0e8091'],
    ['#4e0f2f', '#075f74'],
    ['#33071e', '#033c4c'],
    ['#fff8fb', '#f4fdff'],
    ['#f0a5c0', '#79dce5'],
    ['#ffd3e1', '#b8f1f4'],
    ['#571134', '#0a7183'],
    ['#3d0a25', '#044a5a'],
    ['#3b0b28', '#063e4c'],
    ['#28071c', '#032f3b'],
    ['#170311', '#011d25'],
    ['#330920', '#043642'],
    ['#1c0514', '#011f28'],
  ])
  for (const [alt, neu] of mapping) css = css.replaceAll(alt, neu).replaceAll(alt.toUpperCase(), neu.toUpperCase())
  css = css
    .replaceAll('rgba(255, 248, 251', 'rgba(244, 253, 255')
    .replaceAll('rgba(240, 165, 192', 'rgba(121, 220, 229')
    .replaceAll('rgba(65, 10, 38', 'rgba(0, 70, 86')
    .replaceAll('rgba(31, 3, 18', 'rgba(0, 41, 52')
  schreibe('src/redesign-fixes.css', css)
}

// 3) Palette-Test an die neue relevante Konfliktfarbe anpassen: Türkis vs. grünes Ja.
{
  let test = lese('src/palette.test.ts')
  test = test
    .replaceAll('Farbton in Grad — sagt, ob zwei Rottöne wirklich verschiedene Rottöne sind.', 'Farbton in Grad — prüft den Abstand zwischen Marke und semantischen Urteilfarben.')
    .replaceAll('Die Marke ist rot, und Rot ist in dieser App die Farbe für «Besser nicht».\n   * Getrennt werden beide über den Farbton — die Marke ist pflaumig, das Urteil\n   * scharlachrot — und über die Helligkeit. Wer die Marke aufhellt oder das\n   * Urteil abdunkelt, bis beide dasselbe Rot sind, hebt die Ampel auf.', 'Die Marke ist blau-türkis. Entscheidend ist jetzt vor allem der Abstand zum\n   * grünen «Ja»: ein zu grün gezogenes Türkis würde Marken- und Sicherheitsfarbe\n   * visuell vermischen. Das rote «Nein» bleibt ebenfalls klar getrennt.')

  const alt = `  it('hält die Marke vom Ampelrot getrennt', () => {\n    const abstand = Math.abs(farbton(p('--marke')) - farbton(p('--farbe-meiden')))\n    expect(Math.min(abstand, 360 - abstand)).toBeGreaterThanOrEqual(20)\n    expect(kontrast(p('--marke'), p('--farbe-meiden'))).toBeGreaterThanOrEqual(2)\n    expect(kontrast(p('--marke'), p('--flaeche-meiden'))).toBeGreaterThanOrEqual(1.5)\n  })`
  const neu = `  it('hält die türkis-blaue Marke von Ja und Nein getrennt', () => {\n    for (const [stufe, mindestabstand] of [['ok', 30], ['meiden', 70]] as const) {\n      const abstand = Math.abs(farbton(p('--marke')) - farbton(p(\`--farbe-\${stufe}\`)))\n      expect(Math.min(abstand, 360 - abstand), stufe).toBeGreaterThanOrEqual(mindestabstand)\n    }\n  })`
  test = ersetze(test, alt, neu, 'alter Markenfarbtest')
  test = test
    .replaceAll('Der gewählte Filterchip. Im Dunkeln träfe das dunkle Burgunder den', 'Der gewählte Filterchip. Im Dunkeln träfe das sehr dunkle Türkis den')
    .replaceAll('Die Marke trägt weisse Schrift, wo sie als Fläche steht — der gewählte', 'Die Marke trägt weisse Schrift, wo sie als Fläche steht — der gewählte')
  schreibe('src/palette.test.ts', test)
}

// 4) Browser-/PWA-Farbe und Statusleiste.
{
  let farbschema = lese('src/farbschema.ts')
  farbschema = farbschema
    .replace("hell: '#F4ECEE',", "hell: '#075F74',")
    .replace("dunkel: '#1B1418',", "dunkel: '#032F3B',")
    .replace('das die warme Tönung am oberen Rand des Grundes (--grund-warm), nicht mehr\n * das Burgunder der Marke.', 'die Markenfläche des Headers: blau-türkis im hellen und tiefes Türkis im dunklen Schema.')
  schreibe('src/farbschema.ts', farbschema)

  let html = lese('index.html')
  html = html
    .replace('<meta name="theme-color" content="#F4ECEE" />', '<meta name="theme-color" content="#075F74" />')
    .replace("dunkel ? '#1B1418' : '#F4ECEE'", "dunkel ? '#032F3B' : '#075F74'")
    .replace('burgunderroten Kopfleiste', 'türkis-blauen Kopfleiste')
  schreibe('index.html', html)

  let vite = lese('vite.config.ts')
  vite = vite.replace("theme_color: '#4E0F2F',", "theme_color: '#075F74',")
  schreibe('vite.config.ts', vite)
}

// 5) Logo/Favicon und daraus abgeleitete Raster-Icons.
for (const pfad of ['public/icon.svg', 'public/favicon.svg']) {
  let svg = lese(pfad)
  svg = svg.replaceAll('#4E0F2F', '#075F74')
  schreibe(pfad, svg)
}

const renderer = (() => {
  for (const kandidat of ['magick', 'convert']) {
    try {
      execFileSync(kandidat, ['-version'], { stdio: 'ignore' })
      return kandidat
    } catch {
      // nächsten versuchen
    }
  }
  throw new Error('Weder ImageMagick «magick» noch «convert» ist auf dem Runner vorhanden.')
})()

function rendere(ziel, groesse, quelle = 'public/icon.svg') {
  const args = renderer === 'magick'
    ? [quelle, '-background', 'none', '-resize', `${groesse}x${groesse}`, ziel]
    : [quelle, '-background', 'none', '-resize', `${groesse}x${groesse}`, ziel]
  execFileSync(renderer, args, { stdio: 'inherit' })
}

rendere('public/icon-192.png', 192)
rendere('public/icon-512.png', 512)
rendere('public/icon-maskable-512.png', 512)
rendere('public/apple-touch-icon.png', 180, 'public/favicon.svg')

// 6) Neuer, eigenständiger Wissensbereich «Unterwegs & Reisen».
{
  let wissen = lese('src/Wissen.tsx')
  wissen = ersetze(wissen, "type Bereich = 'ernaehrung' | 'rezepte'", "type Bereich = 'ernaehrung' | 'rezepte' | 'unterwegs'", 'Bereich-Typ')

  const reiseArtikel = `const UNTERWEGS: Wissensartikel[] = [\n  {\n    id: 'wandern-bewegung',\n    titel: 'Wandern & Bewegung',\n    kicker: 'Draussen aktiv',\n    kurz: 'Bei unkomplizierter Schwangerschaft ist Bewegung erwünscht — Tour und Risiko sollten aber zur Situation passen.',\n    punkte: [\n      'Gesundheitsförderung Schweiz hält Bewegung bei einer unkomplizierten Schwangerschaft grundsätzlich für sinnvoll und nennt Wandern bis rund 2000 m ü. M. als gut möglich.',\n      'Aktivitäten mit hoher Sturz- oder Kollisionsgefahr werden nicht empfohlen. Bei anspruchsvollen Touren zählt deshalb nicht nur die Kondition, sondern auch Gelände, Trittsicherheit und Rückzugsmöglichkeit.',\n      'Bei Schmerzen oder deutlichem Unwohlsein die Aktivität abbrechen und erholen. Bei Unsicherheit oder einer Risikoschwangerschaft Touren vorher mit Ärztin oder Hebamme abstimmen.',\n    ],\n    quelle: 'Quelle: Gesundheitsförderung Schweiz, Bewegung in der Schwangerschaft; Empfehlungen für die Schweiz.',\n    symbol: 'blatt',\n  },\n  {\n    id: 'sonne-hitze',\n    titel: 'Sonne, Hitze & Pausen',\n    kicker: 'Tourentag planen',\n    kurz: 'Schatten, Sonnenschutz, Flüssigkeit und ein angepasstes Tempo gehören draussen zur Grundausrüstung.',\n    punkte: [\n      'Das BAG empfiehlt, starke Sonne möglichst zu meiden; zwischen 11 und 16 Uhr ist die UV-Belastung besonders hoch. Kleidung, Kopfbedeckung und Sonnenbrille sind der wichtigste Schutz.',\n      'Unbedeckte Haut mit einem breit wirksamen Sonnenschutz mit mindestens LSF 30 schützen und den Schutz unterwegs erneuern.',\n      'An warmen Tagen Intensität und Etappenlänge anpassen, Schattenpausen einplanen und regelmässig trinken. Auf Reisen nur Wasser verwenden, dessen hygienische Qualität zuverlässig ist.',\n    ],\n    quelle: 'Quellen: BAG «Sonne und UV-Strahlung»; HealthyTravel, gesundes Reisen.',\n    symbol: 'sonne',\n  },\n  {\n    id: 'zecken',\n    titel: 'Zecken',\n    kicker: 'Nach der Tour',\n    kurz: 'Zecken kommen in der ganzen Schweiz vor — Schutz und Körperkontrolle sind einfach und wirksam.',\n    punkte: [\n      'Im Unterholz und hohen Gras möglichst bedeckende Kleidung und geschlossenes Schuhwerk tragen; Zeckenschutzmittel können ergänzen.',\n      'Nach Aufenthalten im Freien Körper und Kleidung sorgfältig absuchen. Eine gefundene Zecke möglichst rasch entfernen und die Stichstelle desinfizieren.',\n      'Bei Fieber oder auffälliger Hautrötung nach einem Zeckenstich ärztlich abklären lassen.',\n    ],\n    quelle: 'Quelle: BAG, FAQ und Schutzempfehlungen zu Zecken und zeckenübertragenen Krankheiten, Stand 2026.',\n    symbol: 'schild',\n  },\n  {\n    id: 'essen-wasser-reise',\n    titel: 'Essen & Trinkwasser unterwegs',\n    kicker: 'Reisehygiene',\n    kurz: 'Je ungewohnter die Hygieneverhältnisse, desto wichtiger werden heisse Speisen, sauberes Wasser und Handhygiene.',\n    punkte: [\n      'HealthyTravel empfiehlt konsequente Hand-, Lebensmittel- und Trinkwasserhygiene. Wo die Hygiene unsicher ist: gut durchgekocht und heiss serviert essen, Früchte selbst schälen und Wasser aus zuverlässig verschlossenen Flaschen verwenden.',\n      'In der Schwangerschaft zusätzlich rohen Fisch, rohes oder ungenügend gegartes Fleisch sowie nicht pasteurisierte Milch und entsprechende Produkte vermeiden.',\n      'Eiswürfel, kalte Buffets, rohe Salate oder bereits geschnittene Früchte sind bei unsicherer Wasser- und Küchenhygiene keine gute Wahl.',\n    ],\n    quelle: 'Quelle: HealthyTravel.ch, Nahrungsmittel und Trinkwasser sowie Reisen in Schwangerschaft und Stillzeit.',\n    symbol: 'tropfen',\n  },\n  {\n    id: 'reiseplanung-fliegen',\n    titel: 'Reiseplanung & lange Wege',\n    kicker: 'Vor der Abreise',\n    kurz: 'Eine unkomplizierte Schwangerschaft schliesst Reisen nicht aus — Reiseziel, Versorgung und lange Sitzzeiten verdienen aber Planung.',\n    punkte: [\n      'HealthyTravel nennt das mittlere Drittel der Schwangerschaft häufig als günstige Reisezeit. Vor grösseren Reisen sollten medizinische Versorgung am Ziel und Versicherungsschutz für Mutter und Kind geklärt sein.',\n      'Bei Flugreisen gelten je nach Airline unterschiedliche Regeln und Nachweispflichten. Diese vor der Buchung direkt bei der Fluggesellschaft prüfen.',\n      'Bei langen Flug-, Auto- oder Zugreisen regelmässig die Beine bewegen, wenn möglich aufstehen und genügend trinken. Individuelle Thromboserisiken vor längeren Reisen medizinisch besprechen.',\n    ],\n    quelle: 'Quelle: HealthyTravel.ch, Schweizerisches Expertenkomitee für Reisemedizin, «Reisen in Schwangerschaft und Stillzeit».',\n    symbol: 'teller',\n  },\n  {\n    id: 'tropen-muecken',\n    titel: 'Tropen, Malaria & Zika',\n    kicker: 'Ziel entscheidet',\n    kurz: 'Bei tropischen Reisezielen ist die aktuelle Risikolage wichtiger als eine statische Länderliste in der App.',\n    punkte: [\n      'HealthyTravel rät während der Schwangerschaft von Reisen in Malaria-Risikogebiete ab. Lässt sich eine Reise nicht vermeiden, ist vorab eine reisemedizinische Beratung erforderlich.',\n      'Von Reisen in Gebiete mit einem aktuellen Zika-Ausbruch wird Schwangeren ebenfalls abgeraten. Risikogebiete können sich ändern — deshalb vor der Buchung und kurz vor Abreise aktuell auf HealthyTravel prüfen.',\n      'Konsequenter Mückenschutz umfasst lange Kleidung, geeignetes Repellent und je nach Reiseziel Moskitonetz beziehungsweise geschützte Schlafräume.',\n    ],\n    quelle: 'Quellen: HealthyTravel.ch und BAG, Reise- und Mückenschutzempfehlungen, Stand 2026.',\n    symbol: 'fisch',\n  },\n]\n\n`
  wissen = ersetze(wissen, 'const REZEPTE: Rezept[] = [', `${reiseArtikel}const REZEPTE: Rezept[] = [`, 'Rezept-Marker')

  wissen = wissen.replace(
    'Ernährung verstehen, Ideen finden und bei einzelnen Lebensmitteln weiterhin gezielt nachschlagen.',
    'Ernährung verstehen, Rezeptideen finden und auch draussen oder auf Reisen schnell die wichtigsten Punkte nachschlagen.',
  )

  const vorRendering = `      </div>\n\n      {bereich === 'ernaehrung' ? (`
  const dritterBereich = `        <button\n          type="button"\n          className="wissen-bereich"\n          data-aktiv={bereich === 'unterwegs' || undefined}\n          aria-pressed={bereich === 'unterwegs'}\n          onClick={() => setBereich('unterwegs')}\n        >\n          <Illustration art="sonne" />\n          <span className="wissen-bereich__text">\n            <strong>Unterwegs & Reisen</strong>\n            <span>6 praktische Themen</span>\n          </span>\n        </button>\n      </div>\n\n      {bereich === 'ernaehrung' ? (`
  wissen = ersetze(wissen, vorRendering, dritterBereich, 'Bereichsbuttons')

  wissen = ersetze(
    wissen,
    `      ) : (\n        <section className="wissen-abschnitt" aria-labelledby="wissen-rezepte">`,
    `      ) : bereich === 'rezepte' ? (\n        <section className="wissen-abschnitt" aria-labelledby="wissen-rezepte">`,
    'zweiter Bereich',
  )

  const endeRezepte = `          </div>\n        </section>\n      )}\n\n      <p className="wissen-einordnung">`
  const mitUnterwegs = `          </div>\n        </section>\n      ) : (\n        <section className="wissen-abschnitt" aria-labelledby="wissen-unterwegs">\n          <div className="wissen-abschnitt__kopf">\n            <h2 id="wissen-unterwegs">Unterwegs & Reisen</h2>\n            <p>Praktische Orientierung für Wandern, Naturtage und Reisen — mit Schweizer Quellen.</p>\n          </div>\n          <div className="wissen-karten">\n            {UNTERWEGS.map((artikel) => (\n              <button\n                key={artikel.id}\n                className="wissen-karte"\n                type="button"\n                onClick={() => setArtikelOffen(artikel)}\n              >\n                <Illustration art={artikel.symbol} />\n                <span className="wissen-karte__kicker">{artikel.kicker}</span>\n                <strong>{artikel.titel}</strong>\n                <span className="wissen-karte__kurz">{artikel.kurz}</span>\n                <span className="wissen-karte__mehr">Mehr erfahren <span aria-hidden="true">›</span></span>\n              </button>\n            ))}\n          </div>\n        </section>\n      )}\n\n      <p className="wissen-einordnung">`
  wissen = ersetze(wissen, endeRezepte, mitUnterwegs, 'Ende Rezeptbereich')

  wissen = wissen.replace(
    'Wissensartikel und Rezepte sind Orientierung. Für das Urteil zu einem konkreten Lebensmittel bleibt «Suchen» massgebend.',
    'Wissensartikel, Reisetipps und Rezepte sind Orientierung. Konkrete Gesundheitsfragen und individuelle Reise- oder Schwangerschaftsrisiken gehören in die medizinische Beratung; für Lebensmittel und Medikamente bleibt «Suchen» massgebend.',
  )
  schreibe('src/Wissen.tsx', wissen)
}

// 7) Dritter Wissensbereich auf Mobilgeräten bewusst über volle Breite; ab Tablet drei Spalten.
{
  let css = lese('src/wissen.css')
  const marker = `@media (hover: hover) and (pointer: fine) {`
  const layout = `.wissen-bereich:nth-child(3) {\n  grid-column: 1 / -1;\n}\n\n@media (min-width: 560px) {\n  .wissen-bereiche {\n    grid-template-columns: repeat(3, minmax(0, 1fr));\n  }\n\n  .wissen-bereich:nth-child(3) {\n    grid-column: auto;\n  }\n}\n\n`
  css = ersetze(css, marker, `${layout}${marker}`, 'Hover-Mediaquery')
  schreibe('src/wissen.css', css)
}

// 8) Spezifikation auf die tatsächlich ausgelieferte Markenpalette nachziehen.
for (const pfad of ['SPEC.md', 'DESIGN-REDESIGN.md']) {
  if (!existsSync(pfad)) continue
  let text = lese(pfad)
  text = farbenErsetzen(text)
  text = text
    .replaceAll('Burgunder als Marke, warme Rosé-Neutrale als Grund.', 'Türkis-Blau als Marke, kühle helle Neutrale als Grund.')
    .replaceAll('Burgunder', 'Türkis-Blau')
    .replaceAll('burgunder', 'türkis-blau')
  if (pfad === 'SPEC.md') {
    text = text.replace(
      /Die Markenfarbe ist rot, und Rot ist in dieser App die Farbe für «Besser\n? nicht»\.[\s\S]*?Sie treffen nie aufeinander\./u,
      'Die Markenfarbe ist blau-türkis. Sie ist bewusst deutlich blauer als das grüne «Ja» und bleibt damit eine reine Produktfarbe. Die Marke erscheint als Fläche, Aktion und Fokussignal; Urteile erscheinen weiterhin ausschliesslich mit eigener Farbe und ausgeschriebenem Status. Marke und Sicherheitssemantik werden nie nur über Farbe unterschieden.',
    )
  }
  schreibe(pfad, text)
}

console.log('Türkis-Marke und Wissensbereich «Unterwegs & Reisen» migriert.')
