/**
 * Nachschlagen eines Strichcodes bei Open Food Facts.
 *
 * Open Food Facts ist Fremdinhalt aus einer offen gepflegten Datenbank. Die
 * Daten dienen deshalb ausschliesslich dazu, ein Produkt besser unserem eigenen
 * Lebensmittelkatalog zuzuordnen. Sie erzeugen nie selbst ein Urteil und dürfen
 * eine Schweizer Regel nie lockern.
 */
const DIENST = 'https://world.openfoodfacts.org/api/v3/product'
const FELDER = [
  'product_name',
  'product_name_de',
  'generic_name',
  'generic_name_de',
  'brands',
  'categories',
  'categories_tags',
  'ingredients_text',
  'ingredients_text_de',
  'ingredients_tags',
  'completeness',
].join(',')
const FRIST_MS = 6000
const MAX_LAENGE = 400
const MAX_LISTE = 40

export interface Produkt {
  name: string
  marke: string | null
  /** Verkehrs-/Gattungsbezeichnung, sofern gepflegt. */
  generischerName: string | null
  /** Kategorien aus Textfeld und Taxonomie, bereinigt und dedupliziert. */
  kategorien: string[]
  /** Zutatenliste als Originaltext, wenn vorhanden. */
  zutatenText: string | null
  /** Strukturierte Zutaten-Tags aus Open Food Facts. */
  zutaten: string[]
  /** Allgemeine OFF-Vollständigkeit 0–1; nur Transparenz, kein Freigabekriterium. */
  vollstaendigkeit: number | null
}

function alsText(wert: unknown, max = MAX_LAENGE): string | null {
  if (typeof wert !== 'string') return null
  const sauber = wert.replace(/\s+/g, ' ').trim().slice(0, max)
  return sauber.length > 0 ? sauber : null
}

function taxonomieText(wert: string): string {
  return wert
    .replace(/^[a-z]{2}:/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * API v3 kann Taxonomieeinträge je nach Parametern als String oder als Objekt
 * mit lokalisierter Bezeichnung liefern. Beides wird defensiv gelesen.
 */
function alsTagListe(wert: unknown): string[] {
  if (!Array.isArray(wert)) return []
  const ergebnis: string[] = []
  for (const eintrag of wert.slice(0, MAX_LISTE)) {
    let text: string | null = null
    if (typeof eintrag === 'string') {
      text = alsText(eintrag, 120)
    } else if (typeof eintrag === 'object' && eintrag !== null) {
      const objekt = eintrag as Record<string, unknown>
      text = alsText(objekt['lc_name'], 120) ?? alsText(objekt['id'], 120)
    }
    if (!text) continue
    const sauber = taxonomieText(text)
    if (sauber) ergebnis.push(sauber)
  }
  return [...new Set(ergebnis)]
}

function alsKommaListe(wert: unknown): string[] {
  const text = alsText(wert)
  if (!text) return []
  return text
    .split(',')
    .map((teil) => teil.trim())
    .filter(Boolean)
    .slice(0, MAX_LISTE)
}

function alsAnteil(wert: unknown): number | null {
  if (typeof wert !== 'number' || !Number.isFinite(wert)) return null
  return Math.min(1, Math.max(0, wert))
}

/** Liefert null, sobald Netz, Format oder Mindestinhalt nicht stimmen. */
export async function holeProdukt(ean: string, signal?: AbortSignal): Promise<Produkt | null> {
  const abbruch = new AbortController()
  const frist = setTimeout(() => abbruch.abort(), FRIST_MS)
  signal?.addEventListener('abort', () => abbruch.abort(), { once: true })

  try {
    const parameter = new URLSearchParams({
      cc: 'ch',
      lc: 'de',
      tags_lc: 'de',
      fields: FELDER,
    })
    const antwort = await fetch(`${DIENST}/${encodeURIComponent(ean)}?${parameter.toString()}`, {
      signal: abbruch.signal,
      headers: { Accept: 'application/json' },
    })
    if (!antwort.ok) return null

    const daten: unknown = await antwort.json()
    if (typeof daten !== 'object' || daten === null) return null
    const hülle = daten as { product?: unknown }
    if (typeof hülle.product !== 'object' || hülle.product === null) return null

    const produkt = hülle.product as Record<string, unknown>
    const name = alsText(produkt['product_name_de']) ?? alsText(produkt['product_name'])
    if (!name) return null

    const kategorien = [
      ...alsKommaListe(produkt['categories']),
      ...alsTagListe(produkt['categories_tags']),
    ]

    return {
      name,
      marke: alsText(produkt['brands'], 160),
      generischerName:
        alsText(produkt['generic_name_de']) ?? alsText(produkt['generic_name']),
      kategorien: [...new Set(kategorien)],
      zutatenText:
        alsText(produkt['ingredients_text_de'], 1200) ?? alsText(produkt['ingredients_text'], 1200),
      zutaten: alsTagListe(produkt['ingredients_tags']),
      vollstaendigkeit: alsAnteil(produkt['completeness']),
    }
  } catch {
    // Kein Netz, Zeitüberschreitung, kaputte Antwort: die Auswahl von Hand
    // funktioniert weiterhin.
    return null
  } finally {
    clearTimeout(frist)
  }
}
