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
  /**
   * Grenze, die über die einzelne Mahlzeit hinausgeht — Koffein pro Tag,
   * Thunfisch pro Woche. Sie steht auf der Karte, weil eine Auskunft pro
   * Lebensmittel sie sonst verschweigt.
   */
  grenze?: string
  /** Zustände, die diese Regel gerade NICHT entschärfen (Quecksilber überlebt das Kochen). */
  nicht_entschaerfbar_durch?: string[]
}

/**
 * Tag, das bewusst keine Regel auslöst. Ohne diese Liste wäre nicht
 * unterscheidbar, ob ein Tag unbedenklich oder schlicht unbewertet ist —
 * und «keine Regel getroffen» dürfte nie stillschweigend ein Ja werden.
 */
export interface UnbedenklicherTag {
  tag: string
  text: string
}

export interface RegelKatalog {
  version: string
  hinweis: string
  regeln: Regel[]
  zustaende: string[]
  /** Von unbedenklich nach bedenklich. Der Index ist der Schweregrad. */
  status_rangfolge: Status[]
  unbedenkliche_tags: UnbedenklicherTag[]
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
  /** Grobe Warengruppe, nur für die Übersicht «Was kann ich essen?». */
  gruppe: string
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
