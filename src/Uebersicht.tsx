import { useMemo } from 'react'
import { lebensmittelKatalog, regelKatalog } from './daten'
import { unbedenkliches } from './engine/uebersicht'

/** Gruppenname zu einer Ankerkennung. */
function kennung(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Beantwortet die umgekehrte Frage: nicht «darf ich X essen?», sondern
 * «was kann ich hier nehmen?». Enthält nur klare Ja — was noch eine
 * Einschränkung mitbringt, gehört nicht in eine Liste zum Zugreifen.
 */
export function Uebersicht({ onOeffnen }: { onOeffnen: (id: string) => void }) {
  const gruppen = useMemo(() => unbedenkliches(lebensmittelKatalog, regelKatalog), [])

  return (
    <section aria-labelledby="uebersicht-titel">
      <h2 className="uebersicht__titel" id="uebersicht-titel">
        Was kann ich essen?
      </h2>
      <p className="uebersicht__hinweis">
        Nur Einträge mit einem klaren Ja. Steht eine Zubereitung dabei, gilt das Ja
        für diese — und nur für diese.
      </p>

      {/* 217 Einträge am Stück sind zu viel Weg, wenn nur eine Gruppe zählt. */}
      <nav className="uebersicht__sprung" aria-label="Zu einer Gruppe springen">
        {gruppen.map((gruppe) => (
          <a className="chip" href={`#gruppe-${kennung(gruppe.name)}`} key={gruppe.name}>
            {gruppe.name}
          </a>
        ))}
      </nav>

      {gruppen.map((gruppe) => (
        <div className="uebersicht__gruppe" key={gruppe.name} id={`gruppe-${kennung(gruppe.name)}`}>
          <h3 className="uebersicht__gruppenname">{gruppe.name}</h3>
          <ul className="liste">
            {gruppe.eintraege.map((eintrag) => (
              <li key={eintrag.id}>
                <button type="button" onClick={() => onOeffnen(eintrag.id)}>
                  <span>
                    {eintrag.name}
                    {eintrag.bedingung && (
                      <span className="uebersicht__bedingung">{eintrag.bedingung}</span>
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
        </div>
      ))}
    </section>
  )
}
