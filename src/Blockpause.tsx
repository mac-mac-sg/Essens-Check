import { useEffect, useMemo, useReducer, useState } from 'react'

const BREITE = 10
const HOEHE = 20
const BESTWERT_SCHLUESSEL = 'essens-check.blockpause.bestwert'

type Matrix = number[][]
type Status = 'bereit' | 'laeuft' | 'pausiert' | 'vorbei'

interface Figur {
  form: Matrix
  x: number
  y: number
  farbe: number
}

interface Spielzustand {
  brett: Matrix
  figur: Figur | null
  punkte: number
  linien: number
  status: Status
}

type Aktion =
  | { typ: 'start' }
  | { typ: 'tick' }
  | { typ: 'bewegen'; dx: number; dy: number }
  | { typ: 'drehen' }
  | { typ: 'fallen' }
  | { typ: 'pause' }

const FORMEN: Matrix[] = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
]

function leeresBrett(): Matrix {
  return Array.from({ length: HOEHE }, () => Array<number>(BREITE).fill(0))
}

function neueFigur(): Figur {
  const index = Math.floor(Math.random() * FORMEN.length)
  const vorlage = FORMEN[index] ?? FORMEN[0]!
  const form = vorlage.map((zeile) => [...zeile])
  const breite = form[0]?.length ?? 1
  return {
    form,
    x: Math.floor((BREITE - breite) / 2),
    y: 0,
    farbe: index + 1,
  }
}

function passt(brett: Matrix, figur: Figur): boolean {
  for (let y = 0; y < figur.form.length; y += 1) {
    const zeile = figur.form[y]
    if (!zeile) continue
    for (let x = 0; x < zeile.length; x += 1) {
      if (!zeile[x]) continue
      const zielX = figur.x + x
      const zielY = figur.y + y
      if (zielX < 0 || zielX >= BREITE || zielY >= HOEHE) return false
      if (zielY >= 0) {
        const brettZeile = brett[zielY]
        if (!brettZeile || brettZeile[zielX] !== 0) return false
      }
    }
  }
  return true
}

function drehen(form: Matrix): Matrix {
  const hoehe = form.length
  const breite = form[0]?.length ?? 0
  return Array.from({ length: breite }, (_, x) =>
    Array.from({ length: hoehe }, (_, y) => form[hoehe - 1 - y]?.[x] ?? 0),
  )
}

function verschmelzen(brett: Matrix, figur: Figur): Matrix {
  const neu = brett.map((zeile) => [...zeile])
  figur.form.forEach((zeile, y) => {
    zeile.forEach((wert, x) => {
      if (!wert) return
      const zielY = figur.y + y
      const zielX = figur.x + x
      if (zielY < 0 || zielY >= HOEHE || zielX < 0 || zielX >= BREITE) return
      const brettZeile = neu[zielY]
      if (brettZeile) brettZeile[zielX] = figur.farbe
    })
  })
  return neu
}

function linienEntfernen(brett: Matrix): { brett: Matrix; anzahl: number } {
  const rest = brett.filter((zeile) => zeile.some((feld) => feld === 0))
  const anzahl = HOEHE - rest.length
  while (rest.length < HOEHE) rest.unshift(Array<number>(BREITE).fill(0))
  return { brett: rest, anzahl }
}

function linienPunkte(anzahl: number): number {
  if (anzahl === 1) return 100
  if (anzahl === 2) return 300
  if (anzahl === 3) return 500
  if (anzahl >= 4) return 800
  return 0
}

function landen(zustand: Spielzustand, figur: Figur, bonus = 0): Spielzustand {
  const mitFigur = verschmelzen(zustand.brett, figur)
  const bereinigt = linienEntfernen(mitFigur)
  const naechste = neueFigur()
  const punkte = zustand.punkte + bonus + linienPunkte(bereinigt.anzahl)
  const linien = zustand.linien + bereinigt.anzahl

  if (!passt(bereinigt.brett, naechste)) {
    return {
      brett: bereinigt.brett,
      figur: null,
      punkte,
      linien,
      status: 'vorbei',
    }
  }

  return {
    brett: bereinigt.brett,
    figur: naechste,
    punkte,
    linien,
    status: 'laeuft',
  }
}

function reducer(zustand: Spielzustand, aktion: Aktion): Spielzustand {
  if (aktion.typ === 'start') {
    const brett = leeresBrett()
    const figur = neueFigur()
    return { brett, figur, punkte: 0, linien: 0, status: 'laeuft' }
  }

  if (aktion.typ === 'pause') {
    if (zustand.status === 'laeuft') return { ...zustand, status: 'pausiert' }
    if (zustand.status === 'pausiert') return { ...zustand, status: 'laeuft' }
    return zustand
  }

  if (zustand.status !== 'laeuft' || !zustand.figur) return zustand

  if (aktion.typ === 'tick') {
    const bewegt = { ...zustand.figur, y: zustand.figur.y + 1 }
    return passt(zustand.brett, bewegt) ? { ...zustand, figur: bewegt } : landen(zustand, zustand.figur)
  }

  if (aktion.typ === 'bewegen') {
    const bewegt = {
      ...zustand.figur,
      x: zustand.figur.x + aktion.dx,
      y: zustand.figur.y + aktion.dy,
    }
    if (passt(zustand.brett, bewegt)) return { ...zustand, figur: bewegt }
    if (aktion.dy > 0) return landen(zustand, zustand.figur)
    return zustand
  }

  if (aktion.typ === 'drehen') {
    const gedreht = { ...zustand.figur, form: drehen(zustand.figur.form) }
    if (passt(zustand.brett, gedreht)) return { ...zustand, figur: gedreht }
    const links = { ...gedreht, x: gedreht.x - 1 }
    if (passt(zustand.brett, links)) return { ...zustand, figur: links }
    const rechts = { ...gedreht, x: gedreht.x + 1 }
    return passt(zustand.brett, rechts) ? { ...zustand, figur: rechts } : zustand
  }

  if (aktion.typ === 'fallen') {
    let gefallen = { ...zustand.figur }
    let schritte = 0
    while (passt(zustand.brett, { ...gefallen, y: gefallen.y + 1 })) {
      gefallen = { ...gefallen, y: gefallen.y + 1 }
      schritte += 1
    }
    return landen(zustand, gefallen, schritte * 2)
  }

  return zustand
}

function leseBestwert(): number {
  try {
    const wert = Number(localStorage.getItem(BESTWERT_SCHLUESSEL) ?? 0)
    return Number.isFinite(wert) && wert > 0 ? Math.floor(wert) : 0
  } catch {
    return 0
  }
}

function schreibeBestwert(wert: number) {
  try {
    localStorage.setItem(BESTWERT_SCHLUESSEL, String(wert))
  } catch {
    // Privater Modus oder gesperrter Speicher: Das Spiel funktioniert trotzdem.
  }
}

const START: Spielzustand = {
  brett: leeresBrett(),
  figur: null,
  punkte: 0,
  linien: 0,
  status: 'bereit',
}

export function Blockpause() {
  const [zustand, dispatch] = useReducer(reducer, START)
  const [bestwert, setBestwert] = useState(leseBestwert)
  const stufe = Math.floor(zustand.linien / 10) + 1
  const tempo = Math.max(140, 680 - (stufe - 1) * 55)

  useEffect(() => {
    if (zustand.status !== 'laeuft') return
    const timer = window.setInterval(() => dispatch({ typ: 'tick' }), tempo)
    return () => window.clearInterval(timer)
  }, [zustand.status, tempo])

  useEffect(() => {
    if (zustand.punkte <= bestwert) return
    setBestwert(zustand.punkte)
    schreibeBestwert(zustand.punkte)
  }, [bestwert, zustand.punkte])

  useEffect(() => {
    const taste = (ereignis: KeyboardEvent) => {
      const steuerTaste = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'p', 'P'].includes(
        ereignis.key,
      )
      if (!steuerTaste) return
      if (zustand.status === 'bereit' || zustand.status === 'vorbei') {
        if (ereignis.key === ' ') {
          ereignis.preventDefault()
          dispatch({ typ: 'start' })
        }
        return
      }
      ereignis.preventDefault()
      if (ereignis.key === 'ArrowLeft') dispatch({ typ: 'bewegen', dx: -1, dy: 0 })
      if (ereignis.key === 'ArrowRight') dispatch({ typ: 'bewegen', dx: 1, dy: 0 })
      if (ereignis.key === 'ArrowDown') dispatch({ typ: 'bewegen', dx: 0, dy: 1 })
      if (ereignis.key === 'ArrowUp') dispatch({ typ: 'drehen' })
      if (ereignis.key === ' ') dispatch({ typ: 'fallen' })
      if (ereignis.key === 'p' || ereignis.key === 'P') dispatch({ typ: 'pause' })
    }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [zustand.status])

  useEffect(() => {
    const sichtbarkeit = () => {
      if (document.hidden && zustand.status === 'laeuft') dispatch({ typ: 'pause' })
    }
    document.addEventListener('visibilitychange', sichtbarkeit)
    return () => document.removeEventListener('visibilitychange', sichtbarkeit)
  }, [zustand.status])

  const anzeige = useMemo(() => {
    const brett = zustand.brett.map((zeile) => [...zeile])
    const figur = zustand.figur
    if (!figur) return brett
    figur.form.forEach((zeile, y) => {
      zeile.forEach((wert, x) => {
        if (!wert) return
        const zielY = figur.y + y
        const zielX = figur.x + x
        const brettZeile = brett[zielY]
        if (zielY >= 0 && brettZeile && zielX >= 0 && zielX < BREITE) {
          brettZeile[zielX] = figur.farbe
        }
      })
    })
    return brett
  }, [zustand.brett, zustand.figur])

  const startText = zustand.status === 'vorbei' ? 'Nochmal spielen' : 'Spiel starten'

  return (
    <section className="blockpause" aria-label="Blockpause">
      <div className="blockpause__kopf">
        <div>
          <p className="blockpause__kicker">Wartezimmer-Modus</p>
          <h2>Blockpause</h2>
        </div>
        <button
          className="blockpause__pause"
          type="button"
          onClick={() => dispatch({ typ: 'pause' })}
          disabled={zustand.status === 'bereit' || zustand.status === 'vorbei'}
        >
          {zustand.status === 'pausiert' ? 'Weiter' : 'Pause'}
        </button>
      </div>

      <div className="blockpause__werte" aria-label="Spielstand">
        <span><b>{zustand.punkte}</b><small>Punkte</small></span>
        <span><b>{bestwert}</b><small>Bestwert</small></span>
        <span><b>{stufe}</b><small>Stufe</small></span>
      </div>

      <div className="blockpause__spiel">
        <div
          className="blockpause__brett"
          role="img"
          aria-label={`Spielfeld, ${zustand.punkte} Punkte, ${zustand.linien} gelöschte Linien`}
        >
          {anzeige.flatMap((zeile, y) =>
            zeile.map((wert, x) => (
              <span
                className="blockpause__feld"
                data-block={wert > 0 ? wert : undefined}
                key={`${y}-${x}`}
              />
            )),
          )}

          {(zustand.status === 'bereit' || zustand.status === 'vorbei' || zustand.status === 'pausiert') && (
            <div className="blockpause__overlay">
              {zustand.status === 'vorbei' && <strong>Wartezeit besiegt.</strong>}
              {zustand.status === 'pausiert' ? (
                <button type="button" onClick={() => dispatch({ typ: 'pause' })}>Weiter</button>
              ) : (
                <button type="button" onClick={() => dispatch({ typ: 'start' })}>{startText}</button>
              )}
            </div>
          )}
        </div>

        <div className="blockpause__steuerung" aria-label="Spielsteuerung">
          <button type="button" onClick={() => dispatch({ typ: 'bewegen', dx: -1, dy: 0 })} aria-label="Nach links">←</button>
          <button type="button" onClick={() => dispatch({ typ: 'drehen' })} aria-label="Drehen">↻</button>
          <button type="button" onClick={() => dispatch({ typ: 'bewegen', dx: 1, dy: 0 })} aria-label="Nach rechts">→</button>
          <button type="button" onClick={() => dispatch({ typ: 'bewegen', dx: 0, dy: 1 })} aria-label="Schneller nach unten">↓</button>
          <button className="blockpause__fallen" type="button" onClick={() => dispatch({ typ: 'fallen' })} aria-label="Ganz nach unten fallen lassen">⇣</button>
        </div>
      </div>

      <p className="blockpause__hilfe">Pfeiltasten zum Bewegen · ↑ drehen · Leertaste fallen lassen · P pausieren</p>
    </section>
  )
}
