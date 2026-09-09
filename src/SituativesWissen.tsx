import { useState } from 'react'
import type { CheckRef } from './meineChecks'
import { wissensFokusFuer } from './Wissen'
import { WissensThemen, type WissensStart } from './WissensThemen'

export function SituativesWissen({
  sswAnzeige,
  trimester,
  start,
  onCheck,
  istFavorit,
  onFavorit,
}: {
  sswAnzeige?: string
  trimester?: number
  start?: WissensStart | null
  onCheck?: (ref: CheckRef) => void
  istFavorit?: (ref: CheckRef) => boolean
  onFavorit?: (ref: CheckRef) => void
}) {
  const [internStart, setInternStart] = useState<WissensStart | null>(null)
  const ssw = sswAnzeige ? Number.parseInt(sswAnzeige.split('+')[0] ?? '', 10) : undefined
  const fokus = wissensFokusFuer(Number.isFinite(ssw) ? ssw : undefined, trimester)
  const effektiverStart =
    !start ? internStart : !internStart ? start : start.token >= internStart.token ? start : internStart

  const fokusOeffnen = (id: string) => {
    setInternStart({ art: 'wissen', id, token: Date.now() })
  }

  return (
    <>
      <section className="wissen-editorial" aria-labelledby="wissen-editorial-titel">
        <div className="wissen-editorial__kopf">
          <div>
            <p className="wissen-editorial__kicker">Wissen</p>
            <h2 id="wissen-editorial-titel">
              {sswAnzeige ? 'Diese Woche relevant' : 'Für deine Schwangerschaft'}
            </h2>
          </div>
          {sswAnzeige && <span className="wissen-editorial__ssw">SSW {sswAnzeige}</span>}
        </div>

        <div className="wissen-fokus" aria-label="Aktuell ausgewählte Wissensthemen">
          {fokus.map((artikel) => (
            <button
              className="wissen-fokus__karte"
              type="button"
              key={artikel.id}
              onClick={() => fokusOeffnen(artikel.id)}
            >
              <span className="wissen-fokus__kicker">{artikel.kicker}</span>
              <strong>{artikel.titel}</strong>
              <span>{artikel.kurz}</span>
              <small>Öffnen <span aria-hidden="true">›</span></small>
            </button>
          ))}
        </div>
        <p className="wissen-fokus__hinweis">
          Die Auswahl priorisiert bereits fachlich hinterlegte Themen passend zur aktuellen
          Schwangerschaftsphase. Sie erzeugt kein zusätzliches medizinisches Urteil.
        </p>
      </section>

      <WissensThemen
        {...(Number.isFinite(ssw) ? { ssw } : {})}
        {...(sswAnzeige ? { sswAnzeige } : {})}
        {...(trimester ? { trimester } : {})}
        start={effektiverStart}
        {...(onCheck ? { onCheck } : {})}
        {...(istFavorit ? { istFavorit } : {})}
        {...(onFavorit ? { onFavorit } : {})}
      />
    </>
  )
}
