import { ALLTAG_STATUS_META, type AlltagEintrag } from './alltag/daten'
import { FavoritKnopf } from './FavoritKnopf'
import { ResultHero, type ResultTone } from './ResultHero'

function sswHinweise(eintrag: AlltagEintrag, ssw?: number): string[] {
  if (ssw === undefined) return []
  return (eintrag.ssw_hinweise ?? [])
    .filter((hinweis) => ssw >= hinweis.von_ssw && ssw <= hinweis.bis_ssw)
    .map((hinweis) => hinweis.text)
}

function toneFuer(status: AlltagEintrag['status']): ResultTone {
  if (status === 'moeglich') return 'ok'
  if (status === 'meiden') return 'meiden'
  if (status === 'nicht_bewertet') return 'unklar'
  return 'bedingt'
}

export function AlltagDetail({
  eintrag,
  ssw,
  sswAnzeige,
  trimester,
  favorit = false,
  onFavorit,
}: {
  eintrag: AlltagEintrag
  ssw?: number
  sswAnzeige?: string
  trimester?: number
  favorit?: boolean
  onFavorit?: () => void
}) {
  const meta = ALLTAG_STATUS_META[eintrag.status]
  const aktuelleHinweise = sswHinweise(eintrag, ssw)
  const context = [
    eintrag.gruppe,
    sswAnzeige ? `SSW ${sswAnzeige}` : null,
    trimester ? `${trimester}. Trimester` : null,
  ].filter((wert): wert is string => Boolean(wert))

  return (
    <article className="alltag-detail">
      <ResultHero
        subject={eintrag.titel}
        status={meta.label}
        tone={toneFuer(eintrag.status)}
        grad={meta.gradLabel}
        context={context}
      />

      {onFavorit && <FavoritKnopf aktiv={favorit} onUmschalten={onFavorit} />}

      <p className="alltag-detail__lead">{eintrag.kurz}</p>

      {aktuelleHinweise.length > 0 && (
        <section className="ssw-hinweis" aria-label="Hinweis für die aktuelle Schwangerschaftswoche">
          <strong>Für deine aktuelle SSW</strong>
          {aktuelleHinweise.map((hinweis) => <p key={hinweis}>{hinweis}</p>)}
        </section>
      )}

      <section className="detailblock">
        <h3>Warum?</h3>
        {eintrag.warum.map((text) => <p key={text}>{text}</p>)}
      </section>

      {eintrag.beachten.length > 0 && (
        <section className="detailblock detailblock--worauf">
          <h3>Worauf kommt es an?</h3>
          <ul>
            {eintrag.beachten.map((punkt) => <li key={punkt}>{punkt}</li>)}
          </ul>
        </section>
      )}

      <section className="detailblock detailblock--quellen">
        <h3>Quellen</h3>
        {eintrag.quellen.length > 0 ? (
          <ul>
            {eintrag.quellen.map((quelle) => (
              <li key={quelle.url}>
                <a href={quelle.url} target="_blank" rel="noreferrer">{quelle.titel}</a>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            Für dieses Thema ist noch keine belastbare spezifische Schweizer Einzelquelle im
            Regelwerk hinterlegt. Deshalb zeigt die App bewusst keine Freigabe.
          </p>
        )}
      </section>
    </article>
  )
}
