/**
 * Normalisierung und Matching.
 *
 * Es wird ausschliesslich über Teilzeichenketten von Name und Synonymen
 * gesucht — keine Wortähnlichkeit, keine Ableitung. Wer nicht im Katalog
 * steht, bekommt kein geratenes Urteil, sondern einen Nulltreffer.
 */
import type { Lebensmittel, LebensmittelKatalog } from '../typen'

/** Ab zwei Zeichen wird gesucht. */
export const MINDESTLAENGE = 2

const KOMBINIERENDE_ZEICHEN = /[\u0300-\u036f]/g

/** Kleinschreibung, Akzente weg, ß zu ss, Leerraum vereinheitlicht. */
export function normalisiere(text: string): string {
  return text
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(KOMBINIERENDE_ZEICHEN, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Zweite Schreibform mit ausgeschriebenen Umlauten, damit «kaese» genauso
 * trifft wie «käse» oder «kase».
 */
export function digraphform(text: string): string {
  return normalisiere(
    text
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue'),
  )
}

function suchbegriffe(eintrag: Lebensmittel): string[] {
  const roh = [eintrag.name, ...eintrag.synonyme]
  return [...new Set([...roh.map(normalisiere), ...roh.map(digraphform)])]
}

/** 0 wörtlich, 1 Wortanfang, 2 enthalten, null kein Treffer. */
function bewerteTreffer(begriffe: string[], anfrage: string): number | null {
  let bestes: number | null = null
  for (const begriff of begriffe) {
    const guete = begriff === anfrage ? 0 : begriff.startsWith(anfrage) ? 1 : begriff.includes(anfrage) ? 2 : null
    if (guete !== null && (bestes === null || guete < bestes)) bestes = guete
  }
  return bestes
}

/**
 * Treffer nach Güte sortiert. Unter der Mindestlänge und bei Nulltreffer
 * bleibt die Liste leer — die Oberfläche verweist dann auf die Hebamme.
 */
export function suche(anfrage: string, katalog: LebensmittelKatalog): Lebensmittel[] {
  const gesucht = normalisiere(anfrage)
  if (gesucht.length < MINDESTLAENGE) return []

  return katalog.lebensmittel
    .map((eintrag) => ({ eintrag, guete: bewerteTreffer(suchbegriffe(eintrag), gesucht) }))
    .filter((kandidat): kandidat is { eintrag: Lebensmittel; guete: number } => kandidat.guete !== null)
    .sort((a, b) => a.guete - b.guete || a.eintrag.name.localeCompare(b.eintrag.name, 'de-CH'))
    .map((kandidat) => kandidat.eintrag)
}

export function findeNachId(id: string, katalog: LebensmittelKatalog): Lebensmittel | undefined {
  return katalog.lebensmittel.find((eintrag) => eintrag.id === id)
}
