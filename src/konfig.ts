/**
 * Errechneter Geburtstermin.
 *
 * Der Termin steht bewusst weder im Repo noch im Bundle: er wird einmal in der
 * App eingetragen und liegt danach ausschliesslich im Browser des Geräts. So
 * verrät weder der Quelltext noch die veröffentlichte Seite, wann das Kind
 * erwartet wird.
 *
 * VITE_GEBURTSTERMIN dient nur der lokalen Entwicklung und ist nicht gesetzt.
 */
const SCHLUESSEL = 'essens-check.geburtstermin'

/** Nur ein wirklich lesbares Datum. Alles andere gilt als nicht vorhanden. */
function alsDatum(wert: string | null | undefined): string | null {
  if (!wert) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(wert)) return null
  return Number.isNaN(new Date(`${wert}T00:00:00Z`).getTime()) ? null : wert
}

/**
 * ISO-Datum oder null, wenn noch keiner eingetragen wurde.
 *
 * Was im Speicher steht, wird geprüft. Ein beschädigter Wert ergab sonst eine
 * Wochenanzeige aus «NaN» — und die stand ungefragt im Kopf jeder Ansicht.
 * Ohne brauchbares Datum fragt die App lieber neu.
 */
export function leseGeburtstermin(): string | null {
  try {
    const gespeichert = alsDatum(localStorage.getItem(SCHLUESSEL))
    if (gespeichert) return gespeichert
  } catch {
    // Privater Modus oder gesperrter Speicher — dann eben ohne.
  }
  return alsDatum(import.meta.env.VITE_GEBURTSTERMIN)
}

export function speichereGeburtstermin(datum: string): void {
  try {
    localStorage.setItem(SCHLUESSEL, datum)
  } catch {
    // Nicht speicherbar: der Termin gilt dann nur für diese Sitzung.
  }
}

export function vergissGeburtstermin(): void {
  try {
    localStorage.removeItem(SCHLUESSEL)
  } catch {
    // nichts zu tun
  }
}

/** Grobe Plausibilität: ein Termin liegt nicht Jahrzehnte daneben. */
export function istPlausibel(datum: string, heute: Date): boolean {
  const termin = new Date(`${datum}T00:00:00Z`)
  if (Number.isNaN(termin.getTime())) return false
  const tage = (termin.getTime() - heute.getTime()) / 86400000
  return tage > -60 && tage < 300
}

