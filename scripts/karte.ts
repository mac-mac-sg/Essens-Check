/** Zeigt eine Ergebniskarte so, wie die Oberfläche sie ausgibt. */
import { bewerteLebensmittel } from '../src/engine/bewerten'
import { lebensmittelKatalog, regelKatalog } from '../src/daten'
import { AMPEL } from '../src/ampel'

for (const id of process.argv.slice(2)) {
  const eintrag = lebensmittelKatalog.lebensmittel.find((e) => e.id === id)
  if (!eintrag) { console.log(`!! ${id} nicht gefunden`); continue }
  const urteil = bewerteLebensmittel(eintrag, regelKatalog)
  console.log(`\n=== ${urteil.name}${urteil.frage ? ` — ${urteil.frage}` : ''}`)
  for (const v of urteil.varianten) {
    console.log(`  [${AMPEL[v.status].wort}] ${v.label ?? ''}`)
    for (const b of v.begruendungen) {
      console.log(`     · ${b.titel ? b.titel + ': ' : ''}${b.text}`)
      if (b.grenze) console.log(`       ⤷ Grenze: ${b.grenze}`)
    }
  }
}
