import { readFileSync, writeFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')
const write = (path, content) => writeFileSync(path, content, 'utf8')
const replaceOnce = (text, from, to, label) => {
  if (!text.includes(from)) throw new Error(`Nicht gefunden: ${label}`)
  return text.replace(from, to)
}

// Sternzeichen als kleine, rein informative Ergänzung zum errechneten Geburtstermin.
write('src/sternzeichen.ts', `export type Sternzeichen = {
  name: string
  symbol: string
}

/**
 * Westliches Sonnenzeichen zum errechneten Geburtstermin.
 * Der ET ist nur ein Schätzwert; das tatsächliche Sternzeichen hängt vom
 * tatsächlichen Geburtsdatum ab. Ungültige Datumsstrings ergeben null.
 */
export function sternzeichenFuerDatum(datum: string): Sternzeichen | null {
  const treffer = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(datum)
  if (!treffer) return null

  const monat = Number(treffer[2])
  const tag = Number(treffer[3])
  const pruefdatum = new Date(Date.UTC(Number(treffer[1]), monat - 1, tag))
  if (
    pruefdatum.getUTCFullYear() !== Number(treffer[1]) ||
    pruefdatum.getUTCMonth() !== monat - 1 ||
    pruefdatum.getUTCDate() !== tag
  ) return null

  const md = monat * 100 + tag
  if (md >= 1222 || md <= 119) return { name: 'Steinbock', symbol: '♑' }
  if (md <= 218) return { name: 'Wassermann', symbol: '♒' }
  if (md <= 320) return { name: 'Fische', symbol: '♓' }
  if (md <= 419) return { name: 'Widder', symbol: '♈' }
  if (md <= 520) return { name: 'Stier', symbol: '♉' }
  if (md <= 620) return { name: 'Zwillinge', symbol: '♊' }
  if (md <= 722) return { name: 'Krebs', symbol: '♋' }
  if (md <= 822) return { name: 'Löwe', symbol: '♌' }
  if (md <= 922) return { name: 'Jungfrau', symbol: '♍' }
  if (md <= 1022) return { name: 'Waage', symbol: '♎' }
  if (md <= 1121) return { name: 'Skorpion', symbol: '♏' }
  return { name: 'Schütze', symbol: '♐' }
}
`)

write('src/sternzeichen.test.ts', `import { describe, expect, it } from 'vitest'
import { sternzeichenFuerDatum } from './sternzeichen'

describe('sternzeichenFuerDatum', () => {
  it.each([
    ['2027-01-10', 'Steinbock', '♑'],
    ['2027-02-10', 'Wassermann', '♒'],
    ['2027-03-10', 'Fische', '♓'],
    ['2027-04-10', 'Widder', '♈'],
    ['2027-05-10', 'Stier', '♉'],
    ['2027-06-10', 'Zwillinge', '♊'],
    ['2027-07-10', 'Krebs', '♋'],
    ['2027-08-10', 'Löwe', '♌'],
    ['2027-09-10', 'Jungfrau', '♍'],
    ['2027-10-10', 'Waage', '♎'],
    ['2027-11-10', 'Skorpion', '♏'],
    ['2027-12-10', 'Schütze', '♐'],
  ])('%s → %s', (datum, name, symbol) => {
    expect(sternzeichenFuerDatum(datum)).toEqual({ name, symbol })
  })

  it.each([
    ['2027-01-19', 'Steinbock'], ['2027-01-20', 'Wassermann'],
    ['2027-02-18', 'Wassermann'], ['2027-02-19', 'Fische'],
    ['2027-03-20', 'Fische'], ['2027-03-21', 'Widder'],
    ['2027-04-19', 'Widder'], ['2027-04-20', 'Stier'],
    ['2027-05-20', 'Stier'], ['2027-05-21', 'Zwillinge'],
    ['2027-06-20', 'Zwillinge'], ['2027-06-21', 'Krebs'],
    ['2027-07-22', 'Krebs'], ['2027-07-23', 'Löwe'],
    ['2027-08-22', 'Löwe'], ['2027-08-23', 'Jungfrau'],
    ['2027-09-22', 'Jungfrau'], ['2027-09-23', 'Waage'],
    ['2027-10-22', 'Waage'], ['2027-10-23', 'Skorpion'],
    ['2027-11-21', 'Skorpion'], ['2027-11-22', 'Schütze'],
    ['2027-12-21', 'Schütze'], ['2027-12-22', 'Steinbock'],
  ])('behandelt die Grenze %s korrekt', (datum, name) => {
    expect(sternzeichenFuerDatum(datum)?.name).toBe(name)
  })

  it('weist ungültige Daten zurück', () => {
    expect(sternzeichenFuerDatum('')).toBeNull()
    expect(sternzeichenFuerDatum('2027-02-30')).toBeNull()
    expect(sternzeichenFuerDatum('20.02.2027')).toBeNull()
  })
})
`)

let app = read('src/App.tsx')
app = replaceOnce(
  app,
  "import { berechneStand, fortschritt, restAnzeige } from './schwangerschaft'",
  "import { berechneStand, fortschritt, restAnzeige } from './schwangerschaft'\nimport { sternzeichenFuerDatum } from './sternzeichen'",
  'Sternzeichen-Import',
)
app = replaceOnce(
  app,
  "  const stand = useMemo(() => (termin ? berechneStand(termin, new Date()) : null), [termin])",
  "  const stand = useMemo(() => (termin ? berechneStand(termin, new Date()) : null), [termin])\n  const sternzeichen = useMemo(() => (termin ? sternzeichenFuerDatum(termin) : null), [termin])",
  'Stand-Berechnung',
)
app = replaceOnce(
  app,
  "      )}. Geburtstermin ändern`}",
  "      )}${sternzeichen ? `, voraussichtliches Sternzeichen ${sternzeichen.name}` : ''}. Geburtstermin ändern`}",
  'Aria-Label Schwangerschaftskarte',
)
app = replaceOnce(
  app,
  "        <span className=\"stand__rest\">{restAnzeige(stand.tageBis)}</span>",
  `        <span className="stand__rechts">
          <span className="stand__rest">{restAnzeige(stand.tageBis)}</span>
          {sternzeichen && (
            <span
              className="stand__sternzeichen"
              aria-hidden="true"
              title={\`Voraussichtliches Sternzeichen: \${sternzeichen.name}\`}
            >
              {sternzeichen.symbol}
            </span>
          )}
        </span>`,
  'Resttage im Statuskopf',
)
write('src/App.tsx', app)

let css = read('src/redesign-fixes.css')
if (!css.includes('.stand__sternzeichen')) {
  css += `

/* Kleine persönliche Ergänzung im Schwangerschaftsstatus: aus dem ET abgeleitet. */
.stand__rechts {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.42rem;
  min-width: 0;
}

.stand__sternzeichen {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 1.55rem;
  height: 1.55rem;
  font-size: 0.95rem;
  line-height: 1;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 999px;
}

@media (max-width: 350px) {
  .stand__sternzeichen {
    width: 1.4rem;
    height: 1.4rem;
    font-size: 0.86rem;
  }
}
`
}
write('src/redesign-fixes.css', css)

let wissen = read('src/Wissen.tsx')
wissen = replaceOnce(
  wissen,
  `    titel: 'Wandern & Bewegung',
    kicker: 'Draussen aktiv',
    kurz: 'Bei unkomplizierter Schwangerschaft ist Bewegung erwünscht — Tour und Risiko sollten aber zur Situation passen.',
    punkte: [
      'Gesundheitsförderung Schweiz hält Bewegung bei einer unkomplizierten Schwangerschaft grundsätzlich für sinnvoll und nennt Wandern bis rund 2000 m ü. M. als gut möglich.',
      'Aktivitäten mit hoher Sturz- oder Kollisionsgefahr werden nicht empfohlen. Bei anspruchsvollen Touren zählt deshalb nicht nur die Kondition, sondern auch Gelände, Trittsicherheit und Rückzugsmöglichkeit.',
      'Bei Schmerzen oder deutlichem Unwohlsein die Aktivität abbrechen und erholen. Bei Unsicherheit oder einer Risikoschwangerschaft Touren vorher mit Ärztin oder Hebamme abstimmen.',
    ],
    quelle: 'Quelle: Gesundheitsförderung Schweiz, Bewegung in der Schwangerschaft; Empfehlungen für die Schweiz.',`,
  `    titel: 'Wandern, Höhe & Bewegung',
    kicker: 'Draussen aktiv',
    kurz: 'Bei unkomplizierter Schwangerschaft ist Bewegung erwünscht — bei Bergtouren zählen Höhe, Belastung und Gelände.',
    punkte: [
      'Für körperliche Aktivität nennt Gesundheitsförderung Schweiz Höhen bis rund 2000 m ü. M. als gut möglich. Das ist die praktische Orientierung für Wanderungen und aktive Bergtouren.',
      'Ein Aufstieg und Aufenthalt für einige Stunden bis etwa 2500 m ü. M. gilt bei unkomplizierter Schwangerschaft grundsätzlich als möglich, wenn dabei keine stärkere körperliche Belastung dazukommt.',
      'Über 2500 m sollte man in der Schwangerschaft zurückhaltend sein: HealthyTravel empfiehlt Aufenthalte oberhalb dieser Höhe zu meiden, weil das Risiko für Höhenkrankheit und Komplikationen steigt. Das gilt besonders bei schnellem Aufstieg aus dem Flachland oder längerem Aufenthalt.',
      'Aktivitäten mit hoher Sturz- oder Kollisionsgefahr werden nicht empfohlen. Bei anspruchsvollen Touren zählen deshalb neben der Höhe auch Gelände, Trittsicherheit und eine einfache Rückzugsmöglichkeit.',
      'Bei Schmerzen, Schwindel, Atemnot oder deutlichem Unwohlsein die Tour abbrechen. Bei Risikoschwangerschaft oder geplanten Aufenthalten nahe beziehungsweise über 2500 m die Tour vorher mit Ärztin oder Hebamme besprechen.',
    ],
    quelle: 'Quellen: Gesundheitsförderung Schweiz, «Gesundheitswirksame Bewegung bei Frauen während und nach der Schwangerschaft»; HealthyTravel / Schweizerisches Expertenkomitee für Reisemedizin, Schwangerschaft und Reisen.',`,
  'Wandern-und-Höhe-Artikel',
)
write('src/Wissen.tsx', wissen)
