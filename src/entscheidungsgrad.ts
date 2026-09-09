import type { Status } from './typen'
import type { MedikamentStatus } from './medikamente/typen'

export type Entscheidungsgrad = 'klar' | 'bedingt' | 'offen'

export interface EntscheidungsgradInfo {
  grad: Entscheidungsgrad
  label: string
  erklaerung: string
}

export function entscheidungsgradLebensmittel(
  status: Status,
  variantenUnterschiedlich = false,
): EntscheidungsgradInfo {
  if (variantenUnterschiedlich) {
    return {
      grad: 'bedingt',
      label: 'Abhängig von Zubereitung',
      erklaerung: 'Für dieses Lebensmittel gibt es je nach Variante unterschiedliche Urteile.',
    }
  }

  switch (status) {
    case 'ok':
      return {
        grad: 'klar',
        label: 'Klare Empfehlung',
        erklaerung: 'Für die gezeigte Variante ist eine klare Einordnung hinterlegt.',
      }
    case 'meiden':
      return {
        grad: 'klar',
        label: 'Klare Einschränkung',
        erklaerung: 'Für die gezeigte Variante ist eine klare Einschränkung hinterlegt.',
      }
    case 'bedingt':
      return {
        grad: 'bedingt',
        label: 'Mit Bedingungen',
        erklaerung: 'Die Einordnung gilt nur unter den genannten Bedingungen.',
      }
    case 'unklar':
      return {
        grad: 'offen',
        label: 'Keine belastbare Einordnung',
        erklaerung: 'Das Regelwerk enthält dafür bewusst keine ausreichende Freigabe oder Einschränkung.',
      }
  }
}

export function entscheidungsgradMedikament(status: MedikamentStatus): EntscheidungsgradInfo {
  switch (status) {
    case 'geeignet':
      return {
        grad: 'klar',
        label: 'Klare Einordnung',
        erklaerung: 'Für den ausgewählten Wirkstoff, die Anwendung und die aktuelle SSW ist eine klare Einordnung hinterlegt.',
      }
    case 'nicht_empfohlen':
      return {
        grad: 'klar',
        label: 'Klare Einschränkung',
        erklaerung: 'Für den ausgewählten Kontext ist eine klare Einschränkung hinterlegt.',
      }
    case 'mit_einschraenkung':
      return {
        grad: 'bedingt',
        label: 'Mit Bedingungen',
        erklaerung: 'Die Einordnung hängt von den genannten Bedingungen ab.',
      }
    case 'nur_nach_ruecksprache':
      return {
        grad: 'bedingt',
        label: 'Individuelle Rücksprache nötig',
        erklaerung: 'Eine pauschale Selbstentscheidung ist für diesen Kontext nicht vorgesehen.',
      }
    case 'nicht_bewertet':
      return {
        grad: 'offen',
        label: 'Keine belastbare Einordnung',
        erklaerung: 'Für diesen Kontext ist keine ausreichende lokale Bewertung hinterlegt.',
      }
  }
}
