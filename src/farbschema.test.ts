import { describe, expect, it } from 'vitest'
import {
  ermittleSchema,
  istWunsch,
  LEISTENFARBE,
  leseWunsch,
  SCHEMA_SCHLUESSEL,
  speichereWunsch,
  umgelegt,
  VOREINSTELLUNG,
} from './farbschema'

describe('ermittleSchema', () => {
  it('folgt bei «system» dem Gerät', () => {
    expect(ermittleSchema('system', true)).toBe('dunkel')
    expect(ermittleSchema('system', false)).toBe('hell')
  })

  it('überstimmt das Gerät, wenn gewählt wurde', () => {
    expect(ermittleSchema('hell', true)).toBe('hell')
    expect(ermittleSchema('dunkel', false)).toBe('dunkel')
  })
})

describe('umgelegt', () => {
  it('kehrt das geltende Schema um und legt es fest', () => {
    expect(umgelegt('hell')).toBe('dunkel')
    expect(umgelegt('dunkel')).toBe('hell')
  })
})

describe('istWunsch', () => {
  it('nimmt nur die drei bekannten Werte an', () => {
    for (const gut of ['hell', 'dunkel', 'system']) expect(istWunsch(gut)).toBe(true)
    for (const schlecht of [null, '', 'light', 'Dunkel', 42, {}]) {
      expect(istWunsch(schlecht), String(schlecht)).toBe(false)
    }
  })
})

describe('Voreinstellung', () => {
  /** Ein Speicher, wie ihn der Browser stellt — die Tests laufen ohne DOM. */
  function speicher(inhalt: Record<string, string> = {}) {
    globalThis.localStorage = {
      getItem: (k: string) => inhalt[k] ?? null,
      setItem: (k: string, v: string) => {
        inhalt[k] = v
      },
      removeItem: (k: string) => {
        delete inhalt[k]
      },
    } as unknown as Storage
    return inhalt
  }

  it('ist hell, nicht die Systemvorgabe', () => {
    expect(VOREINSTELLUNG).toBe('hell')
    speicher()
    expect(leseWunsch()).toBe('hell')
  })

  it('liest eine gespeicherte Wahl zurück', () => {
    speicher({ [SCHEMA_SCHLUESSEL]: 'dunkel' })
    expect(leseWunsch()).toBe('dunkel')
  })

  it('hält «Dem Gerät folgen» über den nächsten Start hinweg', () => {
    // Würde «system» den Schlüssel löschen, käme beim nächsten Start wieder
    // die Voreinstellung — die Wahl hielte nur bis zum Schliessen der App.
    const inhalt = speicher()
    speichereWunsch('system')
    expect(inhalt[SCHEMA_SCHLUESSEL]).toBe('system')
    expect(leseWunsch()).toBe('system')
  })

  it('übersteht einen gesperrten Speicher', () => {
    globalThis.localStorage = {
      getItem: () => {
        throw new Error('gesperrt')
      },
      setItem: () => {
        throw new Error('gesperrt')
      },
      removeItem: () => {},
    } as unknown as Storage
    expect(leseWunsch()).toBe('hell')
    expect(() => speichereWunsch('dunkel')).not.toThrow()
  })
})

describe('Leistenfarbe', () => {
  it('nennt für jedes Schema eine Farbe', () => {
    expect(LEISTENFARBE.hell).toMatch(/^#[0-9A-F]{6}$/i)
    expect(LEISTENFARBE.dunkel).toMatch(/^#[0-9A-F]{6}$/i)
  })
})
