import { describe, expect, it } from 'vitest'
import { ermittleSchema, istWunsch, LEISTENFARBE, umgelegt } from './farbschema'

describe('ermittleSchema', () => {
  it('folgt bei «system» dem Gerät', () => {
    expect(ermittleSchema('system', true)).toBe('dunkel')
    expect(ermittleSchema('system', false)).toBe('hell')
  })

  it('überstimmt das Gerät, wenn gewählt wurde', () => {
    expect(ermittleSchema('hell', true)).toBe('hell')
    expect(ermittleSchema('dunkel', false)).toBe('dunkel')
  })
})

describe('umgelegt', () => {
  it('kehrt das geltende Schema um und legt es fest', () => {
    expect(umgelegt('hell')).toBe('dunkel')
    expect(umgelegt('dunkel')).toBe('hell')
  })
})

describe('istWunsch', () => {
  it('nimmt nur die drei bekannten Werte an', () => {
    for (const gut of ['hell', 'dunkel', 'system']) expect(istWunsch(gut)).toBe(true)
    for (const schlecht of [null, '', 'light', 'Dunkel', 42, {}]) {
      expect(istWunsch(schlecht), String(schlecht)).toBe(false)
    }
  })
})

describe('Leistenfarbe', () => {
  it('nennt für jedes Schema eine Farbe', () => {
    expect(LEISTENFARBE.hell).toMatch(/^#[0-9A-F]{6}$/i)
    expect(LEISTENFARBE.dunkel).toMatch(/^#[0-9A-F]{6}$/i)
  })
})
