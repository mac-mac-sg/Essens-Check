import { describe, expect, it } from 'vitest'
import { istGueltigeEan } from './barcodes'

describe('istGueltigeEan', () => {
  it('nimmt gültige EAN-13 an', () => {
    expect(istGueltigeEan('4006381333931')).toBe(true)
    expect(istGueltigeEan('9780201379624')).toBe(true)
  })

  it('nimmt gültige EAN-8 an', () => {
    expect(istGueltigeEan('96385074')).toBe(true)
    expect(istGueltigeEan('55123457')).toBe(true)
  })

  it('weist eine falsche Prüfziffer ab', () => {
    // Ein Lesefehler der Kamera darf gar nicht erst nachgeschlagen werden.
    expect(istGueltigeEan('4006381333932')).toBe(false)
    expect(istGueltigeEan('96385075')).toBe(false)
  })

  it('weist falsche Längen und Nicht-Ziffern ab', () => {
    expect(istGueltigeEan('400638133393')).toBe(false)
    expect(istGueltigeEan('40063813339311')).toBe(false)
    expect(istGueltigeEan('400638133393X')).toBe(false)
    expect(istGueltigeEan('')).toBe(false)
  })
})

