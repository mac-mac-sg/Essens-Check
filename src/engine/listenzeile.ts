/**
 * Was eine Zeile in einer Trefferliste über ihr Urteil verraten darf.
 *
 * Ein einzelner Punkt neben einem Namen ist verführerisch und gefährlich:
 * «Lachs» hat drei Varianten mit drei verschiedenen Urteilen, und jede einzelne
 * Farbe wäre dort gelogen. Die grüne wäre die gefährlichste. Deshalb gibt es
 * neben den vier Urteilen einen fünften Zustand — `gemischt` — der sagt, dass
 * die Zubereitung entscheidet, und die Frage gleich mitliefert.
 */
import type { Lebensmittel, RegelKatalog, Status } from '../typen'
import { bewerteLebensmittel } from './bewerten'

/** Das Urteil einer Zeile, oder der Hinweis, dass es keines gibt. */
export type Zeilenstatus = Status | 'gemischt'

export interface Listenzeile {
  id: string
  name: string
  status: Zeilenstatus
  /**
   * Zweite Zeile. Bei `gemischt` die Frage, die entscheidet — sonst leer:
   * das Urteil steht schon daneben und braucht keine Wiederholung.
   */
  hinweis: string
}

/** Fallback, wenn ein Eintrag mit mehreren Urteilen keine eigene Frage stellt. */
export const OHNE_FRAGE = 'Je nach Zubereitung'

export function listenzeile(eintrag: Lebensmittel, regeln: RegelKatalog): Listenzeile {
  const urteil = bewerteLebensmittel(eintrag, regeln)
  const urteile = new Set(urteil.varianten.map((variante) => variante.status))
  const [einziges] = [...urteile]

  if (urteile.size === 1 && einziges !== undefined) {
    return { id: eintrag.id, name: eintrag.name, status: einziges, hinweis: '' }
  }

  return {
    id: eintrag.id,
    name: eintrag.name,
    status: 'gemischt',
    hinweis: urteil.frage ?? OHNE_FRAGE,
  }
}
