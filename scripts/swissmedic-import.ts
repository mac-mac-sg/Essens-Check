import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import medikamenteJson from '../daten/medikamente.json'
import erweiterungJson from '../daten/medikamente-erweiterung.json'
import mappingJson from '../daten/medikament-wirkstoff-mapping.json'
import {
  baueSwissmedicSnapshot,
  type SwissmedicMappingKatalog,
  type SwissmedicXmlQuellen,
} from '../src/medikamente/swissmedic'
import type { MedikamentKatalog, MedikamentQuelle } from '../src/medikamente/typen'

const QUELLDATEIEN = {
  praeparate: ['Praeparate.XML', 'Praeparate.xml'],
  sequenzen: ['Sequenzen.XML', 'Sequenzen.xml'],
  deklarationen: ['Deklarationen.XML', 'Deklarationen.xml'],
  packungen: ['Packungen.XML', 'Packungen.xml'],
  stoffSynonyme: ['Stoff-Synonyme.XML', 'Stoff-Synonyme.xml', 'Stoff_Synonyme.XML'],
  userDefinedCodes: [
    'User-Defined-Codes.XML',
    'User-Defined-Codes.xml',
    'User_Defined_Codes.XML',
  ],
  exportDatum: ['Export-Datum.XML', 'Export-Datum.xml', 'Export_Datum.XML'],
} as const

type QuellenKey = keyof typeof QUELLDATEIEN

type MedikamentErweiterung = {
  stand: string
  quellen: MedikamentQuelle[]
  medikamente: MedikamentKatalog['medikamente']
}

async function dateiIndex(verzeichnis: string): Promise<Map<string, string>> {
  const result = new Map<string, string>()
  const queue = [verzeichnis]

  while (queue.length > 0) {
    const aktuell = queue.shift()
    if (!aktuell) continue
    for (const eintrag of await readdir(aktuell, { withFileTypes: true })) {
      const pfad = resolve(aktuell, eintrag.name)
      if (eintrag.isDirectory()) {
        queue.push(pfad)
      } else if (eintrag.isFile()) {
        result.set(eintrag.name.toLocaleLowerCase('de-CH'), pfad)
      }
    }
  }
  return result
}

function findeQuelldatei(index: Map<string, string>, kandidaten: readonly string[]): string | undefined {
  const normalisierteKandidaten = kandidaten.map((kandidat) =>
    kandidat.toLocaleLowerCase('de-CH'),
  )

  for (const kandidat of normalisierteKandidaten) {
    const exakt = index.get(kandidat)
    if (exakt) return exakt
  }

  for (const [dateiname, pfad] of index) {
    if (normalisierteKandidaten.some((kandidat) => dateiname.endsWith(kandidat))) {
      return pfad
    }
  }

  return undefined
}

async function leseQuellen(verzeichnis: string): Promise<SwissmedicXmlQuellen> {
  const index = await dateiIndex(verzeichnis)
  const result = {} as Record<QuellenKey, string>

  for (const [key, kandidaten] of Object.entries(QUELLDATEIEN) as [QuellenKey, readonly string[]][]) {
    const pfad = findeQuelldatei(index, kandidaten)
    if (!pfad) {
      throw new Error(
        `Swissmedic-Import: Datei für «${key}» fehlt. Gesucht: ${kandidaten.join(', ')}`,
      )
    }
    result[key] = await readFile(pfad, 'utf8')
  }

  return result
}

function fachkatalog(): MedikamentKatalog {
  const basis = medikamenteJson as MedikamentKatalog
  const erweiterung = erweiterungJson as MedikamentErweiterung
  return {
    ...basis,
    version: '0.2',
    stand: erweiterung.stand,
    quellen: [...basis.quellen, ...erweiterung.quellen],
    medikamente: [...basis.medikamente, ...erweiterung.medikamente],
  }
}

async function main() {
  const [, , quellArg, zielArg] = process.argv
  if (!quellArg) {
    throw new Error(
      'Aufruf: vite-node scripts/swissmedic-import.ts -- <entpacktes-ogd-verzeichnis> [ziel-json]',
    )
  }

  const quellVerzeichnis = resolve(quellArg)
  const ziel = resolve(zielArg ?? 'daten/medikament-produkte.json')
  const quellen = await leseQuellen(quellVerzeichnis)
  const snapshot = baueSwissmedicSnapshot(
    quellen,
    mappingJson as SwissmedicMappingKatalog,
    fachkatalog(),
  )

  await mkdir(dirname(ziel), { recursive: true })
  await writeFile(ziel, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')

  const { statistik } = snapshot
  console.log(`Swissmedic-Snapshot ${snapshot.stand}`)
  console.log(`Aktive HAM-Präparate: ${statistik.praeparate_ham_aktiv}`)
  console.log(`Aktive HAM-Sequenzen: ${statistik.sequenzen_ham_aktiv}`)
  console.log(`Produkte mit kuratiertem Wirkstoff: ${statistik.produkte_mit_pilotwirkstoff}`)
  console.log(`Vollständig gemappt: ${statistik.vollstaendig_gemappt}`)
  console.log(`Unvollständige Kombinationen: ${statistik.unvollstaendige_kombinationen}`)
  console.log(`Geschrieben: ${ziel}`)
}

await main()
