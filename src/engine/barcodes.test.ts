import { beforeEach, describe, expect, it } from 'vitest'
import { istGueltigeEan, leseZuordnungen, merkeZuordnung, vergissZuordnung } from './barcodes'

/** Minimaler Speicher, damit die Tests ohne Browser-Umgebung auskommen. */
function stelleSpeicher() {
  const inhalt = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => inhalt.get(k) ?? null,
      setItem: (k: string, v: string) => void inhalt.set(k, v),
      removeItem: (k: string) => void inhalt.delete(k),
    },
  })
  return inhalt
}

describe('istGueltigeEan', () => {
  it('nimmt gültige EAN-13 an', () => {
    expect(istGueltigeEan('4006381333931')).toBe(true)
    expect(istGueltigeEan('9780201379624')).toBe(true)
  })

  it('nimmt gültige EAN-8 an', () => {
    expect(istGueltigeEan('96385074')).toBe(true)
    expect(istGueltigeEan('55123457')).toBe(true)
  })

  it('weist eine falsche Prüfziffer ab', () => {
    // Ein Lesefehler darf nicht als Zuordnung im Speicher landen.
    expect(istGueltigeEan('4006381333932')).toBe(false)
    expect(istGueltigeEan('96385075')).toBe(false)
  })

  it('weist falsche Längen und Nicht-Ziffern ab', () => {
    expect(istGueltigeEan('400638133393')).toBe(false)
    expect(istGueltigeEan('40063813339311')).toBe(false)
    expect(istGueltigeEan('400638133393X')).toBe(false)
    expect(istGueltigeEan('')).toBe(false)
  })
})


describe('Zuordnungen', () => {
  let speicher: Map<string, string>
  beforeEach(() => {
    speicher = stelleSpeicher()
  })

  it('merkt sich eine Zuordnung und liest sie zurück', () => {
    merkeZuordnung('4006381333931', 'joghurt')
    expect(leseZuordnungen()).toEqual({ '4006381333931': 'joghurt' })
  })

  it('überschreibt eine bestehende Zuordnung', () => {
    merkeZuordnung('4006381333931', 'joghurt')
    merkeZuordnung('4006381333931', 'kefir')
    expect(leseZuordnungen()['4006381333931']).toBe('kefir')
  })

  it('vergisst eine Zuordnung wieder', () => {
    merkeZuordnung('4006381333931', 'joghurt')
    merkeZuordnung('96385074', 'brot')
    expect(vergissZuordnung('4006381333931')).toEqual({ '96385074': 'brot' })
  })

  it('verwirft beim Lesen, was keine gültige EAN ist', () => {
    // Der Speicher ist nicht vertrauenswürdig: eine ungültige Prüfziffer
    // würde sonst später auf ein falsches Lebensmittel auflösen.
    speicher.set(
      'essens-check.barcodes',
      JSON.stringify({ '4006381333932': 'leber', '4006381333931': 'joghurt', kaputt: 'brot' }),
    )
    expect(leseZuordnungen()).toEqual({ '4006381333931': 'joghurt' })
  })

  it('verwirft leere und nicht-textliche Einträge', () => {
    speicher.set(
      'essens-check.barcodes',
      JSON.stringify({ '96385074': '', '55123457': 42, '4006381333931': 'joghurt' }),
    )
    expect(leseZuordnungen()).toEqual({ '4006381333931': 'joghurt' })
  })

  it('kommt mit kaputtem Speicherinhalt zurecht', () => {
    speicher.set('essens-check.barcodes', 'kein json')
    expect(leseZuordnungen()).toEqual({})
    speicher.set('essens-check.barcodes', 'null')
    expect(leseZuordnungen()).toEqual({})
  })
})
