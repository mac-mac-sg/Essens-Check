import { describe, expect, it } from 'vitest'
import { digraphform, findeNachId, MINDESTLAENGE, normalisiere, suche } from './suchen'
import { lebensmittelKatalog } from '../daten'

const ids = (anfrage: string) => suche(anfrage, lebensmittelKatalog).map((e) => e.id)

describe('normalisiere', () => {
  it('vereinheitlicht Grossschreibung, Akzente und Leerraum', () => {
    expect(normalisiere('  Gruyère  ')).toBe('gruyere')
    expect(normalisiere('Entrecôte')).toBe('entrecote')
    expect(normalisiere('Käse')).toBe('kase')
  })

  it('ersetzt ß durch ss', () => {
    expect(normalisiere('Weißschimmel')).toBe('weissschimmel')
  })
})

describe('digraphform', () => {
  it('schreibt Umlaute aus', () => {
    expect(digraphform('Käse')).toBe('kaese')
    expect(digraphform('Hähnchen')).toBe('haehnchen')
    expect(digraphform('Nüsslisalat')).toBe('nuesslisalat')
  })
})

describe('suche', () => {
  it('sucht erst ab zwei Zeichen', () => {
    expect(MINDESTLAENGE).toBe(2)
    expect(ids('l')).toEqual([])
    expect(ids('')).toEqual([])
    expect(ids('la').length).toBeGreaterThan(0)
  })

  it('findet über den Namen', () => {
    expect(ids('camembert')).toContain('camembert')
  })

  it('findet über Synonyme', () => {
    expect(ids('bündnerfleisch')).toContain('salami')
    expect(ids('poulet')).toContain('gefluegel')
    expect(ids('mett')).toContain('tatar')
  })

  it('findet unabhängig von der Umlautschreibung', () => {
    expect(ids('hähnchen')).toContain('gefluegel')
    expect(ids('haehnchen')).toContain('gefluegel')
    expect(ids('hahnchen')).toContain('gefluegel')
  })

  it('findet unabhängig von Akzenten und Grossschreibung', () => {
    expect(ids('GRUYERE')).toContain('hartkaese')
    expect(ids('gruyère')).toContain('hartkaese')
  })

  it('stellt den wörtlichen Treffer vor den blossen Teiltreffer', () => {
    // «lachs» steht wörtlich als Synonym, «blattsalat» enthält es nicht —
    // geprüft wird die Reihenfolge bei mehreren Treffern.
    const treffer = ids('salat')
    expect(treffer[0]).toBe('blattsalat')
  })

  it('liefert bei einem unbekannten Begriff einen Nulltreffer', () => {
    expect(ids('kartoffelgratin')).toEqual([])
    expect(ids('xyzzy')).toEqual([])
  })

  it('rät nicht über Wortähnlichkeit', () => {
    // Ein Tippfehler darf keinen Treffer erzeugen — lieber nichts als falsch.
    expect(ids('camambert')).toEqual([])
    expect(ids('thunfsch')).toEqual([])
  })

  it('findet jeden Katalogeintrag über seinen eigenen Namen', () => {
    for (const eintrag of lebensmittelKatalog.lebensmittel) {
      expect(ids(eintrag.name), eintrag.id).toContain(eintrag.id)
    }
  })

  it('findet jeden Katalogeintrag über jedes seiner Synonyme', () => {
    for (const eintrag of lebensmittelKatalog.lebensmittel) {
      for (const synonym of eintrag.synonyme) {
        expect(ids(synonym), `${eintrag.id}: ${synonym}`).toContain(eintrag.id)
      }
    }
  })
})

describe('findeNachId', () => {
  it('findet einen bekannten Eintrag', () => {
    expect(findeNachId('lachs', lebensmittelKatalog)?.name).toBe('Lachs')
  })

  it('liefert für eine unbekannte ID undefined', () => {
    expect(findeNachId('gibt-es-nicht', lebensmittelKatalog)).toBeUndefined()
  })
})
