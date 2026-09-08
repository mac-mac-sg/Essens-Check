import { findeMedikament, medikamentKatalog } from './daten'
import type { Medikament, MedikamentKatalog, MedikamentProfil } from './typen'
import {
  findeMedikamentProdukte,
  medikamentProduktSnapshot,
} from './produkte'
import type { SwissmedicProdukt } from './swissmedic'

function normalisiere(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('de-CH')
    .replace(/[^a-z0-9]+/gu, ' ')
    .trim()
}

function suchScore(medikament: Medikament, suche: string): number {
  const query = normalisiere(suche)
  if (!query) return 0
  const begriffe = [medikament.wirkstoff, ...medikament.synonyme].map(normalisiere)

  if (begriffe.some((begriff) => begriff === query)) return 100
  if (begriffe.some((begriff) => begriff.startsWith(query))) return 80

  const queryWoerter = query.split(' ')
  const begriffWoerter = begriffe.flatMap((begriff) => begriff.split(' '))
  const alleWoerter = queryWoerter.every((wort) =>
    begriffWoerter.some((begriffWort) => begriffWort.startsWith(wort)),
  )
  return alleWoerter ? 50 : 0
}

export function findeWirkstoffe(
  suche: string,
  katalog: MedikamentKatalog = medikamentKatalog,
  limit = 10,
): Medikament[] {
  if (normalisiere(suche).length < 2) return []
  return katalog.medikamente
    .map((medikament) => ({ medikament, score: suchScore(medikament, suche) }))
    .filter((eintrag) => eintrag.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.medikament.wirkstoff.localeCompare(b.medikament.wirkstoff, 'de-CH'),
    )
    .slice(0, Math.max(0, limit))
    .map((eintrag) => eintrag.medikament)
}

export function sucheMedikamentProdukte(suche: string, limit = 20): SwissmedicProdukt[] {
  if (normalisiere(suche).length < 2) return []
  return findeMedikamentProdukte(suche, medikamentProduktSnapshot, limit)
}

export function findeMedikamentProdukt(id: string): SwissmedicProdukt | null {
  return medikamentProduktSnapshot.produkte.find((produkt) => produkt.id === id) ?? null
}

/**
 * Die Arzneiform wird nur auf einen Darreichungsweg abgebildet, wenn der
 * Swissmedic-Text dafür eindeutig genug ist. Unbekannte oder lokale Formen
 * bleiben absichtlich leer und dürfen kein systemisches Profil erben.
 */
export function darreichungswegeFuer(arzneiform: string): string[] {
  const form = normalisiere(arzneiform)
  if (!form) return []

  if (
    /\b(nasenspray|nasentropfen|nasal spray|spray zur anwendung in der nase)\b/u.test(form)
  ) {
    return ['nasal']
  }
  if (/\b(zapfchen|suppositor)/u.test(form)) return ['rektal']
  if (/\b(infusionslosung|infusion)/u.test(form)) return ['intravenös']
  if (/\b(injektionslosung|injektion)/u.test(form)) return ['intravenös', 'intramuskulär']
  if (
    /\b(filmtablette|tablette|brausetablette|kapsel|dragee|granulat|sirup|orale losung|losung zum einnehmen|suspension zum einnehmen|tropfen zum einnehmen)\b/u.test(
      form,
    )
  ) {
    return ['oral']
  }
  return []
}

export type ProduktBewertungsVorbereitung =
  | {
      art: 'bereit'
      medikament: Medikament
      profile: MedikamentProfil[]
      darreichungswege: string[]
    }
  | {
      art: 'gesperrt'
      grund: 'unvollstaendig' | 'kombination' | 'darreichungsform' | 'unbekanntes-medikament'
      medikamente: Medikament[]
      darreichungswege: string[]
    }

export function bereiteProduktBewertungVor(
  produkt: SwissmedicProdukt,
): ProduktBewertungsVorbereitung {
  const medikamente = produkt.medikament_ids
    .map((id) => findeMedikament(id))
    .filter((medikament): medikament is Medikament => medikament !== null)
  const darreichungswege = darreichungswegeFuer(produkt.arzneiform)

  if (!produkt.vollstaendig_gemappt) {
    return { art: 'gesperrt', grund: 'unvollstaendig', medikamente, darreichungswege }
  }
  if (produkt.medikament_ids.length !== 1) {
    return { art: 'gesperrt', grund: 'kombination', medikamente, darreichungswege }
  }

  const medikament = medikamente[0]
  if (!medikament) {
    return {
      art: 'gesperrt',
      grund: 'unbekanntes-medikament',
      medikamente: [],
      darreichungswege,
    }
  }
  if (darreichungswege.length === 0) {
    return { art: 'gesperrt', grund: 'darreichungsform', medikamente, darreichungswege }
  }

  const profile = medikament.profile.filter((profil) =>
    profil.darreichungswege.some((weg) => darreichungswege.includes(weg)),
  )
  if (profile.length === 0) {
    return { art: 'gesperrt', grund: 'darreichungsform', medikamente, darreichungswege }
  }

  return { art: 'bereit', medikament, profile, darreichungswege }
}
