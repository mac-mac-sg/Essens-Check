/**
 * Offline-Test im simulierten Flugmodus.
 *
 * Baut nicht selbst — `npm run build` muss vorher gelaufen sein. Startet die
 * Vorschau, lässt den Service Worker alles ablegen, kappt die Verbindung und
 * prüft danach: vollständiger Neuladevorgang, Suche, Urteil und Kaltstart in
 * einem frischen Tab. Alles muss ohne Netz funktionieren.
 */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const PORT = 4183
// Muss zu `base` in vite.config.ts passen — sonst prüft der Test einen
// anderen Pfad als den, der ausgeliefert wird.
const BASIS = '/Essens-Check/'
const ADRESSE = `http://localhost:${PORT}${BASIS}`
// In dieser Umgebung liegt Chromium an fester Stelle; sonst sucht Playwright selbst.
const CHROMIUM = '/opt/pw-browsers/chromium'
const start = { ...(existsSync(CHROMIUM) && { executablePath: CHROMIUM }) }

const pruefungen = []
const pruefe = (name, bedingung, zusatz = '') => {
  pruefungen.push({ name, ok: Boolean(bedingung), zusatz })
  console.log(`${bedingung ? '  ok  ' : ' FEHL '} ${name}${zusatz ? ` — ${zusatz}` : ''}`)
}

// Ein fremder Server auf dem Port würde einen veralteten Build ausliefern und
// den Test still gegen das Falsche laufen lassen. Lieber sofort abbrechen.
try {
  await fetch(`http://localhost:${PORT}/`)
  console.error(`Port ${PORT} ist belegt. Bitte den Prozess beenden und erneut starten.`)
  process.exit(1)
} catch {
  /* frei, wie erwartet */
}

// Direkt die lokale Vite-Binärdatei starten, nicht über npx: sonst bleibt beim
// Beenden der eigentliche Serverprozess als Waise zurück. `detached` legt eine
// eigene Prozessgruppe an, die sich vollständig beenden lässt.
const viteBin = fileURLToPath(new URL('../node_modules/.bin/vite', import.meta.url))
const server = spawn(viteBin, ['preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
  detached: true,
})

let beendet = false
const aufraeumen = () => {
  if (beendet || server.pid === undefined) return
  beendet = true
  try {
    process.kill(-server.pid, 'SIGTERM')
  } catch {
    /* schon beendet */
  }
}
process.on('exit', aufraeumen)
process.on('SIGINT', () => process.exit(130))

try {
  let bereit = false
  for (let i = 0; i < 60; i++) {
    try {
      const antwort = await fetch(ADRESSE)
      if (antwort.ok) {
        bereit = true
        break
      }
    } catch {
      /* noch nicht bereit */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  if (!bereit) throw new Error(`Vorschau unter ${URL} nicht erreichbar`)

  const browser = await chromium.launch(start)
  const kontext = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const seite = await kontext.newPage()
  const seitenfehler = []
  seite.on('pageerror', (e) => seitenfehler.push(String(e)))

  console.log('\nMit Netz:')
  await seite.goto(ADRESSE, { waitUntil: 'networkidle' })
  await seite.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
    timeout: 20000,
  })
  const abgelegt = await seite.evaluate(async () => {
    const namen = await caches.keys()
    const anzahl = await Promise.all(
      namen.map(async (n) => (await (await caches.open(n)).keys()).length),
    )
    return anzahl.reduce((a, b) => a + b, 0)
  })
  pruefe('Service Worker legt Dateien ab', abgelegt > 0, `${abgelegt} Dateien`)

  console.log('\nOhne Netz:')
  await kontext.setOffline(true)

  await seite.reload({ waitUntil: 'load' })
  const titel = await seite.locator('.kopfzeile__titel').innerText()
  pruefe('Neuladevorgang liefert die App', titel === 'Darf ich das essen?', titel)

  await seite.fill('#suche', 'thunfisch')
  await seite.waitForSelector('.liste')
  await seite.locator('.liste button').first().click()
  await seite.waitForSelector('.karte')
  const marken = await seite.locator('.marke').allInnerTexts()
  pruefe(
    'Suche und Urteil funktionieren',
    marken.join(',') === 'Bedingt,Nein',
    marken.join(', ') || 'keine Marken',
  )

  const zweite = await kontext.newPage()
  await zweite.goto(ADRESSE, { waitUntil: 'load' })
  const chips = await zweite.locator('.chip').allInnerTexts()
  pruefe('Kaltstart in einem neuen Tab', chips.length > 0, `${chips.length} Chips`)

  pruefe('Keine Seitenfehler', seitenfehler.length === 0, seitenfehler.join('; '))
  await browser.close()
} finally {
  aufraeumen()
}

const gescheitert = pruefungen.filter((p) => !p.ok)
console.log(`\n${pruefungen.length - gescheitert.length}/${pruefungen.length} Prüfungen bestanden`)
process.exit(gescheitert.length === 0 ? 0 : 1)
