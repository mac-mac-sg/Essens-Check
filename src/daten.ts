/**
 * Typisierter Zugang zu den Katalogen. Die grossen Basiskataloge bleiben
 * unverändert nachvollziehbar; fachlich neu entschiedene Einzelpunkte liegen
 * gesammelt in `daten/korrekturen.json` und werden hier generisch darübergelegt.
 *
 * Die Korrekturschicht enthält Daten, keine Bewertungslogik: welche Regel oder
 * welches Lebensmittel geändert wird, steht ausschliesslich im JSON.
 */
import regelnJson from '@daten/regeln.json'
import lebensmittelJson from '@daten/lebensmittel.json'
import korrekturenJson from '@daten/korrekturen.json'
import type {
  Lebensmittel,
  LebensmittelKatalog,
  Regel,
  RegelKatalog,
  UnbedenklicherTag,
} from './typen'

type RegelAenderung = Partial<Regel> & Pick<Regel, 'id'>
type LebensmittelAenderung = Partial<Lebensmittel> & Pick<Lebensmittel, 'id'>
type UnbedenklicheAenderung = Partial<UnbedenklicherTag> & Pick<UnbedenklicherTag, 'tag'>

interface KorrekturKatalog {
  version: string
  stand: string
  hinweis: string
  regel_aenderungen: RegelAenderung[]
  regel_hinzufuegen: Regel[]
  unbedenkliche_aenderungen: UnbedenklicheAenderung[]
  lebensmittel_aenderungen: LebensmittelAenderung[]
  lebensmittel_hinzufuegen: Lebensmittel[]
  alternativen_enthalten_entfernen: string[]
}

const korrekturen = korrekturenJson as KorrekturKatalog

/**
 * Wendet Teilobjekte anhand einer stabilen ID an. Ein unbekanntes Patch-Ziel
 * ist ein Datenfehler und wird nicht still ignoriert — sonst könnte eine
 * beabsichtigte Sicherheitskorrektur wirkungslos bleiben.
 */
function mitAenderungen<T extends { id: string }>(
  basis: T[],
  aenderungen: (Partial<T> & Pick<T, 'id'>)[],
  hinzufuegen: T[],
): T[] {
  const basisIds = new Set(basis.map((eintrag) => eintrag.id))
  const unbekannt = aenderungen.filter((aenderung) => !basisIds.has(aenderung.id))
  if (unbekannt.length > 0) {
    throw new Error(
      `Korrektur verweist auf unbekannte ID: ${unbekannt.map((eintrag) => eintrag.id).join(', ')}`,
    )
  }

  const patches = new Map(aenderungen.map((aenderung) => [aenderung.id, aenderung]))
  return [
    ...basis.map((eintrag) => ({ ...eintrag, ...(patches.get(eintrag.id) ?? {}) })),
    ...hinzufuegen,
  ]
}

function unbedenklicheMitAenderungen(
  basis: UnbedenklicherTag[],
  aenderungen: UnbedenklicheAenderung[],
): UnbedenklicherTag[] {
  const basisTags = new Set(basis.map((eintrag) => eintrag.tag))
  const unbekannt = aenderungen.filter((aenderung) => !basisTags.has(aenderung.tag))
  if (unbekannt.length > 0) {
    throw new Error(
      `Korrektur verweist auf unbekanntes Freigabe-Tag: ${unbekannt.map((e) => e.tag).join(', ')}`,
    )
  }
  const patches = new Map(aenderungen.map((aenderung) => [aenderung.tag, aenderung]))
  return basis.map((eintrag) => ({ ...eintrag, ...(patches.get(eintrag.tag) ?? {}) }))
}

const basisRegeln = regelnJson as RegelKatalog
const basisLebensmittel = lebensmittelJson as LebensmittelKatalog

export const regelKatalog: RegelKatalog = {
  ...basisRegeln,
  version: `${basisRegeln.version}+CH-${korrekturen.version}`,
  hinweis: `${basisRegeln.hinweis} ${korrekturen.hinweis}`,
  regeln: mitAenderungen(
    basisRegeln.regeln,
    korrekturen.regel_aenderungen,
    korrekturen.regel_hinzufuegen,
  ),
  unbedenkliche_tags: unbedenklicheMitAenderungen(
    basisRegeln.unbedenkliche_tags,
    korrekturen.unbedenkliche_aenderungen,
  ),
}

const entfernteAlternativen = korrekturen.alternativen_enthalten_entfernen.map((eintrag) =>
  eintrag.toLocaleLowerCase('de-CH'),
)

export const lebensmittelKatalog: LebensmittelKatalog = {
  ...basisLebensmittel,
  version: `${basisLebensmittel.version}+CH-${korrekturen.version}`,
  hinweis: `${basisLebensmittel.hinweis} ${korrekturen.hinweis}`,
  lebensmittel: mitAenderungen(
    basisLebensmittel.lebensmittel,
    korrekturen.lebensmittel_aenderungen,
    korrekturen.lebensmittel_hinzufuegen,
  ).map((eintrag) => ({
    ...eintrag,
    alternativen: eintrag.alternativen.filter((alternative) => {
      const normalisiert = alternative.toLocaleLowerCase('de-CH')
      return !entfernteAlternativen.some((begriff) => normalisiert.includes(begriff))
    }),
  })),
}

export const korrekturStand = korrekturen.stand
