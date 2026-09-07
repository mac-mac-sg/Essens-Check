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
 * Zugeklappt, weil sie den Weg zur Suche nicht verstellen soll.
 */
export function Grundsaetze() {
  if (regelKatalog.grundsaetze.length === 0) return null

  return (
    <details className="gruppe gruppe--grundsatz">
      <summary className="gruppe__titel">
        <span className="gruppe__name">Gilt immer</span>
        <span className="gruppe__anzahl">{regelKatalog.grundsaetze.length}</span>
        <svg
          className="gruppe__pfeil"
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

      {regelKatalog.grundsaetze.map((grundsatz) => (
        <div className="grundsatz" key={grundsatz.titel}>
          <p className="grundsatz__titel">{grundsatz.titel}</p>
          <p className="grundsatz__text">{grundsatz.text}</p>
        </div>
      ))}
    </details>
  )
}
