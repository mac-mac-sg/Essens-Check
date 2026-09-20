import { describe, expect, it } from 'vitest'
import { parseCheckStand } from './geburtscheckliste'

describe('lokaler Checklistenstand', () => {
  it('behandelt fehlende oder beschädigte Daten als offene Liste', () => {
    for (const raw of [null, '{', 'null', '[]', '42', '"erledigt"']) expect(parseCheckStand(raw)).toEqual({})
  })
  it('übernimmt nur bekannte Punkte und gültige Markierungen', () => {
    expect(parseCheckStand(JSON.stringify({ hebamme: 'erledigt', kurs: 'entfaellt', arbeit: 'offen', budget: true, fremd: 'erledigt' })))
      .toEqual({ hebamme: 'erledigt', kurs: 'entfaellt' })
  })
})
