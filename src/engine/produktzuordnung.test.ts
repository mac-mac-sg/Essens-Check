import { describe, expect, it } from 'vitest'
import type { Lebensmittel, LebensmittelKatalog, RegelKatalog } from '../typen'
import type { Produkt } from './produktsuche'
import { ordneProduktZu } from './produktzuordnung'

function lebensmittel(
  id: string,
  name: string,
  synonyme: string[],
  tag: string,
): Lebensmittel {
  return {
    id,
    name,
    gruppe: 'Test',
    synonyme,
    varianten: [{ label: null, komponenten: [{ tag }] }],
    alternativen: [],
  }
}

const katalog: LebensmittelKatalog = {
  version: 'test',
  hinweis: '',
  lebensmittel: [
    lebensmittel('joghurt', 'Joghurt', ['Yogurt'], 'sicher'),
    lebensmittel('vanillecreme', 'Vanillecreme', ['Vanille'], 'sicher'),
    lebensmittel('rohmilch', 'Rohmilch', ['unpasteurisierte Milch'], 'rohmilch'),
    lebensmittel('kaffee', 'Kaffee', ['Coffee'], 'koffein'),
  ],
}

const regeln: RegelKatalog = {
  version: 'test',
  hinweis: '',
  grundsaetze: [],
  zustaende: [],
  status_rangfolge: ['ok', 'bedingt', 'unklar', 'meiden'],
  unbedenkliche_tags: [{ tag: 'sicher', text: 'Unbedenklich.' }],
  regeln: [
    {
      id: 'rohmilch',
      titel: 'Rohmilch',
      trifft_auf: ['rohmilch'],
      status: 'meiden',
      begruendung: 'Meiden.',
      entschaerfung: [],
      trimester_gewichtung: null,
    },
    {
      id: 'koffein',
      titel: 'Koffein',
      trifft_auf: ['koffein'],
      status: 'bedingt',
      begruendung: 'Begrenzt.',
      entschaerfung: [],
      trimester_gewichtung: null,
    },
  ],
}

function produkt(teil: Partial<Produkt>): Produkt {
  return {
    name: 'Musterprodukt',
    marke: null,
    generischerName: null,
    kategorien: [],
    zutatenText: null,
    zutaten: [],
    vollstaendigkeit: null,
    ...teil,
  }
}

describe('ordneProduktZu', () => {
  it('löst einen mehrdeutigen Produktnamen mit Bezeichnung und Kategorie auf', () => {
    const ergebnis = ordneProduktZu(
      produkt({
        name: 'Vanille Joghurt',
        generischerName: 'Joghurt mit Vanille',
        kategorien: ['Joghurt'],
      }),
      katalog,
      regeln,
    )

    expect(ergebnis.eindeutig?.id).toBe('joghurt')
    expect(ergebnis.kandidaten[0]?.id).toBe('joghurt')
    expect(ergebnis.grundlagen).toEqual(
      expect.arrayContaining(['Produktname', 'Bezeichnung', 'Kategorie']),
    )
  })

  it('erteilt aus einer Kategorie allein kein automatisches Urteil', () => {
    const ergebnis = ordneProduktZu(
      produkt({ name: 'Muster Edition', kategorien: ['Joghurt'] }),
      katalog,
      regeln,
    )

    expect(ergebnis.kandidaten[0]?.id).toBe('joghurt')
    expect(ergebnis.eindeutig).toBeNull()
  })

  it('nutzt eine passende Zutat nur als zusätzliche Bestätigung', () => {
    const ergebnis = ordneProduktZu(
      produkt({
        name: 'Natur Joghurt',
        kategorien: ['Joghurt'],
        zutaten: ['Joghurt'],
      }),
      katalog,
      regeln,
    )

    expect(ergebnis.eindeutig?.id).toBe('joghurt')
    expect(ergebnis.grundlagen).toContain('Zutaten')
  })

  it('blockiert ein Auto-Urteil bei einer expliziten bekannten Nein-Zutat', () => {
    const ergebnis = ordneProduktZu(
      produkt({
        name: 'Natur Joghurt',
        kategorien: ['Joghurt'],
        zutatenText: 'Joghurt, Rohmilch',
        zutaten: ['Joghurt', 'Rohmilch'],
      }),
      katalog,
      regeln,
    )

    expect(ergebnis.eindeutig).toBeNull()
    expect(ergebnis.konflikte.map((konflikt) => konflikt.eintrag.id)).toContain('rohmilch')
  })

  it('macht aus Zutaten allein keinen Produktkandidaten', () => {
    const ergebnis = ordneProduktZu(
      produkt({ name: 'Muster Edition', zutaten: ['Rohmilch', 'Kaffee'] }),
      katalog,
      regeln,
    )

    expect(ergebnis.kandidaten).toEqual([])
    expect(ergebnis.eindeutig).toBeNull()
  })

  it('blockiert nicht wegen bloss bedingter Nebenzutaten', () => {
    const ergebnis = ordneProduktZu(
      produkt({
        name: 'Natur Joghurt',
        kategorien: ['Joghurt'],
        zutaten: ['Joghurt', 'Kaffee'],
      }),
      katalog,
      regeln,
    )

    expect(ergebnis.eindeutig?.id).toBe('joghurt')
    expect(ergebnis.konflikte).toEqual([])
  })
})
