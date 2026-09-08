import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Die Palette steht in styles.css und wird hier daraus gelesen, nicht
 * abgetippt. Eine Kopie liefe nach der ersten Farbkorrektur auseinander und
 * prüfte dann eine Palette, die es nicht mehr gibt.
 */
const CSS = readFileSync(fileURLToPath(new URL('./styles.css', import.meta.url)), 'utf8')

function block(auswahl: string): Record<string, string> {
  const anfang = CSS.indexOf(auswahl)
  if (anfang === -1) throw new Error(`Block «${auswahl}» fehlt in styles.css`)
  const inhalt = CSS.slice(anfang, CSS.indexOf('\n}', anfang))
  const werte: Record<string, string> = {}
  for (const treffer of inhalt.matchAll(/(--[a-z-]+):\s*(#[0-9a-f]{6})\s*;/gi)) {
    werte[treffer[1]!] = treffer[2]!.toLowerCase()
  }
  return werte
}

const HELL = block(':root {')
const DUNKEL = { ...HELL, ...block(":root[data-schema='dunkel'] {") }

function leuchtkraft(farbe: string): number {
  const kanaele = [1, 3, 5].map((i) => {
    const anteil = parseInt(farbe.slice(i, i + 2), 16) / 255
    return anteil <= 0.03928 ? anteil / 12.92 : ((anteil + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * kanaele[0] + 0.7152 * kanaele[1] + 0.0722 * kanaele[2]
}

/** Kontrastverhältnis nach WCAG. */
function kontrast(a: string, b: string): number {
  const [hell, dunkel] = [leuchtkraft(a), leuchtkraft(b)].sort((x, y) => y - x) as [number, number]
  return (hell + 0.05) / (dunkel + 0.05)
}

function farbe(palette: Record<string, string>, name: string): string {
  const wert = palette[name]
  if (!wert) throw new Error(`Farbe «${name}» fehlt in der Palette`)
  return wert
}

/** Farbton in Grad — sagt, ob zwei Rottöne wirklich verschiedene Rottöne sind. */
function farbton(f: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(f.slice(i, i + 2), 16) / 255) as [
    number,
    number,
    number,
  ]
  const max = Math.max(r, g, b)
  const spanne = max - Math.min(r, g, b)
  if (spanne === 0) return 0
  const roh =
    max === r ? ((g - b) / spanne) % 6 : max === g ? (b - r) / spanne + 2 : (r - g) / spanne + 4
  return ((roh * 60) % 360 + 360) % 360
}

const SCHEMATA: [string, Record<string, string>][] = [
  ['hell', HELL],
  ['dunkel', DUNKEL],
]

describe.each(SCHEMATA)('Palette (%s)', (_name, P) => {
  const p = (schluessel: string) => farbe(P, schluessel)

  it('liest Text auf jedem Grund mit mindestens AA', () => {
    expect(kontrast(p('--text'), p('--grundflaeche'))).toBeGreaterThanOrEqual(4.5)
    expect(kontrast(p('--text'), p('--karte'))).toBeGreaterThanOrEqual(4.5)
    expect(kontrast(p('--text-zweitrangig'), p('--karte'))).toBeGreaterThanOrEqual(4.5)
    expect(kontrast(p('--text-gedaempft'), p('--karte'))).toBeGreaterThanOrEqual(4.5)
  })

  it('trägt die Akzentfarbe als Schrift und als Fokusring', () => {
    expect(kontrast(p('--akzent'), p('--grundflaeche'))).toBeGreaterThanOrEqual(4.5)
    expect(kontrast(p('--akzent'), p('--karte'))).toBeGreaterThanOrEqual(4.5)
  })

  it('liest jedes Urteil auf seiner eigenen Fläche', () => {
    for (const stufe of ['ok', 'bedingt', 'meiden', 'unklar']) {
      expect(
        kontrast(p(`--farbe-${stufe}`), p(`--flaeche-${stufe}`)),
        stufe,
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('hebt jede Urteilsfläche von der Karte ab', () => {
    // Sonst wäre die Tönung, die die Variante gliedert, nicht zu sehen.
    for (const stufe of ['ok', 'bedingt', 'meiden', 'unklar']) {
      expect(kontrast(p(`--flaeche-${stufe}`), p('--karte')), stufe).toBeGreaterThanOrEqual(1.14)
    }
  })

  /*
   * Der Grund, aus dem diese Datei existiert.
   *
   * Die Marke ist rot, und Rot ist in dieser App die Farbe für «Besser nicht».
   * Getrennt werden beide über den Farbton — die Marke ist pflaumig, das Urteil
   * scharlachrot — und über die Helligkeit. Wer die Marke aufhellt oder das
   * Urteil abdunkelt, bis beide dasselbe Rot sind, hebt die Ampel auf.
   */
  it('hält die Marke vom Ampelrot getrennt', () => {
    const abstand = Math.abs(farbton(p('--marke')) - farbton(p('--farbe-meiden')))
    expect(Math.min(abstand, 360 - abstand)).toBeGreaterThanOrEqual(20)
    expect(kontrast(p('--marke'), p('--farbe-meiden'))).toBeGreaterThanOrEqual(2)
    expect(kontrast(p('--marke'), p('--flaeche-meiden'))).toBeGreaterThanOrEqual(1.5)
  })

  it('trägt die Marke auch als Fläche mit weisser Schrift', () => {
    // Der gewählte Filterchip. Im Dunkeln träfe das dunkle Burgunder den
    // Grund — dort steht deshalb eine aufgehellte Fassung.
    expect(kontrast('#ffffff', p('--marke-flaeche'))).toBeGreaterThanOrEqual(4.5)
    expect(kontrast(p('--marke-flaeche'), p('--grundflaeche'))).toBeGreaterThanOrEqual(3)
  })

  it('liest weisse Schrift auf der Marke', () => {
    // Die Marke trägt weisse Schrift, wo sie als Fläche steht — der gewählte
    // Filterchip, die Knöpfe im Blatt.
    expect(kontrast('#ffffff', p('--marke'))).toBeGreaterThanOrEqual(4.5)
  })

  /*
   * Der Stand liegt seit dem Wegfall der Kopfleiste auf hellem Grund. Die
   * Restangabe ist die leiseste Zeile darauf und war vorher der Grund, den
   * Fortschritt nicht als Füllung in die Fläche zu legen.
   */
  it('liest die Restangabe auf der Standfläche', () => {
    expect(kontrast(p('--text-gedaempft'), p('--flaeche-still'))).toBeGreaterThanOrEqual(4.5)
    expect(kontrast(p('--text'), p('--flaeche-still'))).toBeGreaterThanOrEqual(4.5)
    // Der Fortschrittsstreifen trägt keinen Text, muss aber sichtbar sein.
    expect(kontrast(p('--stand-balken'), p('--flaeche-still'))).toBeGreaterThanOrEqual(3)
  })
})

describe('Beide Schemata', () => {
  it('definieren dieselben Farbnamen', () => {
    const fehlend = Object.keys(HELL).filter((name) => !(name in DUNKEL))
    expect(fehlend).toEqual([])
  })

  it('unterscheiden sich tatsächlich', () => {
    const nur = block(":root[data-schema='dunkel'] {")
    expect(Object.keys(nur).length).toBeGreaterThan(10)
  })
})
