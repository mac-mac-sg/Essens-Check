import { describe, expect, it } from 'vitest'
import { bewerteKomponente, bewerteLebensmittel, bewerteVariante, UNKLAR_TEXT } from './bewerten'
import { lebensmittelKatalog, regelKatalog } from '../daten'
import { findeNachId } from './suchen'
import type { Status } from '../typen'

/** Urteile aller Varianten eines Eintrags, in Katalogreihenfolge. */
function urteile(id: string, trimester?: number): Status[] {
  const eintrag = findeNachId(id, lebensmittelKatalog)
  if (!eintrag) throw new Error(`Lebensmittel «${id}» fehlt im Katalog`)
  return bewerteLebensmittel(eintrag, regelKatalog, trimester).varianten.map((v) => v.status)
}

function ersteVariante(id: string, trimester?: number) {
  const eintrag = findeNachId(id, lebensmittelKatalog)
  if (!eintrag) throw new Error(`Lebensmittel «${id}» fehlt im Katalog`)
  const urteil = bewerteLebensmittel(eintrag, regelKatalog, trimester)
  const erste = urteil.varianten[0]
  if (!erste) throw new Error(`Lebensmittel «${id}» hat keine Variante`)
  return erste
}

describe('Zubereitung entscheidet', () => {
  it('bewertet Lachs je nach Zubereitung', () => {
    // Gegart, kalt geräuchert, roh
    expect(urteile('lachs')).toEqual(['ok', 'meiden', 'meiden'])
  })

  it('gibt Salami erst durcherhitzt frei, tiefgefroren nur bedingt', () => {
    expect(urteile('salami')).toEqual(['meiden', 'ok', 'bedingt'])
  })

  it('trennt durchgebratenes von rosa Fleisch', () => {
    expect(urteile('steak')).toEqual(['ok', 'meiden'])
  })

  it('gibt Eier nur durchgegart frei', () => {
    expect(urteile('spiegelei')).toEqual(['ok', 'meiden'])
  })

  it('gibt Austern und Sprossen nur gegart frei', () => {
    expect(urteile('austern')).toEqual(['ok', 'meiden'])
    expect(urteile('sprossen')).toEqual(['ok', 'meiden'])
  })

  it('gibt Salat nur gewaschen ohne Vorbehalt frei', () => {
    expect(urteile('blattsalat')).toEqual(['ok', 'bedingt'])
  })
})

describe('Entschärfung', () => {
  it('stuft rohes Ei durch Pasteurisierung auf ok herab', () => {
    expect(urteile('tiramisu')).toEqual(['meiden', 'ok'])
  })

  it('stuft Koffein durch Entkoffeinierung auf ok herab', () => {
    expect(urteile('kaffee')).toEqual(['bedingt', 'ok'])
  })

  it('stuft Alkohol nur bei ausgewiesenen 0,0 Prozent auf ok herab', () => {
    expect(urteile('wein-bier')).toEqual(['meiden', 'ok'])
  })

  it('stuft Thunfisch durch Mengenbegrenzung auf bedingt herab', () => {
    expect(urteile('thunfisch')).toEqual(['bedingt', 'meiden'])
  })

  it('nennt bei Entschärfung den Entschärfungstext statt der Regelbegründung', () => {
    const variante = ersteVariante('kaffee')
    expect(variante.begruendungen.map((b) => b.text).join(' ')).toContain('200 mg')
  })
})

describe('nicht_entschaerfbar_durch', () => {
  it('lässt Quecksilber durch Erhitzen nicht verschwinden', () => {
    // Schwertfisch trägt den Zustand durcherhitzt und bleibt trotzdem meiden.
    expect(urteile('schwertfisch')).toEqual(['meiden'])
    expect(ersteVariante('schwertfisch').begruendungen[0]?.text).toContain('Methylquecksilber')
  })
})

describe('Schlechtester Status gewinnt', () => {
  it('bewertet Vitello tonnato über die kritischste Komponente', () => {
    // Restaurant: rohes Ei und Quecksilber trotz durchgegartem Fleisch.
    // Gekaufte Sauce: pasteurisiertes Ei, kein Thunfisch mehr im Datensatz.
    expect(urteile('vitello-tonnato')).toEqual(['meiden', 'ok'])
  })
})

describe('Trimester-Hinweise', () => {
  it('zeigt den Retinol-Hinweis nur im ersten Trimester', () => {
    expect(ersteVariante('leber', 1).trimesterHinweise).toHaveLength(1)
    expect(ersteVariante('leber', 2).trimesterHinweise).toHaveLength(0)
    expect(ersteVariante('leber').trimesterHinweise).toHaveLength(0)
  })

  it('zeigt den Kräuter-Hinweis nur im dritten Trimester', () => {
    expect(ersteVariante('kraeutertee', 3).trimesterHinweise).toHaveLength(1)
    expect(ersteVariante('kraeutertee', 1).trimesterHinweise).toHaveLength(0)
  })

  it('ändert das Urteil durch den Hinweis nicht', () => {
    expect(ersteVariante('leber', 1).status).toBe('meiden')
    expect(ersteVariante('leber', 3).status).toBe('meiden')
  })
})

describe('Unbedenkliche und unbekannte Tags', () => {
  it('gibt ausdrücklich unbedenkliche Tags frei', () => {
    expect(urteile('hartkaese')).toEqual(['ok'])
    expect(urteile('ananas')).toEqual(['ok'])
  })

  it('bewertet ein Tag ohne Regel und ohne Freigabe als unklar', () => {
    const urteil = bewerteKomponente({ tag: 'gibt-es-nicht' }, regelKatalog)
    expect(urteil.status).toBe('unklar')
    expect(urteil.begruendungen[0]?.text).toBe(UNKLAR_TEXT)
  })

  it('rät auch bei bekanntem Tag mit unbekanntem Zustand keine Freigabe', () => {
    const urteil = bewerteKomponente({ tag: 'ei-roh', zustand: 'irgendwie' }, regelKatalog)
    expect(urteil.status).toBe('meiden')
  })
})

describe('eigener_text', () => {
  it('ersetzt die Begründung, nicht das Urteil', () => {
    const variante = ersteVariante('ananas')
    expect(variante.status).toBe('ok')
    expect(variante.begruendungen).toHaveLength(1)
    expect(variante.begruendungen[0]?.regel).toBe('eigener_text')
    expect(variante.begruendungen[0]?.text).toContain('Mythos')
  })
})

describe('Begründungen', () => {
  it('entfernt doppelte Formulierungen', () => {
    const variante = ersteVariante('camembert')
    const texte = variante.begruendungen.map((b) => b.text)
    expect(new Set(texte).size).toBe(texte.length)
  })

  it('gibt jeder Variante mindestens eine Begründung', () => {
    for (const eintrag of lebensmittelKatalog.lebensmittel) {
      for (const variante of bewerteLebensmittel(eintrag, regelKatalog).varianten) {
        expect(variante.begruendungen.length, `${eintrag.id}/${variante.label}`).toBeGreaterThan(0)
      }
    }
  })
})

describe('Im Zweifel das strengere Argument', () => {
  it('lässt bei zwei Regeln auf einem Tag die strengere gewinnen', () => {
    // rohmilch-weichkaese trifft listerien-weichkaese (pasteurisiert -> bedingt)
    // und listerien-nicht-erhitzt (keine Entschärfung für pasteurisiert -> meiden).
    // Camembert aus pasteurisierter Milch bleibt deshalb meiden.
    const pasteurisiert = ersteVariante('camembert')
    expect(pasteurisiert.label).toBe('Aus pasteurisierter Milch')
    expect(pasteurisiert.status).toBe('meiden')
  })

  it('nennt trotzdem beide Begründungen', () => {
    const texte = ersteVariante('camembert').begruendungen.map((b) => b.regel)
    expect(texte).toContain('listerien-nicht-erhitzt')
    expect(texte).toContain('listerien-weichkaese')
  })

  it('lässt eine Regel eine Freigabe aus unbedenkliche_tags überstimmen', () => {
    const katalog = {
      ...regelKatalog,
      unbedenkliche_tags: [
        ...regelKatalog.unbedenkliche_tags,
        { tag: 'ei-roh', text: 'Frei erfundene Freigabe.' },
      ],
    }
    expect(bewerteKomponente({ tag: 'ei-roh' }, katalog).status).toBe('meiden')
  })

  it('greift bei mehreren Entschärfungen für denselben Zustand die strengste', () => {
    const katalog = {
      ...regelKatalog,
      regeln: [
        {
          id: 'test-mehrdeutig',
          titel: 'Mehrdeutig',
          trifft_auf: ['test-tag'],
          status: 'meiden' as const,
          begruendung: 'Grundregel.',
          entschaerfung: [
            { durch: 'gekocht', auf: 'ok' as const, text: 'Milde Lesart.' },
            { durch: 'gekocht', auf: 'bedingt' as const, text: 'Strenge Lesart.' },
          ],
          trimester_gewichtung: null,
        },
      ],
    }
    const urteil = bewerteKomponente({ tag: 'test-tag', zustand: 'gekocht' }, katalog)
    expect(urteil.status).toBe('bedingt')
    expect(urteil.begruendungen[0]?.text).toBe('Strenge Lesart.')
  })

  it('wertet eine Variante ohne Komponenten als unklar, nicht als ok', () => {
    const urteil = bewerteVariante({ label: null, komponenten: [] }, regelKatalog)
    expect(urteil.status).toBe('unklar')
    expect(urteil.begruendungen[0]?.text).toBe(UNKLAR_TEXT)
  })
})

describe('Katalogabdeckung', () => {
  it('löst jede Regel mit mindestens einem Lebensmittel aus', () => {
    const ausgeloest = new Set<string>()
    for (const eintrag of lebensmittelKatalog.lebensmittel) {
      for (const variante of bewerteLebensmittel(eintrag, regelKatalog).varianten) {
        for (const komponente of variante.komponenten) {
          for (const begruendung of komponente.begruendungen) ausgeloest.add(begruendung.regel)
        }
      }
    }
    const fehlend = regelKatalog.regeln.map((r) => r.id).filter((id) => !ausgeloest.has(id))
    expect(fehlend).toEqual([])
  })

  it('lässt keinen Katalogeintrag unklar werden', () => {
    for (const eintrag of lebensmittelKatalog.lebensmittel) {
      for (const variante of bewerteLebensmittel(eintrag, regelKatalog).varianten) {
        expect(variante.status, `${eintrag.id}/${variante.label}`).not.toBe('unklar')
      }
    }
  })

  it('hält die Urteile aller Varianten fest', () => {
    const stand = Object.fromEntries(
      lebensmittelKatalog.lebensmittel.map((eintrag) => [
        eintrag.id,
        bewerteLebensmittel(eintrag, regelKatalog).varianten.map((v) => v.status),
      ]),
    )
    expect(stand).toEqual({
      camembert: ['meiden', 'meiden', 'ok'],
      hartkaese: ['ok'],
      lachs: ['ok', 'meiden', 'meiden'],
      thunfisch: ['bedingt', 'meiden'],
      schwertfisch: ['meiden'],
      salami: ['meiden', 'ok', 'bedingt'],
      tatar: ['meiden'],
      steak: ['ok', 'meiden'],
      gefluegel: ['bedingt'],
      tiramisu: ['meiden', 'ok'],
      spiegelei: ['ok', 'meiden'],
      kaffee: ['bedingt', 'ok'],
      leber: ['meiden'],
      austern: ['ok', 'meiden'],
      sprossen: ['ok', 'meiden'],
      'vitello-tonnato': ['meiden', 'ok'],
      ananas: ['ok'],
      'wein-bier': ['meiden', 'ok'],
      lakritze: ['bedingt'],
      blattsalat: ['ok', 'bedingt'],
      kraeutertee: ['bedingt'],
    })
  })
})
