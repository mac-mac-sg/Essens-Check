export type AlltagStatus =
  | 'moeglich'
  | 'mit_vorsicht'
  | 'ruecksprache'
  | 'meiden'
  | 'nicht_bewertet'

export type AlltagEntscheidungsgrad = 'klar' | 'bedingt' | 'offen'

export interface AlltagQuelle {
  titel: string
  url: string
}

export interface AlltagSswHinweis {
  von_ssw: number
  bis_ssw: number
  text: string
}

export interface AlltagEintrag {
  id: string
  titel: string
  synonyme: string[]
  gruppe: string
  status: AlltagStatus
  kurz: string
  warum: string[]
  beachten: string[]
  quellen: AlltagQuelle[]
  ssw_hinweise?: AlltagSswHinweis[]
}

export const ALLTAG_STATUS_META: Record<
  AlltagStatus,
  { label: string; entscheidungsgrad: AlltagEntscheidungsgrad; gradLabel: string }
> = {
  moeglich: {
    label: 'Grundsätzlich möglich',
    entscheidungsgrad: 'klar',
    gradLabel: 'Klare Einordnung',
  },
  mit_vorsicht: {
    label: 'Mit Vorsicht',
    entscheidungsgrad: 'bedingt',
    gradLabel: 'Abhängig von Bedingungen',
  },
  ruecksprache: {
    label: 'Vorher abklären',
    entscheidungsgrad: 'bedingt',
    gradLabel: 'Individuelle Rücksprache nötig',
  },
  meiden: {
    label: 'Besser nicht',
    entscheidungsgrad: 'klar',
    gradLabel: 'Klare Einschränkung',
  },
  nicht_bewertet: {
    label: 'Nicht bewertet',
    entscheidungsgrad: 'offen',
    gradLabel: 'Keine belastbare Einordnung',
  },
}

export const ALLTAG: AlltagEintrag[] = [
  {
    id: 'katze-katzenklo',
    titel: 'Katze & Katzenklo',
    synonyme: ['katze', 'katzenklo', 'katzentoilette', 'katzenkot', 'haustier'],
    gruppe: 'Zu Hause',
    status: 'mit_vorsicht',
    kurz: 'Eine Katze muss nicht weg — bei Katzenkot und Hygiene sind aber einfache Vorsichtsmassnahmen sinnvoll.',
    warum: [
      'Das BAG beschreibt Katzen als Endwirte von Toxoplasma gondii. Eine Erstinfektion in der Schwangerschaft soll vermieden werden.',
    ],
    beachten: [
      'Nach Kontakt mit Sand oder Erde die Hände gründlich waschen.',
      'Beim Reinigen der Katzentoilette Handschuhe tragen und danach die Hände waschen.',
      'Der Katze kein rohes Fleisch geben; das Katzenklo nicht in der Küche platzieren.',
    ],
    quellen: [
      {
        titel: 'BAG – Toxoplasmose',
        url: 'https://www.bag.admin.ch/de/toxoplasmose-de',
      },
    ],
  },
  {
    id: 'gartenarbeit-erde',
    titel: 'Gartenarbeit & Erde',
    synonyme: ['garten', 'gartenarbeit', 'erde', 'blumenerde', 'sand', 'pflanzen'],
    gruppe: 'Zu Hause',
    status: 'mit_vorsicht',
    kurz: 'Gartenarbeit ist nicht pauschal ausgeschlossen; entscheidend ist die Hygiene nach Kontakt mit Erde und Sand.',
    warum: [
      'Das BAG empfiehlt in der Schwangerschaft nach Kontakt mit Sand oder Erde eine besonders gute Handhygiene, um das Toxoplasmose-Risiko zu reduzieren.',
    ],
    beachten: [
      'Bei Arbeiten mit Erde Handschuhe verwenden.',
      'Danach die Hände gründlich waschen, auch wenn Handschuhe getragen wurden.',
      'Frisches Gemüse vor dem Essen sorgfältig waschen.',
    ],
    quellen: [
      {
        titel: 'BAG – Toxoplasmose',
        url: 'https://www.bag.admin.ch/de/toxoplasmose-de',
      },
    ],
  },
  {
    id: 'roentgen-ct',
    titel: 'Röntgen & CT',
    synonyme: ['röntgen', 'roentgen', 'ct', 'computertomographie', 'radiologie', 'bildgebung'],
    gruppe: 'Medizin',
    status: 'ruecksprache',
    kurz: 'Eine notwendige Untersuchung wird individuell abgewogen — Schwangerschaft immer vor der Untersuchung angeben.',
    warum: [
      'Das BAG empfiehlt bei radiologischen Untersuchungen in der Schwangerschaft eine individuelle Nutzen-Risiko-Abwägung. Wenn medizinisch möglich, werden Untersuchungen verschoben oder Verfahren ohne ionisierende Strahlung erwogen.',
    ],
    beachten: [
      'Bei Anmeldung und vor der Untersuchung ausdrücklich sagen, dass eine Schwangerschaft besteht oder möglich ist.',
      'Eine medizinisch notwendige Untersuchung nicht eigenständig absagen; die geeignete Methode wird mit Ärztin, Arzt oder Radiologie festgelegt.',
      'Besonders bei Untersuchungen im Bauch- oder Beckenbereich ist die individuelle Planung wichtig.',
    ],
    quellen: [
      {
        titel: 'BAG – Rechtfertigung radiologischer Untersuchungen',
        url: 'https://www.bag.admin.ch/de/rechtfertigung-radiologischer-untersuchungen',
      },
    ],
  },
  {
    id: 'flugreisen',
    titel: 'Flugreisen',
    synonyme: ['flug', 'fliegen', 'flugzeug', 'flugreise', 'ferienflug'],
    gruppe: 'Reisen',
    status: 'mit_vorsicht',
    kurz: 'Bei unkomplizierter Schwangerschaft sind Flugreisen grundsätzlich möglich; Schwangerschaftswoche, Airline-Regeln und Thromboserisiko zählen.',
    warum: [
      'HealthyTravel beschreibt Reisen bei unkomplizierter Schwangerschaft grundsätzlich als möglich und weist bei Flugreisen auf das erhöhte Thromboserisiko hin.',
    ],
    beachten: [
      'Regeln der Fluggesellschaft vor der Buchung prüfen.',
      'Auf längeren Flügen regelmässig bewegen, Wadenübungen machen und ausreichend trinken.',
      'Individuelle Risiken und lange Reisen vorab mit der betreuenden Fachperson besprechen.',
    ],
    ssw_hinweise: [
      {
        von_ssw: 28,
        bis_ssw: 42,
        text: 'Ab etwa SSW 28 verlangen viele Airlines eine ärztliche Flugfähigkeitsbescheinigung; die konkrete Regel immer direkt bei der Airline prüfen.',
      },
    ],
    quellen: [
      {
        titel: 'HealthyTravel – Reisen in Schwangerschaft und Stillzeit',
        url: 'https://www.healthytravel.ch/de/special-travellers',
      },
    ],
  },
  {
    id: 'hitze',
    titel: 'Hitze & heisse Tage',
    synonyme: ['hitze', 'heiss', 'hitzewelle', 'sommer', 'hohe temperatur'],
    gruppe: 'Alltag',
    status: 'mit_vorsicht',
    kurz: 'Schwangere können Hitze schlechter ausgleichen; Kühlung, Pausen und Trinken werden wichtiger.',
    warum: [
      'Das BAG zählt Schwangere zu den Personengruppen, deren Körper Hitze schlechter ausgleichen kann.',
    ],
    beachten: [
      'Starke Hitze und direkte Sonne möglichst reduzieren.',
      'Regelmässig trinken und körperliche Belastung an heissen Tagen anpassen.',
      'Bei deutlichem Unwohlsein, Schwindel oder Kreislaufproblemen in eine kühle Umgebung wechseln und bei Bedarf medizinische Hilfe suchen.',
    ],
    quellen: [
      {
        titel: 'BAG – Hitze',
        url: 'https://www.bag.admin.ch/de/hitze-in-leichter-sprache',
      },
    ],
  },
  {
    id: 'sauna-whirlpool',
    titel: 'Sauna & Whirlpool',
    synonyme: ['sauna', 'whirlpool', 'jacuzzi', 'dampfbad', 'thermalbad'],
    gruppe: 'Freizeit',
    status: 'nicht_bewertet',
    kurz: 'Dafür ist noch keine spezifische, belastbare Schweizer Einzelregel im Katalog hinterlegt.',
    warum: [
      'Die App leitet aus allgemeinen Hitzehinweisen bewusst keine pauschale Freigabe oder ein pauschales Verbot für Sauna und Whirlpool ab.',
    ],
    beachten: [
      'Bei Unsicherheit oder individuellen Risiken mit Ärztin oder Hebamme besprechen.',
      'Die allgemeinen BAG-Hinweise zu Hitze und ausreichender Flüssigkeitszufuhr bleiben relevant.',
    ],
    quellen: [
      {
        titel: 'BAG – Hitze',
        url: 'https://www.bag.admin.ch/de/hitze-in-leichter-sprache',
      },
    ],
  },
  {
    id: 'haarfaerben',
    titel: 'Haare färben',
    synonyme: ['haare färben', 'haarfaerben', 'haarfarbe', 'blondieren', 'blondierung'],
    gruppe: 'Kosmetik',
    status: 'nicht_bewertet',
    kurz: 'Für Haarfärben ist im aktuellen Regelwerk noch keine belastbare spezifische Schweizer Schwangerschaftsempfehlung hinterlegt.',
    warum: [
      'Ohne eine fachlich hinterlegte Einzelgrundlage erzeugt die App bewusst kein Ja oder Nein.',
    ],
    beachten: [
      'Produktinformationen und Warnhinweise beachten.',
      'Bei beruflicher oder wiederholter Exposition beziehungsweise Unsicherheit medizinisch oder arbeitsmedizinisch nachfragen.',
    ],
    quellen: [],
  },
  {
    id: 'tattoo-piercing',
    titel: 'Tattoo & Piercing',
    synonyme: ['tattoo', 'tätowieren', 'taetowieren', 'piercing', 'piercen'],
    gruppe: 'Kosmetik',
    status: 'nicht_bewertet',
    kurz: 'Für neue Tattoos oder Piercings ist im aktuellen Regelwerk noch keine belastbare spezifische Schweizer Schwangerschaftseinordnung hinterlegt.',
    warum: [
      'Die App trennt fehlende Evidenz von einer Freigabe und zeigt deshalb bewusst „Nicht bewertet“.',
    ],
    beachten: [
      'Bei einer geplanten Durchführung während der Schwangerschaft vorher medizinisch Rücksprache halten.',
    ],
    quellen: [],
  },
]

function normalisiere(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('de-CH')
    .replace(/[^a-z0-9]+/gu, ' ')
    .trim()
}

export function sucheAlltag(begriff: string): AlltagEintrag[] {
  const query = normalisiere(begriff)
  if (query.length < 2) return []

  return ALLTAG
    .map((eintrag) => {
      const begriffe = [eintrag.titel, ...eintrag.synonyme].map(normalisiere)
      let score = 0
      if (begriffe.some((wert) => wert === query)) score = 100
      else if (begriffe.some((wert) => wert.startsWith(query))) score = 80
      else if (begriffe.some((wert) => wert.includes(query))) score = 60
      return { eintrag, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.eintrag.titel.localeCompare(b.eintrag.titel, 'de-CH'))
    .map(({ eintrag }) => eintrag)
}

export function findeAlltag(id: string): AlltagEintrag | null {
  return ALLTAG.find((eintrag) => eintrag.id === id) ?? null
}
