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
  it('liefert Namen und Marke', async () => {
    antworte({ status: 1, product: { product_name: 'Nutella', brands: 'Ferrero' } })
    expect(await holeProdukt('3017620422003')).toEqual({ name: 'Nutella', marke: 'Ferrero' })
  })

  it('bevorzugt den deutschen Namen', async () => {
    antworte({ status: 1, product: { product_name: 'Cream Cheese', product_name_de: 'Frischkäse' } })
    expect((await holeProdukt('123'))?.name).toBe('Frischkäse')
  })

  it('liefert null, wenn das Produkt unbekannt ist', async () => {
    antworte({ status: 0 })
    expect(await holeProdukt('123')).toBeNull()
  })

  it('liefert null bei einer Fehlerantwort', async () => {
    antworte({ status: 1, product: { product_name: 'X' } }, false)
    expect(await holeProdukt('123')).toBeNull()
  })

  it('liefert null, wenn das Netz nicht mitmacht', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch
    expect(await holeProdukt('123')).toBeNull()
  })

  it('verträgt jede unerwartete Antwortform', async () => {
    // Fremdinhalt aus einer offen gepflegten Datenbank — nichts ist zugesichert.
    for (const unfug of [null, 'text', 42, [], {}, { status: 1 }, { status: 1, product: null },
                         { status: 1, product: 'kaputt' }, { status: 1, product: { product_name: 42 } },
                         { status: 1, product: { product_name: '   ' } }]) {
      antworte(unfug)
      expect(await holeProdukt('123'), JSON.stringify(unfug)).toBeNull()
    }
  })

  it('kürzt überlange Namen und normalisiert Leerraum', async () => {
    antworte({ status: 1, product: { product_name: '  Viel   Leerraum\n\tim  Namen  ' } })
    expect((await holeProdukt('123'))?.name).toBe('Viel Leerraum im Namen')

    antworte({ status: 1, product: { product_name: 'x'.repeat(500) } })
    expect((await holeProdukt('123'))?.name.length).toBe(120)
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
