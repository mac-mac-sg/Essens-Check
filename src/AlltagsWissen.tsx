import { useState } from 'react'
import { AlltagDetail } from './AlltagDetail'
import { ALLTAG, type AlltagEintrag } from './alltag/daten'
import { Sheet } from './Sheet'

function AlltagSymbol({ gruppe }: { gruppe: string }) {
  const inhalt = (() => {
    if (gruppe === 'Medizin') {
      return <path d="M10 4v12M4 10h12" />
    }
    if (gruppe === 'Reisen') {
      return <><rect x="4" y="6.2" width="12" height="9.2" rx="1.8" /><path d="M7.5 6.2V4.8c0-.7.5-1.2 1.2-1.2h2.6c.7 0 1.2.5 1.2 1.2v1.4M7 10.8h6M10 8.8v4" /></>
    }
    if (gruppe === 'Kosmetik') {
      return <><path d="M10 3.2v4.1M10 12.7v4.1M3.2 10h4.1M12.7 10h4.1" /><path d="m5.2 5.2 2.1 2.1M12.7 12.7l2.1 2.1M14.8 5.2l-2.1 2.1M7.3 12.7l-2.1 2.1" /></>
    }
    if (gruppe === 'Freizeit') {
      return <><circle cx="10" cy="10" r="3.2" /><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4" /></>
    }
    return <><path d="M3.5 9.2 10 3.8l6.5 5.4v6.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V9.2Z" /><path d="M7.8 16.7v-4.8h4.4v4.8" /></>
  })()

  return (
    <span className="wissen-symbol" aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {inhalt}
      </svg>
    </span>
  )
}

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
        <h2 id="wissen-alltag-titel">Alltag in der Schwangerschaft</h2>
        <p>Situationen zu Hause, unterwegs, bei medizinischen Untersuchungen und in der Freizeit.</p>
      </div>

      <div className="wissen-karten wissen-alltag__liste">
        {ALLTAG.map((eintrag) => (
          <button
            className="wissen-karte wissen-alltag__karte"
            type="button"
            key={eintrag.id}
            onClick={() => setOffen(eintrag)}
          >
            <AlltagSymbol gruppe={eintrag.gruppe} />
            <span className="wissen-karte__kicker">{eintrag.gruppe}</span>
            <strong>{eintrag.titel}</strong>
            <span className="wissen-karte__kurz">{eintrag.kurz}</span>
            <span className="wissen-karte__mehr">Mehr erfahren <span aria-hidden="true">›</span></span>
          </button>
        ))}
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
