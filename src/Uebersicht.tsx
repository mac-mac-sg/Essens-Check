import { useMemo, useState } from 'react'
import { lebensmittelKatalog, regelKatalog } from './daten'
import { unbedenkliches, type UebersichtEintrag } from './engine/uebersicht'

const ALLE = 'Alle'

function Pfeil({ klasse }: { klasse: string }) {
  return (
    <svg className={klasse} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3.5 L10.5 8 L6 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Eintragsliste({ eintraege, onOeffnen }: { eintraege: UebersichtEintrag[]; onOeffnen: (id: string) => void }) {
  return (
    <ul className="liste liste--verbunden">
      {eintraege.map((eintrag) => (
        <li key={eintrag.id}>
          <button type="button" onClick={() => onOeffnen(eintrag.id)}>
            <span>
              {eintrag.name}
              {eintrag.bedingung && <span className="gruppe__bedingung">{eintrag.bedingung}</span>}
            </span>
            <Pfeil klasse="liste__pfeil" />
          </button>
        </li>
      ))}
    </ul>
  )
}

export function Uebersicht({ onOeffnen }: { onOeffnen: (id: string) => void }) {
  const gruppen = useMemo(() => unbedenkliches(lebensmittelKatalog, regelKatalog), [])
  const [filter, setFilter] = useState<string>(ALLE)
  const gewaehlt = gruppen.find((gruppe) => gruppe.name === filter)

  return (
    <section aria-labelledby="uebersicht-titel">
      <h2 className="abschnitt__titel" id="uebersicht-titel">Was kann ich essen?</h2>
      <p className="abschnitt__hinweis">
        Nur Einträge mit einem klaren Ja. Wenn eine Zubereitung genannt ist, gilt die Freigabe nur dafür.
      </p>

      {filter === ALLE ? (
        <div className="kategorien" aria-label="Warengruppen">
          {gruppen.map((gruppe) => (
            <button className="kategorie" key={gruppe.name} type="button" onClick={() => setFilter(gruppe.name)}>
              <span className="kategorie__name">{gruppe.name}</span>
              <span className="kategorie__meta">{gruppe.eintraege.length} Einträge</span>
              <Pfeil klasse="kategorie__pfeil" />
            </button>
          ))}
        </div>
      ) : (
        <>
          <button className="uebersicht-zurueck" type="button" onClick={() => setFilter(ALLE)}>
            ‹ Alle Kategorien
          </button>
          <div className="uebersicht-kopf">
            <h3 className="uebersicht-kopf__titel">{gewaehlt?.name}</h3>
            <span className="uebersicht-kopf__zahl">{gewaehlt?.eintraege.length ?? 0}</span>
          </div>
          {gewaehlt && <Eintragsliste eintraege={gewaehlt.eintraege} onOeffnen={onOeffnen} />}
        </>
      )}
    </section>
  )
}
