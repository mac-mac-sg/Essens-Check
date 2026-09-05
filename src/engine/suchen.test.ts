import { describe, expect, it } from 'vitest'
import { digraphform, findeNachId, MAX_TREFFER, MINDESTLAENGE, normalisiere, suche } from './suchen'
import { lebensmittelKatalog } from '../daten'
import { BELIEBT } from '../ampel'

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
    expect(ids('straussenfleisch')).toEqual([])
    expect(ids('quittenbrot')).toEqual([])
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

describe('Rangfolge bei vielen Treffern', () => {
  it('stellt den wörtlichen Treffer an die Spitze', () => {
    expect(ids('ei')[0]).toBe('ei')
    expect(ids('tee')[0]).toBe('schwarztee')
  })

  it('stellt Wortanfänge vor Treffer mitten im Wort', () => {
    // «Eierlikör» beginnt mit «ei», «Fleischkäse» trägt es nur in der Wortmitte.
    const treffer = ids('ei')
    expect(treffer.indexOf('eierlikoer')).toBeLessThan(treffer.indexOf('cervelat'))
  })

  it('blendet nichts aus — die Deckelung betrifft nur die Anzeige', () => {
    expect(ids('ei').length).toBeGreaterThan(MAX_TREFFER)
  })
})

describe('Einstiegs-Chips', () => {
  it('führt jeder häufige Begriff zu mindestens einem Treffer', () => {
    // Ein Chip, der ins Leere führt, wäre die schlechteste Visitenkarte.
    for (const eintrag of BELIEBT) {
      expect(ids(eintrag), eintrag).not.toEqual([])
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
