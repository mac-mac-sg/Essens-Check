/**
 * Nachschlagen eines Strichcodes bei Open Food Facts.
 *
 * Das Ergebnis ist ein Vorschlag, nie ein Urteil: der gefundene Produktname
 * füllt nur die Suche vor. Welcher Katalogeintrag gemeint ist, bestätigt sie
 * selbst — ein fremder Name darf keine Freigabe auslösen.
 *
 * Die Antwort ist Fremdinhalt aus einer offen gepflegten Datenbank und wird
 * entsprechend misstrauisch behandelt: alles Unerwartete gilt als «nicht
 * gefunden».
 */
const DIENST = 'https://world.openfoodfacts.org/api/v2/product'
const FELDER = 'product_name,product_name_de,brands'
const FRIST_MS = 6000
const MAX_LAENGE = 120

export interface Produkt {
  name: string
  marke: string | null
}

function alsText(wert: unknown): string | null {
  if (typeof wert !== 'string') return null
  const sauber = wert.replace(/\s+/g, ' ').trim().slice(0, MAX_LAENGE)
  return sauber.length > 0 ? sauber : null
}

/** Liefert null, sobald irgendetwas nicht stimmt — Netz, Format oder Inhalt. */
export async function holeProdukt(ean: string, signal?: AbortSignal): Promise<Produkt | null> {
  const abbruch = new AbortController()
  const frist = setTimeout(() => abbruch.abort(), FRIST_MS)
  signal?.addEventListener('abort', () => abbruch.abort())

  try {
    const antwort = await fetch(`${DIENST}/${encodeURIComponent(ean)}.json?fields=${FELDER}`, {
      signal: abbruch.signal,
      headers: { Accept: 'application/json' },
    })
    if (!antwort.ok) return null

    const daten: unknown = await antwort.json()
    if (typeof daten !== 'object' || daten === null) return null
    const hülle = daten as { status?: unknown; product?: unknown }
    if (hülle.status !== 1) return null
    if (typeof hülle.product !== 'object' || hülle.product === null) return null

    const produkt = hülle.product as Record<string, unknown>
    const name = alsText(produkt['product_name_de']) ?? alsText(produkt['product_name'])
    if (!name) return null

    return { name, marke: alsText(produkt['brands']) }
  } catch {
    // Kein Netz, Zeitüberschreitung, kaputte Antwort: die Auswahl von Hand
    // funktioniert weiterhin.
    return null
  } finally {
    clearTimeout(frist)
  }
}
