/** Eigenes Datenmodell für Arzneimittel in der Schwangerschaft. */

export type MedikamentStatus =
  | 'geeignet'
  | 'mit_einschraenkung'
  | 'nur_nach_ruecksprache'
  | 'nicht_empfohlen'
  | 'nicht_bewertet'

export const MEDIKAMENT_STATUS_META: Record<
  MedikamentStatus,
  { label: string; kurz: string }
> = {
  geeignet: { label: 'Geeignet', kurz: 'Geeignet' },
  mit_einschraenkung: { label: 'Mit Einschränkung', kurz: 'Eingeschränkt' },
  nur_nach_ruecksprache: { label: 'Nur nach Rücksprache', kurz: 'Rücksprache' },
  nicht_empfohlen: { label: 'Nicht empfohlen', kurz: 'Nicht empfohlen' },
  nicht_bewertet: { label: 'Nicht ausreichend bewertet', kurz: 'Nicht bewertet' },
}

export type QuellenTyp = 'swissmedic' | 'teratologie' | 'leitlinie'

export interface MedikamentQuelle {
  id: string
  typ: QuellenTyp
  titel: string
  url: string
  abgerufen_am: string
  rolle: 'produktdaten' | 'schwangerschaftsbewertung'
}

/**
 * SSW wird als abgeschlossene Schwangerschaftswoche geführt: 28 bedeutet
 * 28+0. Die Grenzen sind inklusive. 0–42 deckt den für die App relevanten
 * Bereich ab, ohne eine individuelle Terminaussage zu treffen.
 */
export interface MedikamentSswFenster {
  von_ssw: number
  bis_ssw: number
  status: MedikamentStatus
  text: string
  bereits_eingenommen: string
  hinweise?: string[]
}

/**
 * Ein Wirkstoff kann je nach Dosis-/Anwendungskontext völlig anders zu
 * beurteilen sein. ASS Low-dose und ASS als Schmerzmittel dürfen deshalb
 * niemals in einem einzigen pauschalen Urteil zusammenfallen.
 */
export interface MedikamentProfil {
  id: string
  label: string
  beschreibung: string
  darreichungswege: string[]
  voraussetzung?: string
  ssw_fenster: MedikamentSswFenster[]
}

export interface Medikament {
  id: string
  wirkstoff: string
  synonyme: string[]
  gruppe: string
  verschreibungspflichtig: boolean | null
  allgemeiner_hinweis?: string
  profile: MedikamentProfil[]
  quellen: string[]
}

export interface MedikamentKatalog {
  version: string
  stand: string
  status: 'pilot' | 'freigegeben'
  hinweis: string
  sicherheitshinweis: string
  produktdaten_quellen: string[]
  quellen: MedikamentQuelle[]
  medikamente: Medikament[]
}

export type Klaerung = 'profil' | 'ssw' | null

export interface MedikamentUrteil {
  medikament: Medikament
  profil: MedikamentProfil | null
  status: MedikamentStatus | null
  klaerung: Klaerung
  text: string
  bereits_eingenommen: string | null
  hinweise: string[]
  quellen: MedikamentQuelle[]
}
