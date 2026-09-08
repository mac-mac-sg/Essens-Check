import mappingJson from '@daten/medikament-wirkstoff-mapping.json'
import { describe, expect, it } from 'vitest'
import { medikamentKatalog } from './daten'
import {
  baueSwissmedicSnapshot,
  leseXmlDatensaetze,
  type SwissmedicMappingKatalog,
  type SwissmedicXmlQuellen,
} from './swissmedic'

const mapping = mappingJson as SwissmedicMappingKatalog

function xmlDatensaetze(name: string, datensaetze: Record<string, string>[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?><ROOT>${datensaetze
    .map(
      (datensatz) =>
        `<${name}>${Object.entries(datensatz)
          .map(([feld, wert]) => `<${feld}>${wert}</${feld}>`)
          .join('')}</${name}>`,
    )
    .join('')}</ROOT>`
}

const udc = xmlDatensaetze('CODE', [
  {
    SYSTEM_CODE: '',
    USER_DEFINED_CODE: 'SUBSTANCE_CATEGORY',
    CODE_VALUE: 'W',
    SPRACH_CODE: 'D',
    BESCHREIBUNG_1: 'Wirkstoff',
  },
  {
    SYSTEM_CODE: '',
    USER_DEFINED_CODE: 'MA_STATUS',
    CODE_VALUE: 'A',
    SPRACH_CODE: 'D',
    BESCHREIBUNG_1: 'zugelassen',
  },
  {
    SYSTEM_CODE: '',
    USER_DEFINED_CODE: 'MA_STATUS',
    CODE_VALUE: 'X',
    SPRACH_CODE: 'D',
    BESCHREIBUNG_1: 'nicht mehr zugelassen',
  },
  {
    SYSTEM_CODE: '',
    USER_DEFINED_CODE: 'DF',
    CODE_VALUE: 'TAB',
    SPRACH_CODE: 'D',
    BESCHREIBUNG_1: 'Filmtabletten',
  },
  {
    SYSTEM_CODE: '',
    USER_DEFINED_CODE: 'UNIT',
    CODE_VALUE: 'MG',
    SPRACH_CODE: 'D',
    BESCHREIBUNG_1: 'mg',
  },
  {
    SYSTEM_CODE: '',
    USER_DEFINED_CODE: 'PACKAGE_UNIT',
    CODE_VALUE: 'ST',
    SPRACH_CODE: 'D',
    BESCHREIBUNG_1: 'Stück',
  },
  {
    SYSTEM_CODE: '',
    USER_DEFINED_CODE: 'SUPL_CATEGORY',
    CODE_VALUE: 'B',
    SPRACH_CODE: 'D',
    BESCHREIBUNG_1: 'Abgabekategorie B',
  },
])

function quellen(): SwissmedicXmlQuellen {
  return {
    userDefinedCodes: udc,
    stoffSynonyme: xmlDatensaetze('STOFF', [
      { STOFF_ID: 'S1', SYNONYM_CODE: '1', STOFFSYNONYM: 'Paracetamolum' },
      { STOFF_ID: 'S2', SYNONYM_CODE: '1', STOFFSYNONYM: 'Coffeinum' },
      { STOFF_ID: 'S3', SYNONYM_CODE: '1', STOFFSYNONYM: 'Ibuprofenum' },
    ]),
    deklarationen: xmlDatensaetze('DEKLARATION', [
      {
        ZULASSUNGSNUMMER: '56318',
        SEQUENZNUMMER: '1',
        STOFF_ID: 'S1',
        STOFFKATEGORIE: 'W',
        MENGE: '1000',
        MENGEN_EINHEIT: 'MG',
      },
      {
        ZULASSUNGSNUMMER: '60000',
        SEQUENZNUMMER: '1',
        STOFF_ID: 'S1',
        STOFFKATEGORIE: 'W',
        MENGE: '500',
        MENGEN_EINHEIT: 'MG',
      },
      {
        ZULASSUNGSNUMMER: '60000',
        SEQUENZNUMMER: '1',
        STOFF_ID: 'S2',
        STOFFKATEGORIE: 'W',
        MENGE: '50',
        MENGEN_EINHEIT: 'MG',
      },
      {
        ZULASSUNGSNUMMER: '56046',
        SEQUENZNUMMER: '1',
        STOFF_ID: 'S3',
        STOFFKATEGORIE: 'W',
        MENGE: '100',
        MENGEN_EINHEIT: 'MG',
      },
    ]),
    packungen: xmlDatensaetze('PACKUNG', [
      {
        ZULASSUNGSNUMMER: '56318',
        SEQUENZNUMMER: '1',
        PACKUNGSCODE: '001',
        ZULASSUNGSSTATUS: 'A',
        PACKUNGSGROESSE: '20',
        PACKUNGSEINHEIT: 'ST',
        ABGABEKATEGORIE: 'B',
      },
      {
        ZULASSUNGSNUMMER: '60000',
        SEQUENZNUMMER: '1',
        PACKUNGSCODE: '001',
        ZULASSUNGSSTATUS: 'A',
      },
      {
        ZULASSUNGSNUMMER: '56046',
        SEQUENZNUMMER: '1',
        PACKUNGSCODE: '001',
        ZULASSUNGSSTATUS: 'X',
      },
    ]),
    sequenzen: xmlDatensaetze('SEQUENZ', [
      {
        ZULASSUNGSNUMMER: '56318',
        SEQUENZNUMMER: '1',
        ZULASSUNGSSTATUS: 'A',
        SEQUENZNAME: 'Dafalgan 1 g',
      },
      {
        ZULASSUNGSNUMMER: '60000',
        SEQUENZNUMMER: '1',
        ZULASSUNGSSTATUS: 'A',
        SEQUENZNAME: 'Test Kombi 500/50 mg',
      },
      {
        ZULASSUNGSNUMMER: '56046',
        SEQUENZNUMMER: '1',
        ZULASSUNGSSTATUS: 'X',
        SEQUENZNAME: 'Algifor alt',
      },
    ]),
    praeparate: xmlDatensaetze('PRAEPARAT', [
      {
        VERWENDUNG: 'HAM',
        ZULASSUNGSNUMMER: '56318',
        PRAEPARATENAME: 'Dafalgan',
        ARZNEIFORM: 'TAB',
        ZULASSUNGSSTATUS: 'A',
        ABGABEKATEGORIE: 'B',
        ATC_CODE: 'N02BE01',
      },
      {
        VERWENDUNG: 'HAM',
        ZULASSUNGSNUMMER: '60000',
        PRAEPARATENAME: 'Test Kombi',
        ARZNEIFORM: 'TAB',
        ZULASSUNGSSTATUS: 'A',
      },
      {
        VERWENDUNG: 'HAM',
        ZULASSUNGSNUMMER: '56046',
        PRAEPARATENAME: 'Algifor alt',
        ARZNEIFORM: 'TAB',
        ZULASSUNGSSTATUS: 'X',
      },
    ]),
    exportDatum: xmlDatensaetze('EXPORT', [{ EXPORT_DATUM: '20260831' }]),
  }
}

describe('Swissmedic-OGD Parser', () => {
  it('liest flache XML-Datensätze und dekodiert Entities', () => {
    const daten = leseXmlDatensaetze(
      xmlDatensaetze('TEST', [{ A: 'Dafalgan &amp; Co.', B: '500' }]),
      ['A', 'B'],
    )
    expect(daten).toEqual([{ A: 'Dafalgan & Co.', B: '500' }])
  })

  it('baut ein vollständig gemapptes Schweizer Einzelwirkstoff-Produkt', () => {
    const snapshot = baueSwissmedicSnapshot(quellen(), mapping, medikamentKatalog)
    const dafalgan = snapshot.produkte.find((produkt) => produkt.name === 'Dafalgan')

    expect(snapshot.stand).toBe('2026-08-31')
    expect(dafalgan).toMatchObject({
      zulassungsnummer: '56318',
      medikament_ids: ['paracetamol'],
      kombinationspraeparat: false,
      vollstaendig_gemappt: true,
      arzneiform: 'Filmtabletten',
    })
    expect(dafalgan?.wirkstoffe).toEqual([
      expect.objectContaining({ name: 'Paracetamolum', medikament_id: 'paracetamol' }),
    ])
    expect(dafalgan?.packungen[0]).toEqual(
      expect.objectContaining({ code: '001', groesse: '20', einheit: 'Stück' }),
    )
  })

  it('behält unbekannte zweite Wirkstoffe und sperrt dadurch die Automatik', () => {
    const snapshot = baueSwissmedicSnapshot(quellen(), mapping, medikamentKatalog)
    const kombi = snapshot.produkte.find((produkt) => produkt.name === 'Test Kombi')

    expect(kombi?.kombinationspraeparat).toBe(true)
    expect(kombi?.medikament_ids).toEqual(['paracetamol'])
    expect(kombi?.wirkstoffe.map((wirkstoff) => wirkstoff.name)).toEqual([
      'Paracetamolum',
      'Coffeinum',
    ])
    expect(kombi?.vollstaendig_gemappt).toBe(false)
    expect(snapshot.statistik.unvollstaendige_kombinationen).toBe(1)
  })

  it('schliesst nicht mehr zugelassene Präparate und Sequenzen aus', () => {
    const snapshot = baueSwissmedicSnapshot(quellen(), mapping, medikamentKatalog)
    expect(snapshot.produkte.some((produkt) => produkt.name === 'Algifor alt')).toBe(false)
  })

  it('lehnt ein Mapping auf einen nicht vorhandenen lokalen Wirkstoff ab', () => {
    const falsch: SwissmedicMappingKatalog = {
      version: 'test',
      hinweis: '',
      wirkstoffe: [{ medikament_id: 'gibt-es-nicht', treffer: [{ modus: 'praefix', wert: 'x' }] }],
    }
    expect(() => baueSwissmedicSnapshot(quellen(), falsch, medikamentKatalog)).toThrow(
      'unbekannte Medikamenten-ID',
    )
  })
})
