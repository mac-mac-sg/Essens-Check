import { NICHTS_GEFUNDEN } from './ampel'
import { lebensmittelKatalog } from './daten'
import { findeNachId, MAX_TREFFER } from './engine/suchen'
import { GerichtTreffer } from './GerichtTreffer'
import { sucheGerichte } from './gerichte'
import { Hero } from './Hero'
import { Medikamentensuche } from './Medikamentensuche'
import { CheckListe, type CheckAnzeige } from './MeineChecks'
import { leseVerlauf, type CheckRef } from './meineChecks'
import { findeMedikament } from './medikamente/daten'
import { findeMedikamentProdukt } from './medikamente/suche'
import { Trefferliste } from './Trefferliste'
import type { Lebensmittel } from './typen'

export type Suchbereich = 'lebensmittel' | 'medikamente'

function Bereichsschalter({
  aktiv,
  onWechsel,
}: {
  aktiv: Suchbereich
  onWechsel: (bereich: Suchbereich) => void
}) {
  return (
    <div className="suchbereich" data-aktiv={aktiv} role="group" aria-label="Was möchtest du prüfen?">
      <span className="suchbereich__indikator" aria-hidden="true" />
      <button
        type="button"
        aria-pressed={aktiv === 'lebensmittel'}
        onClick={() => onWechsel('lebensmittel')}
      >
        Lebensmittel
      </button>
      <button
        type="button"
        aria-pressed={aktiv === 'medikamente'}
        onClick={() => onWechsel('medikamente')}
      >
        Medikamente
      </button>
    </div>
  )
}

function anzeigeFuerSuchverlauf(ref: CheckRef): CheckAnzeige | null {
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
  return null
}

export function Suchansicht({
  bereich,
  onBereichWechsel,
  begriff,
  setBegriff,
  treffer,
  teilwort,
  gesucht,
  onOeffnen,
  onMedikamentProduktOeffnen,
  onMedikamentWirkstoffOeffnen,
}: {
  bereich: Suchbereich
  onBereichWechsel: (bereich: Suchbereich) => void
  begriff: string
  setBegriff: (wert: string) => void
  treffer: Lebensmittel[]
  teilwort: Lebensmittel[]
  gesucht: boolean
  onOeffnen: (id: string) => void
  onMedikamentProduktOeffnen: (id: string) => void
  onMedikamentWirkstoffOeffnen: (id: string) => void
}) {
  const sichtbar = treffer.slice(0, MAX_TREFFER)
  const weitere = treffer.length - sichtbar.length
  const nochLeer = begriff.trim().length < 2
  const verlauf = leseVerlauf().flatMap((ref) => {
    const anzeige = anzeigeFuerSuchverlauf(ref)
    return anzeige ? [anzeige] : []
  })
  const verlaufSichtbar = begriff.trim().length === 0 && verlauf.length > 0
  const gerichte = bereich === 'lebensmittel' ? sucheGerichte(begriff) : []

  const verlaufOeffnen = (ref: CheckRef) => {
    if (ref.art === 'lebensmittel') {
      onOeffnen(ref.id)
      return
    }
    if (ref.art === 'medikament') {
      onMedikamentWirkstoffOeffnen(ref.id)
      return
    }
    if (ref.art === 'medikament-produkt') onMedikamentProduktOeffnen(ref.id)
  }

  return (
    <>
      {nochLeer && <Hero bereich={bereich} />}
      <Bereichsschalter aktiv={bereich} onWechsel={onBereichWechsel} />

      {bereich === 'medikamente' ? (
        <Medikamentensuche
          begriff={begriff}
          setBegriff={setBegriff}
          onProduktOeffnen={onMedikamentProduktOeffnen}
          onWirkstoffOeffnen={onMedikamentWirkstoffOeffnen}
        />
      ) : (
        <>
          <div className="suchleiste suchleiste--spotlight">
            <label className="feldtitel feldtitel--versteckt" htmlFor="suche">
              Lebensmittel oder Gericht suchen
            </label>
            <div className="suchfeld-huelle">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M13.5 13.5 L17 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                id="suche"
                className="suchfeld"
                type="search"
                placeholder="Lebensmittel / Gericht"
                value={begriff}
                onChange={(ereignis) => setBegriff(ereignis.target.value)}
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
          </div>

          {gesucht && gerichte.length > 0 && (
            <GerichtTreffer gerichte={gerichte} onPruefen={setBegriff} />
          )}

          {gesucht && treffer.length > 0 && (
            <>
              <Trefferliste eintraege={sichtbar} onOeffnen={onOeffnen} />
              {weitere > 0 && (
                <p className="weitere">{weitere} weitere Treffer — Suchbegriff verfeinern.</p>
              )}
            </>
          )}

          {gesucht && treffer.length === 0 && gerichte.length === 0 && (
            <div className="leer" role="status">
              <p className="leer__titel">{NICHTS_GEFUNDEN}</p>
              <p className="leer__text">
                Zu «{begriff.trim()}» ist hier nichts geprüft hinterlegt. Das heisst weder ja
                noch nein — nur, dass der Katalog es nicht kennt. Statt zu raten: im Zweifel
                kurz die Hebamme fragen.
              </p>
            </div>
          )}

          {gesucht && treffer.length === 0 && gerichte.length === 0 && teilwort.length > 0 && (
            <>
              <p className="teilwort__frage">Meintest du eines davon?</p>
              <Trefferliste eintraege={teilwort} onOeffnen={onOeffnen} />
            </>
          )}
        </>
      )}

      {verlaufSichtbar && (
        <section className="suchverlauf" aria-labelledby="suchverlauf-titel">
          <div>
            <p className="meine-checks__kicker">Verlauf</p>
            <h2 id="suchverlauf-titel">Zuletzt geprüft</h2>
          </div>
          <CheckListe eintraege={verlauf.slice(0, 5)} onOeffnen={verlaufOeffnen} />
        </section>
      )}
    </>
  )
}
