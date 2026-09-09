import { useMemo } from 'react'
import { medikamentKatalog } from './medikamente/daten'
import { medikamentProduktSnapshot } from './medikamente/produkte'
import { findeWirkstoffe, sucheMedikamentProdukte } from './medikamente/suche'
import type { Medikament } from './medikamente/typen'
import type { SwissmedicProdukt } from './medikamente/swissmedic'

function WirkstoffZeile({
  medikament,
  onOeffnen,
}: {
  medikament: Medikament
  onOeffnen: (id: string) => void
}) {
  return (
    <li>
      <button className="med-treffer" type="button" onClick={() => onOeffnen(medikament.id)}>
        <span className="med-treffer__haupt">
          <span className="med-treffer__art">Wirkstoff</span>
          <span className="med-treffer__name">{medikament.wirkstoff}</span>
          <span className="med-treffer__meta">{medikament.gruppe}</span>
        </span>
        <span className="med-treffer__pfeil" aria-hidden="true">›</span>
      </button>
    </li>
  )
}

function ProduktZeile({
  produkt,
  onOeffnen,
}: {
  produkt: SwissmedicProdukt
  onOeffnen: (id: string) => void
}) {
  const wirkstoffe = produkt.wirkstoffe
    .map((wirkstoff) => wirkstoff.name)
    .filter(Boolean)
    .join(' + ')

  return (
    <li>
      <button className="med-treffer" type="button" onClick={() => onOeffnen(produkt.id)}>
        <span className="med-treffer__haupt">
          <span className="med-treffer__art">Schweizer Präparat</span>
          <span className="med-treffer__name">{produkt.name}</span>
          <span className="med-treffer__meta">
            {[produkt.arzneiform, wirkstoffe].filter(Boolean).join(' · ')}
          </span>
          {!produkt.vollstaendig_gemappt && (
            <span className="med-treffer__warnung">Nicht vollständig fachlich bewertet</span>
          )}
        </span>
        <span className="med-treffer__pfeil" aria-hidden="true">›</span>
      </button>
    </li>
  )
}

export function Medikamentensuche({
  begriff,
  setBegriff,
  onProduktOeffnen,
  onWirkstoffOeffnen,
}: {
  begriff: string
  setBegriff: (wert: string) => void
  onProduktOeffnen: (id: string) => void
  onWirkstoffOeffnen: (id: string) => void
}) {
  const gesucht = begriff.trim().length >= 2
  const wirkstoffe = useMemo(() => findeWirkstoffe(begriff), [begriff])
  const produkte = useMemo(() => sucheMedikamentProdukte(begriff, 15), [begriff])

  return (
    <section className="med-suche" aria-label="Medikamente prüfen">
      <div className="suchleiste suchleiste--spotlight med-suche__suchleiste">
        <label className="feldtitel feldtitel--versteckt" htmlFor="medikament-suche">
          Medikament oder Wirkstoff suchen
        </label>
        <div className="suchfeld-huelle">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
            <path d="M13.5 13.5 L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="medikament-suche"
            className="suchfeld"
            type="search"
            placeholder="Medikament oder Wirkstoff suchen …"
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
                document.getElementById('medikament-suche')?.focus()
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {!gesucht && (
        <p className="such-meta">
          {medikamentKatalog.medikamente.length} kuratierte Wirkstoffe · Swissmedic-Produktdaten Stand {medikamentProduktSnapshot.stand.split('-').reverse().join('.')}
        </p>
      )}

      {gesucht && wirkstoffe.length > 0 && (
        <div className="med-suche__gruppe">
          <h2 className="med-suche__ueberschrift">Wirkstoffe</h2>
          <ul className="med-trefferliste">
            {wirkstoffe.map((medikament) => (
              <WirkstoffZeile key={medikament.id} medikament={medikament} onOeffnen={onWirkstoffOeffnen} />
            ))}
          </ul>
        </div>
      )}

      {gesucht && produkte.length > 0 && (
        <div className="med-suche__gruppe">
          <h2 className="med-suche__ueberschrift">Schweizer Präparate</h2>
          <ul className="med-trefferliste">
            {produkte.map((produkt) => (
              <ProduktZeile key={produkt.id} produkt={produkt} onOeffnen={onProduktOeffnen} />
            ))}
          </ul>
        </div>
      )}

      {gesucht && wirkstoffe.length === 0 && produkte.length === 0 && (
        <div className="leer med-suche__leer" role="status">
          <p className="leer__titel">Nicht im aktuellen Medikamentenkatalog</p>
          <p className="leer__text">
            Zu «{begriff.trim()}» ist keine belastbare lokale Bewertung hinterlegt. Daraus wird
            kein Ja oder Nein abgeleitet. Bitte Ärztin, Apotheke oder Hebamme fragen.
          </p>
        </div>
      )}
    </section>
  )
}
