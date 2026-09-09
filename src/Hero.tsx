export type HeroBereich = 'lebensmittel' | 'medikamente' | 'alltag'

const BEISPIELE: Record<HeroBereich, string> = {
  lebensmittel: 'Zum Beispiel Salami, Lachs oder Tiramisu.',
  medikamente: 'Zum Beispiel Dafalgan, Ibuprofen oder Paracetamol.',
  alltag: 'Zum Beispiel Sauna, Jogging oder Röntgen.',
}

export function Hero({ bereich }: { bereich: HeroBereich }) {
  return (
    <section className="hero" aria-labelledby="hero-titel">
      <h2 className="hero__titel" id="hero-titel">
        Was möchtest du prüfen?
      </h2>
      <p className="hero__text">{BEISPIELE[bereich]}</p>
    </section>
  )
}
