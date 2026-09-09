/**
 * Der Einstieg: was die App tut, in zwei Sätzen — und dann das Suchfeld
 * darunter.
 */
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-titel">
      <h2 className="hero__titel" id="hero-titel">
        Schnell prüfen. Sicher entscheiden.
      </h2>
      <p className="hero__text">
        Einfach eingeben oder scannen und direkt die passende Auskunft erhalten.
      </p>
    </section>
  )
}
