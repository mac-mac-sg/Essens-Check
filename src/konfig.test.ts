import { beforeEach, describe, expect, it } from 'vitest'
import { istPlausibel, leseGeburtstermin } from './konfig'

const HEUTE = new Date('2029-06-01T09:00:00Z')

describe('istPlausibel', () => {
  it('nimmt einen Termin in den nächsten Monaten an', () => {
    expect(istPlausibel('2029-06-02', HEUTE)).toBe(true)
    expect(istPlausibel('2030-01-01', HEUTE)).toBe(true)
  })

  it('nimmt einen eben überschrittenen Termin noch an', () => {
    expect(istPlausibel('2029-05-20', HEUTE)).toBe(true)
  })

  it('weist einen längst vergangenen Termin ab', () => {
    expect(istPlausibel('2028-01-01', HEUTE)).toBe(false)
  })

  it('weist einen viel zu fernen Termin ab', () => {
    // Ein Vertipper im Jahr darf keine falsche Woche erzeugen.
    expect(istPlausibel('2039-06-02', HEUTE)).toBe(false)
  })

  it('weist Unsinn ab', () => {
    expect(istPlausibel('', HEUTE)).toBe(false)
    expect(istPlausibel('kein datum', HEUTE)).toBe(false)
    expect(istPlausibel('2029-13-45', HEUTE)).toBe(false)
  })
})


describe('beschädigter Speicherwert', () => {
  // Die Tests laufen ohne Browser; ein Ablagefach genügt.
  const fach = new Map<string, string>()
  beforeEach(() => {
    fach.clear()
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (k: string) => fach.get(k) ?? null,
        setItem: (k: string, v: string) => void fach.set(k, v),
        removeItem: (k: string) => void fach.delete(k),
      },
    })
  })

  it('gilt als kein Termin, statt eine NaN-Woche zu erzeugen', () => {
    for (const muell of ['"2027-05-03"', 'morgen', '2027-13-45', '', '2027-5-3', '2027-05-03T09:00']) {
      fach.set('essens-check.geburtstermin', muell)
      expect(leseGeburtstermin(), muell).toBeNull()
    }
  })

  it('nimmt ein sauberes ISO-Datum an', () => {
    fach.set('essens-check.geburtstermin', '2027-05-03')
    expect(leseGeburtstermin()).toBe('2027-05-03')
  })
})
