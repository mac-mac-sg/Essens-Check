import { describe, expect, it } from 'vitest'
import { bewerteMedikament } from './bewerten'
import { findeMedikament, medikamentKatalog } from './daten'

function medikament(id: string) {
  const eintrag = findeMedikament(id)
  if (!eintrag) throw new Error(`Medikament «${id}» fehlt im kuratierten Katalog`)
  return eintrag
}

function urteil(id: string, ssw?: number, profilId?: string) {
  return bewerteMedikament(medikament(id), medikamentKatalog, ssw, profilId)
}

describe('Medikamentenkatalog', () => {
  it('enthält nach der ersten Ausbauwelle dreissig kuratierte Wirkstoffe', () => {
    expect(medikamentKatalog.status).toBe('pilot')
    expect(medikamentKatalog.medikamente).toHaveLength(30)
    expect(medikamentKatalog.version).toBe('0.2')
    expect(medikamentKatalog.stand).toBe('2026-09-09')
    expect(medikamentKatalog.sicherheitshinweis).toContain('nicht eigenständig')
  })

  it('trennt Produktdatenquellen von Schwangerschaftsbewertungen', () => {
    const produktdaten = medikamentKatalog.produktdaten_quellen.map((id) =>
      medikamentKatalog.quellen.find((quelle) => quelle.id === id),
    )
    expect(produktdaten.every((quelle) => quelle?.typ === 'swissmedic')).toBe(true)
    expect(produktdaten.every((quelle) => quelle?.rolle === 'produktdaten')).toBe(true)

    for (const eintrag of medikamentKatalog.medikamente) {
      const quellen = eintrag.quellen.map((id) =>
        medikamentKatalog.quellen.find((quelle) => quelle.id === id),
      )
      expect(quellen.every((quelle) => quelle?.rolle === 'schwangerschaftsbewertung')).toBe(true)
    }
  })

  it('bewertet zeitlich einheitliche Wirkstoffe auch ohne hinterlegte SSW', () => {
    expect(urteil('paracetamol').status).toBe('geeignet')
    expect(urteil('amoxicillin').status).toBe('geeignet')
    expect(urteil('cetirizin').status).toBe('geeignet')
    expect(urteil('loratadin').status).toBe('geeignet')
    expect(urteil('omeprazol').status).toBe('geeignet')
    expect(urteil('metoclopramid').status).toBe('mit_einschraenkung')
    expect(urteil('xylometazolin').status).toBe('mit_einschraenkung')
  })

  it('liefert für eine bereits erfolgte Anwendung einen eigenen Hinweis', () => {
    const ergebnis = urteil('paracetamol', 23)
    expect(ergebnis.bereits_eingenommen).toContain('keine besonderen Massnahmen')
  })
})

describe('Erweiterte schwangerschaftsrelevante Wirkstoffe', () => {
  it('deckt häufige Beschwerden mit kuratierten Einordnungen ab', () => {
    expect(urteil('doxylamin').status).toBe('geeignet')
    expect(urteil('meclozin').status).toBe('geeignet')
    expect(urteil('pantoprazol').status).toBe('geeignet')
    expect(urteil('macrogol').status).toBe('geeignet')
    expect(urteil('lactulose').status).toBe('geeignet')
    expect(urteil('bisacodyl').status).toBe('mit_einschraenkung')
    expect(urteil('sumatriptan').status).toBe('geeignet')
  })

  it('deckt Asthma, Infektionen und Schilddrüse ab', () => {
    expect(urteil('salbutamol').status).toBe('geeignet')
    expect(urteil('cefuroxim').status).toBe('geeignet')
    expect(urteil('penicillin-v').status).toBe('geeignet')
    expect(urteil('azithromycin').status).toBe('mit_einschraenkung')
    expect(urteil('nitrofurantoin').status).toBe('mit_einschraenkung')
    expect(urteil('clotrimazol').status).toBe('geeignet')
    expect(urteil('metronidazol').status).toBe('mit_einschraenkung')
    expect(urteil('aciclovir').status).toBe('geeignet')
    expect(urteil('levothyroxin').status).toBe('geeignet')
  })

  it('verlangt bei anwendungsabhängigen Wirkstoffen zuerst das Profil', () => {
    expect(urteil('budesonid', 20).klaerung).toBe('profil')
    expect(urteil('budesonid', 20, 'inhalativ-nasal').status).toBe('geeignet')
    expect(urteil('budesonid', 20, 'oral-rektal').status).toBe('geeignet')

    expect(urteil('fosfomycin', 20).klaerung).toBe('profil')
    expect(urteil('fosfomycin', 20, 'oral-einmalgabe').status).toBe('geeignet')
    expect(urteil('fosfomycin', 20, 'intravenoes').status).toBe('nur_nach_ruecksprache')
  })

  it('behandelt Ondansetron wegen des besonderen ersten Trimenons SSW-abhängig', () => {
    expect(urteil('ondansetron').klaerung).toBe('ssw')
    expect(urteil('ondansetron', 8).status).toBe('nur_nach_ruecksprache')
    expect(urteil('ondansetron', 20).status).toBe('nur_nach_ruecksprache')
    expect(urteil('ondansetron', 8).bereits_eingenommen).toContain('1. Trimenon')
  })
})

describe('SSW-abhängige NSAID-Regeln', () => {
  it('rät bei Ibuprofen ohne SSW nicht', () => {
    const ergebnis = urteil('ibuprofen')
    expect(ergebnis.status).toBeNull()
    expect(ergebnis.klaerung).toBe('ssw')
  })

  it('zieht die Ibuprofen-Grenze exakt bei SSW 28', () => {
    expect(urteil('ibuprofen', 19).status).toBe('geeignet')
    expect(urteil('ibuprofen', 20).status).toBe('geeignet')
    expect(urteil('ibuprofen', 27).status).toBe('geeignet')
    expect(urteil('ibuprofen', 28).status).toBe('nicht_empfohlen')
    expect(urteil('ibuprofen', 42).status).toBe('nicht_empfohlen')
    expect(urteil('ibuprofen', 20).hinweise.join(' ')).toContain('mehrtägiger Anwendung')
  })

  it('zieht dieselbe SSW-28-Grenze für systemisches Diclofenac', () => {
    expect(urteil('diclofenac', 27).status).toBe('geeignet')
    expect(urteil('diclofenac', 28).status).toBe('nicht_empfohlen')
  })
})

describe('ASS bleibt dosisabhängig', () => {
  it('verlangt zuerst das Anwendungsprofil statt eine Dosis zu erraten', () => {
    const ergebnis = urteil('acetylsalicylsaeure', 30)
    expect(ergebnis.status).toBeNull()
    expect(ergebnis.klaerung).toBe('profil')
  })

  it('trennt ärztlich verordnetes Low-dose von analgetischer Dosierung', () => {
    expect(urteil('acetylsalicylsaeure', 10, 'low-dose-verordnet').status).toBe('geeignet')
    expect(urteil('acetylsalicylsaeure', 35, 'low-dose-verordnet').status).toBe('geeignet')
    expect(urteil('acetylsalicylsaeure', 10, 'analgetisch').status).toBe('mit_einschraenkung')
    expect(urteil('acetylsalicylsaeure', 28, 'analgetisch').status).toBe('nicht_empfohlen')
  })

  it('nennt beim Low-dose-Profil die ärztliche Voraussetzung', () => {
    const ergebnis = urteil('acetylsalicylsaeure', 35, 'low-dose-verordnet')
    expect(ergebnis.hinweise.join(' ')).toContain('ärztlich')
  })
})

describe('Sicherheitsgrenzen der Medikamentenengine', () => {
  it('weist unbekannte Profile zurück statt auf ein anderes auszuweichen', () => {
    const ergebnis = urteil('acetylsalicylsaeure', 20, 'gibt-es-nicht')
    expect(ergebnis.status).toBeNull()
    expect(ergebnis.klaerung).toBe('profil')
  })

  it('weist ungültige Schwangerschaftswochen zurück', () => {
    expect(urteil('paracetamol', -1).klaerung).toBe('ssw')
    expect(urteil('paracetamol', 43).klaerung).toBe('ssw')
    expect(urteil('paracetamol', 2.5).klaerung).toBe('ssw')
  })

  it('führt verschreibungspflichtige Fälle nicht als Selbstmedikation', () => {
    expect(medikament('amoxicillin').verschreibungspflichtig).toBe(true)
    expect(medikament('metoclopramid').verschreibungspflichtig).toBe(true)
    expect(medikament('ondansetron').verschreibungspflichtig).toBe(true)
    expect(medikament('levothyroxin').verschreibungspflichtig).toBe(true)
    expect(medikament('amoxicillin').profile[0]?.voraussetzung).toContain('Verordnung')
    expect(medikament('metoclopramid').profile[0]?.voraussetzung).toContain('Verordnung')
  })
})
