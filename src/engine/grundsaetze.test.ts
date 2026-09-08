import { describe, expect, it } from 'vitest'
import { lebensmittelKatalog, regelKatalog } from '../daten'
import { bewerteLebensmittel } from './bewerten'
import { findeNachId } from './suchen'

function textDerVariante(id: string, index = 0): string {
  const eintrag = findeNachId(id, lebensmittelKatalog)
  if (!eintrag) throw new Error(`Lebensmittel «${id}» fehlt im Katalog`)
  const variante = bewerteLebensmittel(eintrag, regelKatalog).varianten[index]
  if (!variante) throw new Error(`Variante ${index} von «${id}» fehlt`)
  return variante.begruendungen.map((begruendung) => begruendung.text).join(' ')
}

describe('Grundsätze direkt im Antworttext', () => {
  it('zeigt bei jeder Hartkäse-Variante in der Warengruppe Käse den Rindenhinweis', () => {
    let geprueft = 0

    for (const eintrag of lebensmittelKatalog.lebensmittel.filter(
      (kandidat) => kandidat.gruppe === 'Käse',
    )) {
      const urteil = bewerteLebensmittel(eintrag, regelKatalog)
      eintrag.varianten.forEach((variante, index) => {
        if (!variante.komponenten.some((komponente) => komponente.tag === 'hartkaese')) return
        geprueft += 1
        const text = urteil.varianten[index]?.begruendungen
          .map((begruendung) => begruendung.text.toLocaleLowerCase('de-CH'))
          .join(' ') ?? ''
        expect(text, `${eintrag.id}/${variante.label}`).toContain('rinde')
        expect(
          text.includes('wegschneid') || text.includes('entfern'),
          `${eintrag.id}/${variante.label}`,
        ).toBe(true)
      })
    }

    expect(geprueft).toBeGreaterThan(0)
  })

  it('definiert bei jeder ausdrücklich durcherhitzten Variante 70 °C während zwei Minuten', () => {
    let geprueft = 0

    for (const eintrag of lebensmittelKatalog.lebensmittel) {
      const urteil = bewerteLebensmittel(eintrag, regelKatalog)
      eintrag.varianten.forEach((variante, index) => {
        if (!variante.komponenten.some((komponente) => komponente.zustand === 'durcherhitzt')) return
        geprueft += 1
        const text = urteil.varianten[index]?.begruendungen
          .map((begruendung) => begruendung.text.toLocaleLowerCase('de-CH'))
          .join(' ') ?? ''
        expect(
          text.includes('70 °c') || text.includes('70°c'),
          `${eintrag.id}/${variante.label}`,
        ).toBe(true)
        expect(
          text.includes('zwei minuten') || text.includes('2 minuten'),
          `${eintrag.id}/${variante.label}`,
        ).toBe(true)
      })
    }

    expect(geprueft).toBeGreaterThan(0)
  })

  it('hängt den Rindenhinweis nicht an Gerichte mit bereits verarbeitetem Hartkäse', () => {
    const eintrag = findeNachId('aelplermagronen', lebensmittelKatalog)
    if (!eintrag) throw new Error('Älplermagronen fehlen im Katalog')
    const regeln = bewerteLebensmittel(eintrag, regelKatalog).varianten[0]?.begruendungen
      .map((begruendung) => begruendung.regel) ?? []
    expect(regeln).not.toContain('grundsatz-kaeserinde')
  })

  it('dupliziert einen bereits vorhandenen Rindenhinweis nicht', () => {
    const text = textDerVariante('hartkaese').toLocaleLowerCase('de-CH')
    expect((text.match(/rinde/g) ?? []).length).toBeGreaterThanOrEqual(1)
    const eintrag = findeNachId('hartkaese', lebensmittelKatalog)
    if (!eintrag) throw new Error('Hartkäse fehlt im Katalog')
    const regeln = bewerteLebensmittel(eintrag, regelKatalog).varianten[0]?.begruendungen
      .map((begruendung) => begruendung.regel) ?? []
    expect(regeln).not.toContain('grundsatz-kaeserinde')
  })

  it('dupliziert die 70-Grad-Definition nicht, wenn die Fachregel sie bereits nennt', () => {
    const feta = findeNachId('feta', lebensmittelKatalog)
    if (!feta) throw new Error('Feta fehlt im Katalog')
    const erhitzt = bewerteLebensmittel(feta, regelKatalog).varianten[2]
    expect(erhitzt?.status).toBe('ok')
    expect(erhitzt?.begruendungen.map((begruendung) => begruendung.regel)).not.toContain(
      'grundsatz-durcherhitzen',
    )
  })
})
