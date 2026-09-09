import { useEffect, useMemo, useState } from 'react'
import { lebensmittelKatalog, regelKatalog } from './daten'
import { bewerteLebensmittel } from './engine/bewerten'
import { analysiereProduktmerkmale } from './engine/produktmerkmale'
import { holeProdukt, type Produkt } from './engine/produktsuche'
import { ordneProduktZu, type ProduktZuordnung } from './engine/produktzuordnung'
import { findeNachId, MAX_TREFFER, MINDESTLAENGE, suche } from './engine/suchen'
import { Ergebniskarte } from './Ergebniskarte'
import { istSchweizerArzneimittelGtin } from './medikamente/produkte'
import { Trefferliste } from './Trefferliste'
import type { Lebensmittel } from './typen'

type Stand = 'laeuft' | 'urteil' | 'auswahl' | 'ohne' | 'medikament-ohne'

function grundlagenText(zuordnung: ProduktZuordnung | null): string {
  if (!zuordnung || zuordnung.grundlagen.length === 0) return 'Produktname'
  return zuordnung.grundlagen.join(', ')
}

function Produktmerkmale({ produkt }: { produkt: Produkt }) {
  const merkmale = analysiereProduktmerkmale(produkt)
  if (merkmale.length === 0) return null

  return (
    <section className="scan-merkmale" aria-labelledby="scan-merkmale-titel">
      <div className="scan-merkmale__kopf">
        <h3 id="scan-merkmale-titel">Auf der Verpackung erkannt</h3>
        <span>{merkmale.length} Merkmal{merkmale.length === 1 ? '' : 'e'}</span>
      </div>
      <div className="scan-merkmale__liste">
        {merkmale.map((merkmal) => (
          <div className="scan-merkmal" data-art={merkmal.art} key={merkmal.id}>
            <span>{merkmal.label}</span>
            <strong>{merkmal.wert}</strong>
            <small>{merkmal.hinweis}</small>
          </div>
        ))}
      </div>
      <p className="scan-merkmale__hinweis">
        Diese Merkmale helfen bei der Einordnung, erzeugen aber selbst keine Freigabe. Das
        Urteil stammt weiterhin aus dem lokalen Regelkatalog.
      </p>
    </section>
  )
}

function Produktdaten({ produkt }: { produkt: Produkt }) {
  const hatDetails = produkt.generischerName || produkt.kategorien.length > 0 || produkt.zutatenText
  if (!hatDetails) return null

  return (
    <details className="scan-produktdaten">
      <summary>Produktdaten von Open Food Facts</summary>
      <dl>
        {produkt.generischerName && (
          <>
            <dt>Bezeichnung</dt>
            <dd>{produkt.generischerName}</dd>
          </>
        )}
        {produkt.kategorien.length > 0 && (
          <>
            <dt>Kategorie</dt>
            <dd>{produkt.kategorien.slice(0, 4).join(' · ')}</dd>
          </>
        )}
        {produkt.zutatenText && (
          <>
            <dt>Zutaten</dt>
            <dd>{produkt.zutatenText}</dd>
          </>
        )}
      </dl>
      <p>
        Diese Fremddaten helfen nur bei der Zuordnung. Das Schwangerschaftsurteil stammt
        weiterhin ausschliesslich aus dem lokalen Schweizer Regelkatalog.
      </p>
    </details>
  )
}

/**
 * Was nach einem gelesenen Strichcode passiert: Schweizer Arzneimittel-GTINs
 * werden bereits vor dieser Ansicht lokal aufgelöst. Alles andere wird als
 * Lebensmittel gegen Open Food Facts und anschliessend gegen den lokalen
 * Katalog geprüft.
 */
export function Scanergebnis({
  ean,
  trimester,
  sswAnzeige,
  onNeuScannen,
  onZurSuche,
}: {
  ean: string
  trimester?: number
  ssw?: number
  sswAnzeige?: string
  onNeuScannen: () => void
  onZurSuche: () => void
}) {
  const [stand, setStand] = useState<Stand>('laeuft')
  const [produkt, setProdukt] = useState<Produkt | null>(null)
  const [zuordnung, setZuordnung] = useState<ProduktZuordnung | null>(null)
  const [gewaehlt, setGewaehlt] = useState<Lebensmittel | null>(null)
  const [begriff, setBegriff] = useState('')

  useEffect(() => {
    const steuerung = new AbortController()
    setStand('laeuft')
    setProdukt(null)
    setZuordnung(null)
    setGewaehlt(null)
    setBegriff('')

    // Ein 7680-GTIN, der hier ankommt, konnte zuvor nicht eindeutig auf eine
    // kuratierte Swissmedic-Packung gemappt werden. Nicht als Lebensmittel raten.
    if (istSchweizerArzneimittelGtin(ean)) {
      setStand('medikament-ohne')
      return () => steuerung.abort()
    }

    holeProdukt(ean, steuerung.signal).then((gefunden) => {
      if (steuerung.signal.aborted) return
      setProdukt(gefunden)
      if (!gefunden) {
        setStand('ohne')
        return
      }

      const abgleich = ordneProduktZu(gefunden, lebensmittelKatalog, regelKatalog)
      setZuordnung(abgleich)
      if (abgleich.eindeutig) {
        setGewaehlt(abgleich.eindeutig)
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

  const vorschlaege = zuordnung?.kandidaten ?? []
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
        <p className="scanstand__text">Produktdaten werden geprüft …</p>
      </section>
    )
  }

  if (stand === 'medikament-ohne') {
    return (
      <section className="scan-medikament-offen" aria-labelledby="scan-medikament-offen-titel">
        <h2 className="abschnitt__titel" id="scan-medikament-offen-titel">Medikament erkannt, aber nicht bewertbar</h2>
        <p className="abschnitt__hinweis">
          Der Code <span className="zuordnen__code">{ean}</span> sieht nach einem Schweizer
          Arzneimittel-GTIN aus, lässt sich im lokalen kuratierten Swissmedic-Snapshot aber
          keiner eindeutigen bewertbaren Packung zuordnen. Daraus wird bewusst kein Urteil
          abgeleitet.
        </p>
        <div className="scan-knoepfe">
          <button className="zurueck zurueck--flaeche" type="button" onClick={onNeuScannen}>
            Nochmal scannen
          </button>
          <button className="zurueck" type="button" onClick={onZurSuche}>
            Zur Medikamentensuche
          </button>
        </div>
      </section>
    )
  }

  if (stand === 'urteil' && urteil) {
    return (
      <>
        {produkt && (
          <div className="scan-produktkopf">
            <p className="scan-quelle">
              Gescannt: <strong>{produkt.name}</strong>
              {produkt.marke && <span> · {produkt.marke}</span>}
              {gewaehlt && (
                <>
                  <br />
                  Zugeordnet zu «{gewaehlt.name}» über {grundlagenText(zuordnung)}.
                </>
              )}
            </p>
            <Produktmerkmale produkt={produkt} />
            <Produktdaten produkt={produkt} />
          </div>
        )}

        {zuordnung && zuordnung.konflikte.length > 0 && (
          <div className="scan-konflikt" role="note">
            <strong>Das Gesamtprodukt ist damit nicht automatisch freigegeben.</strong>
            <p>
              Open Food Facts nennt zusätzlich{' '}
              {zuordnung.konflikte.map((konflikt) => konflikt.eintrag.name).join(', ')}. Das
              folgende Urteil bewertet nur die gewählte Zuordnung «{gewaehlt?.name}» und
              nicht alle Zutaten des Produkts.
            </p>
          </div>
        )}

        <Ergebniskarte
          urteil={urteil}
          {...(sswAnzeige ? { sswAnzeige } : {})}
          {...(trimester ? { trimester } : {})}
        />
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
            Zum Code <span className="zuordnen__code">{ean}</span> liefert Open Food Facts
            nichts — oder es fehlt gerade das Netz. Suche das Lebensmittel von Hand.
          </>
        ) : zuordnung && zuordnung.konflikte.length > 0 ? (
          <>
            Gescannt wurde <strong>{produkt?.name}</strong>. Zusätzlich wurde{' '}
            <strong>{zuordnung.konflikte.map((konflikt) => konflikt.eintrag.name).join(', ')}</strong>{' '}
            erkannt. Deshalb gibt es kein automatisches Gesamturteil — wähle die passende
            Einordnung bewusst aus.
          </>
        ) : (
          <>
            Gescannt wurde <strong>{produkt?.name}</strong>. Produktname, Bezeichnung und
            Kategorie reichen für eine sichere automatische Zuordnung nicht aus. Wähle den
            passenden Katalogeintrag.
          </>
        )}
      </p>

      {produkt && (
        <>
          <Produktmerkmale produkt={produkt} />
          <Produktdaten produkt={produkt} />
        </>
      )}

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

      {liste.length > 0 && <Trefferliste eintraege={liste} onOeffnen={waehlen} />}

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
