import { useCallback, useState } from 'react'

export type CheckArt =
  | 'lebensmittel'
  | 'medikament'
  | 'medikament-produkt'
  | 'wissen'
  | 'alltag'

export interface CheckRef {
  art: CheckArt
  id: string
}

export interface ScanEintrag {
  ean: string
  label: string
}

interface MeineChecksDaten {
  verlauf: CheckRef[]
  favoriten: CheckRef[]
  scans: ScanEintrag[]
}

const SCHLUESSEL = 'essens-check.meine-checks'
const ALTER_VERLAUF_SCHLUESSEL = 'essens-check.verlauf'
const MAX_VERLAUF = 12
const MAX_FAVORITEN = 50
const MAX_SCANS = 5

const CHECK_ARTEN = new Set<CheckArt>([
  'lebensmittel',
  'medikament',
  'medikament-produkt',
  'wissen',
  'alltag',
])

export function checkSchluessel(ref: CheckRef): string {
  return `${ref.art}:${ref.id}`
}

function istCheckRef(wert: unknown): wert is CheckRef {
  if (!wert || typeof wert !== 'object') return false
  const kandidat = wert as Partial<CheckRef>
  return (
    typeof kandidat.art === 'string' &&
    CHECK_ARTEN.has(kandidat.art as CheckArt) &&
    typeof kandidat.id === 'string' &&
    kandidat.id.trim().length > 0
  )
}

function istScanEintrag(wert: unknown): wert is ScanEintrag {
  if (!wert || typeof wert !== 'object') return false
  const kandidat = wert as Partial<ScanEintrag>
  return (
    typeof kandidat.ean === 'string' &&
    /^\d{8}$|^\d{13}$/.test(kandidat.ean) &&
    typeof kandidat.label === 'string' &&
    kandidat.label.trim().length > 0
  )
}

export function ergaenzeCheck(
  bisher: readonly CheckRef[],
  ref: CheckRef,
  maximum = MAX_VERLAUF,
): CheckRef[] {
  const schluessel = checkSchluessel(ref)
  return [ref, ...bisher.filter((eintrag) => checkSchluessel(eintrag) !== schluessel)].slice(
    0,
    maximum,
  )
}

export function toggleFavoritListe(bisher: readonly CheckRef[], ref: CheckRef): CheckRef[] {
  const schluessel = checkSchluessel(ref)
  const vorhanden = bisher.some((eintrag) => checkSchluessel(eintrag) === schluessel)
  if (vorhanden) {
    return bisher.filter((eintrag) => checkSchluessel(eintrag) !== schluessel)
  }
  return [ref, ...bisher].slice(0, MAX_FAVORITEN)
}

export function ergaenzeScan(
  bisher: readonly ScanEintrag[],
  ean: string,
  label: string,
): ScanEintrag[] {
  const bereinigt = label.trim().replace(/\s+/g, ' ').slice(0, 120) || ean
  return [
    { ean, label: bereinigt },
    ...bisher.filter((eintrag) => eintrag.ean !== ean),
  ].slice(0, MAX_SCANS)
}

function migriereAltenVerlauf(): CheckRef[] {
  try {
    const gespeichert = localStorage.getItem(ALTER_VERLAUF_SCHLUESSEL)
    if (!gespeichert) return []
    const gelesen: unknown = JSON.parse(gespeichert)
    if (!Array.isArray(gelesen)) return []
    return gelesen
      .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      .slice(0, MAX_VERLAUF)
      .map((id) => ({ art: 'lebensmittel' as const, id }))
  } catch {
    return []
  }
}

function leseDaten(): MeineChecksDaten {
  try {
    const gespeichert = localStorage.getItem(SCHLUESSEL)
    if (!gespeichert) {
      return { verlauf: migriereAltenVerlauf(), favoriten: [], scans: [] }
    }
    const gelesen: unknown = JSON.parse(gespeichert)
    if (!gelesen || typeof gelesen !== 'object') {
      return { verlauf: [], favoriten: [], scans: [] }
    }
    const daten = gelesen as Partial<MeineChecksDaten>
    return {
      verlauf: Array.isArray(daten.verlauf)
        ? daten.verlauf.filter(istCheckRef).slice(0, MAX_VERLAUF)
        : [],
      favoriten: Array.isArray(daten.favoriten)
        ? daten.favoriten.filter(istCheckRef).slice(0, MAX_FAVORITEN)
        : [],
      scans: Array.isArray(daten.scans) ? daten.scans.filter(istScanEintrag).slice(0, MAX_SCANS) : [],
    }
  } catch {
    return { verlauf: [], favoriten: [], scans: [] }
  }
}

function speichereDaten(daten: MeineChecksDaten): void {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(daten))
    localStorage.removeItem(ALTER_VERLAUF_SCHLUESSEL)
  } catch {
    // Nicht speicherbar: die Daten gelten dann nur für diese Sitzung.
  }
}

export function useMeineChecks() {
  const [daten, setDaten] = useState<MeineChecksDaten>(() => leseDaten())

  const aktualisieren = useCallback((aendern: (bisher: MeineChecksDaten) => MeineChecksDaten) => {
    setDaten((bisher) => {
      const neu = aendern(bisher)
      speichereDaten(neu)
      return neu
    })
  }, [])

  const merken = useCallback(
    (ref: CheckRef) => {
      aktualisieren((bisher) => ({ ...bisher, verlauf: ergaenzeCheck(bisher.verlauf, ref) }))
    },
    [aktualisieren],
  )

  const favoritUmschalten = useCallback(
    (ref: CheckRef) => {
      aktualisieren((bisher) => ({
        ...bisher,
        favoriten: toggleFavoritListe(bisher.favoriten, ref),
      }))
    },
    [aktualisieren],
  )

  const istFavorit = useCallback(
    (ref: CheckRef) => {
      const schluessel = checkSchluessel(ref)
      return daten.favoriten.some((eintrag) => checkSchluessel(eintrag) === schluessel)
    },
    [daten.favoriten],
  )

  const verlaufLeeren = useCallback(() => {
    aktualisieren((bisher) => ({ ...bisher, verlauf: [] }))
  }, [aktualisieren])

  const scanMerken = useCallback(
    (ean: string, label: string) => {
      aktualisieren((bisher) => ({ ...bisher, scans: ergaenzeScan(bisher.scans, ean, label) }))
    },
    [aktualisieren],
  )

  const scansLeeren = useCallback(() => {
    aktualisieren((bisher) => ({ ...bisher, scans: [] }))
  }, [aktualisieren])

  return {
    verlauf: daten.verlauf,
    favoriten: daten.favoriten,
    scans: daten.scans,
    merken,
    favoritUmschalten,
    istFavorit,
    verlaufLeeren,
    scanMerken,
    scansLeeren,
  }
}
