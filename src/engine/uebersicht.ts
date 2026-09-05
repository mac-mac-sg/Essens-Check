/**
 * Die umgekehrte Frage: nicht «darf ich X essen?», sondern «was kann ich
 * hier nehmen?».
 *
 * Aufgenommen wird nur, was mindestens eine Variante mit klarem Ja hat.
 * `bedingt` bleibt bewusst draussen: eine Liste, die zum Zugreifen einlädt,
 * darf nichts enthalten, das noch eine Einschränkung mitbringt.
 */
import type { LebensmittelKatalog, RegelKatalog } from '../typen'
import { bewerteLebensmittel } from './bewerten'

export interface UebersichtEintrag {
  id: string
  name: string
  /** Zubereitung, unter der es unbedenklich ist. Null, wenn immer. */
  bedingung: string | null
}

export interface UebersichtGruppe {
  name: string
  eintraege: UebersichtEintrag[]
}

export function unbedenkliches(
  katalog: LebensmittelKatalog,
  regeln: RegelKatalog,
): UebersichtGruppe[] {
  const gruppen = new Map<string, UebersichtEintrag[]>()

  for (const eintrag of katalog.lebensmittel) {
    const urteil = bewerteLebensmittel(eintrag, regeln)
    const freigegeben = urteil.varianten.filter((variante) => variante.status === 'ok')
    if (freigegeben.length === 0) continue

    const label = freigegeben
      .map((variante) => variante.label)
      .filter((l): l is string => l !== null)

    // Gilt für jede Variante? Dann braucht es keine Bedingung.
    const immer = freigegeben.length === urteil.varianten.length

    if (!gruppen.has(eintrag.gruppe)) gruppen.set(eintrag.gruppe, [])
    gruppen.get(eintrag.gruppe)?.push({
      id: eintrag.id,
      name: eintrag.name,
      bedingung: immer || label.length === 0 ? null : label.join(' oder '),
    })
  }

  // Reihenfolge der Gruppen folgt dem Katalog, innerhalb der Gruppe alphabetisch.
  return [...gruppen.entries()].map(([name, eintraege]) => ({
    name,
    eintraege: [...eintraege].sort((a, b) => a.name.localeCompare(b.name, 'de-CH')),
  }))
}
