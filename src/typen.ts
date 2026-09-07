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

/**
 * Etwas, das unabhängig vom einzelnen Lebensmittel gilt. Steht zentral, weil
 * es sonst an jedem betroffenen Eintrag wiederholt werden müsste — und die
 * Rindenfrage aus acht klaren Ja acht bedingte machen würde.
 */
export interface Grundsatz {
  titel: string
  text: string
}

export interface RegelKatalog {
  version: string
  hinweis: string
  grundsaetze: Grundsatz[]
  regeln: Regel[]
  zustaende: string[]
  /**
   * Vorrang bei mehreren Urteilen: Wer weiter hinten steht, gewinnt.
   *
   * Das ist keine reine Schweregrad-Skala. `unklar` schlägt `ok` und
   * `bedingt`, weil Unwissen nie zur Freigabe oder zur blossen Bedingung
   * werden darf. Aber `meiden` schlägt `unklar`: ein bekanntes Nein ist
   * ebenso schützend und deutlich brauchbarer als «wissen wir nicht».
   */
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
  /**
   * Überschreibt die generierte Begründung — für ALLE Varianten.
   *
   * Nur zulässig, wenn alle Varianten dasselbe Urteil tragen. Sonst steht ein
   * beruhigender Satz unter einem roten Urteil (Halloumi roh) oder eine
   * Warnung unter einem grünen (Kinderpunsch). Ein Test hält das offen.
   */
  eigener_text?: string | null
  /**
   * Ergänzt die generierte Begründung, statt sie zu ersetzen. Das ist der
   * richtige Ort für alles, was zum Eintrag gehört, aber die Regel nicht
   * ersetzt — Einordnung, Erkennungsmerkmal, Verweis auf einen zweiten
   * Eintrag mit gegenläufigem Urteil.
   */
  zusatz_text?: string | null
}

export interface LebensmittelKatalog {
  version: string
  hinweis: string
  lebensmittel: Lebensmittel[]
}
