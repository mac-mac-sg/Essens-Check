import { AMPEL } from './ampel'
import type { Urteil, VariantenUrteil } from './engine/bewerten'

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

export function Ergebniskarte({ urteil }: { urteil: Urteil }) {
  const erste = urteil.varianten[0]
  const einzeln = urteil.varianten.length === 1 && erste?.label === null
  const trimesterHinweise = urteil.varianten.flatMap((variante) => variante.trimesterHinweise)

  return (
    <article className="karte karte--ergebnis" aria-labelledby="ergebnis-titel">
      <h2 className="titel" id="ergebnis-titel">{urteil.name}</h2>

      {einzeln && erste ? (
        <section className="entscheidung" data-status={erste.status} aria-label="Entscheidung">
          <span className="entscheidung__label">Antwort</span>
          <strong className="entscheidung__wort">{AMPEL[erste.status].wort}</strong>
        </section>
      ) : (
        <p className="frage">{urteil.frage ?? 'Je nach Zubereitung'}</p>
      )}

      {trimesterHinweise.map((hinweis) => (
        <p className="warnung" key={hinweis.regel}>{hinweis.text}</p>
      ))}

      {einzeln && erste ? (
        <section className="begruendung-block" aria-label="Begründung">
          <h3 className="detailtitel">Warum?</h3>
          <Begruendungen urteil={erste} />
        </section>
      ) : (
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
      )}

      {urteil.zusatz && <p className="zusatz">{urteil.zusatz}</p>}

      {urteil.alternativen.length > 0 && (
        <div className="alt">
          <p>Stattdessen</p>
          <ul>{urteil.alternativen.map((alternative) => <li key={alternative}>{alternative}</li>)}</ul>
        </div>
      )}
    </article>
  )
}
