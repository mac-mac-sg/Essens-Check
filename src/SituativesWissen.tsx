import { AlltagsWissen } from './AlltagsWissen'
import { Wissensbereich } from './Wissen'

function aktiviereWissensbereich(index: number, zielId: string) {
  const knoepfe = document.querySelectorAll<HTMLButtonElement>('.wissen-bereich')
  knoepfe[index]?.click()
  window.requestAnimationFrame(() => {
    document.getElementById(zielId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function geheZuAlltag() {
  document.getElementById('wissen-alltag')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function fokusFuer(trimester?: number) {
  if (trimester === 1) {
    return {
      kicker: 'Für dich gerade relevant',
      titel: 'Folsäure, Ernährung und ein guter Start',
      text: 'Im ersten Trimester stehen Versorgung, Verträglichkeit und sichere Lebensmittel besonders im Fokus.',
      aktion: 'Ernährung ansehen',
      onClick: () => aktiviereWissensbereich(0, 'wissen-ernaehrung'),
    }
  }
  if (trimester === 3) {
    return {
      kicker: 'Für dich gerade relevant',
      titel: 'Belastung, Reisen und Alltag gut dosieren',
      text: 'Mit wachsendem Bauch werden Komfort, Gleichgewicht, Hitze und längere Wege im Alltag wichtiger.',
      aktion: 'Alltag ansehen',
      onClick: geheZuAlltag,
    }
  }
  return {
    kicker: 'Für dich gerade relevant',
    titel: 'Bewegung, Energie und Alltag im Gleichgewicht',
    text: 'Im mittleren Schwangerschaftsdrittel lassen sich viele Aktivitäten gut anpassen – solange Belastung und Risiko stimmen.',
    aktion: 'Sport & Bewegung ansehen',
    onClick: () => aktiviereWissensbereich(1, 'wissen-unterwegs'),
  }
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
  void onAlltag
  const fokus = fokusFuer(trimester)
  const ssw = sswAnzeige ? Number.parseInt(sswAnzeige.split('+')[0] ?? '', 10) : undefined

  return (
    <>
      <section className="wissen-editorial" aria-labelledby="wissen-editorial-titel">
        <div className="wissen-editorial__kopf">
          <div>
            <p className="wissen-editorial__kicker">Wissen</p>
            <h2 id="wissen-editorial-titel">Für deine Schwangerschaft</h2>
          </div>
          {sswAnzeige && <span className="wissen-editorial__ssw">SSW {sswAnzeige}</span>}
        </div>

        <article className="wissen-feature">
          <p className="wissen-feature__kicker">{fokus.kicker}</p>
          <h3>{fokus.titel}</h3>
          <p>{fokus.text}</p>
          <button type="button" onClick={fokus.onClick}>{fokus.aktion} <span aria-hidden="true">›</span></button>
        </article>

        <div className="wissen-chips" role="group" aria-label="Wissen nach Situation">
          <button type="button" onClick={() => aktiviereWissensbereich(0, 'wissen-ernaehrung')}>Ernährung</button>
          <button type="button" onClick={() => aktiviereWissensbereich(1, 'wissen-unterwegs')}>Sport</button>
          <button type="button" onClick={() => aktiviereWissensbereich(1, 'wissen-unterwegs')}>Reisen</button>
          <button type="button" onClick={geheZuAlltag}>Alltag</button>
        </div>
      </section>

      <Wissensbereich onPruefen={onPruefen} />
      <AlltagsWissen
        {...(Number.isFinite(ssw) ? { ssw } : {})}
        {...(sswAnzeige ? { sswAnzeige } : {})}
        {...(trimester ? { trimester } : {})}
      />
    </>
  )
}
