import { describe, expect, it } from 'vitest'
import { GERICHTE, normalisiereGericht, sucheGerichte } from './gerichte'

describe('Gerichte-Erkennung', () => {
  it('erkennt Cinque-Pi unabhängig von Bindestrich und Grossschreibung', () => {
    expect(sucheGerichte('cinque-pi', 1)[0]?.id).toBe('pasta-cinque-pi')
    expect(sucheGerichte('Cinque Pi', 1)[0]?.id).toBe('pasta-cinque-pi')
    expect(sucheGerichte('PASTA CINQUE-PI', 1)[0]?.id).toBe('pasta-cinque-pi')
  })

  it('erkennt weitere bekannte Gerichte, rät aber unbekannte Begriffe nicht', () => {
    expect(sucheGerichte('carbonara', 1)[0]?.id).toBe('carbonara')
    expect(sucheGerichte('tiramisu', 1)[0]?.id).toBe('tiramisu')
    expect(sucheGerichte('irgendein fantasiegericht')).toEqual([])
  })

  it('normalisiert Satzzeichen und Akzente robust', () => {
    expect(normalisiereGericht('Crème brûlée')).toBe('creme brulee')
    expect(normalisiereGericht('Cinque-Pi')).toBe('cinque pi')
  })

  it('hat eindeutige IDs und keine medizinischen Urteile im Gerichte-Katalog', () => {
    const ids = GERICHTE.map((gericht) => gericht.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(GERICHTE.length).toBeGreaterThanOrEqual(50)

    for (const gericht of GERICHTE) {
      expect(gericht.name.length).toBeGreaterThan(0)
      expect(gericht.bestandteile.length).toBeGreaterThan(0)
      expect('status' in gericht).toBe(false)
      expect('urteil' in gericht).toBe(false)
      for (const bestandteil of gericht.bestandteile) {
        expect(bestandteil.label.length).toBeGreaterThan(0)
        expect('status' in bestandteil).toBe(false)
      }
    }
  })

  it('löst jeden Namen und jedes Synonym wieder auf den zugehörigen Eintrag auf', () => {
    for (const gericht of GERICHTE) {
      for (const begriff of [gericht.name, ...gericht.synonyme]) {
        expect(sucheGerichte(begriff, 1)[0]?.id, begriff).toBe(gericht.id)
      }
    }
  })
})
