import { describe, expect, it } from 'vitest'
import {
  findeMedikamentProdukte,
  istAutomatischBewertbar,
  validiereProduktSnapshot,
} from './produkte'
import type { SwissmedicProduktSnapshot } from './swissmedic'

function snapshot(): SwissmedicProduktSnapshot {
  return {
    version: 'test',
    stand: '2026-08-31',
    quelle: 'test',
    mapping_version: 'test',
    statistik: {
      praeparate_ham_aktiv: 2,
      sequenzen_ham_aktiv: 2,
      produkte_mit_pilotwirkstoff: 2,
      vollstaendig_gemappt: 1,
      unvollstaendige_kombinationen: 1,
    },
    produkte: [
      {
        id: 'sm-1-01',
        zulassungsnummer: '1',
        sequenznummer: '1',
        name: 'Dafalgan',
        sequenzname: 'Dafalgan 500 mg Filmtabletten',
        arzneiform: 'Filmtabletten',
        zulassungsstatus: 'zugelassen',
        wirkstoffe: [
          {
            stoff_id: 'S1',
            name: 'Paracetamolum',
            menge: '500',
            einheit: 'mg',
            medikament_id: 'paracetamol',
          },
        ],
        medikament_ids: ['paracetamol'],
        kombinationspraeparat: false,
        vollstaendig_gemappt: true,
        packungen: [],
      },
      {
        id: 'sm-2-01',
        zulassungsnummer: '2',
        sequenznummer: '1',
        name: 'Paracetamol Coffein Kombi',
        arzneiform: 'Tabletten',
        zulassungsstatus: 'zugelassen',
        wirkstoffe: [
          { stoff_id: 'S1', name: 'Paracetamolum', medikament_id: 'paracetamol' },
          { stoff_id: 'S2', name: 'Coffeinum' },
        ],
        medikament_ids: ['paracetamol'],
        kombinationspraeparat: true,
        vollstaendig_gemappt: false,
        packungen: [],
      },
    ],
  }
}

describe('Swissmedic-Produkte', () => {
  it('findet Handelsnamen und Sequenznamen ohne unscharfe Wortmitten-Treffer', () => {
    const daten = snapshot()
    expect(findeMedikamentProdukte('Dafalgan', daten).map((produkt) => produkt.id)).toEqual([
      'sm-1-01',
    ])
    expect(findeMedikamentProdukte('Daf 500', daten).map((produkt) => produkt.id)).toEqual([
      'sm-1-01',
    ])
    expect(findeMedikamentProdukte('falgan', daten)).toEqual([])
  })

  it('lässt nur vollständig gemappte Produkte für eine spätere Automatik zu', () => {
    const daten = snapshot()
    expect(istAutomatischBewertbar(daten.produkte[0]!)).toBe(true)
    expect(istAutomatischBewertbar(daten.produkte[1]!)).toBe(false)
  })

  it('erkennt inkonsistente Vollständigkeits- und Kombinationsflags', () => {
    const daten = snapshot()
    daten.produkte[1] = { ...daten.produkte[1]!, vollstaendig_gemappt: true }
    expect(() => validiereProduktSnapshot(daten)).toThrow('Inkonsistentes Mapping-Flag')
  })
})
