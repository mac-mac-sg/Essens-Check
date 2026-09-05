import { describe, expect, it } from 'vitest'
import { lebensmittelKatalog, regelKatalog } from './daten'

describe('Kataloge', () => {
  it('lädt beide Kataloge über den @daten-Alias', () => {
    expect(regelKatalog.regeln.length).toBeGreaterThan(0)
    expect(lebensmittelKatalog.lebensmittel.length).toBeGreaterThan(0)
  })

  it('vergibt eindeutige Regel-IDs', () => {
    const ids = regelKatalog.regeln.map((regel) => regel.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('vergibt eindeutige Lebensmittel-IDs', () => {
    const ids = lebensmittelKatalog.lebensmittel.map((eintrag) => eintrag.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gibt jedem Lebensmittel mindestens eine Variante mit Komponenten', () => {
    for (const eintrag of lebensmittelKatalog.lebensmittel) {
      expect(eintrag.varianten.length, eintrag.id).toBeGreaterThan(0)
      for (const variante of eintrag.varianten) {
        expect(variante.komponenten.length, eintrag.id).toBeGreaterThan(0)
      }
    }
  })

  it('kennt nur Status aus der Rangfolge', () => {
    const erlaubt = new Set(regelKatalog.status_rangfolge)
    for (const regel of regelKatalog.regeln) {
      expect(erlaubt.has(regel.status), regel.id).toBe(true)
      for (const entschaerfung of regel.entschaerfung) {
        expect(erlaubt.has(entschaerfung.auf), regel.id).toBe(true)
      }
    }
  })
})
