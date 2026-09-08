import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

const WEG_AB_PIXELN = 96
const WEG_AB_TEMPO = 0.5
const AUSBLENDDAUER = 260

function gummiband(weg: number, hoehe: number, staerke = 0.55): number {
  return (weg * hoehe * staerke) / (hoehe + staerke * Math.abs(weg))
}

export function Sheet({
  titel,
  children,
  onSchliessen,
  fussKnopf,
}: {
  titel: string
  children: ReactNode
  onSchliessen: () => void
  fussKnopf?: string
}) {
  const blatt = useRef<HTMLDivElement>(null)
  const schleier = useRef<HTMLDivElement>(null)
  const zug = useRef<{ start: number; zeit: number; hoehe: number } | null>(null)
  const [geht, setGeht] = useState(false)
  const vorher = useRef<HTMLElement | null>(null)
  if (vorher.current === null && typeof document !== 'undefined') {
    vorher.current = document.activeElement as HTMLElement | null
  }

  const sanft =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

  const rueckmeldung = useRef(onSchliessen)
  rueckmeldung.current = onSchliessen

  const schliessen = useCallback(() => {
    setGeht(true)
    window.setTimeout(() => rueckmeldung.current(), sanft ? 0 : AUSBLENDDAUER)
  }, [sanft])

  useEffect(() => {
    const el = blatt.current
    if (el && !el.contains(document.activeElement)) el.focus()

    const beiTaste = (ereignis: KeyboardEvent) => {
      if (ereignis.key === 'Escape') schliessen()
    }
    document.addEventListener('keydown', beiTaste)

    const vorherigerUeberlauf = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', beiTaste)
      document.body.style.overflow = vorherigerUeberlauf
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
    ereignis.currentTarget.setPointerCapture(ereignis.pointerId)
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
      <div className="schleier" ref={schleier} data-geht={geht || undefined} onClick={schliessen} aria-hidden="true" />
      <div
        className="sheet"
        ref={blatt}
        data-geht={geht || undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-titel"
        tabIndex={-1}
      >
        <div
          className="sheet__griff"
          onPointerDown={greifen}
          onPointerMove={ziehen}
          onPointerUp={lassen}
          onPointerCancel={lassen}
        >
          <span className="sheet__balken" aria-hidden="true" />
        </div>

        <div className="sheet__kopf">
          <h2 className="sheet__titel" id="sheet-titel">{titel}</h2>
          <button className="sheet__zu" type="button" aria-label="Schliessen" onClick={schliessen}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="sheet__inhalt">
          {children}
          {fussKnopf && (
            <button className="zurueck zurueck--flaeche" type="button" onClick={schliessen}>{fussKnopf}</button>
          )}
        </div>
      </div>
    </div>
  )
}
