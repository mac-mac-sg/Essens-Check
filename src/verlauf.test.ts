import { beforeEach, describe, expect, it } from 'vitest'
import {
  ergaenzt,
  leseVerlauf,
  MERKE_HOECHSTENS,
  speichereVerlauf,
  VERLAUF_SCHLUESSEL,
} from './verlauf'

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

describe('ergaenzt', () => {
  it('setzt das Zuletztgesuchte an den Anfang', () => {
    expect(ergaenzt(['lachs', 'kaffee'], 'salami')).toEqual(['salami', 'lachs', 'kaffee'])
  })

  it('führt dasselbe Lebensmittel nur einmal', () => {
    // Sonst stünde «Lachs» fünfmal da, wenn er fünfmal nachgeschlagen wurde.
    expect(ergaenzt(['lachs', 'kaffee'], 'lachs')).toEqual(['lachs', 'kaffee'])
  })

  it('hält die Länge bei fünf', () => {
    const voll = ['a', 'b', 'c', 'd', 'e']
    const neu = ergaenzt(voll, 'f')
    expect(neu).toHaveLength(MERKE_HOECHSTENS)
    expect(neu[0]).toBe('f')
    expect(neu).not.toContain('e')
  })

  it('lässt die Vorlage unberührt', () => {
    const vorher = ['a', 'b']
    ergaenzt(vorher, 'c')
    expect(vorher).toEqual(['a', 'b'])
  })
})

describe('Speichern und Lesen', () => {
  beforeEach(() => speicher())

  it('gibt ohne gespeicherten Verlauf eine leere Liste', () => {
    expect(leseVerlauf()).toEqual([])
  })

  it('liest zurück, was geschrieben wurde', () => {
    speichereVerlauf(['lachs', 'kaffee'])
    expect(leseVerlauf()).toEqual(['lachs', 'kaffee'])
  })

  it('löscht den Schlüssel, wenn der Verlauf leer ist', () => {
    const inhalt = speicher({ [VERLAUF_SCHLUESSEL]: '["lachs"]' })
    speichereVerlauf([])
    expect(inhalt[VERLAUF_SCHLUESSEL]).toBeUndefined()
    expect(leseVerlauf()).toEqual([])
  })

  it('behandelt beschädigten Inhalt als keinen Verlauf', () => {
    for (const müll of ['kein json', '{"a":1}', '"lachs"', '42', 'null']) {
      speicher({ [VERLAUF_SCHLUESSEL]: müll })
      expect(leseVerlauf(), müll).toEqual([])
    }
  })

  it('wirft Fremdkörper aus einer sonst gültigen Liste', () => {
    speicher({ [VERLAUF_SCHLUESSEL]: '["lachs", 42, null, "kaffee"]' })
    expect(leseVerlauf()).toEqual(['lachs', 'kaffee'])
  })

  it('begrenzt auch eine zu lang gespeicherte Liste', () => {
    speicher({ [VERLAUF_SCHLUESSEL]: JSON.stringify(['a', 'b', 'c', 'd', 'e', 'f', 'g']) })
    expect(leseVerlauf()).toHaveLength(MERKE_HOECHSTENS)
  })

  it('übersteht einen gesperrten Speicher', () => {
    globalThis.localStorage = {
      getItem: () => {
        throw new Error('gesperrt')
      },
      setItem: () => {
        throw new Error('gesperrt')
      },
      removeItem: () => {
        throw new Error('gesperrt')
      },
    } as unknown as Storage
    expect(leseVerlauf()).toEqual([])
    expect(() => speichereVerlauf(['lachs'])).not.toThrow()
  })
})
