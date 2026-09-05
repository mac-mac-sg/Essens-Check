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
  /** Regel-ID, oder 'unbedenklich' beziehungsweise 'unklar'. */
  regel: string
  text: string
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
  alternativen: string[]
}

export const UNKLAR_TEXT =
  'Zu dieser Zutat ist keine Bewertung hinterlegt. Im Zweifel die Hebamme fragen.'

/** Schweregrad eines Status. Unbekanntes gilt als am schwersten. */
function rang(status: Status, rangfolge: Status[]): number {
  const index = rangfolge.indexOf(status)
  return index === -1 ? rangfolge.length : index
}

function schlechtester(status: Status[], rangfolge: Status[]): Status {
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
 * Wendet eine einzelne Regel auf einen Zustand an. Ein Zustand, der in
 * `nicht_entschaerfbar_durch` steht, stuft nicht herab — Quecksilber
 * verschwindet nicht durch Kochen.
 */
function wendeRegelAn(regel: Regel, zustand: string | undefined): Begruendung & { status: Status } {
  if (zustand !== undefined && !(regel.nicht_entschaerfbar_durch ?? []).includes(zustand)) {
    const entschaerfung = regel.entschaerfung.find((eintrag) => eintrag.durch === zustand)
    if (entschaerfung) {
      return { regel: regel.id, status: entschaerfung.auf, text: entschaerfung.text }
    }
  }
  return { regel: regel.id, status: regel.status, text: regel.begruendung }
}

export function bewerteKomponente(
  komponente: Komponente,
  katalog: RegelKatalog,
  trimester?: number,
): KomponentenUrteil {
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
    const ergebnis = wendeRegelAn(regel, komponente.zustand)
    status.push(ergebnis.status)
    begruendungen.push({ regel: ergebnis.regel, text: ergebnis.text })

    if (
      regel.trimester_gewichtung !== null &&
      regel.trimester_gewichtung === trimester &&
      regel.trimester_text
    ) {
      trimesterHinweise.push({ regel: regel.id, text: regel.trimester_text })
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

  return {
    label: variante.label,
    status: schlechtester(
      komponenten.map((urteil) => urteil.status),
      katalog.status_rangfolge,
    ),
    begruendungen: ohneDoppelte(komponenten.flatMap((urteil) => urteil.begruendungen)),
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
    // eigener_text ersetzt die generierte Begründung, nicht das Urteil.
    return eintrag.eigener_text
      ? { ...urteil, begruendungen: [{ regel: 'eigener_text', text: eintrag.eigener_text }] }
      : urteil
  })

  return {
    id: eintrag.id,
    name: eintrag.name,
    ...(eintrag.frage !== undefined && { frage: eintrag.frage }),
    varianten,
    alternativen: eintrag.alternativen,
  }
}
