import { lebensmittelKatalog } from './daten'
import { suche } from './engine/suchen'
import type { Gericht } from './gerichte'

export function GerichtTreffer({
  gerichte,
  onPruefen,
}: {
  gerichte: readonly Gericht[]
  onPruefen: (suchbegriff: string) => void
}) {
  if (gerichte.length === 0) return null

  return (
    <section className="gerichte" aria-labelledby="gerichte-titel">
      <div className="gerichte__kopf">
        <p className="gerichte__kicker">Gericht erkannt</p>
        <h2 id="gerichte-titel">Typische Bestandteile prüfen</h2>
      </div>

      {gerichte.map((gericht) => (
        <article className="gericht" key={gericht.id}>
          <div className="gericht__titelzeile">
            <h3>{gericht.name}</h3>
            <span className="gericht__badge">Gericht</span>
          </div>
          <p className="gericht__erklaerung">
            Ein Gericht bekommt hier kein Pauschalurteil. Entscheidend sind die Zutaten und ihre
            Zubereitung. Typischerweise relevant:
          </p>
          <div className="gericht__bestandteile">
            {gericht.bestandteile.map((bestandteil) => {
              const suchbegriff = bestandteil.suchbegriff ?? bestandteil.label
              const verfuegbar = suche(suchbegriff, lebensmittelKatalog).length > 0
              return verfuegbar ? (
                <button
                  type="button"
                  className="gericht__bestandteil"
                  key={`${gericht.id}-${bestandteil.label}`}
                  onClick={() => onPruefen(suchbegriff)}
                  aria-label={`${bestandteil.label} im Lebensmittel-Katalog prüfen`}
                >
                  <span>{bestandteil.label}</span>
                  <span aria-hidden="true">›</span>
                </button>
              ) : (
                <span
                  className="gericht__bestandteil gericht__bestandteil--info"
                  key={`${gericht.id}-${bestandteil.label}`}
                >
                  {bestandteil.label}
                </span>
              )
            })}
          </div>
          {gericht.hinweis && <p className="gericht__hinweis">{gericht.hinweis}</p>}
          <p className="gericht__disclaimer">
            Rezepte können abweichen. Im Restaurant oder bei Fertigprodukten Zutaten und
            Zubereitung im Zweifel separat prüfen.
          </p>
        </article>
      ))}
    </section>
  )
}
