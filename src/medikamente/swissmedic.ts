import type { MedikamentKatalog } from './typen'

export interface SwissmedicMappingTreffer {
  modus: 'praefix' | 'enthaelt'
  wert: string
}

export interface SwissmedicWirkstoffMapping {
  medikament_id: string
  treffer: SwissmedicMappingTreffer[]
}

export interface SwissmedicMappingKatalog {
  version: string
  hinweis: string
  wirkstoffe: SwissmedicWirkstoffMapping[]
}

export interface SwissmedicWirkstoff {
  stoff_id: string
  name: string
  menge?: string
  einheit?: string
  medikament_id?: string
}

export interface SwissmedicPackung {
  code: string
  groesse?: string
  einheit?: string
  beschreibung?: string
  abgabekategorie?: string
}

export interface SwissmedicProdukt {
  id: string
  zulassungsnummer: string
  sequenznummer: string
  name: string
  sequenzname?: string
  arzneiform: string
  atc_code?: string
  zulassungsstatus: string
  abgabekategorie?: string
  wirkstoffe: SwissmedicWirkstoff[]
  medikament_ids: string[]
  kombinationspraeparat: boolean
  vollstaendig_gemappt: boolean
  packungen: SwissmedicPackung[]
}

export interface SwissmedicProduktSnapshot {
  version: string
  stand: string
  quelle: string
  mapping_version: string
  statistik: {
    praeparate_ham_aktiv: number
    sequenzen_ham_aktiv: number
    produkte_mit_pilotwirkstoff: number
    vollstaendig_gemappt: number
    unvollstaendige_kombinationen: number
  }
  produkte: SwissmedicProdukt[]
}

export interface SwissmedicXmlQuellen {
  praeparate: string
  sequenzen: string
  deklarationen: string
  packungen: string
  stoffSynonyme: string
  userDefinedCodes: string
  exportDatum: string
}

type XmlDatensatz = Record<string, string>

type XmlFrame = {
  name: string
  text: string
  felder: XmlDatensatz
}

const QUELLE = 'https://ogd.swissmedic.cloud/ogd-arzneimittel/Daten/OGD.zip'

function xmlName(name: string): string {
  return name.split(':').at(-1) ?? name
}

function dekodiereXml(text: string): string {
  const cdata = text.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/u, '$1')
  return cdata
    .replace(/&#x([0-9a-f]+);/giu, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/gu, (_, dezimal: string) => String.fromCodePoint(Number.parseInt(dezimal, 10)))
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .replace(/&quot;/gu, '"')
    .replace(/&apos;/gu, "'")
    .replace(/&amp;/gu, '&')
    .replace(/\s+/gu, ' ')
    .trim()
}

/**
 * Liest die flachen Swissmedic-OGD-Datensätze ohne zusätzliche XML-Abhängigkeit.
 * Die offiziellen XML-Dateien bestehen aus einem Root-Element, wiederholten
 * Datensatz-Elementen und direkten Feld-Elementen. Gefunden wird nicht über den
 * Namen des Datensatz-Elements, sondern über die erwarteten direkten Felder.
 */
export function leseXmlDatensaetze(xml: string, pflichtfelder: string[]): XmlDatensatz[] {
  const resultate: XmlDatensatz[] = []
  const stack: XmlFrame[] = []
  const tokenRe = /<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->|<[^>]+>|[^<]+/gu

  for (const treffer of xml.matchAll(tokenRe)) {
    const token = treffer[0]
    if (!token) continue

    if (token.startsWith('<?') || token.startsWith('<!--') || token.startsWith('<!DOCTYPE')) {
      continue
    }

    if (token.startsWith('<![CDATA[')) {
      const frame = stack.at(-1)
      if (frame) frame.text += token
      continue
    }

    if (token.startsWith('</')) {
      const frame = stack.pop()
      if (!frame) continue

      if (pflichtfelder.every((feld) => Object.hasOwn(frame.felder, feld))) {
        resultate.push({ ...frame.felder })
      }

      const parent = stack.at(-1)
      if (parent && Object.keys(frame.felder).length === 0) {
        parent.felder[xmlName(frame.name)] = dekodiereXml(frame.text)
      }
      continue
    }

    if (token.startsWith('<')) {
      const selbstSchliessend = /\/\s*>$/u.test(token)
      const namensTreffer = token.match(/^<\s*([^\s/>]+)/u)
      if (!namensTreffer?.[1]) continue
      const name = xmlName(namensTreffer[1])

      if (selbstSchliessend) {
        const parent = stack.at(-1)
        if (parent) parent.felder[name] = ''
      } else {
        stack.push({ name, text: '', felder: {} })
      }
      continue
    }

    const frame = stack.at(-1)
    if (frame) frame.text += token
  }

  return resultate
}

function normalisiere(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('de-CH')
    .replace(/[^a-z0-9]+/gu, ' ')
    .trim()
}

function schluessel(zulassung: string, sequenz: string): string {
  return `${zulassung}:${sequenz}`
}

function wert(datensatz: XmlDatensatz, feld: string): string {
  return datensatz[feld]?.trim() ?? ''
}

function bevorzugteUdcBeschreibung(
  udc: XmlDatensatz[],
  codeArt: string,
  code: string,
): string {
  if (!code) return ''
  const kandidaten = udc.filter((eintrag) => {
    const system = wert(eintrag, 'SYSTEM_CODE')
    const user = wert(eintrag, 'USER_DEFINED_CODE')
    return (system === codeArt || user === codeArt) && wert(eintrag, 'CODE_VALUE') === code
  })
  const deutsch = kandidaten.find((eintrag) => ['D', 'DE'].includes(wert(eintrag, 'SPRACH_CODE').toUpperCase()))
  const eintrag = deutsch ?? kandidaten[0]
  if (!eintrag) return code
  return [
    wert(eintrag, 'BESCHREIBUNG_1'),
    wert(eintrag, 'BESCHREIBUNG_2'),
    wert(eintrag, 'BESCHREIBUNG_LANG'),
  ]
    .filter(Boolean)
    .join(' · ')
}

function aktiveWirkstoffKategorien(udc: XmlDatensatz[]): Set<string> {
  const codes = udc
    .filter((eintrag) => wert(eintrag, 'USER_DEFINED_CODE') === 'SUBSTANCE_CATEGORY')
    .filter((eintrag) => {
      const beschreibung = normalisiere(
        [
          wert(eintrag, 'BESCHREIBUNG_1'),
          wert(eintrag, 'BESCHREIBUNG_2'),
          wert(eintrag, 'BESCHREIBUNG_LANG'),
        ].join(' '),
      )
      return beschreibung.includes('wirkstoff') || beschreibung.includes('active substance')
    })
    .map((eintrag) => wert(eintrag, 'CODE_VALUE'))
    .filter(Boolean)

  if (codes.length === 0) {
    throw new Error('Swissmedic-Import: Kein UDC-Code für die Stoffkategorie «Wirkstoff» gefunden.')
  }
  return new Set(codes)
}

function istAktiverZulassungsstatus(status: string): boolean {
  const n = normalisiere(status)
  if (!n) return false
  if (
    n.includes('nicht mehr') ||
    n.includes('abgelaufen') ||
    n.includes('widerruf') ||
    n.includes('sistiert') ||
    n.includes('suspended') ||
    n.includes('revoked') ||
    n.includes('no longer')
  ) {
    return false
  }
  return (
    n.includes('zugelassen') ||
    n.includes('befristet') ||
    n.includes('authorised') ||
    n.includes('authorized')
  )
}

function findeMedikamentId(
  stoffname: string,
  mapping: SwissmedicMappingKatalog,
): string | undefined {
  const name = normalisiere(stoffname)
  const treffer = mapping.wirkstoffe.filter((eintrag) =>
    eintrag.treffer.some((regel) => {
      const suchwert = normalisiere(regel.wert)
      return regel.modus === 'praefix' ? name.startsWith(suchwert) : name.includes(suchwert)
    }),
  )
  if (treffer.length > 1) {
    throw new Error(
      `Swissmedic-Import: Stoff «${stoffname}» trifft mehrere Pilot-Wirkstoffe: ${treffer.map((e) => e.medikament_id).join(', ')}`,
    )
  }
  return treffer[0]?.medikament_id
}

function validiereMapping(
  mapping: SwissmedicMappingKatalog,
  medikamente: MedikamentKatalog,
): void {
  const ids = new Set(medikamente.medikamente.map((medikament) => medikament.id))
  const unbekannt = mapping.wirkstoffe
    .map((eintrag) => eintrag.medikament_id)
    .filter((id) => !ids.has(id))
  if (unbekannt.length > 0) {
    throw new Error(`Swissmedic-Mapping verweist auf unbekannte Medikamenten-ID: ${unbekannt.join(', ')}`)
  }
}

function normalisiereDatum(raw: string): string {
  const value = raw.trim()
  const kompakt = value.match(/^(\d{4})(\d{2})(\d{2})$/u)
  if (kompakt) return `${kompakt[1]}-${kompakt[2]}-${kompakt[3]}`
  const iso = value.match(/^\d{4}-\d{2}-\d{2}$/u)
  if (iso) return value
  throw new Error(`Swissmedic-Import: Ungültiges Exportdatum «${raw}».`)
}

export function baueSwissmedicSnapshot(
  quellen: SwissmedicXmlQuellen,
  mapping: SwissmedicMappingKatalog,
  medikamente: MedikamentKatalog,
): SwissmedicProduktSnapshot {
  validiereMapping(mapping, medikamente)

  const udc = leseXmlDatensaetze(quellen.userDefinedCodes, [
    'SYSTEM_CODE',
    'USER_DEFINED_CODE',
    'CODE_VALUE',
    'SPRACH_CODE',
  ])
  const wirkstoffKategorien = aktiveWirkstoffKategorien(udc)

  const stoffSynonyme = leseXmlDatensaetze(quellen.stoffSynonyme, [
    'STOFF_ID',
    'SYNONYM_CODE',
    'STOFFSYNONYM',
  ])
  const stoffname = new Map<string, string>()
  for (const eintrag of stoffSynonyme) {
    const id = wert(eintrag, 'STOFF_ID')
    const name = wert(eintrag, 'STOFFSYNONYM')
    if (id && name && !stoffname.has(id)) stoffname.set(id, name)
  }

  const deklarationen = leseXmlDatensaetze(quellen.deklarationen, [
    'ZULASSUNGSNUMMER',
    'SEQUENZNUMMER',
    'STOFF_ID',
    'STOFFKATEGORIE',
  ])
  const wirkstoffeProSequenz = new Map<string, SwissmedicWirkstoff[]>()
  for (const deklaration of deklarationen) {
    if (!wirkstoffKategorien.has(wert(deklaration, 'STOFFKATEGORIE'))) continue
    const id = wert(deklaration, 'STOFF_ID')
    const name = stoffname.get(id)
    if (!id || !name) continue
    const key = schluessel(wert(deklaration, 'ZULASSUNGSNUMMER'), wert(deklaration, 'SEQUENZNUMMER'))
    const einheitCode = wert(deklaration, 'MENGEN_EINHEIT')
    const medikamentId = findeMedikamentId(name, mapping)
    const wirkstoff: SwissmedicWirkstoff = {
      stoff_id: id,
      name,
      ...(wert(deklaration, 'MENGE') && { menge: wert(deklaration, 'MENGE') }),
      ...(einheitCode && { einheit: bevorzugteUdcBeschreibung(udc, 'UNIT', einheitCode) }),
      ...(medikamentId && { medikament_id: medikamentId }),
    }
    const liste = wirkstoffeProSequenz.get(key) ?? []
    if (!liste.some((vorhanden) => vorhanden.stoff_id === wirkstoff.stoff_id)) liste.push(wirkstoff)
    wirkstoffeProSequenz.set(key, liste)
  }

  const packungen = leseXmlDatensaetze(quellen.packungen, [
    'ZULASSUNGSNUMMER',
    'SEQUENZNUMMER',
    'PACKUNGSCODE',
    'ZULASSUNGSSTATUS',
  ])
  const packungenProSequenz = new Map<string, SwissmedicPackung[]>()
  for (const packung of packungen) {
    const status = bevorzugteUdcBeschreibung(udc, 'MA_STATUS', wert(packung, 'ZULASSUNGSSTATUS'))
    if (!istAktiverZulassungsstatus(status)) continue
    const key = schluessel(wert(packung, 'ZULASSUNGSNUMMER'), wert(packung, 'SEQUENZNUMMER'))
    const einheitCode = wert(packung, 'PACKUNGSEINHEIT')
    const abgabeCode = wert(packung, 'ABGABEKATEGORIE')
    const eintrag: SwissmedicPackung = {
      code: wert(packung, 'PACKUNGSCODE'),
      ...(wert(packung, 'PACKUNGSGROESSE') && { groesse: wert(packung, 'PACKUNGSGROESSE') }),
      ...(einheitCode && { einheit: bevorzugteUdcBeschreibung(udc, 'PACKAGE_UNIT', einheitCode) }),
      ...(wert(packung, 'BEMERKUNG_FREITEXT') && {
        beschreibung: wert(packung, 'BEMERKUNG_FREITEXT'),
      }),
      ...(abgabeCode && {
        abgabekategorie: bevorzugteUdcBeschreibung(udc, 'SUPL_CATEGORY', abgabeCode),
      }),
    }
    const liste = packungenProSequenz.get(key) ?? []
    liste.push(eintrag)
    packungenProSequenz.set(key, liste)
  }

  const sequenzen = leseXmlDatensaetze(quellen.sequenzen, [
    'ZULASSUNGSNUMMER',
    'SEQUENZNUMMER',
    'ZULASSUNGSSTATUS',
    'SEQUENZNAME',
  ])
  const sequenzNachKey = new Map(
    sequenzen.map((sequenz) => [
      schluessel(wert(sequenz, 'ZULASSUNGSNUMMER'), wert(sequenz, 'SEQUENZNUMMER')),
      sequenz,
    ]),
  )

  const praeparate = leseXmlDatensaetze(quellen.praeparate, [
    'VERWENDUNG',
    'ZULASSUNGSNUMMER',
    'PRAEPARATENAME',
    'ARZNEIFORM',
    'ZULASSUNGSSTATUS',
  ])

  const produkte: SwissmedicProdukt[] = []
  let aktivePraeparate = 0
  let aktiveSequenzen = 0

  for (const praeparat of praeparate) {
    if (wert(praeparat, 'VERWENDUNG') !== 'HAM') continue
    const produktStatus = bevorzugteUdcBeschreibung(udc, 'MA_STATUS', wert(praeparat, 'ZULASSUNGSSTATUS'))
    if (!istAktiverZulassungsstatus(produktStatus)) continue
    aktivePraeparate += 1

    const zulassung = wert(praeparat, 'ZULASSUNGSNUMMER')
    const zugehoerigeSequenzen = sequenzen.filter(
      (sequenz) => wert(sequenz, 'ZULASSUNGSNUMMER') === zulassung,
    )

    for (const sequenz of zugehoerigeSequenzen) {
      const sequenzStatus = bevorzugteUdcBeschreibung(udc, 'MA_STATUS', wert(sequenz, 'ZULASSUNGSSTATUS'))
      if (!istAktiverZulassungsstatus(sequenzStatus)) continue
      aktiveSequenzen += 1

      const sequenznummer = wert(sequenz, 'SEQUENZNUMMER')
      const key = schluessel(zulassung, sequenznummer)
      const wirkstoffe = wirkstoffeProSequenz.get(key) ?? []
      const medikamentIds = [...new Set(wirkstoffe.flatMap((stoff) => stoff.medikament_id ?? []))]
      if (medikamentIds.length === 0) continue

      const alleWirkstoffeGemappt =
        wirkstoffe.length > 0 && wirkstoffe.every((stoff) => stoff.medikament_id !== undefined)
      const formCode = wert(praeparat, 'ARZNEIFORM')
      const abgabeCode = wert(praeparat, 'ABGABEKATEGORIE')
      const atc = wert(praeparat, 'ATC_CODE')
      const sequenzDatensatz = sequenzNachKey.get(key)

      produkte.push({
        id: `sm-${zulassung}-${sequenznummer.padStart(2, '0')}`,
        zulassungsnummer: zulassung,
        sequenznummer,
        name: wert(praeparat, 'PRAEPARATENAME'),
        ...(sequenzDatensatz && wert(sequenzDatensatz, 'SEQUENZNAME') && {
          sequenzname: wert(sequenzDatensatz, 'SEQUENZNAME'),
        }),
        arzneiform: bevorzugteUdcBeschreibung(udc, 'DF', formCode),
        ...(atc && { atc_code: atc }),
        zulassungsstatus: sequenzStatus,
        ...(abgabeCode && {
          abgabekategorie: bevorzugteUdcBeschreibung(udc, 'SUPL_CATEGORY', abgabeCode),
        }),
        wirkstoffe,
        medikament_ids: medikamentIds.sort(),
        kombinationspraeparat: wirkstoffe.length > 1,
        vollstaendig_gemappt: alleWirkstoffeGemappt,
        packungen: (packungenProSequenz.get(key) ?? []).sort((a, b) => a.code.localeCompare(b.code)),
      })
    }
  }

  produkte.sort((a, b) => a.name.localeCompare(b.name, 'de-CH') || a.id.localeCompare(b.id))

  const exportDatensaetze = leseXmlDatensaetze(quellen.exportDatum, ['EXPORT_DATUM'])
  const rawDatum = exportDatensaetze[0]?.EXPORT_DATUM
  if (!rawDatum) throw new Error('Swissmedic-Import: Export-Datum.XML enthält kein EXPORT_DATUM.')

  return {
    version: '0.1',
    stand: normalisiereDatum(rawDatum),
    quelle: QUELLE,
    mapping_version: mapping.version,
    statistik: {
      praeparate_ham_aktiv: aktivePraeparate,
      sequenzen_ham_aktiv: aktiveSequenzen,
      produkte_mit_pilotwirkstoff: produkte.length,
      vollstaendig_gemappt: produkte.filter((produkt) => produkt.vollstaendig_gemappt).length,
      unvollstaendige_kombinationen: produkte.filter(
        (produkt) => produkt.kombinationspraeparat && !produkt.vollstaendig_gemappt,
      ).length,
    },
    produkte,
  }
}
