import { useMemo, useState } from 'react'
import { lebensmittelKatalog, regelKatalog } from './daten'
import { bewerteLebensmittel } from './engine/bewerten'
import { findeNachId, MINDESTLAENGE, suche } from './engine/suchen'
import { leseGeburtstermin } from './konfig'
import { berechneStand } from './schwangerschaft'
import { Ergebniskarte } from './Ergebniskarte'
import { Geburtstermin } from './Geburtstermin'
import { Scanergebnis } from './Scanergebnis'
import { Scanner } from './Scanner'
import { Suchansicht } from './Suchansicht'
import { Uebersicht } from './Uebersicht'
import { Fusszeile } from './Fusszeile'

type Ansicht = 'suche' | 'uebersicht' | 'scanner' | 'scanergebnis'

export function App() {
  const [ansicht, setAnsicht] = useState<Ansicht>('suche')
  const [begriff, setBegriff] = useState('')
  const [offeneId, setOffeneId] = useState<string | null>(null)
  /** Wohin der Rücksprung aus der Ergebniskarte führt. */
  const [herkunft, setHerkunft] = useState<Ansicht>('suche')
  /** Zuletzt gelesener Strichcode. */
  const [code, setCode] = useState<string | null>(null)
  const [termin, setTermin] = useState(() => leseGeburtstermin())
  const [terminBearbeiten, setTerminBearbeiten] = useState(false)

  // Ohne Termin bleibt die Wochenanzeige leer, statt eine falsche zu zeigen.
  const stand = useMemo(() => (termin ? berechneStand(termin, new Date()) : null), [termin])
  const treffer = useMemo(() => suche(begriff, lebensmittelKatalog), [begriff])

  const offen = offeneId ? findeNachId(offeneId, lebensmittelKatalog) : undefined
  const urteil = offen ? bewerteLebensmittel(offen, regelKatalog, stand?.trimester) : undefined

  const zumAnfang = () => {
    setBegriff('')
    setOffeneId(null)
    setCode(null)
    setHerkunft('suche')
    setAnsicht('suche')
  }

  const oeffnen = (id: string, woher: Ansicht) => {
    setOffeneId(id)
    setHerkunft(woher)
    window.scrollTo({ top: 0 })
  }

  /** Ein gelesener Code wird sofort nachgeschlagen und bewertet. */
  const codeErkannt = (ean: string) => {
    setCode(ean)
    setAnsicht('scanergebnis')
  }

  const zurueck = () => {
    setOffeneId(null)
    if (herkunft === 'uebersicht') setAnsicht('uebersicht')
    else zumAnfang()
  }

  return (
    <div className="app">
      <header className="kopfzeile">
        <h1 className="kopfzeile__titel">Darf ich das essen?</h1>
        {stand ? (
          <p className="kopfzeile__stand">
            <span className="kopfzeile__woche">Woche {stand.anzeige}</span>
            <span className="kopfzeile__trimester">{stand.trimester}. Trimester</span>
            {stand.tageBis > 0 && <span className="kopfzeile__tage">noch {stand.tageBis} Tage</span>}
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
            <button className="zurueck zurueck--flaeche" type="button" onClick={zurueck}>
              {herkunft === 'uebersicht' ? 'Zurück zur Übersicht' : 'Neue Suche'}
            </button>
          </>
        ) : ansicht === 'scanner' ? (
          <Scanner onErkannt={codeErkannt} onAbbruch={zumAnfang} />
        ) : ansicht === 'scanergebnis' && code ? (
          <Scanergebnis
            ean={code}
            {...(stand ? { trimester: stand.trimester } : {})}
            onNeuScannen={() => {
              setCode(null)
              setAnsicht('scanner')
            }}
            onZurSuche={zumAnfang}
          />
        ) : ansicht === 'uebersicht' ? (
          <>
            <Uebersicht onOeffnen={(id) => oeffnen(id, 'uebersicht')} />
            <button className="zurueck zurueck--flaeche" type="button" onClick={zumAnfang}>
              Zurück zur Suche
            </button>
          </>
        ) : (
          <Suchansicht
            begriff={begriff}
            setBegriff={setBegriff}
            treffer={treffer}
            gesucht={begriff.trim().length >= MINDESTLAENGE}
            onOeffnen={(id) => oeffnen(id, 'suche')}
            onUebersicht={() => setAnsicht('uebersicht')}
            onScannen={() => setAnsicht('scanner')}
          />
        )}
      </main>

      <Fusszeile onTerminAendern={stand ? () => setTerminBearbeiten(true) : undefined} />
    </div>
  )
}
