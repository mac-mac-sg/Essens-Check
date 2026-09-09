import { useState } from 'react'
import { AlltagDetail } from './AlltagDetail'
import { ALLTAG, ALLTAG_STATUS_META, type AlltagEintrag } from './alltag/daten'
import { Sheet } from './Sheet'

export function AlltagsWissen({
  ssw,
  sswAnzeige,
  trimester,
}: {
  ssw?: number
  sswAnzeige?: string
  trimester?: number
}) {
  const [offen, setOffen] = useState<AlltagEintrag | null>(null)

  return (
    <section className="wissen-alltag" id="wissen-alltag" aria-labelledby="wissen-alltag-titel">
      <div className="wissen-abschnitt__kopf">
        <h2 id="wissen-alltag-titel">Alltag & Gesundheit</h2>
        <p>Praktische Situationen zu Hause, unterwegs, bei medizinischen Untersuchungen und in der Freizeit.</p>
      </div>

      <div className="alltag-karten wissen-alltag__liste">
        {ALLTAG.map((eintrag) => {
          const meta = ALLTAG_STATUS_META[eintrag.status]
          return (
            <button
              className="alltag-karte wissen-alltag__karte"
              type="button"
              key={eintrag.id}
              onClick={() => setOffen(eintrag)}
            >
              <span className="alltag-karte__kopf">
                <span className="alltag-karte__gruppe">{eintrag.gruppe}</span>
                <span className="alltag-status alltag-status--klein" data-status={eintrag.status}>
                  {meta.label}
                </span>
              </span>
              <strong>{eintrag.titel}</strong>
              <span className="alltag-karte__kurz">{eintrag.kurz}</span>
              <span className="alltag-karte__mehr">Mehr erfahren <span aria-hidden="true">›</span></span>
            </button>
          )
        })}
      </div>

      {offen && (
        <Sheet titel={offen.titel} onSchliessen={() => setOffen(null)} fussKnopf="Zurück zum Wissen">
          <AlltagDetail
            eintrag={offen}
            {...(ssw !== undefined ? { ssw } : {})}
            {...(sswAnzeige ? { sswAnzeige } : {})}
            {...(trimester ? { trimester } : {})}
          />
        </Sheet>
      )}
    </section>
  )
}
