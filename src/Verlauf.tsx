import { useMemo } from 'react'
import { lebensmittelKatalog } from './daten'
import { findeNachId } from './engine/suchen'
import { Trefferliste } from './Trefferliste'
import type { Lebensmittel } from './typen'

/**
 * Was zuletzt nachgeschlagen wurde, das Jüngste zuoberst.
 *
 * Steht anstelle einer Liste häufiger Begriffe: die war für alle gleich und
 * damit für niemanden. Was Michelle gestern nachgeschlagen hat, schlägt sie
 * morgen im selben Laden wieder nach.
 *
 * Ist der Verlauf leer, erscheint hier nichts. Ein Kasten mit dem Hinweis, dass
 * er sich noch füllen wird, wäre beim ersten Öffnen genau das, was im Weg steht.
 */
export function Verlauf({
  ids,
  onOeffnen,
  onLeeren,
}: {
  ids: readonly string[]
  onOeffnen: (id: string) => void
  onLeeren: () => void
}) {
  // Ein Eintrag, den es nicht mehr gibt — umbenannt, zusammengelegt —, fällt
  // still heraus, statt eine leere Zeile zu erzeugen.
  const eintraege = useMemo(
    () =>
      ids
        .map((id) => findeNachId(id, lebensmittelKatalog))
        .filter((eintrag): eintrag is Lebensmittel => eintrag !== undefined),
    [ids],
  )

  if (eintraege.length === 0) return null

  return (
    <section aria-labelledby="verlauf-titel">
      <div className="verlauf__kopf">
        <h2 className="abschnitt__titel abschnitt__titel--klein" id="verlauf-titel">
          Verlauf
        </h2>
        {/*
          Eine Liste der nachgeschlagenen Lebensmittel verrät auf einem
          geteilten Gerät etwas über eine Schwangerschaft. Sie muss sich löschen
          lassen, ohne dass man dafür in die Einstellungen des Browsers geht.
        */}
        <button className="verlauf__leeren" type="button" onClick={onLeeren}>
          Leeren
        </button>
      </div>
      <Trefferliste eintraege={eintraege} onOeffnen={onOeffnen} />
    </section>
  )
}
