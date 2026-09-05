import { useMemo, useState } from 'react'
import { lebensmittelKatalog } from './daten'
import { MAX_TREFFER, MINDESTLAENGE, suche } from './engine/suchen'

/**
 * Ein unbekannter Strichcode wird einmal von Hand einem Eintrag zugeordnet.
 * Danach erkennt die App ihn ohne Nachfrage — ohne dass je ein Code das
 * Gerät verlässt.
 */
export function Zuordnen({
  ean,
  onZuordnen,
  onAbbruch,
}: {
  ean: string
  onZuordnen: (id: string) => void
  onAbbruch: () => void
}) {
  const [begriff, setBegriff] = useState('')
  const treffer = useMemo(() => suche(begriff, lebensmittelKatalog), [begriff])
  const gesucht = begriff.trim().length >= MINDESTLAENGE

  return (
    <section aria-labelledby="zuordnen-titel">
      <h2 className="uebersicht__titel" id="zuordnen-titel">
        Noch nicht zugeordnet
      </h2>
      <p className="uebersicht__hinweis">
        Der Code <span className="zuordnen__code">{ean}</span> ist neu. Suche das
        Lebensmittel einmal heraus — ab dann wird er sofort erkannt.
      </p>

      <label className="feldtitel" htmlFor="zuordnen-suche">
        Lebensmittel suchen
      </label>
      <input
        id="zuordnen-suche"
        className="suchfeld suchfeld--datum"
        type="search"
        placeholder="Camembert, Lachs, Kaffee …"
        value={begriff}
        onChange={(ereignis) => setBegriff(ereignis.target.value)}
        autoFocus
        autoComplete="off"
        spellCheck={false}
      />

      {gesucht && treffer.length > 0 && (
        <ul className="liste">
          {treffer.slice(0, MAX_TREFFER).map((eintrag) => (
            <li key={eintrag.id}>
              <button type="button" onClick={() => onZuordnen(eintrag.id)}>
                <span>{eintrag.name}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M6 3.5 L10.5 8 L6 12.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="liste__pfeil"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {gesucht && treffer.length === 0 && (
        <p className="uebersicht__hinweis">
          Nichts gefunden. Dieses Produkt ist im Katalog nicht hinterlegt — im Zweifel
          die Hebamme fragen.
        </p>
      )}

      <button className="zurueck zurueck--flaeche" type="button" onClick={onAbbruch}>
        Abbrechen
      </button>
    </section>
  )
}
