import { describe, expect, it } from 'vitest'
import { bewerteMedikament } from './bewerten'
import { medikamentKatalog } from './daten'
import {
  bereiteProduktBewertungVor,
  findeWirkstoffe,
  sucheMedikamentProdukte,
} from './suche'

describe('Phase-3-Fluss vom Schweizer Präparat zum Schwangerschaftsurteil', () => {
  it('führt ein geeignetes Dafalgan-Präparat sicher zu Paracetamol', () => {
    const vorbereitet = sucheMedikamentProdukte('Dafalgan')
      .map(bereiteProduktBewertungVor)
      .find(
        (eintrag) =>
          eintrag.art === 'bereit' && eintrag.medikament.id === 'paracetamol',
      )

    expect(vorbereitet).toBeDefined()
    if (!vorbereitet || vorbereitet.art !== 'bereit') return

    expect(vorbereitet.profile).toHaveLength(1)
    const urteil = bewerteMedikament(
      vorbereitet.medikament,
      medikamentKatalog,
      30,
      vorbereitet.profile[0]?.id,
    )
    expect(urteil.status).toBe('geeignet')
    expect(urteil.klaerung).toBeNull()
  })

  it('wendet bei einem passenden Algifor-Präparat die SSW-28-Grenze an', () => {
    const vorbereitet = sucheMedikamentProdukte('Algifor')
      .map(bereiteProduktBewertungVor)
      .find(
        (eintrag) => eintrag.art === 'bereit' && eintrag.medikament.id === 'ibuprofen',
      )

    expect(vorbereitet).toBeDefined()
    if (!vorbereitet || vorbereitet.art !== 'bereit') return

    const profil = vorbereitet.profile[0]?.id
    expect(profil).toBeDefined()
    expect(
      bewerteMedikament(vorbereitet.medikament, medikamentKatalog, 27, profil).status,
    ).toBe('geeignet')
    expect(
      bewerteMedikament(vorbereitet.medikament, medikamentKatalog, 28, profil).status,
    ).toBe('nicht_empfohlen')
  })

  it('verlangt bei ASS weiterhin eine Auswahl des Anwendungsprofils', () => {
    const ass = findeWirkstoffe('Aspirin').find(
      (medikament) => medikament.id === 'acetylsalicylsaeure',
    )
    expect(ass).toBeDefined()
    if (!ass) return

    expect(ass.profile.map((profil) => profil.id)).toEqual(
      expect.arrayContaining(['low-dose-verordnet', 'analgetisch']),
    )
    expect(bewerteMedikament(ass, medikamentKatalog, 20).klaerung).toBe('profil')
  })
})
