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

/** Höchstzahl gleichzeitig angezeigter Treffer. Betrifft nur die Anzeige. */
export const MAX_TREFFER = 15

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

/**
 * 0 wörtlich, 1 Anfang des Begriffs, 2 Anfang eines Wortes darin,
 * 3 irgendwo enthalten, null kein Treffer.
 *
 * Die Wortanfang-Stufe ist bei kurzen Eingaben entscheidend: «ei» soll
 * «Eier» vor «eingelegtes Gemüse» stellen. Gefunden wird trotzdem beides —
 * ausgeblendet wird nichts, nur anders sortiert.
 */
function bewerteTreffer(begriffe: string[], anfrage: string): number | null {
  let bestes: number | null = null
  for (const begriff of begriffe) {
    let guete: number | null = null
    if (begriff === anfrage) guete = 0
    else if (begriff.startsWith(anfrage)) guete = 1
    else if (begriff.split(/[ -]/).some((wort) => wort.startsWith(anfrage))) guete = 2
    else if (begriff.includes(anfrage)) guete = 3
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

/**
 * Katalogvorschläge zu einem Produktnamen aus einer fremden Datenbank.
 *
 * «Le Rustique Camembert» ergibt als Ganzes keinen Treffer — die Suche
 * vergleicht Teilzeichenketten, und der Produktname ist länger als jeder
 * Katalogbegriff. Deshalb wortweise suchen und die Treffer zusammenführen.
 *
 * Es bleibt ein Vorschlag: welcher Eintrag gemeint ist, bestätigt sie selbst.
 */
export interface Vorschlag {
  eintrag: Lebensmittel
  /** Summe der Längen der Wörter, die auf diesen Eintrag passten. */
  gewicht: number
}

export function bewerteteVorschlaege(
  produktname: string,
  katalog: LebensmittelKatalog,
  hoechstens = 8,
): Vorschlag[] {
  // Auch am Bindestrich trennen, sonst findet «Coca-Cola» das Wort «Cola» nie.
  const woerter = [...new Set(normalisiere(produktname).split(/[ -]/))].filter(
    (wort) => wort.length >= 3,
  )

  const gewichtet = new Map<string, { eintrag: Lebensmittel; gewicht: number; platz: number }>()
  for (const wort of woerter) {
    suche(wort, katalog).forEach((eintrag, platz) => {
      const bisher = gewichtet.get(eintrag.id)
      // Längere Wörter wiegen schwerer: «Haferdrink» sagt mehr als «Bio».
      if (bisher) {
        bisher.gewicht += wort.length
        bisher.platz = Math.min(bisher.platz, platz)
      } else {
        gewichtet.set(eintrag.id, { eintrag, gewicht: wort.length, platz })
      }
    })
  }

  return [...gewichtet.values()]
    .sort((a, b) => b.gewicht - a.gewicht || a.platz - b.platz)
    .slice(0, hoechstens)
    .map(({ eintrag, gewicht }) => ({ eintrag, gewicht }))
}

export function vorschlaegeAusName(
  produktname: string,
  katalog: LebensmittelKatalog,
  hoechstens = 8,
): Lebensmittel[] {
  return bewerteteVorschlaege(produktname, katalog, hoechstens).map((v) => v.eintrag)
}

/**
 * Der eine Eintrag, für den ein Produktname eindeutig genug spricht — sonst null.
 *
 * Eindeutig heisst: entweder der einzige Treffer, oder mindestens doppelt so
 * schwer wie der nächste. Die Schwelle ist an echten Produktnamen geeicht.
 * «Zweifel Paprika Chips» etwa trifft Tomaten, Gewürze und Chips gleich stark —
 * dort wäre ein automatisches Urteil schlicht falsch, und es kommt keines.
 */
export function eindeutigerVorschlag(
  produktname: string,
  katalog: LebensmittelKatalog,
): Lebensmittel | null {
  const [erster, zweiter] = bewerteteVorschlaege(produktname, katalog, 2)
  if (!erster) return null
  if (!zweiter) return erster.eintrag
  return erster.gewicht >= zweiter.gewicht * 2 ? erster.eintrag : null
}
