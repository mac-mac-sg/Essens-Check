import { useMemo, useState } from 'react'
import { lebensmittelKatalog, regelKatalog } from './daten'
import { unbedenkliches, type UebersichtEintrag } from './engine/uebersicht'

/** «Alle» ist kein Warengruppenname und kollidiert deshalb mit keinem. */
const ALLE = 'Alle'

function Pfeil({ klasse }: { klasse: string }) {
  return (
    <svg className={klasse} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 3.5 L10.5 8 L6 12.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Eintragsliste({
  eintraege,
  onOeffnen,
}: {
  eintraege: UebersichtEintrag[]
  onOeffnen: (id: string) => void
}) {
  return (
    <ul className="liste">
      {eintraege.map((eintrag) => (
        <li key={eintrag.id}>
          <button type="button" onClick={() => onOeffnen(eintrag.id)}>
            <span>
              {eintrag.name}
              {eintrag.bedingung && (
                <span className="gruppe__bedingung">{eintrag.bedingung}</span>
              )}
            </span>
            <Pfeil klasse="liste__pfeil" />
          </button>
        </li>
      ))}
    </ul>
  )
}

/**
 * Beantwortet die umgekehrte Frage: nicht «darf ich X essen?», sondern
 * «was kann ich hier nehmen?». Enthält nur klare Ja — was noch eine
 * Einschränkung mitbringt, gehört nicht in eine Liste zum Zugreifen.
 *
 * Zwei Wege hinein. Ohne Filter sind die Gruppen zugeklappt: 246 Einträge am
 * Stück sind kein Überblick, zugeklappt passen alle zwölf Titel auf einen
 * Blick. Ist eine Gruppe gewählt, entfällt das Aufklappen — dann steht ihre
 * Liste direkt da, und ein Behälter um genau einen Inhalt wäre nur ein Griff
 * mehr.
 */
export function Uebersicht({ onOeffnen }: { onOeffnen: (id: string) => void }) {
  const gruppen = useMemo(() => unbedenkliches(lebensmittelKatalog, regelKatalog), [])
  const [filter, setFilter] = useState<string>(ALLE)

  const gewaehlt = gruppen.find((gruppe) => gruppe.name === filter)

  return (
    <section aria-labelledby="uebersicht-titel">
      <h2 className="abschnitt__titel" id="uebersicht-titel">
        Was kann ich essen?
      </h2>
      <p className="abschnitt__hinweis">
        Nur Einträge mit einem klaren Ja. Steht eine Zubereitung dabei, gilt das Ja für
        diese — und nur für diese.
      </p>

      {/*
        Waagrecht scrollbar statt umbrechend: eine Filterreihe, die auf drei
        Zeilen wächst, schiebt die Liste aus dem Bild.
      */}
      <div className="filter" role="group" aria-label="Nach Warengruppe filtern">
        {[ALLE, ...gruppen.map((gruppe) => gruppe.name)].map((name) => (
          <button
            key={name}
            className="filter__chip"
            type="button"
            data-aktiv={name === filter || undefined}
            aria-pressed={name === filter}
            onClick={(ereignis) => {
              setFilter(name)
              // Sonst bliebe der gewählte Chip halb am Bildschirmrand stehen.
              ereignis.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest' })
            }}
          >
            {name}
            <span className="filter__zahl">
              {name === ALLE
                ? gruppen.reduce((summe, gruppe) => summe + gruppe.eintraege.length, 0)
                : (gruppen.find((gruppe) => gruppe.name === name)?.eintraege.length ?? 0)}
            </span>
          </button>
        ))}
      </div>

      {gewaehlt ? (
        <Eintragsliste eintraege={gewaehlt.eintraege} onOeffnen={onOeffnen} />
      ) : (
        gruppen.map((gruppe) => (
          <details className="gruppe" key={gruppe.name}>
            <summary className="gruppe__titel">
              <span className="gruppe__name">{gruppe.name}</span>
              <span className="gruppe__anzahl">{gruppe.eintraege.length}</span>
              <Pfeil klasse="gruppe__pfeil" />
            </summary>
            <Eintragsliste eintraege={gruppe.eintraege} onOeffnen={onOeffnen} />
          </details>
        ))
      )}
    </section>
  )
}
