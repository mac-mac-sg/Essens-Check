export function Hero() {
  return (
    <section className="hero" aria-label="Kurzhinweis">
      <p className="hero__text">
        Eingeben oder scannen — die Antwort zeigt direkt, ob und unter welcher Zubereitung
        ein Lebensmittel passt.
      </p>
    </section>
  )
}

export function Hinweiskacheln() {
  return (
    <div className="kacheln">
      <div className="kachel">
        <p className="kachel__titel">Schweizer Empfehlungen</p>
        <p className="kachel__text">
          Kuratiert nach BLV und BAG, strittige Stellen fachlich gegengelesen. Ersetzt
          keine Beratung durch Hebamme oder Ärztin.
        </p>
      </div>
      <div className="kachel">
        <p className="kachel__titel">Zubereitung entscheidet</p>
        <p className="kachel__text">
          Roh, durcherhitzt, pasteurisiert oder gekühlt kann das Urteil verändern.
        </p>
      </div>
    </div>
  )
}
