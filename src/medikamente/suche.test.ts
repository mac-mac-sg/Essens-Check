import { describe, expect, it } from 'vitest'
import { medikamentProduktSnapshot } from './produkte'
import {
  bereiteProduktBewertungVor,
  darreichungswegeFuer,
  findeMedikamentProdukt,
  findeWirkstoffe,
  sucheMedikamentProdukte,
} from './suche'

describe('Medikamentensuche Phase 3', () => {
  it('findet Wirkstoffe über Namen und Synonyme, aber nicht mitten im Wort', () => {
    expect(findeWirkstoffe('Parac').map((eintrag) => eintrag.id)).toContain('paracetamol')
    expect(findeWirkstoffe('Aspirin').map((eintrag) => eintrag.id)).toContain(
      'acetylsalicylsaeure',
    )
    expect(findeWirkstoffe('racetam').map((eintrag) => eintrag.id)).not.toContain('paracetamol')
  })

  it('findet Ibuprofen direkt und über den häufigen Schreibfehler iboprufen', () => {
    for (const begriff of ['Ibuprofen', 'iboprufen']) {
      const treffer = findeWirkstoffe(begriff)
      expect(treffer[0]).toMatchObject({ id: 'ibuprofen', wirkstoff: 'Ibuprofen' })
    }
  })

  it('findet reale Schweizer Präparate über den Handelsnamen', () => {
    expect(sucheMedikamentProdukte('Dafalgan').some((produkt) => produkt.medikament_ids.includes('paracetamol'))).toBe(true)
    expect(sucheMedikamentProdukte('Algifor').some((produkt) => produkt.medikament_ids.includes('ibuprofen'))).toBe(true)
  })

  it('findet alle Mebucaïne-Varianten auch ohne Akzent und verhindert eine pauschale Freigabe', () => {
    const produkte = sucheMedikamentProdukte('Mebucaine')
    expect(produkte.filter((produkt) => produkt.produktquelle)).toHaveLength(8)
    expect(sucheMedikamentProdukte('Mebucaïne Dolo Spray').some((produkt) => produkt.name === 'Mebucaïne Dolo Spray')).toBe(true)
    for (const produkt of produkte.filter((eintrag) => eintrag.produktquelle)) {
      expect(findeMedikamentProdukt(produkt.id)).toEqual(produkt)
      expect(bereiteProduktBewertungVor(produkt)).toMatchObject({ art: 'gesperrt', grund: 'unvollstaendig' })
    }
    expect(produkte.find((produkt) => produkt.name === 'Mebucaïne Dolo Orange')?.wirkstoffe.map((stoff) => stoff.name)).toEqual(['Flurbiprofen'])
    expect(produkte.find((produkt) => produkt.name === 'Mebucaïne N')?.wirkstoffe.map((stoff) => stoff.name)).toEqual(['Lidocain', 'Cetylpyridin'])
  })

  it('ordnet nur eindeutige Arzneiformen einem Darreichungsweg zu', () => {
    expect(darreichungswegeFuer('Filmtablette')).toEqual(['oral'])
    expect(darreichungswegeFuer('Nasenspray')).toEqual(['nasal'])
    expect(darreichungswegeFuer('Suppositorium')).toEqual(['rektal'])
    expect(darreichungswegeFuer('Gel')).toEqual([])
  })

  it('bereitet ein vollständig gemapptes orales Dafalgan für Paracetamol vor', () => {
    const produkt = sucheMedikamentProdukte('Dafalgan').find(
      (eintrag) =>
        eintrag.vollstaendig_gemappt &&
        eintrag.medikament_ids.length === 1 &&
        eintrag.medikament_ids[0] === 'paracetamol' &&
        darreichungswegeFuer(eintrag.arzneiform).includes('oral'),
    )
    expect(produkt).toBeDefined()
    if (!produkt) return

    const vorbereitet = bereiteProduktBewertungVor(produkt)
    expect(vorbereitet.art).toBe('bereit')
    if (vorbereitet.art === 'bereit') {
      expect(vorbereitet.medikament.id).toBe('paracetamol')
      expect(vorbereitet.profile).toHaveLength(1)
    }
  })

  it('sperrt Kombinationen mit unbekanntem zusätzlichem Wirkstoff', () => {
    const produkt = medikamentProduktSnapshot.produkte.find(
      (eintrag) => eintrag.kombinationspraeparat && !eintrag.vollstaendig_gemappt,
    )
    expect(produkt).toBeDefined()
    if (!produkt) return

    const vorbereitet = bereiteProduktBewertungVor(produkt)
    expect(vorbereitet).toMatchObject({ art: 'gesperrt', grund: 'unvollstaendig' })
  })

  it('sperrt vollständig gemappte Kombinationspräparate als Gesamtprodukt', () => {
    const produkt = medikamentProduktSnapshot.produkte.find(
      (eintrag) =>
        eintrag.kombinationspraeparat &&
        eintrag.vollstaendig_gemappt &&
        eintrag.medikament_ids.length > 1,
    )
    if (!produkt) return

    const vorbereitet = bereiteProduktBewertungVor(produkt)
    expect(vorbereitet).toMatchObject({ art: 'gesperrt', grund: 'kombination' })
  })

  it('überträgt ein systemisches Profil nicht auf eine lokale, nicht zugeordnete Arzneiform', () => {
    const basis = sucheMedikamentProdukte('Diclofenac').find(
      (eintrag) => eintrag.medikament_ids.includes('diclofenac'),
    )
    if (!basis) return
    const lokal = { ...basis, arzneiform: 'Gel' }

    expect(bereiteProduktBewertungVor(lokal)).toMatchObject({
      art: 'gesperrt',
      grund: 'darreichungsform',
    })
  })
})
