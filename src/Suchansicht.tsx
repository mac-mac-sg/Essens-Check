import { BELIEBT, NICHTS_GEFUNDEN } from './ampel'
import { lebensmittelKatalog } from './daten'
import { MAX_TREFFER, suche } from './engine/suchen'
import { Grundsaetze } from './Grundsaetze'
import { Hero } from './Hero'
import { Trefferliste } from './Trefferliste'
import type { Lebensmittel } from './typen'

/**
 * Die häufigen Begriffe als Katalogeinträge — einmal aufgelöst, nicht bei
 * jedem Tastendruck. Ein Begriff ohne Treffer fällt heraus, statt eine leere
 * Zeile zu erzeugen.
 */
const BELIEBTE: Lebensmittel[] = BELIEBT.map(
  (begriff) => suche(begriff, lebensmittelKatalog)[0],
).filter((eintrag): eintrag is Lebensmittel => eintrag !== undefined)


export function Suchansicht({
  begriff,
  setBegriff,
  treffer,
  teilwort,
  gesucht,
  onOeffnen,
  onUebersicht,
  onScannen,
}: {
  begriff: string
  setBegriff: (wert: string) => void
  treffer: Lebensmittel[]
  teilwort: Lebensmittel[]
  gesucht: boolean
  onOeffnen: (id: string) => void
  onUebersicht: () => void
  onScannen: () => void
}) {
  // Lange Listen sind auf dem Handy unbrauchbar. Es wird nichts weggelassen,
  // nur später gezeigt — der Hinweis darunter sagt, wie viele noch folgen.
  const sichtbar = treffer.slice(0, MAX_TREFFER)
  const weitere = treffer.length - sichtbar.length

  return (
    <>
      {!gesucht && <Hero />}

      {/*
        Die Suchleiste bleibt beim Scrollen oben stehen. In einem Laden ist sie
        das Einzige, was zählt — sie darf nie erst wieder gesucht werden müssen.
      */}
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

      {!gesucht && (
        <>
          <div className="wege">
            <button className="weg" type="button" onClick={onScannen}>
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M3 6.5V4a1 1 0 0 1 1-1h2.5M13.5 3H16a1 1 0 0 1 1 1v2.5M17 13.5V16a1 1 0 0 1-1 1h-2.5M6.5 17H4a1 1 0 0 1-1-1v-2.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M6 7v6M8.5 7v6M11.5 7v6M14 7v6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Strichcode scannen
            </button>

            <button className="weg" type="button" onClick={onUebersicht}>
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M3.5 5.5h13M3.5 10h13M3.5 14.5h8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Was kann ich essen?
            </button>
          </div>

          <h2 className="abschnitt__titel abschnitt__titel--klein">Häufig gesucht</h2>
          <Trefferliste eintraege={BELIEBTE} onOeffnen={onOeffnen} />

          <Grundsaetze />
        </>
      )}

      {gesucht && treffer.length > 0 && (
        <>
          <Trefferliste eintraege={sichtbar} onOeffnen={onOeffnen} />
          {weitere > 0 && (
            <p className="weitere">{weitere} weitere Treffer — Suchbegriff verfeinern.</p>
          )}
        </>
      )}

      {/* Nulltreffer: nicht raten, sondern sagen, dass nichts hinterlegt ist. */}
      {gesucht && treffer.length === 0 && (
        <div className="karte karte--ergebnis" role="status">
          <span className="urteil" data-status="unklar">
            {NICHTS_GEFUNDEN}
          </span>
          <p className="text">
            Zu «{begriff.trim()}» ist hier nichts geprüft hinterlegt. Statt zu raten: im
            Zweifel kurz die Hebamme fragen.
          </p>
        </div>
      )}

      {/*
        Steckt ein Katalogbegriff im Suchwort, wird gefragt statt geraten:
        «Leberkäse» enthält «Leber» und ist doch eine Brühwurst.
      */}
      {gesucht && treffer.length === 0 && teilwort.length > 0 && (
        <>
          <p className="teilwort__frage">Meintest du eines davon?</p>
          <Trefferliste eintraege={teilwort} onOeffnen={onOeffnen} />
        </>
      )}
    </>
  )
}
