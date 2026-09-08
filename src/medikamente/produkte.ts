import produkteJson from '@daten/medikament-produkte.json'
import { medikamentKatalog } from './daten'
import type { SwissmedicProdukt, SwissmedicProduktSnapshot } from './swissmedic'

function normalisiere(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('de-CH')
    .replace(/[^a-z0-9]+/gu, ' ')
    .trim()
}

export function validiereProduktSnapshot(
  snapshot: SwissmedicProduktSnapshot,
): SwissmedicProduktSnapshot {
  const produktIds = snapshot.produkte.map((produkt) => produkt.id)
  const doppelteIds = produktIds.filter((id, index) => produktIds.indexOf(id) !== index)
  if (doppelteIds.length > 0) {
    throw new Error(`Doppelte Swissmedic-Produkt-IDs: ${[...new Set(doppelteIds)].join(', ')}`)
  }

  const lokalerMedikamente = new Set(medikamentKatalog.medikamente.map((medikament) => medikament.id))

  for (const produkt of snapshot.produkte) {
    if (produkt.wirkstoffe.length === 0) {
      throw new Error(`Swissmedic-Produkt ohne Wirkstoffe: ${produkt.id}`)
    }
    if (produkt.medikament_ids.length === 0) {
      throw new Error(`Swissmedic-Produkt ohne Pilot-Wirkstoffzuordnung: ${produkt.id}`)
    }
    for (const id of produkt.medikament_ids) {
      if (!lokalerMedikamente.has(id)) {
        throw new Error(`Swissmedic-Produkt ${produkt.id} verweist auf unbekanntes Medikament: ${id}`)
      }
    }

    const gemappteWirkstoffe = produkt.wirkstoffe.filter(
      (wirkstoff) => wirkstoff.medikament_id !== undefined,
    )
    const istVollstaendig = gemappteWirkstoffe.length === produkt.wirkstoffe.length
    if (produkt.vollstaendig_gemappt !== istVollstaendig) {
      throw new Error(`Inkonsistentes Mapping-Flag bei Swissmedic-Produkt ${produkt.id}`)
    }
    if (produkt.kombinationspraeparat !== (produkt.wirkstoffe.length > 1)) {
      throw new Error(`Inkonsistentes Kombinations-Flag bei Swissmedic-Produkt ${produkt.id}`)
    }
  }

  return snapshot
}

export const medikamentProduktSnapshot = validiereProduktSnapshot(
  produkteJson as SwissmedicProduktSnapshot,
)

function suchScore(produkt: SwissmedicProdukt, suche: string): number {
  const query = normalisiere(suche)
  if (!query) return 0
  const name = normalisiere(produkt.name)
  const sequenz = normalisiere(produkt.sequenzname ?? '')

  if (name === query || sequenz === query) return 100
  if (name.startsWith(`${query} `) || name.startsWith(query)) return 80
  if (sequenz.startsWith(`${query} `) || sequenz.startsWith(query)) return 70

  const nameWoerter = name.split(' ')
  const queryWoerter = query.split(' ')
  const alleWoerter = queryWoerter.every((wort) =>
    nameWoerter.some((nameWort) => nameWort.startsWith(wort)),
  )
  return alleWoerter ? 50 : 0
}

export function findeMedikamentProdukte(
  suche: string,
  snapshot: SwissmedicProduktSnapshot = medikamentProduktSnapshot,
  limit = 20,
): SwissmedicProdukt[] {
  if (!normalisiere(suche)) return []
  return snapshot.produkte
    .map((produkt) => ({ produkt, score: suchScore(produkt, suche) }))
    .filter((eintrag) => eintrag.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.produkt.name.localeCompare(b.produkt.name, 'de-CH') ||
        a.produkt.id.localeCompare(b.produkt.id),
    )
    .slice(0, Math.max(0, limit))
    .map((eintrag) => eintrag.produkt)
}

/**
 * Nur ein vollständig auf bereits fachlich bewertete Wirkstoffe gemapptes
 * Produkt darf später überhaupt für eine automatische Medikamentenbewertung
 * in Frage kommen. Kombinationspräparate mit einem unbekannten zweiten
 * Wirkstoff bleiben sichtbar, aber fachlich gesperrt.
 */
export function istAutomatischBewertbar(produkt: SwissmedicProdukt): boolean {
  return produkt.vollstaendig_gemappt && produkt.medikament_ids.length > 0
}
