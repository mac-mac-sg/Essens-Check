import { useEffect, useMemo, useState } from 'react'
import { AlltagDetail } from './AlltagDetail'
import { findeAlltag } from './alltag/daten'
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
import { sternzeichenFuerDatum } from './sternzeichen'
import { ergaenzt, leseVerlauf, speichereVerlauf } from './verlauf'
import { Einstellungen } from './Einstellungen'
import { Ergebniskarte } from './Ergebniskarte'
import { Geburtstermin } from './Geburtstermin'
import { MedikamentDetail } from './MedikamentDetail'
import { findeMedikament } from './medikamente/daten'
import { findeMedikamentProduktNachGtin } from './medikamente/produkte'
import { findeMedikamentProdukt } from './medikamente/suche'
import { Scanergebnis } from './Scanergebnis'
import { Scanner } from './Scanner'
import { Sheet } from './Sheet'
import { SituativesWissen } from './SituativesWissen'
import { Suchansicht, type Suchbereich } from './Suchansicht'
import { Uebersicht } from './Uebersicht'
import { Fusszeile } from './Fusszeile'
import { Navigation, type Ziel } from './Navigation'

type Ansicht = 'suche' | 'uebersicht' | 'wissen' | 'scanner' | 'scanergebnis'

interface Installationsaufforderung extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt: () => Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: Installationsaufforderung
    appinstalled: Event
  }
}

function Zahnrad() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M10 2.7v1.4M10 15.9v1.4M17.3 10h-1.4M4.1 10H2.7M15.15 4.85l-.98.98M5.83 14.17l-.98.98M15.15 15.15l-.98-.98M5.83 5.83l-.98-.98"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Markenlogo() {
  return (
    <img
      className="kopfzeile__logo"
      src={`${import.meta.env.BASE_URL}icon.svg`}
      alt=""
      aria-hidden="true"
    />
  )
}

export function App() {
  const [ansicht, setAnsicht] = useState<Ansicht>('suche')
  const [suchbereich, setSuchbereich] = useState<Suchbereich>('lebensmittel')
  const [begriff, setBegriff] = useState('')
  const [offeneId, setOffeneId] = useState<string | null>(null)
  const [medikamentProduktId, setMedikamentProduktId] = useState<string | null>(null)
  const [medikamentWirkstoffId, setMedikamentWirkstoffId] = useState<string | null>(null)
  const [alltagId, setAlltagId] = useState<string | null>(null)
  /** Wohin der Rücksprung aus der Ergebniskarte führt. */
  const [herkunft, setHerkunft] = useState<Ansicht>('suche')
  /** Zuletzt gelesener Strichcode. */
  const [code, setCode] = useState<string | null>(null)
  const [termin, setTermin] = useState(() => leseGeburtstermin())
  const [terminBearbeiten, setTerminBearbeiten] = useState(false)
  const [einstellungenOffen, setEinstellungenOffen] = useState(false)
  const [wunsch, setWunsch] = useState<Wunsch>(() => leseWunsch())
  /** Was zuletzt nachgeschlagen wurde. Bleibt auf dem Gerät. */
  const [verlauf, setVerlauf] = useState<string[]>(() => leseVerlauf())
  const [systemDunkel, setSystemDunkel] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
  )
  const [installationsaufforderung, setInstallationsaufforderung] =
    useState<Installationsaufforderung | null>(null)
  const [installiert, setInstalliert] = useState(
    () => window.matchMedia?.('(display-mode: standalone)').matches ?? false,
  )

  const schema = ermittleSchema(wunsch, systemDunkel)

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

  useEffect(() => {
    const beiInstallierbar = (ereignis: Installationsaufforderung) => {
      ereignis.preventDefault()
      setInstallationsaufforderung(ereignis)
    }
    const beiInstalliert = () => {
      setInstalliert(true)
      setInstallationsaufforderung(null)
    }

    window.addEventListener('beforeinstallprompt', beiInstallierbar)
    window.addEventListener('appinstalled', beiInstalliert)
    return () => {
      window.removeEventListener('beforeinstallprompt', beiInstallierbar)
      window.removeEventListener('appinstalled', beiInstalliert)
    }
  }, [])

  const waehleSchema = (neu: Wunsch) => {
    setWunsch(neu)
    speichereWunsch(neu)
  }

  const appInstallieren = async () => {
    if (!installationsaufforderung) return
    await installationsaufforderung.prompt()
    await installationsaufforderung.userChoice
    setInstallationsaufforderung(null)
  }

  const stand = useMemo(() => (termin ? berechneStand(termin, new Date()) : null), [termin])
  const sternzeichen = useMemo(() => (termin ? sternzeichenFuerDatum(termin) : null), [termin])
  const treffer = useMemo(() => suche(begriff, lebensmittelKatalog), [begriff])
  const teilwort = useMemo(
    () => (treffer.length === 0 ? kompositumVorschlaege(begriff, lebensmittelKatalog) : []),
    [begriff, treffer.length],
  )

  const offen = offeneId ? findeNachId(offeneId, lebensmittelKatalog) : undefined
  const urteil = offen ? bewerteLebensmittel(offen, regelKatalog, stand?.trimester) : undefined
  const medikamentProdukt = medikamentProduktId
    ? findeMedikamentProdukt(medikamentProduktId)
    : null
  const medikamentWirkstoff = medikamentWirkstoffId
    ? findeMedikament(medikamentWirkstoffId)
    : null
  const alltag = alltagId ? findeAlltag(alltagId) : null

  const medikamentSchliessen = () => {
    setMedikamentProduktId(null)
    setMedikamentWirkstoffId(null)
  }

  const detailsSchliessen = () => {
    setOffeneId(null)
    medikamentSchliessen()
    setAlltagId(null)
  }

  const zumAnfang = () => {
    setBegriff('')
    detailsSchliessen()
    setCode(null)
    setHerkunft('suche')
    setAnsicht('suche')
  }

  const zumZiel = (ziel: Ziel) => {
    detailsSchliessen()
    if (ziel === 'scanner') setCode(null)
    if (ziel === 'suche') setBegriff('')
    setHerkunft(ziel === 'uebersicht' ? 'uebersicht' : 'suche')
    setAnsicht(ziel)
  }

  const aktivesZiel: Ziel = ansicht === 'scanergebnis' ? 'scanner' : ansicht

  const oeffnen = (id: string, woher: Ansicht) => {
    medikamentSchliessen()
    setAlltagId(null)
    setOffeneId(id)
    setHerkunft(woher)
    setVerlauf((bisher) => {
      const neu = ergaenzt(bisher, id)
      speichereVerlauf(neu)
      return neu
    })
  }

  const medikamentProduktOeffnen = (id: string) => {
    setOffeneId(null)
    setAlltagId(null)
    setMedikamentWirkstoffId(null)
    setMedikamentProduktId(id)
  }

  const medikamentWirkstoffOeffnen = (id: string) => {
    setOffeneId(null)
    setAlltagId(null)
    setMedikamentProduktId(null)
    setMedikamentWirkstoffId(id)
  }

  const alltagOeffnen = (id: string) => {
    setOffeneId(null)
    medikamentSchliessen()
    setAlltagId(id)
  }

  const suchbereichWechseln = (neu: Suchbereich) => {
    if (neu === suchbereich) return
    setSuchbereich(neu)
    setBegriff('')
    detailsSchliessen()
  }

  const verlaufLeeren = () => {
    setVerlauf([])
    speichereVerlauf([])
  }

  const codeErkannt = (ean: string) => {
    detailsSchliessen()
    const medikament = findeMedikamentProduktNachGtin(ean)
    if (medikament) {
      setCode(null)
      setMedikamentProduktId(medikament.id)
      setAnsicht('scanner')
      return
    }
    setCode(ean)
    setAnsicht('scanergebnis')
  }

  const zurueck = () => {
    setOffeneId(null)
    setAnsicht(herkunft === 'uebersicht' ? 'uebersicht' : 'suche')
  }

  const ausWissenPruefen = (suchwort: string) => {
    detailsSchliessen()
    setCode(null)
    setSuchbereich('lebensmittel')
    setBegriff(suchwort)
    setHerkunft('suche')
    setAnsicht('suche')
  }

  const ausWissenAlltag = () => {
    detailsSchliessen()
    setCode(null)
    setSuchbereich('alltag')
    setBegriff('')
    setHerkunft('suche')
    setAnsicht('suche')
  }

  const schwangerschaftsKarte = stand ? (
    <button
      className="stand stand--hero"
      type="button"
      onClick={() => setTerminBearbeiten(true)}
      aria-label={`SSW ${stand.anzeige}, ${stand.trimester}. Trimester, ${restAnzeige(
        stand.tageBis,
      )}${sternzeichen ? `, voraussichtliches Sternzeichen ${sternzeichen.name}` : ''}. Geburtstermin ändern`}
    >
      <span className="stand__kopf">
        <span className="stand__woche">SSW {stand.anzeige}</span>
        <span className="stand__trimester">{stand.trimester}. Trimester</span>
        <span className="stand__rechts">
          <span className="stand__rest">{restAnzeige(stand.tageBis)}</span>
          {sternzeichen && (
            <span
              className="stand__sternzeichen"
              aria-hidden="true"
              title={`Voraussichtliches Sternzeichen: ${sternzeichen.name}`}
            >
              {sternzeichen.symbol}
            </span>
          )}
        </span>
      </span>
      <span className="stand__fortschritt" aria-hidden="true">
        <span style={{ width: `${fortschritt(stand.tageBis) * 100}%` }} />
      </span>
    </button>
  ) : (
    <button
      className="stand stand--hero stand--leer"
      type="button"
      onClick={() => setTerminBearbeiten(true)}
    >
      <span className="stand__leer-titel">Schwangerschaft einrichten</span>
      <span className="stand__leer-text">Geburtstermin eintragen und SSW anzeigen</span>
    </button>
  )

  const einstellungenKnopf = (
    <button
      className="einstellungen-knopf"
      type="button"
      aria-label="Einstellungen öffnen"
      onClick={() => setEinstellungenOffen(true)}
    >
      <Zahnrad />
    </button>
  )

  return (
    <div className="app">
      <header className={`kopfzeile ${ansicht === 'suche' ? 'kopfzeile--suche' : ''}`}>
        {ansicht === 'suche' ? (
          <>
            <div className="kopfzeile__suche-kopf">
              <Markenlogo />
              {einstellungenKnopf}
            </div>
            <div className="kopfzeile__marke">
              <h1 className="kopfzeile__titel">Darf ich das?</h1>
              <p className="kopfzeile__unter">Lebensmittel, Medikamente & Alltag in der Schwangerschaft</p>
            </div>
            {schwangerschaftsKarte}
          </>
        ) : (
          <div className="kopfzeile__kompakt">
            <Markenlogo />
            <div className="kopfzeile__marke">
              <h1 className="kopfzeile__titel">Darf ich das?</h1>
              <p className="kopfzeile__unter">Lebensmittel, Medikamente & Alltag in der Schwangerschaft</p>
            </div>
            {einstellungenKnopf}
          </div>
        )}
      </header>

      <main className={`inhalt ${ansicht === 'suche' ? 'inhalt--suche' : ''}`}>
        {ansicht === 'wissen' ? (
          <SituativesWissen
            onPruefen={ausWissenPruefen}
            onAlltag={ausWissenAlltag}
            {...(stand ? { sswAnzeige: stand.anzeige, trimester: stand.trimester } : {})}
          />
        ) : ansicht === 'scanner' ? (
          <Scanner onErkannt={codeErkannt} onAbbruch={zumAnfang} />
        ) : ansicht === 'scanergebnis' && code ? (
          <Scanergebnis
            ean={code}
            {...(stand
              ? { trimester: stand.trimester, ssw: stand.woche, sswAnzeige: stand.anzeige }
              : {})}
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
            bereich={suchbereich}
            onBereichWechsel={suchbereichWechseln}
            begriff={begriff}
            setBegriff={setBegriff}
            treffer={treffer}
            teilwort={teilwort}
            gesucht={begriff.trim().length >= MINDESTLAENGE}
            verlauf={verlauf}
            onOeffnen={(id) => oeffnen(id, 'suche')}
            onVerlaufLeeren={verlaufLeeren}
            onMedikamentProduktOeffnen={medikamentProduktOeffnen}
            onMedikamentWirkstoffOeffnen={medikamentWirkstoffOeffnen}
            onAlltagOeffnen={alltagOeffnen}
          />
        )}
      </main>

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

      {einstellungenOffen && (
        <Sheet titel="Einstellungen" onSchliessen={() => setEinstellungenOffen(false)}>
          <Einstellungen
            termin={termin}
            schema={schema}
            wunsch={wunsch}
            installierbar={Boolean(installationsaufforderung) && !installiert}
            onInstallieren={appInstallieren}
            onWunsch={waehleSchema}
            onTerminAendern={() => {
              setEinstellungenOffen(false)
              setTerminBearbeiten(true)
            }}
          />
        </Sheet>
      )}

      {urteil && (
        <Sheet
          titel={urteil.name}
          onSchliessen={zurueck}
          fussKnopf={herkunft === 'uebersicht' ? 'Zurück zur Übersicht' : 'Zurück zur Suche'}
        >
          <Ergebniskarte
            urteil={urteil}
            {...(stand ? { sswAnzeige: stand.anzeige, trimester: stand.trimester } : {})}
          />
        </Sheet>
      )}

      {(medikamentProdukt || medikamentWirkstoff) && (
        <Sheet
          titel={medikamentProdukt?.name ?? medikamentWirkstoff?.wirkstoff ?? 'Medikament'}
          onSchliessen={medikamentSchliessen}
          fussKnopf="Zurück"
        >
          <MedikamentDetail
            key={medikamentProdukt?.id ?? medikamentWirkstoff?.id}
            produkt={medikamentProdukt}
            medikamentId={medikamentWirkstoff?.id}
            {...(stand ? { ssw: stand.woche, sswAnzeige: stand.anzeige } : {})}
            onTerminAendern={() => {
              medikamentSchliessen()
              setTerminBearbeiten(true)
            }}
            onWirkstoffOeffnen={medikamentWirkstoffOeffnen}
          />
        </Sheet>
      )}

      {alltag && (
        <Sheet titel={alltag.titel} onSchliessen={() => setAlltagId(null)} fussKnopf="Zurück zum Alltag">
          <AlltagDetail
            eintrag={alltag}
            {...(stand
              ? { ssw: stand.woche, sswAnzeige: stand.anzeige, trimester: stand.trimester }
              : {})}
          />
        </Sheet>
      )}

      <Fusszeile nurSicherheit={ansicht === 'suche'} />

      <Navigation aktiv={aktivesZiel} onWechsel={zumZiel} />
    </div>
  )
}
