import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { lebensmittelKatalog, regelKatalog } from './daten'
import { bewerteLebensmittel } from './engine/bewerten'
import { findeNachId, kompositumVorschlaege, MINDESTLAENGE, suche } from './engine/suchen'
import { leseGeburtstermin } from './konfig'
import {
  ermittleSchema,
  leseWunsch,
  speichereWunsch,
  wendeAn,
  type Wunsch,
} from './farbschema'
import { berechneStand, fortschritt, restAnzeige } from './schwangerschaft'
import { ergaenzt, leseVerlauf, speichereVerlauf } from './verlauf'
import { Ergebniskarte } from './Ergebniskarte'
import { Geburtstermin } from './Geburtstermin'
import { Scanergebnis } from './Scanergebnis'
import { Scanner } from './Scanner'
import { Sheet } from './Sheet'
import { Suchansicht } from './Suchansicht'
import { Uebersicht } from './Uebersicht'
import { Fusszeile } from './Fusszeile'
import { Navigation, type Ziel } from './Navigation'

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
  const [wunsch, setWunsch] = useState<Wunsch>(() => leseWunsch())
  /** Was zuletzt nachgeschlagen wurde. Bleibt auf dem Gerät. */
  const [verlauf, setVerlauf] = useState<string[]>(() => leseVerlauf())
  const [systemDunkel, setSystemDunkel] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
  )

  const kopf = useRef<HTMLElement>(null)

  const schema = ermittleSchema(wunsch, systemDunkel)

  /*
   * Die Suchleiste bleibt unter der Kopfzeile stehen, nicht darunter
   * verschwinden. Deren Höhe hängt am Text und am sicheren Bereich des Geräts
   * und lässt sich nicht als Zahl hinschreiben — also gemessen und als
   * Variable weitergereicht.
   */
  useEffect(() => {
    const element = kopf.current
    if (!element) return
    const messen = () =>
      document.documentElement.style.setProperty(
        '--kopf-hoehe',
        `${element.getBoundingClientRect().height}px`,
      )
    messen()
    if (typeof ResizeObserver === 'undefined') return
    const beobachter = new ResizeObserver(messen)
    beobachter.observe(element)
    return () => beobachter.disconnect()
  }, [])

  // Solange dem Gerät gefolgt wird, zieht ein Wechsel dort sofort nach.
  useEffect(() => {
    const abfrage = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!abfrage) return
    const beiWechsel = (ereignis: MediaQueryListEvent) => setSystemDunkel(ereignis.matches)
    abfrage.addEventListener('change', beiWechsel)
    return () => abfrage.removeEventListener('change', beiWechsel)
  }, [])

  useEffect(() => {
    wendeAn(schema)
  }, [schema])

  const waehleSchema = (neu: Wunsch) => {
    setWunsch(neu)
    speichereWunsch(neu)
  }

  // Ohne Termin bleibt die Wochenanzeige leer, statt eine falsche zu zeigen.
  const stand = useMemo(() => (termin ? berechneStand(termin, new Date()) : null), [termin])
  const treffer = useMemo(() => suche(begriff, lebensmittelKatalog), [begriff])
  // Nur wenn die Suche leer ausgeht: Katalogbegriffe, die im Suchwort stecken.
  const teilwort = useMemo(
    () => (treffer.length === 0 ? kompositumVorschlaege(begriff, lebensmittelKatalog) : []),
    [begriff, treffer.length],
  )

  const offen = offeneId ? findeNachId(offeneId, lebensmittelKatalog) : undefined
  const urteil = offen ? bewerteLebensmittel(offen, regelKatalog, stand?.trimester) : undefined

  const zumAnfang = () => {
    setBegriff('')
    setOffeneId(null)
    setCode(null)
    setHerkunft('suche')
    setAnsicht('suche')
  }

  /**
   * Ein Ziel aus der Leiste. Der Scanner bekommt jedes Mal einen frischen
   * Anlauf — sonst stünde nach der Rückkehr noch das Ergebnis des letzten
   * Codes da, obwohl gerade neu gescannt werden soll.
   */
  const zumZiel = (ziel: Ziel) => {
    setOffeneId(null)
    if (ziel === 'scanner') setCode(null)
    if (ziel === 'suche') setBegriff('')
    setHerkunft(ziel === 'uebersicht' ? 'uebersicht' : 'suche')
    setAnsicht(ziel)
  }

  /** Das Scanergebnis gehört zum Scanner, nicht zu einem vierten Ziel. */
  const aktivesZiel: Ziel = ansicht === 'scanergebnis' ? 'scanner' : ansicht

  // Kein Scrollen nach oben mehr: die Karte kommt als Blatt darüber, die
  // Trefferliste bleibt dahinter stehen. Zumachen führt dorthin zurück, wo
  // gerade gesucht wurde — nicht an den Anfang.
  const oeffnen = (id: string, woher: Ansicht) => {
    setOffeneId(id)
    setHerkunft(woher)
    // Gemerkt wird beim Öffnen, nicht beim Tippen: was tatsächlich
    // nachgeschlagen wurde, ist die Auskunft — nicht jede halbe Eingabe.
    setVerlauf((bisher) => {
      const neu = ergaenzt(bisher, id)
      speichereVerlauf(neu)
      return neu
    })
  }

  const verlaufLeeren = () => {
    setVerlauf([])
    speichereVerlauf([])
  }

  /** Ein gelesener Code wird sofort nachgeschlagen und bewertet. */
  const codeErkannt = (ean: string) => {
    setCode(ean)
    setAnsicht('scanergebnis')
  }

  const zurueck = () => {
    setOffeneId(null)
    setAnsicht(herkunft === 'uebersicht' ? 'uebersicht' : 'suche')
  }

  return (
    <div className="app">
      <header
        ref={kopf}
        className="kopfzeile"
        // Speist den Fortschrittsbalken an der Unterkante.
        style={stand ? ({ '--anteil': `${fortschritt(stand.tageBis) * 100}%` } as CSSProperties) : undefined}
      >
        <h1 className="kopfzeile__titel">Darf ich das essen?</h1>
        {stand ? (
          <button
            className="stand"
            type="button"
            onClick={() => setTerminBearbeiten(true)}
            aria-label={`Woche ${stand.anzeige}, ${stand.trimester}. Trimester, ${restAnzeige(
              stand.tageBis,
            )}. Geburtstermin ändern`}
          >
            <span className="stand__woche">{stand.anzeige}</span>
            <span className="stand__trenner" aria-hidden="true" />
            <span className="stand__rest">{restAnzeige(stand.tageBis)}</span>
          </button>
        ) : (
          <button
            className="stand stand--leer"
            type="button"
            onClick={() => setTerminBearbeiten(true)}
          >
            Termin eintragen
          </button>
        )}
      </header>

      <main className="inhalt">
        {ansicht === 'scanner' ? (
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
          <Uebersicht onOeffnen={(id) => oeffnen(id, 'uebersicht')} />
        ) : (
          <Suchansicht
            begriff={begriff}
            setBegriff={setBegriff}
            treffer={treffer}
            teilwort={teilwort}
            gesucht={begriff.trim().length >= MINDESTLAENGE}
            verlauf={verlauf}
            onOeffnen={(id) => oeffnen(id, 'suche')}
            onVerlaufLeeren={verlaufLeeren}
          />
        )}
      </main>

      {/*
        Der Termin ist eine geschlossene Aufgabe und gehört deshalb ins selbe
        Blatt wie das Detail. Vorher stand das Formular über der Startansicht
        und wurde vom Fokus im Suchfeld sofort aus dem Bild geschoben.
      */}
      {terminBearbeiten && (
        <Sheet titel="Geburtstermin" onSchliessen={() => setTerminBearbeiten(false)}>
          <Geburtstermin
            vorhanden={termin}
            onGespeichert={(datum) => {
              setTermin(datum)
              setTerminBearbeiten(false)
            }}
            onAbbruch={() => setTerminBearbeiten(false)}
          />
        </Sheet>
      )}

      {/* Das Blatt liegt über der Ansicht, aus der es geöffnet wurde. */}
      {urteil && (
        <Sheet
          titel={urteil.name}
          onSchliessen={zurueck}
          fussKnopf={herkunft === 'uebersicht' ? 'Zurück zur Übersicht' : 'Zurück zur Suche'}
        >
          <Ergebniskarte urteil={urteil} />
        </Sheet>
      )}

      <Fusszeile
        onTerminAendern={stand ? () => setTerminBearbeiten(true) : undefined}
        schema={schema}
        wunsch={wunsch}
        onWunsch={waehleSchema}
      />

      <Navigation aktiv={aktivesZiel} onWechsel={zumZiel} />
    </div>
  )
}
