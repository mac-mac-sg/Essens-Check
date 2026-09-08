/**
 * Der Einstieg: was die App tut, in zwei Sätzen — und dann sofort das
 * Suchfeld, das direkt darunter steht.
 *
 * Ohne Ampellegende. Sie stand hier als Erklärung der vier Stufen, aber wer
 * die App öffnet, will etwas nachschlagen und nicht erst eine Legende lesen;
 * die Stufen erklären sich auf der ersten Karte von selbst.
 */
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-titel">
      <p className="hero__marke">Schwangerschaft · Lebensmittel</p>
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

/**
 * Woran sich die Auskunft misst und was sie regelmässig entscheidet.
 *
 * Steht am Ende der Startansicht: es ist Hintergrund, kein Einstieg. Wer
 * sucht, kommt gar nicht bis hierher — und wer wissen will, worauf die App
 * beruht, scrollt ohnehin.
 */
export function Hinweiskacheln() {
  return (
    <div className="kacheln">
      <div className="kachel">
        <p className="kachel__titel">Schweizer Empfehlungen</p>
        <p className="kachel__text">
          Kuratiert nach den Angaben von BLV und BAG, die strittigen Stellen
          fachlich gegengelesen.
        </p>
      </div>
      <div className="kachel">
        <p className="kachel__titel">Die Zubereitung zählt</p>
        <p className="kachel__text">
          Roh, durcherhitzt, pasteurisiert oder gekühlt macht meistens den Unterschied.
        </p>
      </div>
    </div>
  )
}
