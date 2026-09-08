/**
 * Der Einstieg: was die App tut, in zwei Sätzen — und dann das Suchfeld
 * darunter.
 *
 * Ohne Ampellegende. Sie stand hier als Erklärung der vier Stufen, aber wer
 * die App öffnet, will etwas nachschlagen und nicht erst eine Legende lesen;
 * die Stufen erklären sich auf der ersten Karte von selbst.
 *
 * Auch ohne den Aufhänger «Schwangerschaft · Lebensmittel»: seit der Titel
 * einen Untertitel hat, stand derselbe Satz zweimal untereinander.
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

/**
 * Woran sich die Auskunft misst und was sie regelmässig entscheidet.
 *
 * Steht am Ende der Startansicht: es ist Hintergrund, kein Einstieg. Wer
 * sucht, kommt gar nicht bis hierher — und wer wissen will, worauf die App
 * beruht, scrollt ohnehin.
 *
 * Die erste Kachel trägt den Hinweis auf Hebamme und Ärztin. Er stand vorher
 * als freistehender Satz darunter und sagte dasselbe zweimal; verschwinden
 * darf er nicht (siehe CLAUDE.md), also steht er jetzt dort, wo die Herkunft
 * der Angaben ohnehin erklärt wird. Wo diese Kacheln nicht stehen, trägt ihn
 * weiter die Fusszeile.
 */
export function Hinweiskacheln() {
  return (
    <div className="kacheln">
      <div className="kachel">
        <p className="kachel__titel">Schweizer Empfehlungen</p>
        <p className="kachel__text">
          Kuratiert nach den Angaben von BLV und BAG, die strittigen Stellen fachlich
          gegengelesen. Ersetzt keine Beratung durch Hebamme oder Ärztin — im Zweifel
          dort nachfragen.
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
