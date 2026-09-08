import { describe, expect, it } from 'vitest'
import { sternzeichenFuerDatum } from './sternzeichen'

describe('sternzeichenFuerDatum', () => {
  it.each([
    ['2027-01-10', 'Steinbock', '♑'],
    ['2027-02-10', 'Wassermann', '♒'],
    ['2027-03-10', 'Fische', '♓'],
    ['2027-04-10', 'Widder', '♈'],
    ['2027-05-10', 'Stier', '♉'],
    ['2027-06-10', 'Zwillinge', '♊'],
    ['2027-07-10', 'Krebs', '♋'],
    ['2027-08-10', 'Löwe', '♌'],
    ['2027-09-10', 'Jungfrau', '♍'],
    ['2027-10-10', 'Waage', '♎'],
    ['2027-11-10', 'Skorpion', '♏'],
    ['2027-12-10', 'Schütze', '♐'],
  ])('%s → %s', (datum, name, symbol) => {
    expect(sternzeichenFuerDatum(datum)).toEqual({ name, symbol })
  })

  it.each([
    ['2027-01-19', 'Steinbock'], ['2027-01-20', 'Wassermann'],
    ['2027-02-18', 'Wassermann'], ['2027-02-19', 'Fische'],
    ['2027-03-20', 'Fische'], ['2027-03-21', 'Widder'],
    ['2027-04-19', 'Widder'], ['2027-04-20', 'Stier'],
    ['2027-05-20', 'Stier'], ['2027-05-21', 'Zwillinge'],
    ['2027-06-20', 'Zwillinge'], ['2027-06-21', 'Krebs'],
    ['2027-07-22', 'Krebs'], ['2027-07-23', 'Löwe'],
    ['2027-08-22', 'Löwe'], ['2027-08-23', 'Jungfrau'],
    ['2027-09-22', 'Jungfrau'], ['2027-09-23', 'Waage'],
    ['2027-10-22', 'Waage'], ['2027-10-23', 'Skorpion'],
    ['2027-11-21', 'Skorpion'], ['2027-11-22', 'Schütze'],
    ['2027-12-21', 'Schütze'], ['2027-12-22', 'Steinbock'],
  ])('behandelt die Grenze %s korrekt', (datum, name) => {
    expect(sternzeichenFuerDatum(datum)?.name).toBe(name)
  })

  it('weist ungültige Daten zurück', () => {
    expect(sternzeichenFuerDatum('')).toBeNull()
    expect(sternzeichenFuerDatum('2027-02-30')).toBeNull()
    expect(sternzeichenFuerDatum('20.02.2027')).toBeNull()
  })
})
