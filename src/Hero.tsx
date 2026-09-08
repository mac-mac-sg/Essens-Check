/**
 * Der Einstieg: was die App tut, in zwei Sätzen — und dann das Suchfeld
 * darunter.
 */
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-titel">
      <h2 className="hero__titel" id="hero-titel">
        Ein Lebensmittel, eine klare Antwort.
      </h2>
      <p className="hero__text">
        Eingeben oder scannen — und die Auskunft steht da: mit der Zubereitung, unter der
        sie gilt, und dem Risiko, aus dem sie folgt.
      </p>
    </section>
  )
}
