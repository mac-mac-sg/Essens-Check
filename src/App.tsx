import { useMemo, useState } from 'react'
import { AMPEL, BELIEBT } from './ampel'
import { lebensmittelKatalog, regelKatalog } from './daten'
import { bewerteLebensmittel } from './engine/bewerten'
import { findeNachId, MAX_TREFFER, MINDESTLAENGE, suche } from './engine/suchen'
import { leseGeburtstermin } from './konfig'
import { berechneStand } from './schwangerschaft'
import { Ergebniskarte } from './Ergebniskarte'
import { Geburtstermin } from './Geburtstermin'
import { Fusszeile } from './Fusszeile'

export function App() {
  const [begriff, setBegriff] = useState('')
  const [offeneId, setOffeneId] = useState<string | null>(null)
  const [termin, setTermin] = useState(() => leseGeburtstermin())
  const [terminBearbeiten, setTerminBearbeiten] = useState(false)

  // Ohne Termin bleibt die Wochenanzeige leer, statt eine falsche zu zeigen.
  const stand = useMemo(() => (termin ? berechneStand(termin, new Date()) : null), [termin])
  const treffer = useMemo(() => suche(begriff, lebensmittelKatalog), [begriff])

  const offen = offeneId ? findeNachId(offeneId, lebensmittelKatalog) : undefined
  const urteil = offen ? bewerteLebensmittel(offen, regelKatalog, stand?.trimester) : undefined

  const zuruecksetzen = () => {
    setBegriff('')
    setOffeneId(null)
  }

  const gesucht = begriff.trim().length >= MINDESTLAENGE
  // Lange Listen sind auf dem Handy unbrauchbar. Es wird nichts weggelassen,
  // nur später gezeigt — der Hinweis darunter sagt, wie viele noch folgen.
  const sichtbar = treffer.slice(0, MAX_TREFFER)
  const weitere = treffer.length - sichtbar.length

  return (
    <div className="app">
      <header className="kopfzeile">
        <h1 className="kopfzeile__titel">Darf ich das essen?</h1>
        {stand ? (
          <p className="kopfzeile__stand">
            <span className="kopfzeile__woche">Woche {stand.anzeige}</span>
            <span className="kopfzeile__trimester">{stand.trimester}. Trimester</span>
            {stand.tageBis > 0 && (
              <span className="kopfzeile__tage">noch {stand.tageBis} Tage</span>
            )}
          </p>
        ) : (
          <button
            className="kopfzeile__eintragen"
            type="button"
            onClick={() => setTerminBearbeiten(true)}
          >
            Termin eintragen
          </button>
        )}
      </header>

      <main className="inhalt">
        {terminBearbeiten && (
          <Geburtstermin
            vorhanden={termin}
            onGespeichert={(datum) => {
              setTermin(datum)
              setTerminBearbeiten(false)
            }}
            onAbbruch={() => setTerminBearbeiten(false)}
          />
        )}

        {urteil ? (
          <>
            <Ergebniskarte urteil={urteil} />
            <button className="zurueck zurueck--flaeche" type="button" onClick={zuruecksetzen}>
              Neue Suche
            </button>
          </>
        ) : (
          <>
            <label className="feldtitel" htmlFor="suche">
              Lebensmittel eingeben
            </label>
            <div className="suchfeld-huelle">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
                <path d="M13.5 13.5 L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
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
              {begriff.length > 0 && (
                <button
                  className="suchfeld-loeschen"
                  type="button"
                  aria-label="Suche leeren"
                  onClick={() => {
                    setBegriff('')
                    document.getElementById('suche')?.focus()
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M4 4 L12 12 M12 4 L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>

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
              <>
                <ul className="liste">
                  {sichtbar.map((eintrag) => (
                    <li key={eintrag.id}>
                      <button type="button" onClick={() => setOffeneId(eintrag.id)}>
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
                {weitere > 0 && (
                  <p className="weitere">
                    {weitere} weitere Treffer — Suchbegriff verfeinern.
                  </p>
                )}
              </>
            )}

            {/* Nulltreffer: nicht raten, sondern sagen, dass nichts hinterlegt ist. */}
            {gesucht && treffer.length === 0 && (
              <div className="karte karte--ergebnis" role="status">
                <span className="urteil" data-status="unklar">
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

      <Fusszeile
        onTerminAendern={stand ? () => setTerminBearbeiten(true) : undefined}
      />
    </div>
  )
}
