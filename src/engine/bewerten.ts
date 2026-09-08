/**
 * Regelmaschine. Bewertet ein Lebensmittel variantenweise gegen den Regelkatalog.
 *
 * Grundsatz: Es wird nie eine Freigabe geraten. Ein Tag, das weder eine Regel
 * auslöst noch ausdrücklich als unbedenklich hinterlegt ist, ergibt «unklar».
 */
import type {
  Komponente,
  Lebensmittel,
  Regel,
  RegelKatalog,
  Status,
  Variante,
} from '../typen'

/** Eine Zeile Begründung samt auslösender Regel. */
export interface Begruendung {
  /** Regel-ID, oder 'unbedenklich', 'unklar' beziehungsweise 'eigener_text'. */
  regel: string
  /** Titel des Risikoprinzips, sofern eine Regel die Begründung erzeugt hat. */
  titel?: string
  text: string
  /** Grenze über die Mahlzeit hinaus, sofern die Regel eine kennt. */
  grenze?: string
}

export interface KomponentenUrteil {
  tag: string
  zustand?: string
  status: Status
  begruendungen: Begruendung[]
  trimesterHinweise: Begruendung[]
}

export interface VariantenUrteil {
  label: string | null
  status: Status
  begruendungen: Begruendung[]
  trimesterHinweise: Begruendung[]
  komponenten: KomponentenUrteil[]
}

export interface Urteil {
  id: string
  name: string
  frage?: string
  varianten: VariantenUrteil[]
  /** Einordnung zum ganzen Eintrag, nicht zu einer Variante. */
  zusatz?: string
  alternativen: string[]
}

export const UNKLAR_TEXT =
  'Zu dieser Zutat ist keine Bewertung hinterlegt. Im Zweifel die Hebamme fragen.'

/**
 * Vorrang eines Status. Ein unbekannter Status gilt als der stärkste — ein
 * Tippfehler macht die Auskunft strenger, nicht milder.
 */
function rang(status: Status, rangfolge: Status[]): number {
  const index = rangfolge.indexOf(status)
  return index === -1 ? rangfolge.length : index
}

/** Das Urteil mit dem höchsten Vorrang gewinnt. */
function schlechtester(status: Status[], rangfolge: Status[]): Status {
  if (status.length === 0) return 'unklar'
  return status.reduce<Status>(
    (bisher, kandidat) =>
      rang(kandidat, rangfolge) > rang(bisher, rangfolge) ? kandidat : bisher,
    'ok',
  )
}

/** Gleiche Formulierung nur einmal zeigen. */
function ohneDoppelte(begruendungen: Begruendung[]): Begruendung[] {
  const gesehen = new Set<string>()
  return begruendungen.filter((eintrag) => {
    if (gesehen.has(eintrag.text)) return false
    gesehen.add(eintrag.text)
    return true
  })
}

/**
 * Wendet eine einzelne Regel auf Zustand und Schwangerschaftsstand an.
 *
 * Ein `trimester_status` darf nur bei bekanntem Trimester lockern. Fehlt der
 * Termin, bleibt der normale Regelstatus als sicherer Rückfallwert bestehen.
 * Ein anschliessender Zubereitungszustand kann die Regel wie bisher
 * entschärfen, sofern er nicht ausdrücklich blockiert ist.
 */
function wendeRegelAn(
  regel: Regel,
  zustand: string | undefined,
  rangfolge: Status[],
  trimester?: number,
): Begruendung & { status: Status } {
  const trimesterStatus =
    trimester === 1 || trimester === 2 || trimester === 3
      ? regel.trimester_status?.[trimester]
      : undefined
  const basisStatus = trimesterStatus ?? regel.status

  if (zustand !== undefined && !(regel.nicht_entschaerfbar_durch ?? []).includes(zustand)) {
    const passende = regel.entschaerfung.filter((eintrag) => eintrag.durch === zustand)
    const strengste = passende.reduce<(typeof passende)[number] | undefined>(
      (bisher, kandidat) =>
        bisher === undefined || rang(kandidat.auf, rangfolge) > rang(bisher.auf, rangfolge)
          ? kandidat
          : bisher,
      undefined,
    )
    if (strengste) {
      return {
        regel: regel.id,
        titel: regel.titel,
        status: strengste.auf,
        text: strengste.text,
        ...(regel.grenze !== undefined && strengste.auf !== 'ok' && { grenze: regel.grenze }),
      }
    }
  }

  return {
    regel: regel.id,
    titel: regel.titel,
    status: basisStatus,
    text: regel.begruendung,
    ...(regel.grenze !== undefined && { grenze: regel.grenze }),
  }
}

export function bewerteKomponente(
  komponente: Komponente,
  katalog: RegelKatalog,
  trimester?: number,
): KomponentenUrteil {
  // Regeln haben Vorrang vor unbedenkliche_tags: steht ein Tag in beiden,
  // gilt die Regel. Der strengere Eintrag gewinnt, nicht der mildere.
  const treffer = katalog.regeln.filter((regel) => regel.trifft_auf.includes(komponente.tag))

  if (treffer.length === 0) {
    const unbedenklich = katalog.unbedenkliche_tags.find(
      (eintrag) => eintrag.tag === komponente.tag,
    )
    return {
      tag: komponente.tag,
      ...(komponente.zustand !== undefined && { zustand: komponente.zustand }),
      status: unbedenklich ? 'ok' : 'unklar',
      begruendungen: [
        unbedenklich
          ? { regel: 'unbedenklich', text: unbedenklich.text }
          : { regel: 'unklar', text: UNKLAR_TEXT },
      ],
      trimesterHinweise: [],
    }
  }

  const begruendungen: Begruendung[] = []
  const trimesterHinweise: Begruendung[] = []
  const status: Status[] = []

  for (const regel of treffer) {
    const ergebnis = wendeRegelAn(
      regel,
      komponente.zustand,
      katalog.status_rangfolge,
      trimester,
    )
    status.push(ergebnis.status)
    begruendungen.push({
      regel: ergebnis.regel,
      ...(ergebnis.titel !== undefined && { titel: ergebnis.titel }),
      text: ergebnis.text,
      ...(ergebnis.grenze !== undefined && { grenze: ergebnis.grenze }),
    })

    if (
      regel.trimester_gewichtung !== null &&
      regel.trimester_gewichtung === trimester &&
      regel.trimester_text
    ) {
      trimesterHinweise.push({ regel: regel.id, titel: regel.titel, text: regel.trimester_text })
    }
  }

  return {
    tag: komponente.tag,
    ...(komponente.zustand !== undefined && { zustand: komponente.zustand }),
    status: schlechtester(status, katalog.status_rangfolge),
    begruendungen: ohneDoppelte(begruendungen),
    trimesterHinweise,
  }
}

/** Der schlechteste Status aller Komponenten gewinnt. */
export function bewerteVariante(
  variante: Variante,
  katalog: RegelKatalog,
  trimester?: number,
): VariantenUrteil {
  const komponenten = variante.komponenten.map((komponente) =>
    bewerteKomponente(komponente, katalog, trimester),
  )

  const begruendungen =
    komponenten.length === 0
      ? [{ regel: 'unklar', text: UNKLAR_TEXT }]
      : ohneDoppelte(komponenten.flatMap((urteil) => urteil.begruendungen))

  return {
    label: variante.label,
    status: schlechtester(
      komponenten.map((urteil) => urteil.status),
      katalog.status_rangfolge,
    ),
    begruendungen,
    trimesterHinweise: ohneDoppelte(komponenten.flatMap((urteil) => urteil.trimesterHinweise)),
    komponenten,
  }
}

export function bewerteLebensmittel(
  eintrag: Lebensmittel,
  katalog: RegelKatalog,
  trimester?: number,
): Urteil {
  const varianten = eintrag.varianten.map((variante) => {
    const urteil = bewerteVariante(variante, katalog, trimester)
    return eintrag.eigener_text
      ? { ...urteil, begruendungen: [{ regel: 'eigener_text', text: eintrag.eigener_text }] }
      : urteil
  })

  return {
    id: eintrag.id,
    name: eintrag.name,
    ...(eintrag.frage !== undefined && { frage: eintrag.frage }),
    varianten,
    ...(eintrag.zusatz_text ? { zusatz: eintrag.zusatz_text } : {}),
    alternativen: eintrag.alternativen,
  }
}
