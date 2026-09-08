/**
 * Was zuletzt nachgeschlagen wurde.
 *
 * Bleibt auf dem Gerät, wie der Geburtstermin: keine Übertragung, keine
 * Auswertung. Und weil eine Liste der nachgeschlagenen Lebensmittel auf einem
 * geteilten Gerät etwas über eine Schwangerschaft verrät, lässt sie sich
 * jederzeit leeren.
 */
export const VERLAUF_SCHLUESSEL = 'essens-check.verlauf'

/** Fünf Zeilen sind ein Verlauf; zwanzig wären ein zweiter Katalog. */
export const MERKE_HOECHSTENS = 5

/**
 * Setzt eine Kennung an den Anfang und wirft sie hinten heraus, falls sie
 * schon vorkam — sonst stünde dasselbe Lebensmittel fünfmal da, wenn es
 * fünfmal nachgeschlagen wurde.
 */
export function ergaenzt(bisher: readonly string[], id: string): string[] {
  return [id, ...bisher.filter((eintrag) => eintrag !== id)].slice(0, MERKE_HOECHSTENS)
}

export function leseVerlauf(): string[] {
  try {
    const gespeichert = localStorage.getItem(VERLAUF_SCHLUESSEL)
    if (!gespeichert) return []
    const gelesen: unknown = JSON.parse(gespeichert)
    // Fremder oder beschädigter Inhalt gilt als kein Verlauf, nicht als Fehler.
    if (!Array.isArray(gelesen)) return []
    return gelesen.filter((x): x is string => typeof x === 'string').slice(0, MERKE_HOECHSTENS)
  } catch {
    return []
  }
}

export function speichereVerlauf(verlauf: readonly string[]): void {
  try {
    if (verlauf.length === 0) localStorage.removeItem(VERLAUF_SCHLUESSEL)
    else localStorage.setItem(VERLAUF_SCHLUESSEL, JSON.stringify(verlauf))
  } catch {
    // Nicht speicherbar: der Verlauf gilt dann nur für diese Sitzung.
  }
}
