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

const PORT = 4183
const URL = `http://localhost:${PORT}/`
// In dieser Umgebung liegt Chromium an fester Stelle; sonst sucht Playwright selbst.
const CHROMIUM = '/opt/pw-browsers/chromium'
const start = { ...(existsSync(CHROMIUM) && { executablePath: CHROMIUM }) }

const pruefungen = []
const pruefe = (name, bedingung, zusatz = '') => {
  pruefungen.push({ name, ok: Boolean(bedingung), zusatz })
  console.log(`${bedingung ? '  ok  ' : ' FEHL '} ${name}${zusatz ? ` — ${zusatz}` : ''}`)
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], { stdio: 'ignore' })
const aufraeumen = () => server.kill()
process.on('exit', aufraeumen)

try {
  // Auf den Server warten, statt blind zu schlafen.
  for (let i = 0; i < 40; i++) {
    try {
      const antwort = await fetch(URL)
      if (antwort.ok) break
    } catch {
      /* noch nicht bereit */
    }
    await new Promise((r) => setTimeout(r, 250))
  }

  const browser = await chromium.launch(start)
  const kontext = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const seite = await kontext.newPage()
  const seitenfehler = []
  seite.on('pageerror', (e) => seitenfehler.push(String(e)))

  console.log('\nMit Netz:')
  await seite.goto(URL, { waitUntil: 'networkidle' })
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
  await zweite.goto(URL, { waitUntil: 'load' })
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
