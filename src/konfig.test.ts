import { describe, expect, it } from 'vitest'
import { istPlausibel } from './konfig'

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
