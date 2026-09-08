import { describe, expect, it } from 'vitest'
import {
  findeMedikamentProdukte,
  istAutomatischBewertbar,
  medikamentProduktSnapshot,
} from './produkte'

describe('Realer Swissmedic-Produktsnapshot', () => {
  it('enthält einen substanziellen aktuellen Schweizer Produktbestand für die Pilotwirkstoffe', () => {
    expect(medikamentProduktSnapshot.stand).toMatch(/^\d{4}-\d{2}-\d{2}$/u)
    expect(medikamentProduktSnapshot.statistik.praeparate_ham_aktiv).toBeGreaterThan(5_000)
    expect(medikamentProduktSnapshot.statistik.sequenzen_ham_aktiv).toBeGreaterThan(8_000)
    expect(medikamentProduktSnapshot.produkte.length).toBeGreaterThan(300)
    expect(medikamentProduktSnapshot.statistik.vollstaendig_gemappt).toBeGreaterThan(250)
  })

  it('ordnet Dafalgan als Schweizer Paracetamol-Produkt zu', () => {
    const treffer = findeMedikamentProdukte('Dafalgan')
    const paracetamol = treffer.filter((produkt) =>
      produkt.medikament_ids.includes('paracetamol'),
    )

    expect(paracetamol.length).toBeGreaterThan(0)
    expect(paracetamol.some((produkt) => istAutomatischBewertbar(produkt))).toBe(true)
    expect(
      paracetamol.every((produkt) =>
        produkt.wirkstoffe.some((wirkstoff) => wirkstoff.medikament_id === 'paracetamol'),
      ),
    ).toBe(true)
  })

  it('ordnet Algifor als Schweizer Ibuprofen-Produkt zu', () => {
    const treffer = findeMedikamentProdukte('Algifor')
    const ibuprofen = treffer.filter((produkt) => produkt.medikament_ids.includes('ibuprofen'))

    expect(ibuprofen.length).toBeGreaterThan(0)
    expect(ibuprofen.some((produkt) => istAutomatischBewertbar(produkt))).toBe(true)
    expect(
      ibuprofen.every((produkt) =>
        produkt.wirkstoffe.some((wirkstoff) => wirkstoff.medikament_id === 'ibuprofen'),
      ),
    ).toBe(true)
  })

  it('lässt keine unvollständig gemappte Kombination automatisch bewertbar werden', () => {
    const unvollstaendig = medikamentProduktSnapshot.produkte.filter(
      (produkt) => produkt.kombinationspraeparat && !produkt.vollstaendig_gemappt,
    )

    expect(unvollstaendig.length).toBeGreaterThan(0)
    expect(unvollstaendig.every((produkt) => !istAutomatischBewertbar(produkt))).toBe(true)
  })

  it('hält Statistik und tatsächlichen Snapshot konsistent', () => {
    const vollstaendig = medikamentProduktSnapshot.produkte.filter(
      (produkt) => produkt.vollstaendig_gemappt,
    ).length
    const unvollstaendigeKombinationen = medikamentProduktSnapshot.produkte.filter(
      (produkt) => produkt.kombinationspraeparat && !produkt.vollstaendig_gemappt,
    ).length

    expect(medikamentProduktSnapshot.statistik.produkte_mit_pilotwirkstoff).toBe(
      medikamentProduktSnapshot.produkte.length,
    )
    expect(medikamentProduktSnapshot.statistik.vollstaendig_gemappt).toBe(vollstaendig)
    expect(medikamentProduktSnapshot.statistik.unvollstaendige_kombinationen).toBe(
      unvollstaendigeKombinationen,
    )
  })
})
