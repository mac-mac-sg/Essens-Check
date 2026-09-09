import { ALLTAG_STATUS_META, type AlltagEintrag } from './alltag/daten'

function sswHinweise(eintrag: AlltagEintrag, ssw?: number): string[] {
  if (ssw === undefined) return []
  return (eintrag.ssw_hinweise ?? [])
    .filter((hinweis) => ssw >= hinweis.von_ssw && ssw <= hinweis.bis_ssw)
    .map((hinweis) => hinweis.text)
}

export function AlltagDetail({
  eintrag,
  ssw,
  sswAnzeige,
  trimester,
}: {
  eintrag: AlltagEintrag
  ssw?: number
  sswAnzeige?: string
  trimester?: number
}) {
  const meta = ALLTAG_STATUS_META[eintrag.status]
  const aktuelleHinweise = sswHinweise(eintrag, ssw)

  return (
    <article className="alltag-detail">
      {(sswAnzeige || trimester) && (
        <div className="kontextleiste" aria-label="Persönlicher Schwangerschaftskontext">
          {sswAnzeige && <span>SSW {sswAnzeige}</span>}
          {trimester && <span>{trimester}. Trimester</span>}
        </div>
      )}

      <section className="alltag-entscheidung" data-status={eintrag.status} aria-label="Einordnung">
        <span className="alltag-entscheidung__label">Einordnung</span>
        <strong>{meta.label}</strong>
      </section>

      <section className="entscheidungsgrad" data-grad={meta.entscheidungsgrad}>
        <span>Entscheidungsgrad</span>
        <strong>{meta.gradLabel}</strong>
      </section>

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
        <section className="detailblock">
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
