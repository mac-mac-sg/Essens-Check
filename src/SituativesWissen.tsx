import { Wissensbereich } from './Wissen'

function aktiviereWissensbereich(index: number, zielId: string) {
  const knoepfe = document.querySelectorAll<HTMLButtonElement>('.wissen-bereich')
  knoepfe[index]?.click()
  window.requestAnimationFrame(() => {
    document.getElementById(zielId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

export function SituativesWissen({
  onPruefen,
  onAlltag,
  sswAnzeige,
  trimester,
}: {
  onPruefen: (begriff: string) => void
  onAlltag: () => void
  sswAnzeige?: string
  trimester?: number
}) {
  return (
    <>
      <section className="wissen-situativ" aria-labelledby="wissen-situativ-titel">
        <div className="wissen-situativ__kopf">
          <div>
            <p className="wissen-situativ__kicker">Schnell zur Situation</p>
            <h2 id="wissen-situativ-titel">Was beschäftigt dich gerade?</h2>
          </div>
          {sswAnzeige && (
            <span className="wissen-situativ__ssw">
              SSW {sswAnzeige}{trimester ? ` · ${trimester}. Trimester` : ''}
            </span>
          )}
        </div>
        <p className="wissen-situativ__text">
          Konkrete Bewertungen in Suche und Medikamentenbereich berücksichtigen deine aktuelle
          Schwangerschaftswoche, sobald eine Regel davon abhängt.
        </p>
        <div className="wissen-situativ__aktionen">
          <button type="button" onClick={() => aktiviereWissensbereich(0, 'wissen-ernaehrung')}>
            <strong>{trimester === 1 ? 'Folsäure & Ernährung' : 'Ernährung & Nährstoffe'}</strong>
            <span>Was im Alltag zählt</span>
          </button>
          <button type="button" onClick={() => aktiviereWissensbereich(1, 'wissen-unterwegs')}>
            <strong>Sport & Bewegung</strong>
            <span>Belastung, Sturzrisiko, Höhe</span>
          </button>
          <button type="button" onClick={() => aktiviereWissensbereich(1, 'wissen-unterwegs')}>
            <strong>Unterwegs & Reisen</strong>
            <span>Flug, Hitze, Zecken, Tropen</span>
          </button>
          <button type="button" onClick={onAlltag}>
            <strong>Alltag</strong>
            <span>Katze, Röntgen, Sauna und mehr</span>
          </button>
        </div>
      </section>

      <Wissensbereich onPruefen={onPruefen} />
    </>
  )
}
