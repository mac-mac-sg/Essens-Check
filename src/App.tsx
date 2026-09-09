import { useEffect, useMemo, useState } from 'react'
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
import { Einstellungen } from './Einstellungen'
import { Ergebniskarte } from './Ergebniskarte'
import { Geburtstermin } from './Geburtstermin'
import { MedikamentDetail } from './MedikamentDetail'
import { type CheckAnzeige } from './MeineChecks'
import { type CheckRef, useMeineChecks } from './meineChecks'
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
import { findeWissensartikel } from './Wissen'
import type { WissensStart } from './WissensThemen'

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

function checkAnzeige(ref: CheckRef): CheckAnzeige | null {
  if (ref.art === 'lebensmittel') {
    const eintrag = findeNachId(ref.id, lebensmittelKatalog)
    return eintrag ? { ref, titel: eintrag.name, meta: 'Lebensmittel' } : null
  }
  if (ref.art === 'medikament') {
    const eintrag = findeMedikament(ref.id)
    return eintrag ? { ref, titel: eintrag.wirkstoff, meta: 'Medikament · Wirkstoff' } : null
  }
  if (ref.art === 'medikament-produkt') {
    const eintrag = findeMedikamentProdukt(ref.id)
    return eintrag ? { ref, titel: eintrag.name, meta: 'Medikament · Präparat' } : null
  }
  if (ref.art === 'wissen') {
    const eintrag = findeWissensartikel(ref.id)
    return eintrag ? { ref, titel: eintrag.titel, meta: 'Wissen' } : null
  }
  const eintrag = findeAlltag(ref.id)
  return eintrag ? { ref, titel: eintrag.titel, meta: 'Wissen · Alltag' } : null
}

function sichtbareChecks(refs: readonly CheckRef[]): CheckAnzeige[] {
  return refs.flatMap((ref) => {
    const anzeige = checkAnzeige(ref)
    return anzeige ? [anzeige] : []
  })
}

export function App() {
  const [ansicht, setAnsicht] = useState<Ansicht>('suche')
  const [suchbereich, setSuchbereich] = useState<Suchbereich>('lebensmittel')
  const [begriff, setBegriff] = useState('')
  const [offeneId, setOffeneId] = useState<string | null>(null)
  const [medikamentProduktId, setMedikamentProduktId] = useState<string | null>(null)
  const [medikamentWirkstoffId, setMedikamentWirkstoffId] = useState<string | null>(null)
  /** Wohin der Rücksprung aus der Ergebniskarte führt. */
  const [herkunft, setHerkunft] = useState<Ansicht>('suche')
  /** Zuletzt gelesener Strichcode. */
  const [code, setCode] = useState<string | null>(null)
  const [wissenStart, setWissenStart] = useState<WissensStart | null>(null)
  const [termin, setTermin] = useState(() => leseGeburtstermin())
  const [terminBearbeiten, setTerminBearbeiten] = useState(false)
  const [einstellungenOffen, setEinstellungenOffen] = useState(false)
  const [wunsch, setWunsch] = useState<Wunsch>(() => leseWunsch())
  const [systemDunkel, setSystemDunkel] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
  )
  const [installationsaufforderung, setInstallationsaufforderung] =
    useState<Installationsaufforderung | null>(null)
  const [installiert, setInstalliert] = useState(
    () => window.matchMedia?.('(display-mode: standalone)').matches ?? false,
  )
  const {
    verlauf,
    favoriten,
    scans,
    merken,
    favoritUmschalten,
    istFavorit,
    verlaufLeeren,
    scanMerken,
    scansLeeren,
  } = useMeineChecks()

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
  const favoritenAnzeige = useMemo(() => sichtbareChecks(favoriten), [favoriten])
  const verlaufAnzeige = useMemo(() => sichtbareChecks(verlauf), [verlauf])

  const offen = offeneId ? findeNachId(offeneId, lebensmittelKatalog) : undefined
  const urteil = offen ? bewerteLebensmittel(offen, regelKatalog, stand?.trimester) : undefined
  const medikamentProdukt = medikamentProduktId
    ? findeMedikamentProdukt(medikamentProduktId)
    : null
  const medikamentWirkstoff = medikamentWirkstoffId
    ? findeMedikament(medikamentWirkstoffId)
    : null
  const aktivesMedikamentRef: CheckRef | null = medikamentProdukt
    ? { art: 'medikament-produkt', id: medikamentProdukt.id }
    : medikamentWirkstoff
      ? { art: 'medikament', id: medikamentWirkstoff.id }
      : null

  const medikamentSchliessen = () => {
    setMedikamentProduktId(null)
    setMedikamentWirkstoffId(null)
  }

  const detailsSchliessen = () => {
    setOffeneId(null)
    medikamentSchliessen()
  }

  const zumAnfang = () => {
    setBegriff('')
    detailsSchliessen()
    setCode(null)
    setWissenStart(null)
    setHerkunft('suche')
    setAnsicht('suche')
  }

  const zumZiel = (ziel: Ziel) => {
    detailsSchliessen()
    setWissenStart(null)
    if (ziel === 'scanner') setCode(null)
    if (ziel === 'suche') setBegriff('')
    setHerkunft(ziel === 'uebersicht' ? 'uebersicht' : 'suche')
    setAnsicht(ziel)
  }

  const aktivesZiel: Ziel = ansicht === 'scanergebnis' ? 'scanner' : ansicht

  const oeffnen = (id: string, woher: Ansicht) => {
    medikamentSchliessen()
    setOffeneId(id)
    setHerkunft(woher)
    merken({ art: 'lebensmittel', id })
  }

  const medikamentProduktOeffnen = (id: string) => {
    setOffeneId(null)
    setMedikamentWirkstoffId(null)
    setMedikamentProduktId(id)
    merken({ art: 'medikament-produkt', id })
  }

  const medikamentWirkstoffOeffnen = (id: string) => {
    setOffeneId(null)
    setMedikamentProduktId(null)
    setMedikamentWirkstoffId(id)
    merken({ art: 'medikament', id })
  }

  const checkOeffnen = (ref: CheckRef) => {
    if (ref.art === 'lebensmittel') {
      oeffnen(ref.id, 'uebersicht')
      return
    }
    if (ref.art === 'medikament') {
      medikamentWirkstoffOeffnen(ref.id)
      return
    }
    if (ref.art === 'medikament-produkt') {
      medikamentProduktOeffnen(ref.id)
      return
    }

    detailsSchliessen()
    setCode(null)
    merken(ref)
    setWissenStart({ art: ref.art, id: ref.id, token: Date.now() })
    setAnsicht('wissen')
  }

  const suchbereichWechseln = (neu: Suchbereich) => {
    if (neu === suchbereich) return
    setSuchbereich(neu)
    setBegriff('')
    detailsSchliessen()
  }

  const zurLebensmittelSuche = (suchwort = '') => {
    detailsSchliessen()
    setCode(null)
    setWissenStart(null)
    setSuchbereich('lebensmittel')
    setBegriff(suchwort)
    setHerkunft('suche')
    setAnsicht('suche')
  }

  const zurMedikamentenSuche = () => {
    detailsSchliessen()
    setCode(null)
    setWissenStart(null)
    setSuchbereich('medikamente')
    setBegriff('')
    setHerkunft('suche')
    setAnsicht('suche')
  }

  const codeErkannt = (ean: string) => {
    detailsSchliessen()
    const medikament = findeMedikamentProduktNachGtin(ean)
    if (medikament) {
      scanMerken(ean, medikament.name)
      setCode(null)
      medikamentProduktOeffnen(medikament.id)
      setAnsicht('scanner')
      return
    }
    scanMerken(ean, `Code ${ean}`)
    setCode(ean)
    setAnsicht('scanergebnis')
  }

  const zurueck = () => {
    setOffeneId(null)
    setAnsicht(herkunft === 'uebersicht' ? 'uebersicht' : 'suche')
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
            {...(stand ? { sswAnzeige: stand.anzeige, trimester: stand.trimester } : {})}
            start={wissenStart}
            onCheck={merken}
            istFavorit={istFavorit}
            onFavorit={favoritUmschalten}
          />
        ) : ansicht === 'scanner' ? (
          <Scanner
            onErkannt={codeErkannt}
            onAbbruch={zumAnfang}
            scans={scans}
            onScanWaehlen={codeErkannt}
            onScansLeeren={scansLeeren}
          />
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
            onZurSuche={zurLebensmittelSuche}
            onZurMedikamentensuche={zurMedikamentenSuche}
            onProduktErkannt={scanMerken}
            onLebensmittelGeoeffnet={(id) => merken({ art: 'lebensmittel', id })}
            favoritFuer={(id) => istFavorit({ art: 'lebensmittel', id })}
            onFavorit={(id) => favoritUmschalten({ art: 'lebensmittel', id })}
            onAlternativePruefen={zurLebensmittelSuche}
          />
        ) : ansicht === 'uebersicht' ? (
          <Uebersicht
            onOeffnen={(id) => oeffnen(id, 'uebersicht')}
            favoriten={favoritenAnzeige}
            verlauf={verlaufAnzeige}
            onCheckOeffnen={checkOeffnen}
            onVerlaufLeeren={verlaufLeeren}
          />
        ) : (
          <Suchansicht
            bereich={suchbereich}
            onBereichWechsel={suchbereichWechseln}
            begriff={begriff}
            setBegriff={setBegriff}
            treffer={treffer}
            teilwort={teilwort}
            gesucht={begriff.trim().length >= MINDESTLAENGE}
            onOeffnen={(id) => oeffnen(id, 'suche')}
            onMedikamentProduktOeffnen={medikamentProduktOeffnen}
            onMedikamentWirkstoffOeffnen={medikamentWirkstoffOeffnen}
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
            favorit={istFavorit({ art: 'lebensmittel', id: urteil.id })}
            onFavorit={() => favoritUmschalten({ art: 'lebensmittel', id: urteil.id })}
            onAlternativePruefen={zurLebensmittelSuche}
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
            {...(aktivesMedikamentRef
              ? {
                  favorit: istFavorit(aktivesMedikamentRef),
                  onFavorit: () => favoritUmschalten(aktivesMedikamentRef),
                }
              : {})}
          />
        </Sheet>
      )}

      <Fusszeile nurSicherheit={ansicht === 'suche'} />

      <Navigation aktiv={aktivesZiel} onWechsel={zumZiel} />
    </div>
  )
}
