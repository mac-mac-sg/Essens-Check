import { AMPEL } from './ampel'
import type { Urteil, VariantenUrteil } from './engine/bewerten'

/** Farbige Marke, die das Urteil immer auch ausschreibt. */
function Marke({ urteil, lang = false }: { urteil: VariantenUrteil; lang?: boolean }) {
  const stufe = AMPEL[urteil.status]
  return (
    <span
      className={lang ? 'urteil' : 'marke'}
      style={{ color: stufe.farbe, background: stufe.flaeche }}
    >
      {lang ? stufe.wort : stufe.kurz}
    </span>
  )
}

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
  // Eine einzelne Variante ohne Bezeichnung ist keine Zubereitungsfrage.
  const erste = urteil.varianten[0]
  const einzeln = urteil.varianten.length === 1 && erste?.label === null
  const trimesterHinweise = urteil.varianten.flatMap((variante) => variante.trimesterHinweise)

  return (
    <article className="karte" aria-labelledby="ergebnis-titel">
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
          <Marke urteil={erste} lang />
          <div className="text">
            <Begruendungen urteil={erste} />
          </div>
        </>
      ) : (
        <>
          {/* Alle Varianten sind gleichzeitig sichtbar: die Zubereitung ist
              der entscheidende Faktor, das soll auf einen Blick erkennbar sein. */}
          <p className="frage">{urteil.frage ?? 'Je nach Zubereitung'}</p>
          {urteil.varianten.map((variante, i) => (
            <div className="zeile" key={variante.label ?? i}>
              <Marke urteil={variante} />
              <div>
                {variante.label && <p className="zlabel">{variante.label}</p>}
                <Begruendungen urteil={variante} />
              </div>
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
