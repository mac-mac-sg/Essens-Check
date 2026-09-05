import { useEffect, useMemo, useState } from 'react'
import { lebensmittelKatalog } from './daten'
import { holeProdukt, type Produkt } from './engine/produktsuche'
import { MAX_TREFFER, MINDESTLAENGE, suche, vorschlaegeAusName } from './engine/suchen'
import type { Lebensmittel } from './typen'

type Nachschlag = 'laeuft' | 'gefunden' | 'ohne'

/**
 * Ein unbekannter Strichcode wird einmal einem Eintrag zugeordnet, danach
 * erkennt die App ihn ohne Nachfrage.
 *
 * Der Produktname aus der Datenbank füllt dabei nur die Vorschläge — welcher
 * Eintrag gemeint ist, bestätigt sie. Ein fremder Name darf keine Freigabe
 * auslösen.
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
  const [nachschlag, setNachschlag] = useState<Nachschlag>('laeuft')
  const [produkt, setProdukt] = useState<Produkt | null>(null)

  useEffect(() => {
    const steuerung = new AbortController()
    holeProdukt(ean, steuerung.signal).then((gefunden) => {
      if (steuerung.signal.aborted) return
      setProdukt(gefunden)
      setNachschlag(gefunden ? 'gefunden' : 'ohne')
    })
    return () => steuerung.abort()
  }, [ean])

  const eigeneTreffer = useMemo(() => suche(begriff, lebensmittelKatalog), [begriff])
  const vorschlaege = useMemo(
    () => (produkt ? vorschlaegeAusName(produkt.name, lebensmittelKatalog) : []),
    [produkt],
  )

  const gesucht = begriff.trim().length >= MINDESTLAENGE
  const liste: Lebensmittel[] = gesucht ? eigeneTreffer.slice(0, MAX_TREFFER) : vorschlaege

  return (
    <section aria-labelledby="zuordnen-titel">
      <h2 className="uebersicht__titel" id="zuordnen-titel">
        Noch nicht zugeordnet
      </h2>
      <p className="uebersicht__hinweis">
        Der Code <span className="zuordnen__code">{ean}</span> ist neu. Ordne ihn einmal
        zu — ab dann wird er sofort erkannt.
      </p>

      {nachschlag === 'laeuft' && <p className="zuordnen__stand">Datenbank wird abgefragt …</p>}

      {nachschlag === 'gefunden' && produkt && (
        <div className="zuordnen__fund">
          <p className="zuordnen__fundname">
            {produkt.name}
            {produkt.marke && <span className="zuordnen__marke">{produkt.marke}</span>}
          </p>
          <p className="zuordnen__pruefen">
            Aus der Produktdatenbank. Bitte selbst prüfen, welcher Eintrag zutrifft.
          </p>
        </div>
      )}

      {nachschlag === 'ohne' && (
        <p className="zuordnen__stand">
          In der Produktdatenbank nicht gefunden — oder gerade kein Netz. Suche es von Hand.
        </p>
      )}

      <label className="feldtitel" htmlFor="zuordnen-suche">
        {gesucht || vorschlaege.length === 0 ? 'Lebensmittel suchen' : 'Oder selbst suchen'}
      </label>
      <input
        id="zuordnen-suche"
        className="suchfeld suchfeld--datum"
        type="search"
        placeholder="Camembert, Lachs, Kaffee …"
        value={begriff}
        onChange={(ereignis) => setBegriff(ereignis.target.value)}
        autoComplete="off"
        spellCheck={false}
      />

      {!gesucht && vorschlaege.length > 0 && (
        <p className="zuordnen__vorschlagtitel">Passt eines davon?</p>
      )}

      {liste.length > 0 && (
        <ul className="liste">
          {liste.map((eintrag) => (
            <li key={eintrag.id}>
              <button type="button" onClick={() => onZuordnen(eintrag.id)}>
                <span>{eintrag.name}</span>
                <svg
                  className="liste__pfeil"
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
              </button>
            </li>
          ))}
        </ul>
      )}

      {gesucht && eigeneTreffer.length === 0 && (
        <p className="uebersicht__hinweis">
          Nichts gefunden. Dieses Produkt ist im Katalog nicht hinterlegt — im Zweifel die
          Hebamme fragen.
        </p>
      )}

      <button className="zurueck zurueck--flaeche" type="button" onClick={onAbbruch}>
        Abbrechen
      </button>
    </section>
  )
}
