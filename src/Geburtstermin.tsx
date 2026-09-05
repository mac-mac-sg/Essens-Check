import { useState } from 'react'
import { istPlausibel, speichereGeburtstermin } from './konfig'

/**
 * Eingabe des errechneten Geburtstermins. Der Wert bleibt auf dem Gerät —
 * er wird weder übertragen noch im Repo hinterlegt.
 */
export function Geburtstermin({
  vorhanden,
  onGespeichert,
  onAbbruch,
}: {
  vorhanden: string | null
  onGespeichert: (datum: string) => void
  onAbbruch?: () => void
}) {
  const [wert, setWert] = useState(vorhanden ?? '')
  const [meckern, setMeckern] = useState(false)

  const absenden = (ereignis: React.FormEvent) => {
    ereignis.preventDefault()
    if (!istPlausibel(wert, new Date())) {
      setMeckern(true)
      return
    }
    speichereGeburtstermin(wert)
    onGespeichert(wert)
  }

  return (
    <form className="karte termin" onSubmit={absenden}>
      <label className="feldtitel" htmlFor="termin">
        Errechneter Geburtstermin
      </label>
      <input
        id="termin"
        className="suchfeld suchfeld--datum"
        type="date"
        value={wert}
        onChange={(e) => {
          setWert(e.target.value)
          setMeckern(false)
        }}
        required
      />
      {meckern && (
        <p className="termin__fehler" role="alert">
          Das sieht nicht nach einem Termin in dieser Schwangerschaft aus. Bitte prüfen.
        </p>
      )}
      <p className="termin__hinweis">
        Bleibt auf diesem Gerät gespeichert und wird nirgendwohin übertragen. Ohne
        Termin funktioniert die Suche weiterhin — nur die Wochenanzeige und die
        Hinweise zum Trimester fehlen.
      </p>
      <div className="termin__knoepfe">
        <button className="knopf" type="submit">
          Speichern
        </button>
        {onAbbruch && (
          <button className="zurueck" type="button" onClick={onAbbruch}>
            Abbrechen
          </button>
        )}
      </div>
    </form>
  )
}
