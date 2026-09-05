/**
 * Zuordnung von Strichcodes zu Katalogeinträgen.
 *
 * Bewusst ohne Produktdatenbank: eine Online-Abfrage würde verraten, was
 * eingekauft wird, und im Untergeschoss ohnehin nicht funktionieren. Die App
 * lernt die Codes stattdessen beim Gebrauch — einmal zuordnen, danach erkannt.
 * Alles bleibt im Browser des Geräts.
 */
const SCHLUESSEL = 'essens-check.barcodes'

export type Zuordnungen = Record<string, string>

export function leseZuordnungen(): Zuordnungen {
  try {
    const roh = localStorage.getItem(SCHLUESSEL)
    if (!roh) return {}
    const gelesen: unknown = JSON.parse(roh)
    if (typeof gelesen !== 'object' || gelesen === null) return {}
    // Nur saubere Paare übernehmen — der Speicher ist nicht vertrauenswürdig.
    return Object.fromEntries(
      Object.entries(gelesen as Record<string, unknown>).filter(
        ([code, id]) => istGueltigeEan(code) && typeof id === 'string' && id.length > 0,
      ) as [string, string][],
    )
  } catch {
    return {}
  }
}

function schreibe(zuordnungen: Zuordnungen): void {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(zuordnungen))
  } catch {
    // Nicht speicherbar: die Zuordnung gilt dann nur für diese Sitzung.
  }
}

export function merkeZuordnung(ean: string, id: string): Zuordnungen {
  const neu = { ...leseZuordnungen(), [ean]: id }
  schreibe(neu)
  return neu
}

export function vergissZuordnung(ean: string): Zuordnungen {
  const { [ean]: _entfernt, ...rest } = leseZuordnungen()
  schreibe(rest)
  return rest
}

/**
 * Prüfziffer nach EAN-8 und EAN-13. Verhindert, dass ein Lesefehler als
 * Zuordnung im Speicher landet und später falsch auflöst.
 */
export function istGueltigeEan(code: string): boolean {
  if (!/^\d{8}$/.test(code) && !/^\d{13}$/.test(code)) return false
  const ziffern = [...code].map(Number)
  const pruef = ziffern.pop() as number
  // EAN-13 beginnt mit Gewicht 1, EAN-8 mit Gewicht 3.
  const startgewicht = ziffern.length === 12 ? 1 : 3
  const summe = ziffern.reduce(
    (s, z, i) => s + z * (i % 2 === 0 ? startgewicht : 4 - startgewicht),
    0,
  )
  return (10 - (summe % 10)) % 10 === pruef
}
