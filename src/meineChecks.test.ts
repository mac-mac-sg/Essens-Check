import { describe, expect, it } from 'vitest'
import { ergaenzeCheck, ergaenzeScan, toggleFavoritListe, type CheckRef } from './meineChecks'

describe('Meine Checks', () => {
  it('führt verschiedene Check-Arten in einem gemeinsamen Verlauf', () => {
    const lebensmittel: CheckRef = { art: 'lebensmittel', id: 'kaffee' }
    const medikament: CheckRef = { art: 'medikament', id: 'paracetamol' }
    const wissen: CheckRef = { art: 'wissen', id: 'koffein' }

    const verlauf = ergaenzeCheck(ergaenzeCheck(ergaenzeCheck([], lebensmittel), medikament), wissen)
    expect(verlauf).toEqual([wissen, medikament, lebensmittel])
  })

  it('verschiebt einen erneut geöffneten Check nach vorne statt ihn zu duplizieren', () => {
    const a: CheckRef = { art: 'lebensmittel', id: 'a' }
    const b: CheckRef = { art: 'medikament', id: 'b' }
    expect(ergaenzeCheck([a, b], b)).toEqual([b, a])
  })

  it('schaltet Favoriten ein und wieder aus', () => {
    const ref: CheckRef = { art: 'wissen', id: 'folsaeure' }
    const gespeichert = toggleFavoritListe([], ref)
    expect(gespeichert).toEqual([ref])
    expect(toggleFavoritListe(gespeichert, ref)).toEqual([])
  })

  it('hält die letzten fünf Scans und aktualisiert vorhandene Produktnamen', () => {
    let scans = ergaenzeScan([], '7610000000001', 'Code 7610000000001')
    scans = ergaenzeScan(scans, '7610000000001', 'Naturjoghurt')
    expect(scans).toEqual([{ ean: '7610000000001', label: 'Naturjoghurt' }])

    for (let i = 2; i <= 7; i += 1) {
      scans = ergaenzeScan(scans, `761000000000${i}`, `Produkt ${i}`)
    }
    expect(scans).toHaveLength(5)
    expect(scans[0]?.label).toBe('Produkt 7')
  })
})
