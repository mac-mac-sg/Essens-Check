import medikamenteJson from '@daten/medikamente.json'
import erweiterungJson from '@daten/medikamente-erweiterung.json'
import type { MedikamentKatalog, MedikamentQuelle, MedikamentStatus } from './typen'

const STATUS: MedikamentStatus[] = [
  'geeignet',
  'mit_einschraenkung',
  'nur_nach_ruecksprache',
  'nicht_empfohlen',
  'nicht_bewertet',
]

type MedikamentErweiterung = {
  stand: string
  quellen: MedikamentQuelle[]
  medikamente: MedikamentKatalog['medikamente']
}

function eindeutig(werte: string[], art: string) {
  const doppelt = werte.filter((wert, index) => werte.indexOf(wert) !== index)
  if (doppelt.length > 0) {
    throw new Error(`Doppelte ${art}: ${[...new Set(doppelt)].join(', ')}`)
  }
}

function validiere(katalog: MedikamentKatalog): MedikamentKatalog {
  eindeutig(katalog.quellen.map((quelle) => quelle.id), 'Medikamenten-Quellen-IDs')
  eindeutig(katalog.medikamente.map((medikament) => medikament.id), 'Medikamenten-IDs')

  const quellen = new Set(katalog.quellen.map((quelle) => quelle.id))
  for (const id of katalog.produktdaten_quellen) {
    if (!quellen.has(id)) throw new Error(`Unbekannte Produktdatenquelle: ${id}`)
  }

  for (const medikament of katalog.medikamente) {
    eindeutig(medikament.profile.map((profil) => profil.id), `Profil-IDs bei ${medikament.id}`)
    if (medikament.profile.length === 0) {
      throw new Error(`Medikament ohne Anwendungsprofil: ${medikament.id}`)
    }
    for (const id of medikament.quellen) {
      if (!quellen.has(id)) throw new Error(`Unbekannte Quelle ${id} bei ${medikament.id}`)
    }

    for (const profil of medikament.profile) {
      const fenster = [...profil.ssw_fenster].sort((a, b) => a.von_ssw - b.von_ssw)
      if (fenster.length === 0) throw new Error(`Profil ohne SSW-Fenster: ${medikament.id}/${profil.id}`)

      let erwartet = 0
      for (const eintrag of fenster) {
        if (!STATUS.includes(eintrag.status)) {
          throw new Error(`Unbekannter Medikamentenstatus bei ${medikament.id}/${profil.id}`)
        }
        if (eintrag.von_ssw !== erwartet || eintrag.bis_ssw < eintrag.von_ssw) {
          throw new Error(`Lücke oder Überlappung im SSW-Verlauf: ${medikament.id}/${profil.id}`)
        }
        erwartet = eintrag.bis_ssw + 1
      }
      if (erwartet !== 43) {
        throw new Error(`SSW-Verlauf deckt 0–42 nicht vollständig ab: ${medikament.id}/${profil.id}`)
      }
    }
  }

  return katalog
}

const basis = medikamenteJson as MedikamentKatalog
const erweiterung = erweiterungJson as MedikamentErweiterung

export const medikamentKatalog = validiere({
  ...basis,
  version: '0.2',
  stand: erweiterung.stand,
  hinweis: 'Kuratierter Schwangerschaftskatalog auf Wirkstoffebene. Schweizer Produktdaten dienen der Identifikation; die medizinische Einordnung stammt aus den hinterlegten Schwangerschaftsquellen.',
  quellen: [...basis.quellen, ...erweiterung.quellen],
  medikamente: [...basis.medikamente, ...erweiterung.medikamente],
})

export function findeMedikament(id: string) {
  return medikamentKatalog.medikamente.find((medikament) => medikament.id === id) ?? null
}
