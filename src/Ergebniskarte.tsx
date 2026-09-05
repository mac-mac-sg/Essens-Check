import { AMPEL } from './ampel'
import type { Urteil, VariantenUrteil } from './engine/bewerten'

function Begruendungen({ urteil }: { urteil: VariantenUrteil }) {
  return (
    <>
      {urteil.begruendungen.map((begruendung) => (
        <p className="ztext" key={begruendung.regel + begruendung.text}>
          {begruendung.text}
        </p>
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
      <h2 className="titel" id="ergebnis-titel">
        {urteil.name}
      </h2>

      {trimesterHinweise.map((hinweis) => (
        <p className="warnung" key={hinweis.regel}>
          {hinweis.text}
        </p>
      ))}

      {einzeln && erste ? (
        <>
          <span className="urteil" data-status={erste.status}>
            {AMPEL[erste.status].wort}
          </span>
          <div className="text">
            <Begruendungen urteil={erste} />
          </div>
        </>
      ) : (
        <>
          {/* Alle Varianten gleichzeitig sichtbar: die Zubereitung gliedert die
              Karte, statt als Randnotiz danebenzustehen. */}
          <p className="frage">{urteil.frage ?? 'Je nach Zubereitung'}</p>
          {urteil.varianten.map((variante, i) => (
            <div className="zeile" key={variante.label ?? i} data-status={variante.status}>
              <div className="zeile__kopf">
                <span className="marke" data-status={variante.status}>
                  {AMPEL[variante.status].kurz}
                </span>
                {variante.label && <p className="zlabel">{variante.label}</p>}
              </div>
              <Begruendungen urteil={variante} />
            </div>
          ))}
        </>
      )}

      {urteil.alternativen.length > 0 && (
        <div className="alt">
          <p>Stattdessen</p>
          <ul>
            {urteil.alternativen.map((alternative) => (
              <li key={alternative}>{alternative}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}
