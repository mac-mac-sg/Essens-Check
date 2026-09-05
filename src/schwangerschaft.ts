/**
 * Schwangerschaftswoche aus dem errechneten Geburtstermin.
 * Notation wie in der Vorsorge üblich: abgeschlossene Wochen + Tage,
 * der Termin selbst ist 40+0.
 */

const TAG_IN_MS = 24 * 60 * 60 * 1000
const SCHWANGERSCHAFT_IN_TAGEN = 280

export interface Schwangerschaftsstand {
  /** Abgeschlossene Wochen, 0 bis 40+. */
  woche: number
  /** Tage über der angebrochenen Woche, 0 bis 6. */
  tag: number
  /** 1, 2 oder 3. */
  trimester: 1 | 2 | 3
  /** Anzeigeform, etwa «12+3». */
  anzeige: string
}

function alsTag(datum: Date): number {
  return Math.floor(
    Date.UTC(datum.getFullYear(), datum.getMonth(), datum.getDate()) / TAG_IN_MS,
  )
}

export function berechneStand(geburtstermin: string, heute: Date): Schwangerschaftsstand {
  const termin = new Date(`${geburtstermin}T00:00:00Z`)
  const verbleibend = Math.floor(termin.getTime() / TAG_IN_MS) - alsTag(heute)
  const tage = SCHWANGERSCHAFT_IN_TAGEN - verbleibend

  const woche = Math.max(0, Math.floor(tage / 7))
  const tag = Math.max(0, tage) % 7
  const trimester: 1 | 2 | 3 = woche < 14 ? 1 : woche < 28 ? 2 : 3

  return { woche, tag, trimester, anzeige: `${woche}+${tag}` }
}
