import { useEffect, useMemo, useState } from 'react'
import { lebensmittelKatalog, regelKatalog } from './daten'
import { bewerteLebensmittel } from './engine/bewerten'
import { holeProdukt, type Produkt } from './engine/produktsuche'
import {
  eindeutigerVorschlag,
  findeNachId,
  MAX_TREFFER,
  MINDESTLAENGE,
  suche,
  vorschlaegeAusName,
} from './engine/suchen'
import { Ergebniskarte } from './Ergebniskarte'
import type { Lebensmittel } from './typen'

type Stand = 'laeuft' | 'urteil' | 'auswahl' | 'ohne'

/**
 * Was nach einem gelesenen Strichcode passiert: nachschlagen, und wenn der
 * Produktname eindeutig auf einen Katalogeintrag zeigt, sofort das Urteil.
 *
 * Ist er es nicht, kommt die Auswahl. Ohne zu wissen, wovon die Rede ist,
 * lässt sich keine Einschätzung zeigen — und geraten wird nicht.
 */
export function Scanergebnis({
  ean,
  trimester,
  onNeuScannen,
  onZurSuche,
}: {
  ean: string
  trimester?: number
  onNeuScannen: () => void
  onZurSuche: () => void
}) {
  const [stand, setStand] = useState<Stand>('laeuft')
  const [produkt, setProdukt] = useState<Produkt | null>(null)
  const [gewaehlt, setGewaehlt] = useState<Lebensmittel | null>(null)
  const [begriff, setBegriff] = useState('')

  useEffect(() => {
    const steuerung = new AbortController()
    setStand('laeuft')
    setGewaehlt(null)
    setBegriff('')

    holeProdukt(ean, steuerung.signal).then((gefunden) => {
      if (steuerung.signal.aborted) return
      setProdukt(gefunden)
      if (!gefunden) {
        setStand('ohne')
        return
      }
      const eindeutig = eindeutigerVorschlag(gefunden.name, lebensmittelKatalog)
      if (eindeutig) {
        setGewaehlt(eindeutig)
        setStand('urteil')
      } else {
        setStand('auswahl')
      }
    })
    return () => steuerung.abort()
  }, [ean])

  const urteil = useMemo(
    () => (gewaehlt ? bewerteLebensmittel(gewaehlt, regelKatalog, trimester) : null),
    [gewaehlt, trimester],
  )

  const vorschlaege = useMemo(
    () => (produkt ? vorschlaegeAusName(produkt.name, lebensmittelKatalog) : []),
    [produkt],
  )
  const eigene = useMemo(() => suche(begriff, lebensmittelKatalog), [begriff])
  const gesucht = begriff.trim().length >= MINDESTLAENGE
  const liste = gesucht ? eigene.slice(0, MAX_TREFFER) : vorschlaege

  const waehlen = (id: string) => {
    const eintrag = findeNachId(id, lebensmittelKatalog)
    if (!eintrag) return
    setGewaehlt(eintrag)
    setStand('urteil')
    window.scrollTo({ top: 0 })
  }

  if (stand === 'laeuft') {
    return (
      <section className="scanstand" aria-live="polite">
        <p className="scanstand__code">{ean}</p>
        <p className="scanstand__text">Wird nachgeschlagen …</p>
      </section>
    )
  }

  if (stand === 'urteil' && urteil) {
    return (
      <>
        {produkt && (
          <p className="scan-quelle">
            Gescannt: <strong>{produkt.name}</strong>
            {produkt.marke && <span> · {produkt.marke}</span>}
          </p>
        )}
        <Ergebniskarte urteil={urteil} />
        <div className="scan-knoepfe">
          <button className="zurueck zurueck--flaeche" type="button" onClick={onNeuScannen}>
            Nochmal scannen
          </button>
          <button className="zurueck" type="button" onClick={() => setStand('auswahl')}>
            Anderes Lebensmittel
          </button>
        </div>
      </>
    )
  }

  return (
    <section aria-labelledby="scan-titel">
      <h2 className="abschnitt__titel" id="scan-titel">
        {stand === 'ohne' ? 'Produkt nicht gefunden' : 'Welches trifft zu?'}
      </h2>
      <p className="abschnitt__hinweis">
        {stand === 'ohne' ? (
          <>
            Zum Code <span className="zuordnen__code">{ean}</span> liefert die Datenbank nichts
            — oder es fehlt gerade das Netz. Suche das Lebensmittel von Hand.
          </>
        ) : (
          <>
            Gescannt wurde <strong>{produkt?.name}</strong>. Der Name passt auf mehrere Einträge,
            deshalb entscheidest du.
          </>
        )}
      </p>

      <label className="feldtitel" htmlFor="scan-suche">
        {vorschlaege.length > 0 && !gesucht ? 'Oder selbst suchen' : 'Lebensmittel suchen'}
      </label>
      <input
        id="scan-suche"
        className="suchfeld suchfeld--datum"
        type="search"
        placeholder="Camembert, Lachs, Kaffee …"
        value={begriff}
        onChange={(ereignis) => setBegriff(ereignis.target.value)}
        autoComplete="off"
        spellCheck={false}
      />

      {liste.length > 0 && (
        <ul className="liste">
          {liste.map((eintrag) => (
            <li key={eintrag.id}>
              <button type="button" onClick={() => waehlen(eintrag.id)}>
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

      {gesucht && eigene.length === 0 && (
        <p className="abschnitt__hinweis">
          Nichts gefunden. Dieses Produkt ist im Katalog nicht hinterlegt — im Zweifel die
          Hebamme fragen.
        </p>
      )}

      <div className="scan-knoepfe">
        <button className="zurueck zurueck--flaeche" type="button" onClick={onNeuScannen}>
          Nochmal scannen
        </button>
        <button className="zurueck" type="button" onClick={onZurSuche}>
          Zur Suche
        </button>
      </div>
    </section>
  )
}
