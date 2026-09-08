import { afterEach, describe, expect, it, vi } from 'vitest'
import { holeProdukt } from './produktsuche'

function antworte(inhalt: unknown, ok = true) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    json: async () => inhalt,
  }) as unknown as typeof fetch
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('holeProdukt', () => {
  it('holt gezielt die erweiterten Produktmerkmale über API v3', async () => {
    antworte({
      status: 'success',
      product: {
        product_name: 'Vanilla Yogurt',
        product_name_de: 'Vanille Joghurt',
        generic_name_de: 'Joghurt mit Vanille',
        brands: 'Muster',
        categories: 'Milchprodukte, Joghurt',
        categories_tags: ['de:joghurts', { id: 'en:dairy-desserts', lc_name: 'Milchdesserts' }],
        ingredients_text_de: 'Joghurt, Zucker, Vanille',
        ingredients_tags: ['de:joghurt', { id: 'en:sugar', lc_name: 'Zucker' }],
        completeness: 0.82,
      },
    })

    expect(await holeProdukt('123')).toEqual({
      name: 'Vanille Joghurt',
      marke: 'Muster',
      generischerName: 'Joghurt mit Vanille',
      kategorien: ['Milchprodukte', 'Joghurt', 'joghurts', 'Milchdesserts'],
      zutatenText: 'Joghurt, Zucker, Vanille',
      zutaten: ['joghurt', 'Zucker'],
      vollstaendigkeit: 0.82,
    })

    const [url] = vi.mocked(globalThis.fetch).mock.calls[0] ?? []
    expect(String(url)).toContain('/api/v3/product/123?')
    expect(String(url)).toContain('cc=ch')
    expect(String(url)).toContain('lc=de')
    expect(String(url)).toContain('tags_lc=de')
    expect(String(url)).toContain('ingredients_tags')
    expect(String(url)).toContain('categories_tags')
  })

  it('bevorzugt deutsche Felder und fällt sonst auf die Standardsprache zurück', async () => {
    antworte({ product: { product_name: 'Cream Cheese', product_name_de: 'Frischkäse' } })
    expect((await holeProdukt('123'))?.name).toBe('Frischkäse')

    antworte({ product: { product_name: 'Cream Cheese', generic_name: 'Fresh cheese' } })
    const produkt = await holeProdukt('123')
    expect(produkt?.name).toBe('Cream Cheese')
    expect(produkt?.generischerName).toBe('Fresh cheese')
  })

  it('liefert leere Zusatzfelder, wenn Open Food Facts nur einen Namen kennt', async () => {
    antworte({ product: { product_name: 'Nutella', brands: 'Ferrero' } })
    expect(await holeProdukt('3017620422003')).toEqual({
      name: 'Nutella',
      marke: 'Ferrero',
      generischerName: null,
      kategorien: [],
      zutatenText: null,
      zutaten: [],
      vollstaendigkeit: null,
    })
  })

  it('liefert null, wenn das Produkt unbekannt oder die Antwort fehlerhaft ist', async () => {
    antworte({})
    expect(await holeProdukt('123')).toBeNull()

    antworte({ product: { product_name: 'X' } }, false)
    expect(await holeProdukt('123')).toBeNull()
  })

  it('liefert null, wenn das Netz nicht mitmacht', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch
    expect(await holeProdukt('123')).toBeNull()
  })

  it('verträgt jede unerwartete Antwortform', async () => {
    // Fremdinhalt aus einer offen gepflegten Datenbank — nichts ist zugesichert.
    for (const unfug of [
      null,
      'text',
      42,
      [],
      {},
      { product: null },
      { product: 'kaputt' },
      { product: { product_name: 42 } },
      { product: { product_name: '   ' } },
    ]) {
      antworte(unfug)
      expect(await holeProdukt('123'), JSON.stringify(unfug)).toBeNull()
    }
  })

  it('normalisiert Leerraum, begrenzt Fremdtext und klemmt Vollständigkeit auf 0–1', async () => {
    antworte({
      product: {
        product_name: '  Viel   Leerraum\n\tim  Namen  ',
        ingredients_text: '  Milch   und\n Zucker  ',
        completeness: 4,
      },
    })
    const produkt = await holeProdukt('123')
    expect(produkt?.name).toBe('Viel Leerraum im Namen')
    expect(produkt?.zutatenText).toBe('Milch und Zucker')
    expect(produkt?.vollstaendigkeit).toBe(1)

    antworte({ product: { product_name: 'x'.repeat(800) } })
    expect((await holeProdukt('123'))?.name.length).toBe(400)
  })

  it('bricht ab, wenn das Signal es verlangt', async () => {
    const steuerung = new AbortController()
    globalThis.fetch = vi.fn().mockImplementation(
      (_url, optionen: RequestInit) =>
        new Promise((_erfuellen, ablehnen) => {
          optionen.signal?.addEventListener('abort', () => ablehnen(new Error('abgebrochen')))
        }),
    ) as unknown as typeof fetch
    const laeuft = holeProdukt('123', steuerung.signal)
    steuerung.abort()
    expect(await laeuft).toBeNull()
  })
})
