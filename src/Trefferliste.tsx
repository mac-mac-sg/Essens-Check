import { useMemo } from 'react'
import { AMPEL, GEMISCHT_WORT } from './ampel'
import { regelKatalog } from './daten'
import { listenzeile, type Listenzeile } from './engine/listenzeile'
import type { Lebensmittel } from './typen'

function Pfeil() {
  return (
    <svg
      className="zeile__pfeil"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 3.5 L10.5 8 L6 12.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Treffer({ zeile, onOeffnen }: { zeile: Listenzeile; onOeffnen: (id: string) => void }) {
  const wort = zeile.status === 'gemischt' ? GEMISCHT_WORT : AMPEL[zeile.status].kurz
  return (
    <li>
      <button className="treffer" type="button" onClick={() => onOeffnen(zeile.id)}>
        <span className="treffer__text">
          <span className="treffer__name">{zeile.name}</span>
          <span className="treffer__unten">
            <span className="marke marke--klein" data-status={zeile.status}>
              {wort}
            </span>
            {zeile.hinweis && <span className="treffer__hinweis">· {zeile.hinweis}</span>}
          </span>
        </span>
        <Pfeil />
      </button>
    </li>
  )
}

export function Trefferliste({
  eintraege,
  onOeffnen,
}: {
  eintraege: Lebensmittel[]
  onOeffnen: (id: string) => void
}) {
  const zeilen = useMemo(
    () => eintraege.map((eintrag) => listenzeile(eintrag, regelKatalog)),
    [eintraege],
  )
  return (
    <ul className="treffer-liste">
      {zeilen.map((zeile) => (
        <Treffer key={zeile.id} zeile={zeile} onOeffnen={onOeffnen} />
      ))}
    </ul>
  )
}
