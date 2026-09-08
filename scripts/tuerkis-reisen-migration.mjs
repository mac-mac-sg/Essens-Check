import { readFileSync, writeFileSync } from 'node:fs'

function lese(pfad) { return readFileSync(pfad, 'utf8') }
function schreibe(pfad, text) { writeFileSync(pfad, text, 'utf8') }
function ersetze(text, alt, neu, name) {
  if (!text.includes(alt)) throw new Error(`Fehlt: ${name}`)
  return text.replace(alt, neu)
}

let wissen = lese('src/Wissen.tsx')
wissen = ersetze(
  wissen,
  "type SymbolArt = 'blatt' | 'tropfen' | 'korn' | 'tasse' | 'fisch' | 'schild' | 'sonne' | 'teller' | 'topf'",
  "type SymbolArt = 'blatt' | 'tropfen' | 'korn' | 'tasse' | 'fisch' | 'schild' | 'sonne' | 'teller' | 'topf' | 'berg' | 'koffer' | 'muecke'",
  'SymbolArt',
)
wissen = wissen
  .replace("    symbol: 'blatt',\n  },\n  {\n    id: 'sonne-hitze'", "    symbol: 'berg',\n  },\n  {\n    id: 'sonne-hitze'")
  .replace("    symbol: 'teller',\n  },\n  {\n    id: 'tropen-muecken'", "    symbol: 'koffer',\n  },\n  {\n    id: 'tropen-muecken'")
  .replace("    symbol: 'fisch',\n  },\n]\n\nconst REZEPTE", "    symbol: 'muecke',\n  },\n]\n\nconst REZEPTE")

const marker = `      case 'topf':\n        return <><path d="M4.2 8h11.6v6.2a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2V8ZM2.8 8h14.4M7.4 5.2h5.2" /><path d="M7 3.5c.8-.7.8-1.3 0-2M11 3.5c.8-.7.8-1.3 0-2" /></>\n      default:`
const neueFaelle = `      case 'topf':\n        return <><path d="M4.2 8h11.6v6.2a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2V8ZM2.8 8h14.4M7.4 5.2h5.2" /><path d="M7 3.5c.8-.7.8-1.3 0-2M11 3.5c.8-.7.8-1.3 0-2" /></>\n      case 'berg':\n        return <><path d="M2.7 16 7.5 8l2.2 3.1 2.6-4.4L17.3 16H2.7Z" /><path d="m6.2 10.2 1.3-2.2 1.3 1.9" /></>\n      case 'koffer':\n        return <><rect x="4" y="6.2" width="12" height="9.2" rx="1.8" /><path d="M7.5 6.2V4.8c0-.7.5-1.2 1.2-1.2h2.6c.7 0 1.2.5 1.2 1.2v1.4M7 10.8h6M10 8.8v4" /></>\n      case 'muecke':\n        return <><ellipse cx="10" cy="10.5" rx="1.8" ry="3.2" /><path d="M8.5 8.8 5.2 6.2M11.5 8.8l3.3-2.6M8.4 11l-3.6 1.5M11.6 11l3.6 1.5M10 7.3V4.5M10 13.7v2.2" /></>\n      default:`
wissen = ersetze(wissen, marker, neueFaelle, 'Illustrations-Switch')
schreibe('src/Wissen.tsx', wissen)

let css = lese('src/styles.css')
css = css
  .replace('0 0 0 1px #2c2429, 0 8px 24px', '0 0 0 1px #233034, 0 8px 24px')
  .replace('0 0 0 1px #362c31, 0 24px 56px', '0 0 0 1px #2b3a3f, 0 24px 56px')
  .replace('Eine warme Tönung oben', 'Eine kühle Tönung oben')
schreibe('src/styles.css', css)

console.log('Reisesymbole und restliche kühle Neutrale ergänzt.')
