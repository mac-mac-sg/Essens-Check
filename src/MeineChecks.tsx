import { checkSchluessel, type CheckRef } from './meineChecks'

export interface CheckAnzeige {
  ref: CheckRef
  titel: string
  meta: string
}

export function CheckListe({
  eintraege,
  onOeffnen,
}: {
  eintraege: readonly CheckAnzeige[]
  onOeffnen: (ref: CheckRef) => void
}) {
  return (
    <div className="meine-checks__liste">
      {eintraege.map((eintrag) => (
        <button
          className="meine-checks__eintrag"
          type="button"
          key={checkSchluessel(eintrag.ref)}
          onClick={() => onOeffnen(eintrag.ref)}
        >
          <span>
            <span className="meine-checks__meta">{eintrag.meta}</span>
            <strong>{eintrag.titel}</strong>
          </span>
          <span className="meine-checks__pfeil" aria-hidden="true">›</span>
        </button>
      ))}
    </div>
  )
}

export function MeineChecks({
  favoriten,
  verlauf,
  onOeffnen,
  onVerlaufLeeren,
}: {
  favoriten: readonly CheckAnzeige[]
  verlauf: readonly CheckAnzeige[]
  onOeffnen: (ref: CheckRef) => void
  onVerlaufLeeren: () => void
}) {
  if (favoriten.length === 0 && verlauf.length === 0) return null

  return (
    <section className="meine-checks" aria-labelledby="meine-checks-titel">
      <div className="meine-checks__kopf">
        <div>
          <p className="meine-checks__kicker">Für mich</p>
          <h2 id="meine-checks-titel">Meine Checks</h2>
        </div>
        <span className="meine-checks__lokal">Nur auf diesem Gerät</span>
      </div>

      {favoriten.length > 0 && (
        <div className="meine-checks__gruppe">
          <h3>Gespeichert</h3>
          <CheckListe eintraege={favoriten.slice(0, 6)} onOeffnen={onOeffnen} />
        </div>
      )}

      {verlauf.length > 0 && (
        <div className="meine-checks__gruppe">
          <div className="meine-checks__unterkopf">
            <h3>Zuletzt geprüft</h3>
            <button type="button" onClick={onVerlaufLeeren}>Leeren</button>
          </div>
          <CheckListe eintraege={verlauf.slice(0, 6)} onOeffnen={onOeffnen} />
        </div>
      )}
    </section>
  )
}
