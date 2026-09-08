import { describe, expect, it } from 'vitest'
import { lebensmittelKatalog, regelKatalog } from '../daten'
import type { Status } from '../typen'
import { bewerteKomponente, bewerteLebensmittel, bewerteVariante, UNKLAR_TEXT } from './bewerten'
import { findeNachId } from './suchen'

function urteilVon(id: string, trimester?: number) {
  const eintrag = findeNachId(id, lebensmittelKatalog)
  if (!eintrag) throw new Error(`Lebensmittel «${id}» fehlt im Katalog`)
  return bewerteLebensmittel(eintrag, regelKatalog, trimester)
}

function urteile(id: string, trimester?: number): Status[] {
  return urteilVon(id, trimester).varianten.map((variante) => variante.status)
}

function ersteVariante(id: string, trimester?: number) {
  const variante = urteilVon(id, trimester).varianten[0]
  if (!variante) throw new Error(`Lebensmittel «${id}» hat keine Variante`)
  return variante
}

describe('Sicherheitsprinzip der Regelmaschine', () => {
  it('macht ein unbekanntes Tag niemals zu einem Ja', () => {
    const urteil = bewerteKomponente({ tag: 'gibt-es-nicht' }, regelKatalog)
    expect(urteil.status).toBe('unklar')
    expect(urteil.begruendungen[0]?.text).toBe(UNKLAR_TEXT)
  })

  it('lässt unklar ein Ja und eine Bedingung überstimmen', () => {
    expect(
      bewerteVariante(
        { label: null, komponenten: [{ tag: 'getreide' }, { tag: 'nicht-bewertet' }] },
        regelKatalog,
      ).status,
    ).toBe('unklar')
    expect(
      bewerteVariante(
        { label: null, komponenten: [{ tag: 'gefluegel' }, { tag: 'nicht-bewertet' }] },
        regelKatalog,
      ).status,
    ).toBe('unklar')
  })

  it('lässt ein bekanntes Nein unklar überstimmen', () => {
    expect(
      bewerteVariante(
        { label: null, komponenten: [{ tag: 'fisch-roh' }, { tag: 'nicht-bewertet' }] },
        regelKatalog,
      ).status,
    ).toBe('meiden')
  })

  it('behält die Sicherheitsrangfolge fest', () => {
    expect(regelKatalog.status_rangfolge).toEqual(['ok', 'bedingt', 'unklar', 'meiden'])
  })

  it('nimmt bei mehreren Komponenten immer den strengsten Status', () => {
    expect(urteile('vitello-tonnato')).toEqual(['meiden', 'ok'])
  })

  it('wertet eine Variante ohne Komponenten als unklar', () => {
    const urteil = bewerteVariante({ label: null, komponenten: [] }, regelKatalog)
    expect(urteil.status).toBe('unklar')
  })
})

describe('Listerien, Toxoplasmose und Küchenhygiene', () => {
  it('hält an der strengen Schweizer Käselinie fest', () => {
    expect(urteile('camembert')).toEqual(['meiden', 'meiden', 'ok'])
    expect(urteile('feta')).toEqual(['meiden', 'meiden', 'ok'])
    expect(urteile('halbhartkaese')).toEqual(['meiden', 'ok'])
    expect(urteile('formaggini')).toEqual(['meiden', 'ok'])
    expect(urteile('hartkaese')).toEqual(['ok'])
  })

  it('trennt Mozzarella von ungeeignetem stückigem Frischkäse', () => {
    expect(urteile('mozzarella')).toEqual(['ok', 'meiden'])
  })

  it('gibt rohes Fleisch nicht mehr durch Tiefkühlen teilweise frei', () => {
    expect(urteile('salami')).toEqual(['meiden', 'ok', 'meiden'])
    const tiefgekuehlt = urteilVon('salami').varianten[2]
    expect(tiefgekuehlt?.begruendungen.map((b) => b.regel)).toContain(
      'toxoplasmose-rohes-fleisch',
    )
  })

  it('trennt durchgegartes von rosa Fleisch', () => {
    expect(urteile('steak')).toEqual(['ok', 'meiden'])
  })

  it('gibt Eier nur durchgegart oder pasteurisiert frei', () => {
    expect(urteile('ei')).toEqual(['ok', 'meiden'])
    expect(urteile('tiramisu')).toEqual(['meiden', 'ok'])
  })

  it('gibt Sprossen und rohe Meeresfrüchte nur gegart frei', () => {
    expect(urteile('sprossen')).toEqual(['ok', 'meiden'])
    expect(urteile('austern')).toEqual(['ok', 'meiden'])
    expect(urteile('tintenfisch')).toEqual(['ok', 'meiden'])
  })

  it('behält vorgeschnittene Rohkost auf meiden', () => {
    expect(urteile('fertigsalat')).toEqual(['meiden'])
    expect(urteile('melone')[1]).toBe('meiden')
  })
})

describe('Schweizer Getränkeempfehlungen 2026', () => {
  it('führt Energy Drinks als klares Nein', () => {
    expect(urteile('energydrink')).toEqual(['meiden'])
    expect(ersteVariante('energydrink').begruendungen[0]?.regel).toBe('energy-drink')
  })

  it('führt Tonic und Bitter Lemon als klares Nein', () => {
    expect(urteile('tonic')).toEqual(['meiden'])
    expect(ersteVariante('tonic').begruendungen[0]?.regel).toBe('chinin-getraenk')
  })

  it('trennt Ginger Ale von Tonic', () => {
    expect(urteile('ginger-ale')).toEqual(['ok'])
    expect(findeNachId('tonic', lebensmittelKatalog)?.synonyme).not.toContain('ginger ale')
  })

  it('lässt Kaffee massvoll und entkoffeiniert frei', () => {
    expect(urteile('kaffee')).toEqual(['bedingt', 'ok'])
    expect(ersteVariante('kaffee').begruendungen[0]?.grenze).toContain('Energy Drinks')
  })

  it('hält am vollständigen Alkoholverzicht fest', () => {
    expect(urteile('wein-bier')).toEqual(['meiden', 'ok'])
    expect(urteile('mocktail')).toEqual(['ok', 'meiden'])
  })
})

describe('Fisch nach aktueller Schweizer Artenliste', () => {
  it('meidet die ausdrücklich ausgeschlossenen grossen Raubfische', () => {
    expect(urteile('schwertfisch')).toEqual(['meiden'])
    expect(ersteVariante('schwertfisch').begruendungen[0]?.regel).toBe(
      'quecksilber-raubfisch',
    )
  })

  it('trennt Ostsee-Lachs von anderem gegartem Lachs', () => {
    expect(urteile('lachs')).toEqual(['ok', 'meiden', 'meiden', 'meiden'])
  })

  it('trennt Ostsee-Hering von anderem gegartem Hering', () => {
    expect(urteile('hering')).toEqual(['ok', 'meiden', 'meiden'])
  })

  it('begrenzt frischen Thunfisch, nicht Thunfisch aus der Dose', () => {
    expect(urteile('thunfisch')).toEqual(['bedingt', 'ok', 'meiden'])
    expect(urteilVon('thunfisch').varianten[0]?.begruendungen[0]?.grenze).toContain(
      '1 Portion',
    )
    expect(urteilVon('thunfisch').varianten[1]?.begruendungen[0]?.regel).toBe(
      'unbedenklich',
    )
  })

  it('begrenzt nur ausländischen Hecht und rät bei unbekannter Herkunft nicht', () => {
    expect(urteile('hecht')).toEqual(['ok', 'bedingt', 'unklar', 'meiden'])
  })

  it('gibt Rotbarsch und weissen Heilbutt gemäss Positivliste frei', () => {
    expect(urteile('rotbarsch')).toEqual(['ok', 'meiden'])
    expect(urteile('heilbutt')).toEqual(['ok', 'unklar', 'meiden'])
  })

  it('entfernt nicht-schweizerische Mengenlimits bei weiteren gegarten Arten', () => {
    expect(urteile('makrele')).toEqual(['ok', 'meiden'])
    expect(urteile('zander')).toEqual(['ok', 'meiden'])
    expect(urteile('seeteufel')).toEqual(['ok', 'meiden'])
  })

  it('macht eine alte pauschale Dioxin-Zuordnung nicht mehr zu einem Nein', () => {
    expect(urteile('aal')).toContain('unklar')
  })
})

describe('Wild, Leber und Innereien', () => {
  it('meidet Wild unabhängig von der Garstufe', () => {
    expect(urteile('wild')).toEqual(['meiden', 'meiden'])
    expect(ersteVariante('wild').begruendungen.map((b) => b.regel)).toContain('wildfleisch-blei')
  })

  it('meidet Leber im ersten Trimester und lockert nur bei bekanntem späterem Trimester', () => {
    expect(urteile('leber')).toEqual(['meiden'])
    expect(urteile('leber', 1)).toEqual(['meiden'])
    expect(urteile('leber', 2)).toEqual(['bedingt'])
    expect(urteile('leber', 3)).toEqual(['bedingt'])
  })

  it('behält Retinol-Präparate trimesterunabhängig auf meiden', () => {
    expect(urteile('vitamin-a-praeparat')).toEqual(['meiden'])
    expect(urteile('lebertran')).toEqual(['meiden'])
  })

  it('macht übrige Innereien ohne Schweizer Pauschalregel unklar', () => {
    expect(urteile('innereien')).toEqual(['unklar'])
  })
})

describe('Algen, Supplemente und Kräuter', () => {
  it('macht auch Nori nur bedingt statt pauschal frei', () => {
    expect(urteile('algen')).toEqual(['bedingt', 'bedingt'])
    expect(urteile('braunalgen')).toEqual(['bedingt', 'meiden'])
  })

  it('macht Spirulina wegen unzureichender Schweizer Datenlage unklar', () => {
    expect(urteile('spirulina')).toEqual(['unklar'])
  })

  it('erfindet für Lakritze keine sichere Häufigkeit', () => {
    expect(urteile('lakritz')).toEqual(['unklar'])
  })

  it('entfernt die unbelegte Trimesterfreigabe für Kräutertees', () => {
    expect(urteile('kraeutertee')).toEqual(['unklar'])
    expect(ersteVariante('kraeutertee', 3).trimesterHinweise).toHaveLength(0)
  })

  it('führt Fencheltee aufgrund der geteilten Zuständigkeit als unklar', () => {
    expect(urteile('fencheltee')).toEqual(['unklar'])
  })

  it('empfiehlt Fenchel nicht mehr als pauschal sichere Alternative', () => {
    const mitFenchel = lebensmittelKatalog.lebensmittel.filter((eintrag) =>
      eintrag.alternativen.some((alternative) =>
        alternative.toLocaleLowerCase('de-CH').includes('fenchel'),
      ),
    )
    expect(mitFenchel.map((eintrag) => eintrag.id)).toEqual([])
  })
})

describe('Daten- und Regelkonsistenz', () => {
  it('kennt jedes im Lebensmittelkatalog verwendete Tag', () => {
    const bekannt = new Set([
      ...regelKatalog.regeln.flatMap((regel) => regel.trifft_auf),
      ...regelKatalog.unbedenkliche_tags.map((eintrag) => eintrag.tag),
    ])
    const unbekannt = lebensmittelKatalog.lebensmittel
      .flatMap((eintrag) => eintrag.varianten)
      .flatMap((variante) => variante.komponenten)
      .map((komponente) => komponente.tag)
      .filter((tag) => !bekannt.has(tag))
    expect([...new Set(unbekannt)]).toEqual([])
  })

  it('verwendet die alte pauschale Fisch-Mengenklasse nach der Bereinigung nicht mehr', () => {
    const treffer = lebensmittelKatalog.lebensmittel.filter((eintrag) =>
      eintrag.varianten.some((variante) =>
        variante.komponenten.some((komponente) => komponente.tag === 'raubfisch-mittel'),
      ),
    )
    expect(treffer.map((eintrag) => eintrag.id)).toEqual([])
  })

  it('führt kein Tag zugleich als Regel und ausdrücklich unbedenklich', () => {
    const regelTags = new Set(regelKatalog.regeln.flatMap((regel) => regel.trifft_auf))
    const doppelt = regelKatalog.unbedenkliche_tags
      .map((eintrag) => eintrag.tag)
      .filter((tag) => regelTags.has(tag))
    expect(doppelt).toEqual([])
  })

  it('gibt jeder Variante mindestens eine Begründung', () => {
    for (const eintrag of lebensmittelKatalog.lebensmittel) {
      for (const variante of bewerteLebensmittel(eintrag, regelKatalog).varianten) {
        expect(variante.begruendungen.length, `${eintrag.id}/${variante.label}`).toBeGreaterThan(0)
      }
    }
  })

  it('erreicht weiterhin den Zielumfang des Katalogs', () => {
    expect(lebensmittelKatalog.lebensmittel.length).toBeGreaterThanOrEqual(240)
  })

  it('behält zentrale Referenzurteile stabil', () => {
    const referenz: Record<string, Status[]> = {
      camembert: ['meiden', 'meiden', 'ok'],
      feta: ['meiden', 'meiden', 'ok'],
      hartkaese: ['ok'],
      mozzarella: ['ok', 'meiden'],
      salami: ['meiden', 'ok', 'meiden'],
      steak: ['ok', 'meiden'],
      ei: ['ok', 'meiden'],
      tiramisu: ['meiden', 'ok'],
      energydrink: ['meiden'],
      tonic: ['meiden'],
      'ginger-ale': ['ok'],
      thunfisch: ['bedingt', 'ok', 'meiden'],
      lachs: ['ok', 'meiden', 'meiden', 'meiden'],
      wild: ['meiden', 'meiden'],
      algen: ['bedingt', 'bedingt'],
      spirulina: ['unklar'],
      innereien: ['unklar'],
      heilkraeuter: ['unklar'],
      johanniskraut: ['bedingt'],
      frozenyogurt: ['ok', 'unklar'],
      blattsalat: ['ok', 'bedingt'],
      sprossen: ['ok', 'meiden'],
      rohmilch: ['ok', 'meiden'],
      ananas: ['ok'],
      wasser: ['ok'],
    }

    const gemessen = Object.fromEntries(Object.keys(referenz).map((id) => [id, urteile(id)]))
    expect(gemessen).toEqual(referenz)
  })
})

describe('Trimesterstatus als generische Funktion', () => {
  it('benutzt bei unbekanntem Trimester immer den strengeren Basisstatus', () => {
    const katalog = {
      ...regelKatalog,
      regeln: [
        {
          id: 'test-trimester',
          titel: 'Test',
          trifft_auf: ['test-trimester'],
          status: 'meiden' as const,
          begruendung: 'Basis.',
          entschaerfung: [],
          trimester_gewichtung: null,
          trimester_status: { 2: 'bedingt' as const, 3: 'ok' as const },
        },
      ],
    }
    expect(bewerteKomponente({ tag: 'test-trimester' }, katalog).status).toBe('meiden')
    expect(bewerteKomponente({ tag: 'test-trimester' }, katalog, 2).status).toBe('bedingt')
    expect(bewerteKomponente({ tag: 'test-trimester' }, katalog, 3).status).toBe('ok')
  })

  it('lässt eine explizite Zubereitungsentschärfung weiterhin greifen', () => {
    const katalog = {
      ...regelKatalog,
      regeln: [
        {
          id: 'test-zustand',
          titel: 'Test',
          trifft_auf: ['test-zustand'],
          status: 'meiden' as const,
          begruendung: 'Basis.',
          entschaerfung: [{ durch: 'gekocht', auf: 'ok' as const, text: 'Gekocht.' }],
          trimester_gewichtung: null,
          trimester_status: { 2: 'bedingt' as const },
        },
      ],
    }
    expect(bewerteKomponente({ tag: 'test-zustand', zustand: 'gekocht' }, katalog, 2).status).toBe(
      'ok',
    )
  })
})
