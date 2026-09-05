/**
 * Ein Schieberegler.
 *
 * Der Knopf wird über `left` bewegt, nicht über `transform`: unter
 * `prefers-reduced-motion` setzt das Stylesheet alle Transformationen zurück,
 * und der Knopf bliebe sonst am falschen Ende stehen. So springt er dort
 * ohne Animation an die richtige Stelle.
 */
export function Schalter({
  an,
  onAendern,
  beschriftung,
  erklaerung,
}: {
  an: boolean
  onAendern: (an: boolean) => void
  beschriftung: string
  erklaerung: string
}) {
  return (
    <div className="schalter">
      <div className="schalter__text">
        <p className="schalter__titel">{beschriftung}</p>
        <p className="schalter__erklaerung">{erklaerung}</p>
      </div>
      <button
        className="schalter__bahn"
        type="button"
        role="switch"
        aria-checked={an}
        aria-label={beschriftung}
        onClick={() => onAendern(!an)}
      >
        <span className="schalter__knopf" aria-hidden="true" />
      </button>
    </div>
  )
}
