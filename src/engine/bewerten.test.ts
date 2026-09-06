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

function urteilVon(id: string, trimester?: number) {
  const eintrag = findeNachId(id, lebensmittelKatalog)
  if (!eintrag) throw new Error(`Lebensmittel «${id}» fehlt im Katalog`)
  return bewerteLebensmittel(eintrag, regelKatalog, trimester)
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
    expect(urteile('ei')).toEqual(['ok', 'meiden'])
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
    // Gekaufte Sauce: pasteurisiertes Ei — die Thunfischsauce bleibt aber
    // Thunfischsauce, also greift die Mengenbegrenzung.
    expect(urteile('vitello-tonnato')).toEqual(['meiden', 'bedingt'])
  })

  it('lässt die Thunfischsauce in beiden Varianten mitzählen', () => {
    const eintrag = findeNachId('vitello-tonnato', lebensmittelKatalog)
    if (!eintrag) throw new Error('Vitello tonnato fehlt im Katalog')
    for (const variante of bewerteLebensmittel(eintrag, regelKatalog).varianten) {
      expect(variante.komponenten.map((k) => k.tag)).toContain('raubfisch-mittel')
    }
  })
})

describe('Was eine Entschärfung verspricht, muss sie halten', () => {
  it('erreicht mit jedem Entschärfungszustand genau den versprochenen Status', () => {
    // Fehlerklasse: eine Regel entschärft, eine zweite auf demselben Tag hält
    // dagegen. Der Text sagt dann «vertretbar», das Urteil sagt «besser nicht».
    // Genau so stand pasteurisierter Camembert im Katalog.
    for (const regel of regelKatalog.regeln) {
      for (const entschaerfung of regel.entschaerfung) {
        for (const tag of regel.trifft_auf) {
          const urteil = bewerteKomponente({ tag, zustand: entschaerfung.durch }, regelKatalog)
          expect(
            urteil.status,
            `${regel.id}: «${entschaerfung.durch}» auf ${tag} verspricht ${entschaerfung.auf}`,
          ).toBe(entschaerfung.auf)
        }
      }
    }
  })

  it('erklärt bei pasteurisiertem Weichkäse, warum es trotzdem nein bleibt', () => {
    const variante = urteilVon('camembert').varianten[0]
    expect(variante?.status).toBe('meiden')
    expect(variante?.begruendungen.map((b) => b.text).join(' ')).toContain(
      'nur einen Teil des Risikos',
    )
  })
})

describe('Honig trennt die Schwangere vom Säugling', () => {
  it('gibt Honig für die Schwangere frei und für das Kind nicht', () => {
    expect(urteile('saeuglingshonig')).toEqual(['ok', 'meiden'])
  })

  it('nennt den Grund beim Namen', () => {
    const zweite = urteilVon('saeuglingshonig').varianten[1]
    expect(zweite?.begruendungen[0]?.text).toContain('botulinum')
  })
})

describe('Bärlauch wird bodennah gesammelt', () => {
  it('gibt ihn gekocht und gewaschen frei, ungewaschen nur bedingt', () => {
    expect(urteile('baerlauch')).toEqual(['ok', 'ok', 'bedingt'])
  })
})

describe('Nährstoffpräparate', () => {
  it('gibt die vier häufig gefragten Präparate frei', () => {
    for (const id of ['magnesium', 'kalzium', 'vitamin-d', 'folsaeure', 'eisen', 'omega3']) {
      expect(urteile(id), id).toEqual(['ok'])
    }
  })

  it('verweist bei der Menge auf die Ärztin statt eine Dosis zu nennen', () => {
    const text = ersteVariante('magnesium').begruendungen.map((b) => b.text).join(' ')
    expect(text).toMatch(/Ärztin|Hebamme/)
    expect(text).not.toMatch(/\d+\s*(mg|µg|ug|IE|I\.E\.)/)
  })

  it('trennt das Schwangerschaftspräparat vom Vitamin-A-Präparat', () => {
    // Ein Multivitamin für die Schwangerschaft ist kein Retinolpräparat.
    // Ohne Angabe bleibt es beim strengeren Urteil.
    expect(urteile('multivitamin')).toEqual(['ok', 'meiden'])
  })

  it('trennt Vitamin D von Vitamin A', () => {
    expect(urteile('vitamin-d')).toEqual(['ok'])
    expect(urteile('vitamin-a-praeparat')).toEqual(['meiden'])
    expect(urteile('lebertran')).toEqual(['meiden'])
  })
})

describe('Jod: zu wenig und zu viel liegen nah beieinander', () => {
  it('gibt das verordnete Präparat frei und das Algenpräparat nicht', () => {
    expect(urteile('jod')).toEqual(['ok', 'meiden'])
  })

  it('trennt Nori von den Braunalgen, statt beide gleich zu behandeln', () => {
    // Nori trägt deutlich weniger Jod als Kombu oder Wakame. Beide unter einem
    // Eintrag zu führen kehrte die tatsächliche Belastung um.
    expect(urteile('algen')).toEqual(['ok', 'bedingt'])
    expect(urteile('braunalgen')).toEqual(['bedingt', 'meiden'])
  })

  it('begründet beide mit der Menge, nicht mit gekochtem Gemüse', () => {
    expect(ersteVariante('algen').begruendungen[0]?.titel).toBe('Zu viel Jod')
    expect(ersteVariante('braunalgen').begruendungen[0]?.titel).toBe('Zu viel Jod')
  })

  it('nimmt Spirulina aus der Jod-Regel heraus', () => {
    // Spirulina enthält wenig Jod. Das Urteil stimmte, die Begründung führte
    // in die Irre — und mit ihr jede Ableitung aus dieser Regel.
    expect(urteile('spirulina')).toEqual(['meiden'])
    expect(ersteVariante('spirulina').komponenten[0]?.tag).toBe('ergaenzung-schwankend')
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

describe('Risikoprinzip', () => {
  it('nennt zu jeder Regelbegründung den Titel des Prinzips', () => {
    const variante = ersteVariante('schwertfisch')
    expect(variante.begruendungen[0]?.titel).toBe('Quecksilber in grossen Raubfischen')
  })

  it('nennt den Titel auch bei entschärften Regeln', () => {
    const variante = ersteVariante('kaffee')
    expect(variante.begruendungen[0]?.titel).toBe('Koffein')
  })

  it('lässt den Titel weg, wo keine Regel dahintersteht', () => {
    expect(ersteVariante('hartkaese').begruendungen[0]?.titel).toBeUndefined()
    expect(ersteVariante('ananas').begruendungen[0]?.titel).toBeUndefined()
    expect(bewerteKomponente({ tag: 'gibt-es-nicht' }, regelKatalog).begruendungen[0]?.titel)
      .toBeUndefined()
  })

  it('gibt jeder Regelbegründung im ganzen Katalog einen Titel', () => {
    const ohneTitel = new Set<string>()
    for (const eintrag of lebensmittelKatalog.lebensmittel) {
      for (const variante of bewerteLebensmittel(eintrag, regelKatalog).varianten) {
        for (const grund of variante.begruendungen) {
          const ausRegel = !['unbedenklich', 'unklar', 'eigener_text'].includes(grund.regel)
          if (ausRegel && !grund.titel) ohneTitel.add(grund.regel)
        }
      }
    }
    expect([...ohneTitel]).toEqual([])
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

describe('Vorrang von «unklar»', () => {
  const gemischt = (...tags: string[]) =>
    bewerteVariante({ label: null, komponenten: tags.map((tag) => ({ tag })) }, regelKatalog)
      .status

  it('schlägt eine Freigabe — Unwissen wird nie zum Ja', () => {
    expect(gemischt('getreide')).toBe('ok')
    expect(gemischt('getreide', 'nicht-bewertet')).toBe('unklar')
  })

  it('schlägt eine Bedingung — Unwissen wird nie zur blossen Einschränkung', () => {
    expect(gemischt('gefluegel')).toBe('bedingt')
    expect(gemischt('gefluegel', 'nicht-bewertet')).toBe('unklar')
  })

  it('unterliegt einem bekannten Nein, statt es zu verdecken', () => {
    // Der eigentliche Grund für die Rangfolge: «Nicht bewertet» neben einem
    // bekannten Risiko liest sich, als wisse die App nichts — dabei weiss sie
    // das Entscheidende. Ein bekanntes Nein ist ebenso schützend und weit
    // brauchbarer.
    expect(gemischt('fisch-roh')).toBe('meiden')
    expect(gemischt('fisch-roh', 'nicht-bewertet')).toBe('meiden')
  })

  it('gilt genauso für ein Tag, das gar keine Regel kennt', () => {
    expect(gemischt('gibt-es-nicht')).toBe('unklar')
    expect(gemischt('gibt-es-nicht', 'fisch-roh')).toBe('meiden')
    expect(gemischt('gibt-es-nicht', 'getreide')).toBe('unklar')
  })

  it('hält die Reihenfolge selbst fest', () => {
    // Wer sie umstellt, dreht damit stillschweigend Urteile.
    expect(regelKatalog.status_rangfolge).toEqual(['ok', 'bedingt', 'unklar', 'meiden'])
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

  it('lässt keinen Katalogeintrag versehentlich unklar werden', () => {
    // «unklar» darf vorkommen, aber nur als erklärte Lücke über eine Regel —
    // nie, weil ein Tag weder eine Regel noch eine Freigabe trifft. Genau das
    // wäre ein Tippfehler im Katalog, und genau den soll dieser Test finden.
    //
    // Unterscheidbar sind die beiden an der Begründung: der Notfall trägt die
    // Marke 'unklar', die erklärte Lücke die ID ihrer Regel. Geprüft wird auf
    // Komponentenebene, weil `eigener_text` die Begründung der Variante
    // ersetzt und den Unterschied sonst verdecken würde.
    for (const eintrag of lebensmittelKatalog.lebensmittel) {
      for (const variante of bewerteLebensmittel(eintrag, regelKatalog).varianten) {
        expect(variante.komponenten.length, `${eintrag.id}/${variante.label}: leere Variante`)
          .toBeGreaterThan(0)
        for (const komponente of variante.komponenten) {
          expect(
            komponente.begruendungen.some((b) => b.regel === 'unklar'),
            `${eintrag.id}: Tag «${komponente.tag}» trifft keine Regel und keine Freigabe`,
          ).toBe(false)
        }
      }
    }
  })

  it('lässt die erklärte Lücke aber zu und nennt ihre Regel', () => {
    const variante = urteilVon('johanniskraut').varianten[0]
    expect(variante?.status).toBe('unklar')
    expect(variante?.komponenten[0]?.begruendungen[0]?.regel).toBe('nicht-bewertet')
  })

  /**
   * Referenzurteile. Kein Abbild des ganzen Katalogs — der wächst —, sondern
   * die Fälle, die je ein Regelmuster festhalten. Dreht ein Regelumbau eines
   * davon, schlägt dieser Test an.
   */
  it('hält die Referenzurteile fest', () => {
    const referenz: Record<string, Status[]> = {
      // Weichkäse: die strengere der beiden Listerien-Regeln gewinnt
      camembert: ['meiden', 'meiden', 'ok'],
      hartkaese: ['ok'],
      // BLV: auch pasteurisierter Feta gilt als ungeeignet, überbacken nicht.
      feta: ['meiden', 'meiden', 'ok'],
      // Halbhartkäse ist die BLV-Ausweitung — kalt nein, geschmolzen ja.
      halbhartkaese: ['meiden', 'ok'],
      formaggini: ['meiden', 'ok'],
      raclette: ['ok', 'meiden'],
      'tete-de-moine': ['meiden', 'ok'],
      fondue: ['ok'],
      halloumi: ['ok', 'meiden'],
      mozzarella: ['ok', 'meiden'],
      // Gereifter Cheddar bleibt Hartkäse; Gouda und Edamer sind ausgezogen.
      cheddar: ['ok'],
      'kaese-allgemein': ['ok', 'meiden', 'meiden', 'meiden', 'ok'],
      // Die Rinde ist die Aussenseite — der Teig bleibt ein Ja.
      kaeserinde: ['ok', 'bedingt', 'ok', 'meiden'],
      // Wo die Darreichung das Risiko trägt, gibt es eine sichere Form.
      antipasti: ['ok', 'meiden'],
      'glühwein': ['ok', 'meiden'],
      kaviar: ['ok', 'meiden'],
      // Nori trägt weniger Jod als die Braunalgen; Spirulina gar keins.
      algen: ['ok', 'bedingt'],
      braunalgen: ['bedingt', 'meiden'],
      spirulina: ['meiden'],
      // Zwei Risiken auf einem Eintrag: Retinol und Listerien
      leberwurst: ['meiden'],
      // Seeteufel und Wels sind Raubfische
      weissfisch: ['bedingt', 'meiden'],
      // Fisch: Garung, Räucherung, Quecksilber
      lachs: ['ok', 'meiden', 'meiden'],
      // Quecksilber überlebt das Garen — gegart deshalb bedingt, nicht ok.
      heilbutt: ['bedingt', 'meiden'],
      makrele: ['bedingt', 'meiden'],
      tintenfisch: ['bedingt', 'meiden'],
      thunfisch: ['bedingt', 'meiden'],
      schwertfisch: ['meiden'],
      // Fleisch: Toxoplasmose und ihre Entschärfungen
      salami: ['meiden', 'ok', 'bedingt'],
      tatar: ['meiden'],
      steak: ['ok', 'meiden'],
      gefluegel: ['bedingt'],
      // Ei
      ei: ['ok', 'meiden'],
      tiramisu: ['meiden', 'ok'],
      // Mehrere Komponenten, schlechteste gewinnt
      'vitello-tonnato': ['meiden', 'bedingt'],
      // Getränke
      kaffee: ['bedingt', 'ok'],
      'wein-bier': ['meiden', 'ok'],
      alkoholfrei: ['ok', 'meiden'],
      // Trimester-gewichtete Regeln
      leber: ['meiden'],
      kraeutertee: ['bedingt'],
      // Der Adressat entscheidet, nicht der Fliesstext
      saeuglingshonig: ['ok', 'meiden'],
      // Innereien tragen Schadstoffe über das Retinol hinaus
      innereien: ['bedingt'],
      // Erklärte Lücke, kein Versehen
      johanniskraut: ['unklar'],
      truthahn: ['ok', 'bedingt'],
      sauser: ['ok', 'bedingt', 'meiden'],
      // Bodennah gesammelt, deshalb wie frische Kräuter behandelt
      baerlauch: ['ok', 'ok', 'bedingt'],
      // Waschen, Keime, offene Ware
      blattsalat: ['ok', 'bedingt'],
      sprossen: ['ok', 'meiden'],
      fertigsalat: ['meiden'],
      rohmilch: ['ok', 'meiden'],
      // Unbedenkliche Tags
      ananas: ['ok'],
      brot: ['ok'],
      wasser: ['ok'],
    }
    const gemessen = Object.fromEntries(
      Object.keys(referenz).map((id) => [id, urteile(id)]),
    )
    expect(gemessen).toEqual(referenz)
  })

  it('deckt jedes Variantenmuster mit mindestens einem Eintrag ab', () => {
    const muster = new Set(
      lebensmittelKatalog.lebensmittel.map((eintrag) => eintrag.varianten.length),
    )
    expect(muster.has(1)).toBe(true)
    expect(muster.has(2)).toBe(true)
    expect(muster.has(3)).toBe(true)
  })

  it('erreicht den Zielumfang von rund 250 Einträgen', () => {
    expect(lebensmittelKatalog.lebensmittel.length).toBeGreaterThanOrEqual(240)
  })
})

describe('Grenzen über die Mahlzeit hinaus', () => {
  it('reicht die Grenze der Regel bis in die Begründung durch', () => {
    const koffein = ersteVariante('kaffee').begruendungen[0]
    expect(koffein?.grenze).toContain('Tagesbudget')
  })

  it('zeigt sie auch bei entschärften Regeln', () => {
    // Thunfisch aus der Dose ist entschärft — die Wochengrenze gilt trotzdem.
    const thunfisch = ersteVariante('thunfisch').begruendungen[0]
    expect(thunfisch?.grenze).toContain('einmal pro Woche')
  })

  it('lässt sie weg, wo die Regel keine kennt', () => {
    expect(ersteVariante('lachs').begruendungen[0]?.grenze).toBeUndefined()
  })
})

describe('Aufgewärmtes trägt seine Bedingung im Urteil', () => {
  it('gibt nur die durchgehend heisse Variante frei', () => {
    for (const id of ['resten', 'fertiggericht', 'mikrowelle', 'hotdog']) {
      expect(urteile(id), id).toEqual(['ok', 'bedingt'])
    }
  })
})

describe('Zustände greifen wirklich', () => {
  it('wird jeder verwendete Zustand von einer Regel behandelt', () => {
    // Ein vertippter Zustand entschärft nichts. Das Urteil wird dadurch
    // strenger, also sicher — aber das Variantenlabel verspricht etwas, das
    // die Regeln nicht halten. Dieselbe Fehlerklasse wie beim Camembert.
    for (const eintrag of lebensmittelKatalog.lebensmittel) {
      for (const variante of eintrag.varianten) {
        for (const komponente of variante.komponenten) {
          if (komponente.zustand === undefined) continue
          const regeln = regelKatalog.regeln.filter((r) => r.trifft_auf.includes(komponente.tag))
          const behandelt = regeln.some(
            (r) =>
              r.entschaerfung.some((e) => e.durch === komponente.zustand) ||
              (r.nicht_entschaerfbar_durch ?? []).includes(komponente.zustand!),
          )
          expect(
            behandelt,
            `${eintrag.id}: «${komponente.zustand}» auf ${komponente.tag} greift nirgends`,
          ).toBe(true)
        }
      }
    }
  })

  it('führt der Regelkatalog jeden verwendeten Zustand auch in der Liste', () => {
    const benutzt = new Set<string>()
    for (const e of lebensmittelKatalog.lebensmittel)
      for (const v of e.varianten)
        for (const k of v.komponenten) if (k.zustand) benutzt.add(k.zustand)
    for (const zustand of benutzt) {
      expect(regelKatalog.zustaende, zustand).toContain(zustand)
    }
  })
})

describe('Grenze widerspricht der Freigabe nicht', () => {
  it('verschwindet, wo die Regel entschärft ist', () => {
    // «Unbegrenzt möglich» und «zählt aufs Tagesbudget» zugleich wäre Unsinn.
    const entkoffeiniert = urteilVon('kaffee').varianten[1]
    expect(entkoffeiniert?.status).toBe('ok')
    expect(entkoffeiniert?.begruendungen[0]?.grenze).toBeUndefined()
  })

  it('bleibt, wo die Regel noch greift', () => {
    expect(ersteVariante('kaffee').begruendungen[0]?.grenze).toContain('Tagesbudget')
  })
})
