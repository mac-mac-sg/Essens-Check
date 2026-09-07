import { describe, expect, it } from 'vitest'
import { listenzeile, OHNE_FRAGE } from './listenzeile'
import { bewerteLebensmittel } from './bewerten'
import { findeNachId } from './suchen'
import { lebensmittelKatalog, regelKatalog } from '../daten'

function zeile(id: string) {
  const eintrag = findeNachId(id, lebensmittelKatalog)
  if (!eintrag) throw new Error(`Lebensmittel «${id}» fehlt im Katalog`)
  return listenzeile(eintrag, regelKatalog)
}

describe('Listenzeile', () => {
  it('zeigt das Urteil, wo alle Varianten dasselbe sagen', () => {
    expect(zeile('tatar').status).toBe('meiden')
    expect(zeile('brot').status).toBe('ok')
    expect(zeile('johanniskraut').status).toBe('unklar')
  })

  it('lässt die zweite Zeile leer, wo das Urteil eindeutig ist', () => {
    expect(zeile('brot').hinweis).toBe('')
  })

  it('zeigt kein Urteil, wo die Varianten verschieden urteilen', () => {
    // Lachs: gegart ja, kalt geräuchert nein, roh nein. Jede einzelne Farbe
    // wäre hier gelogen — die grüne am gefährlichsten.
    expect(zeile('lachs').status).toBe('gemischt')
    // Auch dort, wo nur eine Variante ausschert: Camembert ist zweimal ein
    // Nein und überbacken ein Ja.
    expect(zeile('camembert').status).toBe('gemischt')
  })

  it('nennt stattdessen die Frage, die entscheidet', () => {
    expect(zeile('mozzarella').hinweis).toBe('Aus welcher Milch?')
  })

  it('fällt auf einen allgemeinen Hinweis zurück, wo der Eintrag nicht fragt', () => {
    const ohneFrage = lebensmittelKatalog.lebensmittel.find((eintrag) => {
      if (eintrag.frage !== undefined) return false
      const urteile = new Set(
        bewerteLebensmittel(eintrag, regelKatalog).varianten.map((v) => v.status),
      )
      return urteile.size > 1
    })
    if (ohneFrage) expect(listenzeile(ohneFrage, regelKatalog).hinweis).toBe(OHNE_FRAGE)
  })

  it('führt nie ein Ja, wo eine Variante ein Nein trägt', () => {
    // Die eine Eigenschaft, an der alles hängt: die Liste darf nie freigeben,
    // was in einer Zubereitung gemieden gehört.
    for (const eintrag of lebensmittelKatalog.lebensmittel) {
      const urteile = bewerteLebensmittel(eintrag, regelKatalog).varianten.map((v) => v.status)
      const { status } = listenzeile(eintrag, regelKatalog)
      if (status === 'ok') expect(urteile, eintrag.id).not.toContain('meiden')
      if (status === 'ok') expect(urteile, eintrag.id).not.toContain('bedingt')
    }
  })
})
