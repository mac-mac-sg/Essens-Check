/** Die drei Wege durch die App. Reihenfolge wie im Alltag: erst suchen. */
export type Ziel = 'suche' | 'uebersicht' | 'scanner'

function Lupe() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.9" />
      <path d="M13.5 13.5 L17 17" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function Liste() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.5 5.5h13M3.5 10h13M3.5 14.5h8"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Strichcode() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 6.5V4a1 1 0 0 1 1-1h2.5M13.5 3H16a1 1 0 0 1 1 1v2.5M17 13.5V16a1 1 0 0 1-1 1h-2.5M6.5 17H4a1 1 0 0 1-1-1v-2.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M6 7v6M8.5 7v6M11.5 7v6M14 7v6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  )
}

const ZIELE: { ziel: Ziel; wort: string; Zeichen: () => JSX.Element }[] = [
  { ziel: 'suche', wort: 'Suchen', Zeichen: Lupe },
  { ziel: 'uebersicht', wort: 'Liste', Zeichen: Liste },
  { ziel: 'scanner', wort: 'Scannen', Zeichen: Strichcode },
]

/**
 * Die drei Ziele der App in der Daumenzone.
 *
 * Vorher waren Liste und Scanner nur vom Startbildschirm aus erreichbar: wer
 * gesucht hatte, musste erst zurück. In einem Laden, einhändig, ist das der
 * falsche Weg.
 *
 * Das aktive Ziel trägt Farbe **und** Fettung — die Farbe allein wäre bei
 * Rot-Grün-Schwäche verloren, und `aria-current` sagt es zusätzlich an.
 */
export function Navigation({
  aktiv,
  onWechsel,
}: {
  aktiv: Ziel
  onWechsel: (ziel: Ziel) => void
}) {
  return (
    <nav className="navi" aria-label="Hauptbereiche">
      {ZIELE.map(({ ziel, wort, Zeichen }) => (
        <button
          key={ziel}
          className="navi__ziel"
          type="button"
          data-aktiv={ziel === aktiv || undefined}
          aria-current={ziel === aktiv ? 'page' : undefined}
          onClick={() => onWechsel(ziel)}
        >
          <Zeichen />
          <span className="navi__wort">{wort}</span>
        </button>
      ))}
    </nav>
  )
}
