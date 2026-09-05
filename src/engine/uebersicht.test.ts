import { describe, expect, it } from 'vitest'
import { unbedenkliches } from './uebersicht'
import { lebensmittelKatalog, regelKatalog } from '../daten'
import { bewerteLebensmittel } from './bewerten'
import { findeNachId } from './suchen'

const gruppen = unbedenkliches(lebensmittelKatalog, regelKatalog)
const alle = gruppen.flatMap((g) => g.eintraege)

describe('unbedenkliches', () => {
  it('nimmt nur auf, was mindestens eine Variante mit klarem Ja hat', () => {
    for (const eintrag of alle) {
      const lebensmittel = findeNachId(eintrag.id, lebensmittelKatalog)
      const urteil = bewerteLebensmittel(lebensmittel!, regelKatalog)
      expect(urteil.varianten.some((v) => v.status === 'ok'), eintrag.id).toBe(true)
    }
  })

  it('lässt weg, was nirgends ein klares Ja hat', () => {
    // Schwertfisch ist in jeder Variante meiden.
    expect(alle.map((e) => e.id)).not.toContain('schwertfisch')
    expect(alle.map((e) => e.id)).not.toContain('tatar')
    expect(alle.map((e) => e.id)).not.toContain('leber')
  })

  it('nennt die Zubereitung, wenn nur eine Variante freigegeben ist', () => {
    const camembert = alle.find((e) => e.id === 'camembert')
    expect(camembert?.bedingung).toBe('Überbacken')
  })

  it('lässt die Bedingung weg, wenn das Ja immer gilt', () => {
    expect(alle.find((e) => e.id === 'hartkaese')?.bedingung).toBeNull()
    expect(alle.find((e) => e.id === 'brot')?.bedingung).toBeNull()
  })

  it('führt jeden Eintrag genau einmal', () => {
    const ids = alle.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('sortiert innerhalb der Gruppe alphabetisch', () => {
    for (const gruppe of gruppen) {
      const namen = gruppe.eintraege.map((e) => e.name)
      expect(namen, gruppe.name).toEqual([...namen].sort((a, b) => a.localeCompare(b, 'de-CH')))
    }
  })

  it('ordnet jedem Katalogeintrag eine Gruppe zu', () => {
    for (const eintrag of lebensmittelKatalog.lebensmittel) {
      expect(eintrag.gruppe, eintrag.id).toBeTruthy()
    }
  })
})
