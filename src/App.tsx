import { GEBURTSTERMIN } from './konfig'
import { berechneStand } from './schwangerschaft'
import { Fusszeile } from './Fusszeile'

export function App() {
  const stand = berechneStand(GEBURTSTERMIN, new Date())

  return (
    <div className="app">
      <header className="kopfzeile">
        <h1 className="kopfzeile__titel">Darf ich das essen?</h1>
        <p className="kopfzeile__stand">
          <span className="kopfzeile__woche">SSW {stand.anzeige}</span>
          <span className="kopfzeile__trimester">{stand.trimester}. Trimester</span>
        </p>
      </header>

      <main className="inhalt">
        <div className="karte">
          <p className="karte__hinweis">
            Suche und Bewertung folgen mit der Regelmaschine in Aufgabe 2. Die Kataloge
            unter <code>daten/</code> liegen bereit.
          </p>
        </div>
      </main>

      <Fusszeile />
    </div>
  )
}
