import { useEffect, useState } from 'react'
import { CHECKLISTE, CHECKLIST_KEY, parseCheckStand, readCheckStand, type CheckStatus, type CheckStand } from './geburtscheckliste'

const PHASEN = [
  { id: 'frueh', titel: 'Früh organisieren', kurz: 'Betreuung und Plätze sichern' },
  { id: 'mitte', titel: 'In Ruhe klären', kurz: 'Versicherungen, Finanzen und Formalitäten' },
  { id: 'spaet', titel: 'Vor der Geburt bereitlegen', kurz: 'Praktisch vorbereitet sein' },
  { id: 'danach', titel: 'Für nach der Geburt vormerken', kurz: 'Jetzt vorbereiten, später abschliessen' },
]

export function GeburtsCheckliste() {
  const [stand, setStand] = useState<CheckStand>(readCheckStand)
  const [nurOffen, setNurOffen] = useState(false)
  const [fehler, setFehler] = useState(false)
  const [reset, setReset] = useState(false)
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === CHECKLIST_KEY || e.key === null) setStand(parseCheckStand(e.newValue))
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  const save = (next: CheckStand) => {
    setStand(next)
    try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next)); setFehler(false) }
    catch { setFehler(true) }
  }
  const change = (id: string, status: CheckStatus) => {
    const next = { ...stand }
    if (status === 'offen') delete next[id]
    else next[id] = status
    save(next)
  }
  const done = CHECKLISTE.filter((e) => stand[e.id] === 'erledigt').length
  const skipped = CHECKLISTE.filter((e) => stand[e.id] === 'entfaellt').length
  const open = CHECKLISTE.length - done - skipped
  return (
    <section className="geburts-checkliste" aria-labelledby="checkliste-titel">
      <div className="checkliste-intro">
        <p className="wissen-editorial__kicker">Vor der Geburt · Schweiz</p>
        <h2 id="checkliste-titel">Schritt für Schritt bereit</h2>
        <p>Was ihr vor der Geburt auf dem Radar haben solltet. Ihr müsst nicht alles auf einmal erledigen.</p>
        <p className="checkliste-fortschritt" role="status">{done} erledigt · {open} offen{skipped > 0 ? ` · ${skipped} nicht relevant` : ''}</p>
        <progress max={CHECKLISTE.length} value={done + skipped} aria-label="Bearbeitete Checklistenpunkte" />
        <p className="checkliste-hinweis">Die Zeitabschnitte sind Planungshilfen, keine festen Fristen. Gesetzliche Fristen stehen direkt beim Punkt.</p>
      </div>
      <div className="checkliste-werkzeuge">
        <button type="button" aria-pressed={nurOffen} onClick={() => setNurOffen(!nurOffen)}>{nurOffen ? 'Alle anzeigen' : 'Nur offene anzeigen'}</button>
        <button type="button" disabled={!done && !skipped} onClick={() => setReset(true)}>Zurücksetzen</button>
      </div>
      {reset && <div className="checkliste-reset" role="group" aria-label="Checkliste zurücksetzen">
        <p>Alle Häkchen und «Nicht relevant»-Markierungen entfernen?</p>
        <button type="button" onClick={() => { save({}); setReset(false) }}>Alles zurücksetzen</button>
        <button type="button" onClick={() => setReset(false)}>Abbrechen</button>
      </div>}
      {fehler && <p role="alert">Dein Browser konnte die Änderungen nicht speichern. Sie bleiben nur bis zum Verlassen dieser Ansicht erhalten.</p>}
      {nurOffen && open === 0 && <p className="checkliste-leer">Alles durchgesehen. Über «Alle anzeigen» kannst du deine Punkte jederzeit wieder öffnen.</p>}
      {PHASEN.map((phase) => {
        const entries = CHECKLISTE.filter((e) => e.phase === phase.id)
        const visible = entries.filter((e) => !nurOffen || !stand[e.id])
        if (!visible.length) return null
        return <section className="checkliste-phase" key={phase.id} aria-labelledby={`phase-${phase.id}`}>
          <div className="checkliste-phase__kopf"><h3 id={`phase-${phase.id}`}>{phase.titel}</h3><span>{entries.filter((e) => !!stand[e.id]).length}/{entries.length}</span></div>
          <p className="checkliste-hinweis">{phase.kurz}</p>
          <div className="checkliste-eintraege">{visible.map((entry) => {
            const status = stand[entry.id] ?? 'offen'
            return <article className="checkliste-eintrag" key={entry.id} data-status={status}>
              <label className="checkliste-label">
                <input type="checkbox" checked={status === 'erledigt'} onChange={(e) => change(entry.id, e.target.checked ? 'erledigt' : 'offen')} />
                <span><small>{entry.kategorie}</small><strong>{entry.titel}</strong></span>
              </label>
              <div className="checkliste-details"><details><summary>Was ist zu tun?</summary><p>{entry.text}</p>
                {entry.quelle && <a href={entry.quelle.url} target="_blank" rel="noopener noreferrer">{entry.quelle.titel} ↗</a>}
              </details>
              <button className="checkliste-skip" type="button" aria-label={`${entry.titel}: ${status === 'entfaellt' ? 'wieder öffnen' : 'nicht relevant'}`} aria-pressed={status === 'entfaellt'} onClick={() => change(entry.id, status === 'entfaellt' ? 'offen' : 'entfaellt')}>
                {status === 'entfaellt' ? 'Nicht relevant · Rückgängig' : 'Für uns nicht relevant'}
              </button></div>
            </article>
          })}</div>
        </section>
      })}
      <p className="checkliste-hinweis">Deine Markierungen bleiben nur in diesem Browser auf diesem Gerät. Kein Konto, keine Synchronisierung. Beim Löschen der Browserdaten gehen sie verloren.</p>
      <p className="checkliste-hinweis">Planungshilfe für die Schweiz · Stand 19.09.2026. Individuelle Ansprüche und Abläufe mit Krankenkasse, Arbeitgeber und zuständiger Stelle klären.</p>
    </section>
  )
}
