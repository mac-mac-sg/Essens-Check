import { ALLTAG, ALLTAG_STATUS_META, sucheAlltag } from './alltag/daten'

export function Alltagssuche({
  begriff,
  setBegriff,
  onOeffnen,
}: {
  begriff: string
  setBegriff: (wert: string) => void
  onOeffnen: (id: string) => void
}) {
  const gesucht = begriff.trim().length >= 2
  const treffer = gesucht ? sucheAlltag(begriff) : ALLTAG

  return (
    <section className="alltag-suche" aria-labelledby="alltag-suche-titel">
      <div className="alltag-suche__intro">
        <p className="alltag-suche__kicker">Alltag in der Schwangerschaft</p>
        <h2 id="alltag-suche-titel">Was möchtest du einordnen?</h2>
        <p>
          Situationen aus Freizeit, Reisen, Medizin und Zuhause — mit derselben Regel:
          fehlende Grundlage wird nicht zu einer Freigabe.
        </p>
      </div>

      <div className="suchleiste">
        <label className="feldtitel" htmlFor="alltag-suche">
          Alltagsthema eingeben
        </label>
        <div className="suchfeld-huelle">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
            <path d="M13.5 13.5 L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="alltag-suche"
            className="suchfeld"
            type="search"
            placeholder="Sauna, Katze, Flug, Röntgen …"
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
              onClick={() => setBegriff('')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {treffer.length > 0 ? (
        <div className="alltag-karten">
          {treffer.map((eintrag) => {
            const meta = ALLTAG_STATUS_META[eintrag.status]
            return (
              <button
                className="alltag-karte"
                type="button"
                key={eintrag.id}
                onClick={() => onOeffnen(eintrag.id)}
              >
                <span className="alltag-karte__kopf">
                  <span className="alltag-karte__gruppe">{eintrag.gruppe}</span>
                  <span className="alltag-status alltag-status--klein" data-status={eintrag.status}>
                    {meta.label}
                  </span>
                </span>
                <strong>{eintrag.titel}</strong>
                <span className="alltag-karte__kurz">{eintrag.kurz}</span>
                <span className="alltag-karte__mehr">Einordnung ansehen <span aria-hidden="true">›</span></span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="leer" role="status">
          <p className="leer__titel">Nichts geprüft hinterlegt</p>
          <p className="leer__text">
            Zu «{begriff.trim()}» gibt es im Alltagskatalog noch keine belastbare Einordnung.
            Das ist bewusst kein Ja und kein Nein.
          </p>
        </div>
      )}
    </section>
  )
}
