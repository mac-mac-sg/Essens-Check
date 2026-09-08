import { regelKatalog } from './daten'

/**
 * Was unabhängig vom Lebensmittel gilt — einmal zentral statt an jedem
 * betroffenen Eintrag.
 *
 * Die Rindenfrage betrifft alle acht Hartkäse-Einträge. Sie dort zu
 * wiederholen hätte die häufigste unbedenkliche Auskunft der App zu einer
 * bedingten gemacht; genau das ist der Rückfallweg, auf dem jede
 * Alternativenliste endet. Deshalb steht sie hier.
 *
 * Die Titel stehen immer da, nur der Text klappt auf. Das war die Auflage der
 * fachlichen Durchsicht zu diesem Punkt: zentral ist besser als wiederholt,
 * aber nur, solange es sichtbar ist. Hinter einer einzigen zugeklappten Zeile
 * mit der Aufschrift «Gilt immer» wäre es das nicht gewesen.
 */
export function Grundsaetze() {
  if (regelKatalog.grundsaetze.length === 0) return null

  return (
    <section className="grundsaetze" aria-labelledby="grundsaetze-titel">
      <h2 className="abschnitt__titel abschnitt__titel--klein" id="grundsaetze-titel">
        Gilt immer
      </h2>

      {regelKatalog.grundsaetze.map((grundsatz) => (
        <details className="grundsatz" key={grundsatz.titel}>
          <summary className="grundsatz__titel">
            <span>{grundsatz.titel}</span>
            <svg
              className="grundsatz__pfeil"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 3.5 L10.5 8 L6 12.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </summary>
          <p className="grundsatz__text">{grundsatz.text}</p>
        </details>
      ))}
    </section>
  )
}
