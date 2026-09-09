import { useEffect, useState } from 'react'
import { AlltagsWissen } from './AlltagsWissen'
import { Wissensbereich } from './Wissen'

type Wissensthema = 'ernaehrung' | 'unterwegs' | 'alltag'

function ThemaIcon({ thema }: { thema: Wissensthema }) {
  if (thema === 'ernaehrung') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M15.8 4.2C10.4 4.5 6.6 6.7 5.3 11.1c2.9.6 5.7-.1 8-2.2M5.3 11.1c-.7 2-.9 3.8-.7 5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (thema === 'unterwegs') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 9.2 10 3.8l6.5 5.4v6.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V9.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.8 16.7v-4.8h4.4v4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WissensThemen({
  onPruefen,
  ssw,
  sswAnzeige,
  trimester,
}: {
  onPruefen: (begriff: string) => void
  ssw?: number
  sswAnzeige?: string
  trimester?: number
}) {
  const [thema, setThema] = useState<Wissensthema>('ernaehrung')

  useEffect(() => {
    if (thema !== 'unterwegs') return
    const rahmen = document.querySelector<HTMLElement>('.wissen-themen__standard')
    const zweiterBereich = rahmen?.querySelectorAll<HTMLButtonElement>('.wissen-bereich')[1]
    zweiterBereich?.click()
  }, [thema])

  return (
    <section className="wissen-themen" aria-label="Wissensthemen">
      <div className="wissen-hauptbereiche" role="group" aria-label="Wissensthema wählen">
        <button
          type="button"
          className="wissen-hauptbereich"
          data-wissen-thema="ernaehrung"
          data-aktiv={thema === 'ernaehrung' || undefined}
          aria-pressed={thema === 'ernaehrung'}
          onClick={() => setThema('ernaehrung')}
        >
          <span className="wissen-hauptbereich__icon"><ThemaIcon thema="ernaehrung" /></span>
          <strong>Ernährung</strong>
        </button>
        <button
          type="button"
          className="wissen-hauptbereich"
          data-wissen-thema="unterwegs"
          data-aktiv={thema === 'unterwegs' || undefined}
          aria-pressed={thema === 'unterwegs'}
          onClick={() => setThema('unterwegs')}
        >
          <span className="wissen-hauptbereich__icon"><ThemaIcon thema="unterwegs" /></span>
          <strong>Unterwegs &amp; Aktiv</strong>
        </button>
        <button
          type="button"
          className="wissen-hauptbereich"
          data-wissen-thema="alltag"
          data-aktiv={thema === 'alltag' || undefined}
          aria-pressed={thema === 'alltag'}
          onClick={() => setThema('alltag')}
        >
          <span className="wissen-hauptbereich__icon"><ThemaIcon thema="alltag" /></span>
          <strong>Alltag</strong>
        </button>
      </div>

      <div className="wissen-themen__inhalt" id="wissen-themen-inhalt">
        {thema === 'alltag' ? (
          <AlltagsWissen
            {...(ssw !== undefined ? { ssw } : {})}
            {...(sswAnzeige ? { sswAnzeige } : {})}
            {...(trimester ? { trimester } : {})}
          />
        ) : (
          <div className="wissen-themen__standard">
            <Wissensbereich key={thema} onPruefen={onPruefen} />
          </div>
        )}
      </div>
    </section>
  )
}
