import { NICHTS_GEFUNDEN } from './ampel'
import { MAX_TREFFER } from './engine/suchen'
import { Hero } from './Hero'
import { Trefferliste } from './Trefferliste'
import { Verlauf } from './Verlauf'
import type { Lebensmittel } from './typen'

export function Suchansicht({
  begriff,
  setBegriff,
  treffer,
  teilwort,
  gesucht,
  verlauf,
  onOeffnen,
  onVerlaufLeeren,
}: {
  begriff: string
  setBegriff: (wert: string) => void
  treffer: Lebensmittel[]
  teilwort: Lebensmittel[]
  gesucht: boolean
  verlauf: readonly string[]
  onOeffnen: (id: string) => void
  onVerlaufLeeren: () => void
}) {
  const sichtbar = treffer.slice(0, MAX_TREFFER)
  const weitere = treffer.length - sichtbar.length

  return (
    <>
      {!gesucht && <Hero />}

      <div className="suchleiste">
        <label className="feldtitel" htmlFor="suche">
          Lebensmittel eingeben
        </label>
        <div className="suchfeld-huelle">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
      </div>

      {!gesucht && <Verlauf ids={verlauf} onOeffnen={onOeffnen} onLeeren={onVerlaufLeeren} />}

      {gesucht && treffer.length > 0 && (
        <>
          <Trefferliste eintraege={sichtbar} onOeffnen={onOeffnen} />
          {weitere > 0 && (
            <p className="weitere">{weitere} weitere Treffer — Suchbegriff verfeinern.</p>
          )}
        </>
      )}

      {gesucht && treffer.length === 0 && (
        <div className="leer" role="status">
          <p className="leer__titel">{NICHTS_GEFUNDEN}</p>
          <p className="leer__text">
            Zu «{begriff.trim()}» ist hier nichts geprüft hinterlegt. Das heisst weder ja
            noch nein — nur, dass der Katalog es nicht kennt. Statt zu raten: im Zweifel
            kurz die Hebamme fragen.
          </p>
        </div>
      )}

      {gesucht && treffer.length === 0 && teilwort.length > 0 && (
        <>
          <p className="teilwort__frage">Meintest du eines davon?</p>
          <Trefferliste eintraege={teilwort} onOeffnen={onOeffnen} />
        </>
      )}
    </>
  )
}
