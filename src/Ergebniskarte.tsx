import { AMPEL } from './ampel'
import { entscheidungsgradLebensmittel } from './entscheidungsgrad'
import type { Urteil, VariantenUrteil } from './engine/bewerten'
import { FavoritKnopf } from './FavoritKnopf'
import { ResultHero, type ResultTone } from './ResultHero'

function Begruendungen({ urteil }: { urteil: VariantenUrteil }) {
  return (
    <>
      {urteil.begruendungen.map((begruendung) => (
        <div className="grund" key={begruendung.regel + begruendung.text}>
          {begruendung.titel && <p className="grund__prinzip">{begruendung.titel}</p>}
          <p className="ztext">{begruendung.text}</p>
          {begruendung.grenze && <p className="grund__grenze">{begruendung.grenze}</p>}
        </div>
      ))}
    </>
  )
}

export function Ergebniskarte({
  urteil,
  sswAnzeige,
  trimester,
  favorit = false,
  onFavorit,
  onAlternativePruefen,
}: {
  urteil: Urteil
  sswAnzeige?: string
  trimester?: number
  favorit?: boolean
  onFavorit?: () => void
  onAlternativePruefen?: (alternative: string) => void
}) {
  const erste = urteil.varianten[0]
  const einzeln = urteil.varianten.length === 1 && erste?.label === null
  const trimesterHinweise = [
    ...new Map(
      urteil.varianten
        .flatMap((variante) => variante.trimesterHinweise)
        .map((hinweis) => [hinweis.text, hinweis]),
    ).values(),
  ]
  const statusUnterschiedlich = new Set(urteil.varianten.map((variante) => variante.status)).size > 1
  const grad = entscheidungsgradLebensmittel(erste?.status ?? 'unklar', statusUnterschiedlich)
  const worauf = [urteil.frage, urteil.zusatz].filter((text): text is string => Boolean(text))
  const status = einzeln && erste ? AMPEL[erste.status].wort : 'Kommt drauf an'
  const tone: ResultTone = einzeln && erste ? erste.status : 'unklar'
  const context = [
    sswAnzeige ? `SSW ${sswAnzeige}` : null,
    trimester ? `${trimester}. Trimester` : null,
  ].filter((wert): wert is string => Boolean(wert))
  const alternativeHilfreich = urteil.varianten.some((variante) => variante.status !== 'ok')

  return (
    <article className="karte karte--ergebnis" aria-labelledby="ergebnis-titel">
      <ResultHero
        subject={urteil.name}
        status={status}
        tone={tone}
        grad={grad.label}
        gradText={grad.erklaerung}
        context={context}
        headingId="ergebnis-titel"
      />

      {onFavorit && <FavoritKnopf aktiv={favorit} onUmschalten={onFavorit} />}

      {trimesterHinweise.length > 0 && (
        <section className="ssw-hinweis" aria-label="Hinweis für die aktuelle Schwangerschaftswoche">
          <strong>Für deine aktuelle Schwangerschaftsphase</strong>
          {trimesterHinweise.map((hinweis) => (
            <p key={hinweis.regel + hinweis.text}>{hinweis.text}</p>
          ))}
        </section>
      )}

      {einzeln && erste ? (
        <section className="begruendung-block detailblock" aria-label="Begründung">
          <h3>Warum?</h3>
          <Begruendungen urteil={erste} />
        </section>
      ) : (
        <section className="detailblock" aria-label="Bewertung nach Zubereitung">
          <h3>Warum?</h3>
          <div className="varianten" role="list" aria-label="Bewertung nach Zubereitung">
            {urteil.varianten.map((variante, i) => (
              <div className="zeile" key={variante.label ?? i} data-status={variante.status} role="listitem">
                <div className="zeile__kopf">
                  <span className="zlabel">{variante.label ?? 'Variante'}</span>
                  <span className="marke" data-status={variante.status}>{AMPEL[variante.status].kurz}</span>
                </div>
                <Begruendungen urteil={variante} />
              </div>
            ))}
          </div>
        </section>
      )}

      {worauf.length > 0 && (
        <section className="detailblock detailblock--worauf">
          <h3>Worauf kommt es an?</h3>
          <ul>
            {worauf.map((text) => <li key={text}>{text}</li>)}
          </ul>
        </section>
      )}

      {alternativeHilfreich && urteil.alternativen.length > 0 && (
        <section className="alternative-block" aria-labelledby="alternative-titel">
          <p className="alternative-block__kicker">Alternative</p>
          <h3 id="alternative-titel">Was passt stattdessen?</h3>
          <div className="alternative-block__liste">
            {urteil.alternativen.map((alternative) =>
              onAlternativePruefen ? (
                <button
                  className="alternative-block__knopf"
                  type="button"
                  key={alternative}
                  onClick={() => onAlternativePruefen(alternative)}
                >
                  <span>{alternative}</span>
                  <span aria-hidden="true">Prüfen ›</span>
                </button>
              ) : (
                <span className="alternative-block__text" key={alternative}>{alternative}</span>
              ),
            )}
          </div>
          <p className="alternative-block__hinweis">
            Die Vorschläge stammen aus dem kuratierten Eintrag. Das konkrete Produkt trotzdem
            erneut prüfen — Zubereitung und Zutaten können entscheidend sein.
          </p>
        </section>
      )}
    </article>
  )
}
