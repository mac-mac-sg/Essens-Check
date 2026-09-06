/**
 * Prüfstand: erzeugt die Urteile, die die App tatsächlich ausgibt.
 *
 * Kein Test mit erwarteten Werten, sondern ein Abzug zum Gegenlesen. Wer die
 * Daten pflegt, sieht damit auf einen Blick, was sich an den Urteilen ändert —
 * und kann jede Zeile fachlich prüfen, statt der Maschine zu glauben.
 *
 * Aufruf: node_modules/.bin/vite-node scripts/pruefstand.ts -- <teil>
 *   katalog   alle Einträge mit Urteil je Variante
 *   suche     Suchbegriffe mit Trefferzahl und bestem Treffer
 *   produkt   Produktnamen wie sie von Open Food Facts kämen
 */
import { bewerteLebensmittel } from '../src/engine/bewerten'
import { bewerteteVorschlaege, eindeutigerVorschlag, suche } from '../src/engine/suchen'
import { lebensmittelKatalog, regelKatalog } from '../src/daten'
import type { Lebensmittel, Status } from '../src/typen'

// Record<Status, …> statt Record<string, …>: käme je ein Status dazu, meldet
// das die Typprüfung, statt ihn hier stillschweigend als undefined auszugeben.
const KURZ: Record<Status, string> = {
  ok: 'JA',
  bedingt: 'BEDINGT',
  meiden: 'NEIN',
  unklar: 'UNKLAR',
}

function urteilsZeile(eintrag: Lebensmittel): string {
  const urteil = bewerteLebensmittel(eintrag, regelKatalog)
  const teile = urteil.varianten.map((variante) => {
    const tags = variante.komponenten
      .map((k) => (k.zustand ? `${k.tag}/${k.zustand}` : k.tag))
      .join('+')
    return `${variante.label ?? '—'}=${KURZ[variante.status]}[${tags}]`
  })
  return `${eintrag.name} § ${eintrag.gruppe} § ${teile.join(' | ')}`
}

function teilKatalog(): void {
  const nachGruppe = new Map<string, Lebensmittel[]>()
  for (const eintrag of lebensmittelKatalog.lebensmittel) {
    const liste = nachGruppe.get(eintrag.gruppe) ?? []
    liste.push(eintrag)
    nachGruppe.set(eintrag.gruppe, liste)
  }
  for (const [gruppe, eintraege] of nachGruppe) {
    console.log(`\n##### ${gruppe} (${eintraege.length})`)
    for (const eintrag of eintraege) console.log(urteilsZeile(eintrag))
  }
}

function teilSuche(begriffe: string[]): void {
  for (const begriff of begriffe) {
    const treffer = suche(begriff, lebensmittelKatalog)
    if (treffer.length === 0) {
      console.log(`"${begriff}" -> NULLTREFFER`)
      continue
    }
    const [erster, ...rest] = treffer
    const urteil = bewerteLebensmittel(erster!, regelKatalog)
    const stufen = urteil.varianten
      .map((v) => `${v.label ?? '—'}=${KURZ[v.status]}`)
      .join(' | ')
    const weitere = rest.slice(0, 3).map((e) => e.name).join(', ')
    console.log(
      `"${begriff}" -> ${treffer.length}x | 1. ${erster!.name}: ${stufen}` +
        (weitere ? ` | dann: ${weitere}` : ''),
    )
  }
}

function teilProdukt(namen: string[]): void {
  for (const name of namen) {
    const eindeutig = eindeutigerVorschlag(name, lebensmittelKatalog)
    const gewichte = bewerteteVorschlaege(name, lebensmittelKatalog, 4)
      .map((v) => `${v.eintrag.name}:${v.gewicht}`)
      .join(', ')
    if (!eindeutig) {
      console.log(`"${name}" -> ${gewichte ? `AUSWAHL (${gewichte})` : 'KEIN VORSCHLAG'}`)
      continue
    }
    const urteil = bewerteLebensmittel(eindeutig, regelKatalog)
    const stufen = urteil.varianten
      .map((v) => `${v.label ?? '—'}=${KURZ[v.status]}`)
      .join(' | ')
    console.log(`"${name}" -> URTEIL ${eindeutig.name}: ${stufen}   (${gewichte})`)
  }
}

const [teil, ...eingaben] = process.argv.slice(2)
if (teil === 'katalog') teilKatalog()
else if (teil === 'suche') teilSuche(eingaben)
else if (teil === 'produkt') teilProdukt(eingaben)
else {
  console.error('Teil fehlt: katalog | suche | produkt')
  process.exit(1)
}