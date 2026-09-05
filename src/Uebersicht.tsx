import { useMemo } from 'react'
import { lebensmittelKatalog, regelKatalog } from './daten'
import { unbedenkliches } from './engine/uebersicht'

/**
 * Beantwortet die umgekehrte Frage: nicht «darf ich X essen?», sondern
 * «was kann ich hier nehmen?». Enthält nur klare Ja — was noch eine
 * Einschränkung mitbringt, gehört nicht in eine Liste zum Zugreifen.
 *
 * Die Gruppen sind zugeklappt: 217 Einträge am Stück sind kein Überblick.
 * Zugeklappt passen alle zwölf Titel auf einen Blick, und sie öffnet nur das,
 * was gerade zählt.
 */
export function Uebersicht({ onOeffnen }: { onOeffnen: (id: string) => void }) {
  const gruppen = useMemo(() => unbedenkliches(lebensmittelKatalog, regelKatalog), [])

  return (
    <section aria-labelledby="uebersicht-titel">
      <h2 className="abschnitt__titel" id="uebersicht-titel">
        Was kann ich essen?
      </h2>
      <p className="abschnitt__hinweis">
        Nur Einträge mit einem klaren Ja. Steht eine Zubereitung dabei, gilt das Ja für
        diese — und nur für diese.
      </p>

      {gruppen.map((gruppe) => (
        <details className="gruppe" key={gruppe.name}>
          <summary className="gruppe__titel">
            <span className="gruppe__name">{gruppe.name}</span>
            <span className="gruppe__anzahl">{gruppe.eintraege.length}</span>
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

          <ul className="liste">
            {gruppe.eintraege.map((eintrag) => (
              <li key={eintrag.id}>
                <button type="button" onClick={() => onOeffnen(eintrag.id)}>
                  <span>
                    {eintrag.name}
                    {eintrag.bedingung && (
                      <span className="gruppe__bedingung">{eintrag.bedingung}</span>
                    )}
                  </span>
                  <svg
                    className="liste__pfeil"
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
                </button>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </section>
  )
}
