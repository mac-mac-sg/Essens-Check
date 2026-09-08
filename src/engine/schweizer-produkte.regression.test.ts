import { describe, expect, it } from 'vitest'
import { lebensmittelKatalog, regelKatalog } from '../daten'
import { ordneProduktZu } from './produktzuordnung'
import { SCHWEIZER_PRODUKTE } from './fixtures/schweizer-produkte'

describe('Scanner-Regression mit realen Schweizer Produkten', () => {
  it('enthält genügend verschiedene reale Produkte und eindeutige EANs', () => {
    expect(SCHWEIZER_PRODUKTE.length).toBeGreaterThanOrEqual(10)
    expect(new Set(SCHWEIZER_PRODUKTE.map((fall) => fall.ean)).size).toBe(
      SCHWEIZER_PRODUKTE.length,
    )
  })

  for (const fall of SCHWEIZER_PRODUKTE) {
    it(`${fall.ean} · ${fall.produktname}`, () => {
      const ergebnis = ordneProduktZu(fall.produkt, lebensmittelKatalog, regelKatalog)

      expect(ergebnis.eindeutig?.id ?? null, fall.beleg).toBe(fall.erwartung.eindeutig)
      expect(ergebnis.kandidaten[0]?.id ?? null, fall.beleg).toBe(fall.erwartung.erster)
      expect(
        ergebnis.konflikte.map((konflikt) => konflikt.eintrag.id).sort(),
        fall.beleg,
      ).toEqual([...(fall.erwartung.konflikte ?? [])].sort())
    })
  }

  it('lässt einen Kategorienamen allein weiterhin nie für eine Freigabe reichen', () => {
    for (const fall of SCHWEIZER_PRODUKTE) {
      const nurKategorie = {
        ...fall.produkt,
        name: 'Schweizer Testprodukt',
        generischerName: null,
        zutatenText: null,
        zutaten: [],
      }
      const ergebnis = ordneProduktZu(nurKategorie, lebensmittelKatalog, regelKatalog)
      expect(ergebnis.eindeutig, `${fall.ean} · ${fall.produktname}`).toBeNull()
    }
  })

  it('enthält mindestens einen Fall, der wegen einer riskanten Zutat blockiert', () => {
    const blockiert = SCHWEIZER_PRODUKTE.filter(
      (fall) => (fall.erwartung.konflikte?.length ?? 0) > 0,
    )
    expect(blockiert.length).toBeGreaterThanOrEqual(1)
  })
})
