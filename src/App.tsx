import { useMemo, useState } from 'react'
import { AMPEL, BELIEBT } from './ampel'
import { lebensmittelKatalog, regelKatalog } from './daten'
import { bewerteLebensmittel } from './engine/bewerten'
import { findeNachId, MINDESTLAENGE, suche } from './engine/suchen'
import { GEBURTSTERMIN } from './konfig'
import { berechneStand } from './schwangerschaft'
import { Ergebniskarte } from './Ergebniskarte'
import { Fusszeile } from './Fusszeile'

export function App() {
  const [begriff, setBegriff] = useState('')
  const [offeneId, setOffeneId] = useState<string | null>(null)

  const stand = useMemo(() => berechneStand(GEBURTSTERMIN, new Date()), [])
  const treffer = useMemo(() => suche(begriff, lebensmittelKatalog), [begriff])

  const offen = offeneId ? findeNachId(offeneId, lebensmittelKatalog) : undefined
  const urteil = offen ? bewerteLebensmittel(offen, regelKatalog, stand.trimester) : undefined

  const zuruecksetzen = () => {
    setBegriff('')
    setOffeneId(null)
  }

  const gesucht = begriff.trim().length >= MINDESTLAENGE

  return (
    <div className="app">
      <header className="kopfzeile">
        <h1 className="kopfzeile__titel">Darf ich das essen?</h1>
        <p className="kopfzeile__stand">
          <span className="kopfzeile__woche">Woche {stand.anzeige}</span>
          <span className="kopfzeile__trimester">{stand.trimester}. Trimester</span>
          {stand.tageBis > 0 && (
            <span className="kopfzeile__tage">noch {stand.tageBis} Tage</span>
          )}
        </p>
      </header>

      <main className="inhalt">
        {urteil ? (
          <>
            <Ergebniskarte urteil={urteil} />
            <button className="zurueck" type="button" onClick={zuruecksetzen}>
              Neue Suche
            </button>
          </>
        ) : (
          <>
            <label className="feldtitel" htmlFor="suche">
              Lebensmittel eingeben
            </label>
            <input
              id="suche"
              className="suchfeld"
              type="search"
              placeholder="Camembert, Lachs, Kaffee …"
              value={begriff}
              onChange={(ereignis) => setBegriff(ereignis.target.value)}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />

            {!gesucht && (
              <div className="chips">
                {BELIEBT.map((eintrag) => (
                  <button
                    key={eintrag}
                    className="chip"
                    type="button"
                    onClick={() => setBegriff(eintrag)}
                  >
                    {eintrag}
                  </button>
                ))}
              </div>
            )}

            {gesucht && treffer.length > 0 && (
              <ul className="liste">
                {treffer.map((eintrag) => (
                  <li key={eintrag.id}>
                    <button type="button" onClick={() => setOffeneId(eintrag.id)}>
                      {eintrag.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Nulltreffer: nicht raten, sondern sagen, dass nichts hinterlegt ist. */}
            {gesucht && treffer.length === 0 && (
              <div className="karte" role="status">
                <span
                  className="urteil"
                  style={{ color: AMPEL.unklar.farbe, background: AMPEL.unklar.flaeche }}
                >
                  {AMPEL.unklar.wort}
                </span>
                <p className="text">
                  Zu «{begriff.trim()}» ist hier nichts geprüft hinterlegt. Statt zu raten: im
                  Zweifel kurz die Hebamme fragen.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Fusszeile />
    </div>
  )
}
