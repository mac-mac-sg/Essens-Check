import { describe, expect, it } from 'vitest'
import { berechneStand } from './schwangerschaft'

const TERMIN = '2030-01-01'

describe('berechneStand', () => {
  it('nennt den Termin selbst 40+0', () => {
    expect(berechneStand(TERMIN, new Date('2030-01-01T09:00:00')).anzeige).toBe('40+0')
  })

  it('zählt Tage innerhalb der Woche mit', () => {
    expect(berechneStand(TERMIN, new Date('2029-12-27T09:00:00')).anzeige).toBe('39+2')
  })

  it('ordnet das erste Trimester bis 13+6 zu', () => {
    const stand = berechneStand(TERMIN, new Date('2029-07-02T09:00:00'))
    expect(stand.woche).toBe(13)
    expect(stand.trimester).toBe(1)
  })

  it('beginnt das zweite Trimester mit 14+0', () => {
    expect(berechneStand(TERMIN, new Date('2029-07-03T09:00:00')).trimester).toBe(2)
  })

  it('beginnt das dritte Trimester mit 28+0', () => {
    const stand = berechneStand(TERMIN, new Date('2029-10-09T09:00:00'))
    expect(stand.woche).toBe(28)
    expect(stand.trimester).toBe(3)
  })
})
