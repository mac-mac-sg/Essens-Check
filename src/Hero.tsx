import { AMPEL } from './ampel'
import type { Status } from './typen'

/** Die vier Stufen in der Reihenfolge, in der sie gelesen werden sollen. */
const STUFEN: Status[] = ['ok', 'bedingt', 'meiden', 'unklar']

/**
 * Der Einstieg: was die App tut, in welchen Stufen sie antwortet, und woran
 * sich das misst.
 *
 * Beides sind Aussagen über die App und keine Auskunft über ein Lebensmittel —
 * deshalb steht hier keine Ampelfarbe als Fläche, sondern nur als Punkt neben
 * ihrem Wort. Die Legende zeigt alle vier Stufen, auch «Nicht bewertet»: dass
 * die App eine Lücke als Lücke ausweist, gehört zu dem, was sie ausmacht.
 */
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-titel">
      <p className="hero__marke">Schwangerschaft · Lebensmittel</p>
      <h2 className="hero__titel" id="hero-titel">
        Ein Lebensmittel, eine klare Antwort.
      </h2>
      <p className="hero__text">
        Eingeben oder scannen — und die Auskunft steht da: mit der Zubereitung, unter der
        sie gilt, und dem Risiko, aus dem sie folgt.
      </p>

      <ul className="hero__ampel">
        {STUFEN.map((status) => (
          <li className="ampelchip" key={status}>
            <span className="ampelchip__punkt" data-status={status} aria-hidden="true" />
            {AMPEL[status].wort}
          </li>
        ))}
      </ul>

      <div className="hero__kacheln">
        <div className="kachel">
          <p className="kachel__titel">Schweizer Empfehlungen</p>
          <p className="kachel__text">
            Kuratiert nach den Angaben von BLV und BAG. Fachlich noch nicht gegengelesen.
          </p>
        </div>
        <div className="kachel">
          <p className="kachel__titel">Die Zubereitung zählt</p>
          <p className="kachel__text">
            Roh, durcherhitzt, pasteurisiert oder gekühlt macht meistens den Unterschied.
          </p>
        </div>
      </div>
    </section>
  )
}
