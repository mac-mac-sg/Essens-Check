export type ResultTone = 'ok' | 'bedingt' | 'meiden' | 'unklar'

export function ResultHero({
  subject,
  status,
  tone,
  grad,
  gradText,
  context = [],
  headingId,
}: {
  subject: string
  status: string
  tone: ResultTone
  grad: string
  gradText?: string
  context?: string[]
  headingId?: string
}) {
  return (
    <section className="result-hero" data-tone={tone} aria-label="Ergebnis">
      <div className="result-hero__kopf">
        <h2 className="result-hero__subject" id={headingId}>{subject}</h2>
        {context.length > 0 && (
          <div className="result-hero__kontext" aria-label="Persönlicher Kontext">
            {context.map((eintrag) => <span key={eintrag}>{eintrag}</span>)}
          </div>
        )}
      </div>
      <strong className="result-hero__status">{status}</strong>
      <div className="result-hero__grad">
        <span>{grad}</span>
        {gradText && <small>{gradText}</small>}
      </div>
    </section>
  )
}
