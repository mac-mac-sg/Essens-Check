import { describe, expect, it } from 'vitest'
import { lebensmittelKatalog, regelKatalog } from './daten'
import { bewerteVariante } from './engine/bewerten'

describe('Kataloge', () => {
  it('lädt beide Kataloge über den @daten-Alias', () => {
    expect(regelKatalog.regeln.length).toBeGreaterThan(0)
    expect(lebensmittelKatalog.lebensmittel.length).toBeGreaterThan(0)
  })

  it('vergibt eindeutige Regel-IDs', () => {
    const ids = regelKatalog.regeln.map((regel) => regel.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('vergibt eindeutige Lebensmittel-IDs', () => {
    const ids = lebensmittelKatalog.lebensmittel.map((eintrag) => eintrag.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gibt jedem Lebensmittel mindestens eine Variante mit Komponenten', () => {
    for (const eintrag of lebensmittelKatalog.lebensmittel) {
      expect(eintrag.varianten.length, eintrag.id).toBeGreaterThan(0)
      for (const variante of eintrag.varianten) {
        expect(variante.komponenten.length, eintrag.id).toBeGreaterThan(0)
      }
    }
  })

  it('führt kein Tag zugleich als Regel und als unbedenklich', () => {
    // Ein solches Tag wäre mehrdeutig. Die Maschine würde die Regel gewinnen
    // lassen, aber die Absicht bliebe unklar — deshalb hier ausgeschlossen.
    const regelTags = new Set(regelKatalog.regeln.flatMap((regel) => regel.trifft_auf))
    const doppelt = regelKatalog.unbedenkliche_tags
      .map((eintrag) => eintrag.tag)
      .filter((tag) => regelTags.has(tag))
    expect(doppelt).toEqual([])
  })

  it('bewertet jedes verwendete Tag entweder über eine Regel oder ausdrücklich als unbedenklich', () => {
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

  it('ersetzt die Begründung nie über unterschiedliche Urteile hinweg', () => {
    // eigener_text gilt für ALLE Varianten. Urteilen sie unterschiedlich,
    // steht derselbe Satz einmal unter Ja und einmal unter Nein — so entstand
    // «Halloumi … unbedenklich» unter dem roten Urteil für den rohen Würfel.
    // Solche Einträge gehören auf zusatz_text, der die Regel ergänzt.
    const verletzt = lebensmittelKatalog.lebensmittel
      .filter((eintrag) => eintrag.eigener_text)
      .filter((eintrag) => {
        const urteile = eintrag.varianten.map(
          (variante) => bewerteVariante(variante, regelKatalog).status,
        )
        return new Set(urteile).size > 1
      })
      .map((eintrag) => eintrag.id)
    expect(verletzt).toEqual([])
  })

  it('kennt nur Status aus der Rangfolge', () => {
    const erlaubt = new Set(regelKatalog.status_rangfolge)
    for (const regel of regelKatalog.regeln) {
      expect(erlaubt.has(regel.status), regel.id).toBe(true)
      for (const entschaerfung of regel.entschaerfung) {
        expect(erlaubt.has(entschaerfung.auf), regel.id).toBe(true)
      }
    }
  })
})
