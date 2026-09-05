/** Datenmodell der beiden Kataloge. Fachliche Bezeichner bleiben deutsch. */

export type Status = 'ok' | 'bedingt' | 'meiden' | 'unklar'

/** Ein Zustand entschärft eine Regel und stuft ihren Status herab. */
export interface Entschaerfung {
  durch: string
  auf: Status
  text: string
}

/** Ein Risikoprinzip. Ändert sich fast nie. */
export interface Regel {
  id: string
  titel: string
  trifft_auf: string[]
  status: Status
  begruendung: string
  entschaerfung: Entschaerfung[]
  trimester_gewichtung: number | null
  trimester_text?: string
  /** Zustände, die diese Regel gerade NICHT entschärfen (Quecksilber überlebt das Kochen). */
  nicht_entschaerfbar_durch?: string[]
}

export interface RegelKatalog {
  version: string
  hinweis: string
  regeln: Regel[]
  zustaende: string[]
  status_rangfolge: Status[]
}

/** Verweis eines Lebensmittels auf die Regelebene. */
export interface Komponente {
  tag: string
  zustand?: string
}

export interface Variante {
  label: string | null
  komponenten: Komponente[]
}

export interface Lebensmittel {
  id: string
  name: string
  synonyme: string[]
  frage?: string
  varianten: Variante[]
  alternativen: string[]
  /** Überschreibt die generierte Begründung. Sparsam einsetzen. */
  eigener_text?: string | null
}

export interface LebensmittelKatalog {
  version: string
  hinweis: string
  lebensmittel: Lebensmittel[]
}
