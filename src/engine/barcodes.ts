/**
 * Prüfziffer nach EAN-8 und EAN-13.
 *
 * Verhindert, dass ein Lesefehler der Kamera als gültiger Code weitergereicht
 * und nachgeschlagen wird.
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
