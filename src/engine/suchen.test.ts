import { describe, expect, it } from 'vitest'
import {
  digraphform,
  findeNachId,
  MAX_TREFFER,
  MINDESTLAENGE,
  normalisiere,
  suche,
  vorschlaegeAusName,
  eindeutigerVorschlag,
} from './suchen'
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


describe('Mehrwortsuche', () => {
  it('findet über die einzelnen Wörter, wenn die ganze Eingabe nichts ergibt', () => {
    expect(ids('tatar vom lachs')).toContain('lachs')
    expect(ids('rohes ei im dessert')).toContain('ei')
  })

  it('erfindet dabei keine Treffer', () => {
    expect(ids('blauer himmel')).toEqual([])
    expect(ids('auto fahren')).toEqual([])
  })

  it('lässt die genaue Eingabe vorgehen', () => {
    // «Frische Kräuter» ist ein Synonym und muss zuerst stehen, nicht die
    // wortweise zusammengesuchte Liste.
    expect(ids('frische kräuter')[0]).toBe('kraeuter-frisch')
  })
})

describe('Wege, die vorher ins Leere liefen', () => {
  const ersterTreffer = (anfrage: string) => ids(anfrage)[0]

  it('findet gebeizten Fisch und Trockenfleisch unter ihren üblichen Namen', () => {
    expect(ersterTreffer('graved lachs')).toBe('lachs')
    expect(ersterTreffer('gravlax')).toBe('lachs')
    expect(ersterTreffer('mostbröckli')).toBe('salami')
    expect(ersterTreffer('poke bowl')).toBe('sushi')
  })

  it('findet Biermischgetränke, die Alkohol enthalten', () => {
    expect(ersterTreffer('radler')).toBe('wein-bier')
    expect(ersterTreffer('panaché')).toBe('wein-bier')
    expect(ersterTreffer('shandy')).toBe('wein-bier')
  })

  it('findet das weiche Ei und die gängigen Kaffeebestellungen', () => {
    expect(ersterTreffer('wachsweiches ei')).toBe('ei')
    expect(ersterTreffer('latte macchiato')).toBe('kaffee')
    expect(ersterTreffer('capuccino')).toBe('kaffee')
  })
})

describe('vorschlaegeAusName', () => {
  const erster = (name: string) =>
    vorschlaegeAusName(name, lebensmittelKatalog)[0]?.id

  it('findet den Eintrag in einem längeren Produktnamen', () => {
    expect(erster('Le Rustique Camembert')).toBe('camembert')
  })

  it('zählt nur Wortanfänge, nicht Zeichenfolgen mitten im Wort', () => {
    // «latte» steckt in «Himbeerblättertee», «cola» in «Mousse au chocolat»,
    // «rot» in «Brot». Solche Treffer sagen nichts über das Produkt.
    const namen = (produkt: string) =>
      vorschlaegeAusName(produkt, lebensmittelKatalog).map((e) => e.id)
    expect(namen('Caffè Latte Macchiato')).not.toContain('himbeerblaettertee')
    expect(namen('Coca-Cola Zero Sugar')).not.toContain('tiramisu')
    expect(namen('Rivella Rot')).not.toContain('brot')
  })

  it('lässt dadurch den richtigen Eintrag sich durchsetzen', () => {
    // Vorher blockierte ein Zufallstreffer auf «Vanille» das eindeutige Urteil.
    expect(erster('Cristallina Vanille Joghurt')).toBe('joghurt')
  })

  it('trennt auch am Bindestrich', () => {
    expect(erster('Coca-Cola Zero')).toBe('cola')
  })

  it('gewichtet lange Wörter höher als kurze Füllwörter', () => {
    // «Bio» trifft zufällig auf «Robiola» — «Haferdrink» muss gewinnen.
    expect(erster('Alnatura Bio Haferdrink')).toBe('pflanzendrink')
  })

  it('liefert nichts, wenn kein Wort passt', () => {
    expect(vorschlaegeAusName('Kinder Country', lebensmittelKatalog)).toEqual([])
    expect(vorschlaegeAusName('', lebensmittelKatalog)).toEqual([])
  })

  it('begrenzt die Anzahl der Vorschläge', () => {
    expect(vorschlaegeAusName('Käse Fisch Wurst Salat Brot Tee', lebensmittelKatalog).length)
      .toBeLessThanOrEqual(8)
    expect(vorschlaegeAusName('Käse', lebensmittelKatalog, 3).length).toBe(3)
  })

  it('führt jeden Eintrag höchstens einmal', () => {
    const ids = vorschlaegeAusName('Käse Käserinde Hartkäse', lebensmittelKatalog).map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})


describe('eindeutigerVorschlag', () => {
  const eindeutig = (name: string) => eindeutigerVorschlag(name, lebensmittelKatalog)?.id ?? null

  it('entscheidet bei einem einzigen Treffer', () => {
    expect(eindeutig('Le Rustique Camembert')).toBe('camembert')
    expect(eindeutig('Volg Bündnerfleisch')).toBe('salami')
  })

  it('entscheidet, wenn der erste deutlich schwerer wiegt', () => {
    expect(eindeutig('Coca-Cola Zero')).toBe('cola')
    expect(eindeutig('Alnatura Bio Haferdrink')).toBe('pflanzendrink')
  })

  it('entscheidet nicht bei Gleichstand', () => {
    // «Paprika» trifft Tomaten und Gewürze so stark wie «Chips» die Chips.
    // Ein automatisches Urteil wäre hier falsch.
    expect(eindeutig('Zweifel Paprika Chips')).toBeNull()
    expect(eindeutig('M-Classic Thunfisch in Wasser')).toBeNull()
  })

  it('entscheidet nicht ohne Treffer', () => {
    expect(eindeutig('Kinder Country')).toBeNull()
    expect(eindeutig('')).toBeNull()
  })
})
