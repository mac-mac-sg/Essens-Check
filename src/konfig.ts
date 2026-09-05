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

/** ISO-Datum oder null, wenn noch keiner eingetragen wurde. */
export function leseGeburtstermin(): string | null {
  try {
    const gespeichert = localStorage.getItem(SCHLUESSEL)
    if (gespeichert) return gespeichert
  } catch {
    // Privater Modus oder gesperrter Speicher — dann eben ohne.
  }
  return import.meta.env.VITE_GEBURTSTERMIN ?? null
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
