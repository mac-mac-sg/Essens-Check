import { useMemo, useState } from 'react'
import { lebensmittelKatalog, regelKatalog } from './daten'
import { bewerteLebensmittel } from './engine/bewerten'
import { leseZuordnungen, merkeZuordnung, vergissZuordnung } from './engine/barcodes'
import { findeNachId, MINDESTLAENGE, suche } from './engine/suchen'
import { leseGeburtstermin, leseOnlineAbfrage, setzeOnlineAbfrage } from './konfig'
import { berechneStand } from './schwangerschaft'
import { Ergebniskarte } from './Ergebniskarte'
import { Geburtstermin } from './Geburtstermin'
import { Scanner } from './Scanner'
import { Suchansicht } from './Suchansicht'
import { Uebersicht } from './Uebersicht'
import { Zuordnen } from './Zuordnen'
import { Fusszeile } from './Fusszeile'

type Ansicht = 'suche' | 'uebersicht' | 'scanner' | 'zuordnen'

export function App() {
  const [ansicht, setAnsicht] = useState<Ansicht>('suche')
  const [begriff, setBegriff] = useState('')
  const [offeneId, setOffeneId] = useState<string | null>(null)
  /** Wohin der Rücksprung aus der Ergebniskarte führt. */
  const [herkunft, setHerkunft] = useState<Ansicht>('suche')
  /** Code, der die offene Karte gebracht hat — für «Zuordnung aufheben». */
  const [erkannterCode, setErkannterCode] = useState<string | null>(null)
  /** Noch nicht zugeordneter Code. */
  const [neuerCode, setNeuerCode] = useState<string | null>(null)
  const [termin, setTermin] = useState(() => leseGeburtstermin())
  const [terminBearbeiten, setTerminBearbeiten] = useState(false)
  const [onlineAbfrage, setOnlineAbfrage] = useState(() => leseOnlineAbfrage())

  const onlineUmschalten = (an: boolean) => {
    setzeOnlineAbfrage(an)
    setOnlineAbfrage(an)
  }

  // Ohne Termin bleibt die Wochenanzeige leer, statt eine falsche zu zeigen.
  const stand = useMemo(() => (termin ? berechneStand(termin, new Date()) : null), [termin])
  const treffer = useMemo(() => suche(begriff, lebensmittelKatalog), [begriff])

  const offen = offeneId ? findeNachId(offeneId, lebensmittelKatalog) : undefined
  const urteil = offen ? bewerteLebensmittel(offen, regelKatalog, stand?.trimester) : undefined

  const zumAnfang = () => {
    setBegriff('')
    setOffeneId(null)
    setErkannterCode(null)
    setNeuerCode(null)
    setHerkunft('suche')
    setAnsicht('suche')
  }

  const oeffnen = (id: string, woher: Ansicht) => {
    setOffeneId(id)
    setHerkunft(woher)
    window.scrollTo({ top: 0 })
  }

  /** Ein gelesener Code führt direkt zum Urteil — oder zur einmaligen Zuordnung. */
  const codeErkannt = (ean: string) => {
    const id = leseZuordnungen()[ean]
    const eintrag = id ? findeNachId(id, lebensmittelKatalog) : undefined
    if (eintrag) {
      setErkannterCode(ean)
      oeffnen(eintrag.id, 'scanner')
      setAnsicht('suche')
    } else {
      setNeuerCode(ean)
      setAnsicht('zuordnen')
    }
  }

  const zuordnen = (id: string) => {
    if (neuerCode) merkeZuordnung(neuerCode, id)
    setErkannterCode(neuerCode)
    setNeuerCode(null)
    oeffnen(id, 'scanner')
    setAnsicht('suche')
  }

  const zurueck = () => {
    setOffeneId(null)
    setErkannterCode(null)
    if (herkunft === 'uebersicht' || herkunft === 'scanner') setAnsicht(herkunft)
    else zumAnfang()
  }

  const rueckspruch =
    herkunft === 'uebersicht'
      ? 'Zurück zur Übersicht'
      : herkunft === 'scanner'
        ? 'Nochmal scannen'
        : 'Neue Suche'

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
            {erkannterCode && (
              <p className="scan-herkunft">
                Über Strichcode {erkannterCode} erkannt.{' '}
                <button
                  type="button"
                  onClick={() => {
                    vergissZuordnung(erkannterCode)
                    setErkannterCode(null)
                  }}
                >
                  Zuordnung aufheben
                </button>
              </p>
            )}
            <button className="zurueck zurueck--flaeche" type="button" onClick={zurueck}>
              {rueckspruch}
            </button>
          </>
        ) : ansicht === 'scanner' ? (
          <Scanner
            onErkannt={codeErkannt}
            onAbbruch={zumAnfang}
            onlineAbfrage={onlineAbfrage}
            onOnlineAendern={onlineUmschalten}
          />
        ) : ansicht === 'zuordnen' && neuerCode ? (
          <Zuordnen
            ean={neuerCode}
            onlineAbfrage={onlineAbfrage}
            onOnlineAendern={onlineUmschalten}
            onZuordnen={zuordnen}
            onAbbruch={zumAnfang}
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
