export type Sternzeichen = {
  name: string
  symbol: string
}

/**
 * Westliches Sonnenzeichen zum errechneten Geburtstermin.
 * Der ET ist nur ein Schätzwert; das tatsächliche Sternzeichen hängt vom
 * tatsächlichen Geburtsdatum ab. Ungültige Datumsstrings ergeben null.
 */
export function sternzeichenFuerDatum(datum: string): Sternzeichen | null {
  const treffer = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datum)
  if (!treffer) return null

  const monat = Number(treffer[2])
  const tag = Number(treffer[3])
  const pruefdatum = new Date(Date.UTC(Number(treffer[1]), monat - 1, tag))
  if (
    pruefdatum.getUTCFullYear() !== Number(treffer[1]) ||
    pruefdatum.getUTCMonth() !== monat - 1 ||
    pruefdatum.getUTCDate() !== tag
  ) return null

  const md = monat * 100 + tag
  if (md >= 1222 || md <= 119) return { name: 'Steinbock', symbol: '♑' }
  if (md <= 218) return { name: 'Wassermann', symbol: '♒' }
  if (md <= 320) return { name: 'Fische', symbol: '♓' }
  if (md <= 419) return { name: 'Widder', symbol: '♈' }
  if (md <= 520) return { name: 'Stier', symbol: '♉' }
  if (md <= 620) return { name: 'Zwillinge', symbol: '♊' }
  if (md <= 722) return { name: 'Krebs', symbol: '♋' }
  if (md <= 822) return { name: 'Löwe', symbol: '♌' }
  if (md <= 922) return { name: 'Jungfrau', symbol: '♍' }
  if (md <= 1022) return { name: 'Waage', symbol: '♎' }
  if (md <= 1121) return { name: 'Skorpion', symbol: '♏' }
  return { name: 'Schütze', symbol: '♐' }
}
