import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

/** Ab hier gilt ein Zug nach unten als Wegwischen, auch ohne Schwung. */
const WEG_AB_PIXELN = 96
/** Ein kurzer Schnipser reicht auch ohne Weg: Pixel pro Millisekunde. */
const WEG_AB_TEMPO = 0.5
/** Muss zur Dauer von `.sheet` im Stylesheet passen. */
const AUSBLENDDAUER = 260

/**
 * Widerstand über der Oberkante: je weiter darüber hinaus, desto weniger
 * folgt das Blatt. Ein harter Anschlag läse sich wie eingefroren.
 */
function gummiband(weg: number, hoehe: number, staerke = 0.55): number {
  return (weg * hoehe * staerke) / (hoehe + staerke * Math.abs(weg))
}

/**
 * Blatt, das von unten hereinfährt und über der Ansicht liegt.
 *
 * Es kommt von unten und geht nach unten — derselbe Weg in beide Richtungen,
 * damit das Wegwischen sich anfühlt wie das, was es rückgängig macht. Ziehen
 * wird eins zu eins verfolgt, nicht erst beim Loslassen ausgewertet; über der
 * Oberkante federt es, statt zu blockieren. Losgelassen entscheidet nicht nur
 * der Weg, sondern auch das Tempo: ein kurzer Schnipser genügt.
 *
 * Bei reduzierter Bewegung fällt das Ziehen weg. Das Stylesheet setzt dort
 * jede Transformation zurück — das Blatt liesse sich sonst anfassen und bliebe
 * regungslos stehen.
 */
export function Sheet({
  titel,
  children,
  onSchliessen,
  fussKnopf,
}: {
  /** Beschriftet den Dialog für Hilfsmittel. */
  titel: string
  children: ReactNode
  onSchliessen: () => void
  /**
   * Beschriftung der Schaltfläche unter dem Inhalt. Weggelassen, wo der Inhalt
   * eigene Schaltflächen mitbringt — ein zweites «Abbrechen» hilft niemandem.
   */
  fussKnopf?: string
}) {
  const blatt = useRef<HTMLDivElement>(null)
  const schleier = useRef<HTMLDivElement>(null)
  const zug = useRef<{ start: number; zeit: number; hoehe: number } | null>(null)
  const [geht, setGeht] = useState(false)
  /** Womit die Ansicht vorher gearbeitet hat — dorthin geht der Fokus zurück. */
  const vorher = useRef<HTMLElement | null>(null)
  /*
   * Beim ersten Rendern gemerkt, nicht erst im Effekt: Effekte laufen von
   * innen nach aussen, und ein Inhalt, der sich selbst ein Feld holt, hätte
   * den Auslöser bis dahin längst überschrieben. Dann führte das Zumachen
   * zurück auf ein Element, das es nicht mehr gibt.
   */
  if (vorher.current === null && typeof document !== 'undefined') {
    vorher.current = document.activeElement as HTMLElement | null
  }

  const sanft =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

  /*
   * Die Rückmeldung liegt in einer Referenz, nicht in der Abhängigkeitsliste.
   * Sie kommt als Pfeilfunktion herein und ist damit bei jedem Rendern eine
   * andere — als Abhängigkeit hätte sie den Effekt unten jedes Mal abgeräumt
   * und neu aufgesetzt: Fokus weg, Scrollsperre kurz auf, und der Ort, an den
   * der Fokus zurücksoll, überschrieben.
   */
  const rueckmeldung = useRef(onSchliessen)
  rueckmeldung.current = onSchliessen

  // Erst ausblenden, dann abräumen: sonst verschwände das Blatt schlagartig.
  const schliessen = useCallback(() => {
    setGeht(true)
    window.setTimeout(() => rueckmeldung.current(), sanft ? 0 : AUSBLENDDAUER)
  }, [sanft])

  useEffect(() => {
    const el = blatt.current
    // Der Effekt des Kindes läuft vor diesem. Hat der Inhalt sich schon ein
    // Feld geholt — das Terminformular tut das — bleibt er dort.
    if (el && !el.contains(document.activeElement)) el.focus()

    const beiTaste = (ereignis: KeyboardEvent) => {
      if (ereignis.key === 'Escape') schliessen()
    }
    document.addEventListener('keydown', beiTaste)

    // Der Hintergrund darf nicht mitscrollen, solange das Blatt oben liegt.
    const vorherigerUeberlauf = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', beiTaste)
      document.body.style.overflow = vorherigerUeberlauf
      // Nur zurück, wenn es das Element noch gibt — sonst bliebe der Fokus
      // an einer Leiche hängen und fiele stumm auf den Seitenrumpf.
      const ziel = vorher.current
      if (ziel && ziel.isConnected) ziel.focus()
    }
  }, [schliessen])

  const zeichne = (weg: number) => {
    const el = blatt.current
    if (!el) return
    el.style.transform = `translateY(${weg}px)`
    if (schleier.current) {
      const anteil = Math.max(0, 1 - weg / (zug.current?.hoehe ?? 1))
      schleier.current.style.opacity = String(anteil)
    }
  }

  const loesen = () => {
    const el = blatt.current
    if (!el) return
    el.style.transition = ''
    el.style.transform = ''
    if (schleier.current) {
      schleier.current.style.transition = ''
      schleier.current.style.opacity = ''
    }
  }

  const greifen = (ereignis: React.PointerEvent<HTMLDivElement>) => {
    if (sanft || !blatt.current) return
    // Gefangen wird auf dem Griff, nicht auf dem Blatt: ein Fang leitet alle
    // folgenden Ereignisse auf das fangende Element um — läge er auf dem
    // Blatt, erreichte kein pointermove mehr den Griff.
    ereignis.currentTarget.setPointerCapture(ereignis.pointerId)
    // Während des Ziehens keine Übergangsdauer: die Fläche klebt am Finger.
    blatt.current.style.transition = 'none'
    if (schleier.current) schleier.current.style.transition = 'none'
    zug.current = {
      start: ereignis.clientY,
      zeit: performance.now(),
      hoehe: blatt.current.getBoundingClientRect().height,
    }
  }

  const ziehen = (ereignis: React.PointerEvent<HTMLDivElement>) => {
    if (!zug.current) return
    const roh = ereignis.clientY - zug.current.start
    zeichne(roh >= 0 ? roh : -gummiband(-roh, zug.current.hoehe))
  }

  const lassen = (ereignis: React.PointerEvent<HTMLDivElement>) => {
    if (!zug.current) return
    const weg = ereignis.clientY - zug.current.start
    const tempo = weg / Math.max(1, performance.now() - zug.current.zeit)
    zug.current = null
    if (weg > WEG_AB_PIXELN || tempo > WEG_AB_TEMPO) {
      loesen()
      schliessen()
      return
    }
    loesen()
  }

  return (
    <div className="sheet-lage">
      <div
        className="schleier"
        ref={schleier}
        data-geht={geht || undefined}
        onClick={schliessen}
        aria-hidden="true"
      />
      <div
        className="sheet"
        ref={blatt}
        data-geht={geht || undefined}
        role="dialog"
        aria-modal="true"
        aria-label={titel}
        tabIndex={-1}
      >
        {/*
          Der Griff ist die Zugfläche. Der Inhalt darunter bleibt scrollbar —
          würde das ganze Blatt ziehen, käme man nicht mehr an lange Karten.
        */}
        <div
          className="sheet__griff"
          onPointerDown={greifen}
          onPointerMove={ziehen}
          onPointerUp={lassen}
          onPointerCancel={lassen}
        >
          <span className="sheet__balken" aria-hidden="true" />
        </div>

        <div className="sheet__inhalt">
          {children}
          {fussKnopf && (
            <button className="zurueck zurueck--flaeche" type="button" onClick={schliessen}>
              {fussKnopf}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
