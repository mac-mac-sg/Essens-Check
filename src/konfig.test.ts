import { beforeEach, describe, expect, it } from 'vitest'
import { istPlausibel, leseOnlineAbfrage, setzeOnlineAbfrage } from './konfig'

function stelleSpeicher() {
  const inhalt = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => inhalt.get(k) ?? null,
      setItem: (k: string, v: string) => void inhalt.set(k, v),
      removeItem: (k: string) => void inhalt.delete(k),
    },
  })
  return inhalt
}

const HEUTE = new Date('2029-06-01T09:00:00Z')

describe('istPlausibel', () => {
  it('nimmt einen Termin in den nächsten Monaten an', () => {
    expect(istPlausibel('2029-06-02', HEUTE)).toBe(true)
    expect(istPlausibel('2030-01-01', HEUTE)).toBe(true)
  })

  it('nimmt einen eben überschrittenen Termin noch an', () => {
    expect(istPlausibel('2029-05-20', HEUTE)).toBe(true)
  })

  it('weist einen längst vergangenen Termin ab', () => {
    expect(istPlausibel('2028-01-01', HEUTE)).toBe(false)
  })

  it('weist einen viel zu fernen Termin ab', () => {
    // Ein Vertipper im Jahr darf keine falsche Woche erzeugen.
    expect(istPlausibel('2039-06-02', HEUTE)).toBe(false)
  })

  it('weist Unsinn ab', () => {
    expect(istPlausibel('', HEUTE)).toBe(false)
    expect(istPlausibel('kein datum', HEUTE)).toBe(false)
    expect(istPlausibel('2029-13-45', HEUTE)).toBe(false)
  })
})


describe('Online-Abfrage', () => {
  beforeEach(() => {
    stelleSpeicher()
  })

  it('ist standardmässig aus', () => {
    // Einen Strichcode wegzuschicken soll eine bewusste Entscheidung sein.
    expect(leseOnlineAbfrage()).toBe(false)
  })

  it('lässt sich ein- und ausschalten', () => {
    setzeOnlineAbfrage(true)
    expect(leseOnlineAbfrage()).toBe(true)
    setzeOnlineAbfrage(false)
    expect(leseOnlineAbfrage()).toBe(false)
  })

  it('gilt bei unbrauchbarem Speicherinhalt als aus', () => {
    const speicher = stelleSpeicher()
    speicher.set('essens-check.online-abfrage', 'vielleicht')
    expect(leseOnlineAbfrage()).toBe(false)
  })

  it('gilt als aus, wenn der Speicher nicht lesbar ist', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('gesperrt')
      },
    })
    expect(leseOnlineAbfrage()).toBe(false)
  })
})
