/**
 * Erzeugt die Prüfliste für die Hebamme aus den echten Daten.
 *
 * Nichts hier ist abgetippt: Regeln, Einträge und Urteile kommen aus den
 * Katalogen und der Regelmaschine, die offenen Fragen aus pruefliste.json.
 * Damit veraltet die Liste nicht, sobald sich die Daten ändern.
 *
 * Aufruf: npm run hebammenliste > hebammenliste.html
 *         npm run hebammenliste -- --artefakt   (ohne eigenes HTML-Gerüst,
 *                                                für die Veröffentlichung)
 */
import { bewerteLebensmittel } from '../src/engine/bewerten'
import { lebensmittelKatalog, regelKatalog } from '../src/daten'
import pruefliste from '@daten/pruefliste.json'
import type { Lebensmittel, Status } from '../src/typen'

const WORT: Record<Status, string> = {
  ok: 'Ja',
  bedingt: 'Bedingt',
  meiden: 'Nein',
  unklar: 'Unklar',
}

const e = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const datum = new Date().toLocaleDateString('de-CH', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

function chip(status: Status, label?: string | null): string {
  return `<span class="chip" data-status="${status}">${WORT[status]}${
    label ? `<span class="chip__label">${e(label)}</span>` : ''
  }</span>`
}

function eintragZeile(eintrag: Lebensmittel): string {
  const urteil = bewerteLebensmittel(eintrag, regelKatalog)
  const chips = urteil.varianten.map((v) => chip(v.status, v.label)).join('')
  // Ein einziges Urteil ohne Zubereitungsfrage passt neben den Namen. Bei 284
  // Einträgen spart das die halbe Länge, ohne dass etwas enger zusammenrückt.
  const knapp = urteil.varianten.length === 1 && !urteil.varianten[0]?.label
  return `<li class="posten${knapp ? ' posten--knapp' : ''}"><span class="posten__name">${e(
    eintrag.name,
  )}</span><span class="posten__urteil">${chips}</span></li>`
}

// --- Teil 1: offene Entscheidungen -----------------------------------------
const punkte = pruefliste.punkte
  .map(
    (p, i) => `<article class="punkt">
  <div class="punkt__zahl" aria-hidden="true">${i + 1}</div>
  <div class="punkt__inhalt">
    <h3>${e(p.titel)}</h3>
    <p class="punkt__betrifft">${p.betrifft.map((b) => `<span>${e(b)}</span>`).join('')}</p>
    <dl>
      <dt>Die App sagt</dt><dd>${e(p.app_sagt)}</dd>
      <dt>Warum</dt><dd>${e(p.warum)}</dd>
      <dt>Meine Frage</dt><dd class="punkt__frage">${e(p.frage)}</dd>
    </dl>
  </div>
</article>`,
  )
  .join('\n')

// --- Teil 2: Regelkatalog ---------------------------------------------------
const regeln = regelKatalog.regeln
  .map((r) => {
    const entschaerfung = r.entschaerfung.length
      ? `<ul class="regel__ent">${r.entschaerfung
          .map(
            (x) =>
              `<li><code>${e(x.durch)}</code> <span class="pfeil">→</span> ${chip(x.auf)} <span>${e(x.text)}</span></li>`,
          )
          .join('')}</ul>`
      : '<p class="regel__ohne">Keine Entschärfung — die Regel gilt unbedingt.</p>'
    return `<article class="regel">
  <header>
    <h3>${e(r.titel)}</h3>
    ${chip(r.status)}
  </header>
  <p>${e(r.begruendung)}</p>
  ${r.grenze ? `<p class="regel__grenze">${e(r.grenze)}</p>` : ''}
  ${entschaerfung}
  <p class="regel__tags">${r.trifft_auf.map((t) => `<code>${e(t)}</code>`).join('')}</p>
</article>`
  })
  .join('\n')

const freigaben = regelKatalog.unbedenkliche_tags
  .map(
    (t) =>
      `<li><code>${e(t.tag)}</code><span>${e(t.text)}</span></li>`,
  )
  .join('')

// --- Teil 3: alle Einträge ---------------------------------------------------
const nachGruppe = new Map<string, Lebensmittel[]>()
for (const eintrag of lebensmittelKatalog.lebensmittel) {
  const liste = nachGruppe.get(eintrag.gruppe) ?? []
  liste.push(eintrag)
  nachGruppe.set(eintrag.gruppe, liste)
}
const gruppen = [...nachGruppe.entries()]
  .map(
    ([name, eintraege]) => `<section class="gruppe">
  <h3>${e(name)} <span class="gruppe__zahl">${eintraege.length}</span></h3>
  <ul class="posten-liste">${eintraege.map(eintragZeile).join('')}</ul>
</section>`,
  )
  .join('\n')

const varianten = lebensmittelKatalog.lebensmittel.reduce(
  (s, x) => s + x.varianten.length,
  0,
)

/**
 * Als Artefakt liefert der Dienst Gerüst und Kopf selbst; dort darf die Seite
 * kein eigenes html/head mitbringen. Als Datei zum Öffnen und Drucken schon.
 */
const alsArtefakt = process.argv.includes('--artefakt')
const kopfAuf = alsArtefakt
  ? ''
  : `<!doctype html>
<html lang="de-CH" data-generiert="${datum}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
`
const kopfZu = alsArtefakt ? '' : '</head>\n<body>'
const fussZu = alsArtefakt ? '' : '\n</body>\n</html>'

console.log(`${kopfAuf}<title>Prüfliste Schwangerschaftskatalog</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap">
<style>
:root {
  --grund: #f4f5f2;
  --blatt: #ffffff;
  --text: #16211c;
  --leise: #5f6b62;
  --zweit: #3b453e;
  --linie: #d8dad2;
  --tanne: #14432f;
  --ok-schrift: #14432f;   --ok-flaeche: #dbe7de;
  --bed-schrift: #7a5311;  --bed-flaeche: #efe6d5;
  --nein-schrift: #7a1e28; --nein-flaeche: #f0dcde;
  --unk-schrift: #55605a;  --unk-flaeche: #e4e6e1;
  --serif: "Source Serif 4", Georgia, "Times New Roman", serif;
  --grotesk: Archivo, "Helvetica Neue", Arial, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --grund: #0f1512; --blatt: #191f1b; --text: #e9eee9; --leise: #9ca79f;
    --zweit: #c3ccc4; --linie: #2c3430; --tanne: #86cca4;
    --ok-schrift: #7cc79b;   --ok-flaeche: #17301f;
    --bed-schrift: #e3b662;  --bed-flaeche: #332614;
    --nein-schrift: #f0a3ab; --nein-flaeche: #34191d;
    --unk-schrift: #aab4ac;  --unk-flaeche: #262c28;
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --grund: #0f1512; --blatt: #191f1b; --text: #e9eee9; --leise: #9ca79f;
  --zweit: #c3ccc4; --linie: #2c3430; --tanne: #86cca4;
  --ok-schrift: #7cc79b;   --ok-flaeche: #17301f;
  --bed-schrift: #e3b662;  --bed-flaeche: #332614;
  --nein-schrift: #f0a3ab; --nein-flaeche: #34191d;
  --unk-schrift: #aab4ac;  --unk-flaeche: #262c28;
  color-scheme: dark;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 0 1.25rem 5rem;
  background: var(--grund);
  color: var(--text);
  font-family: var(--serif);
  font-size: 17px;
  line-height: 1.6;
  font-optical-sizing: auto;
}
.bahn { max-width: 42rem; margin: 0 auto; }
.bahn--weit { max-width: 62rem; margin: 0 auto; }
h1, h2, h3, .kopf__marke, .teil__zahl, dt, .chip, .gruppe__zahl {
  font-family: var(--grotesk);
}
h1 {
  margin: 0 0 0.5rem;
  font-size: clamp(1.9rem, 5.5vw, 2.6rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
  text-wrap: balance;
}
h2 { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.015em; margin: 0; }
h3 { font-size: 1.0625rem; font-weight: 600; letter-spacing: -0.006em; margin: 0; }
p { margin: 0 0 0.85rem; }
code { font-family: var(--mono); font-size: 0.8125em; }

/* Kopf */
.kopf { padding: 3.5rem 0 2.5rem; border-bottom: 2px solid var(--tanne); }
.kopf__marke {
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--tanne); margin: 0 0 1rem;
}
.kopf__lead { font-size: 1.125rem; color: var(--zweit); margin-bottom: 1.5rem; }
.kopf__zahlen {
  display: flex; flex-wrap: wrap; gap: 0 2rem;
  padding-top: 1.25rem; border-top: 1px solid var(--linie);
  font-family: var(--mono); font-size: 0.8125rem; color: var(--leise);
  font-variant-numeric: tabular-nums;
}

/* Teil-Überschrift */
.teil { display: flex; align-items: baseline; gap: 1rem; margin: 4rem 0 0.75rem; }
.teil__zahl {
  flex: 0 0 auto; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--tanne);
}
.teil__text { color: var(--leise); margin-bottom: 2rem; }

/* Punkte */
.punkte { display: flex; flex-direction: column; gap: 1.25rem; }
.punkt {
  display: flex; gap: 1.25rem;
  background: var(--blatt); border-radius: 4px;
  border-left: 3px solid var(--tanne);
  padding: 1.5rem 1.5rem 1.25rem;
}
.punkt__zahl {
  flex: 0 0 1.75rem; font-size: 1.375rem; font-weight: 700; line-height: 1.1;
  color: var(--tanne); font-variant-numeric: tabular-nums;
}
.punkt__inhalt { min-width: 0; flex: 1; }
.punkt__betrifft {
  display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0.6rem 0 1rem;
}
.punkt__betrifft span {
  font-family: var(--mono); font-size: 0.6875rem; line-height: 1.5;
  padding: 0.15rem 0.45rem; border-radius: 3px;
  background: var(--grund); color: var(--leise);
}
.punkt dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 0.35rem 1rem; }
.punkt dt {
  font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--leise); padding-top: 0.35rem;
  white-space: nowrap;
}
.punkt dd { margin: 0; font-size: 0.9375rem; line-height: 1.55; }
.punkt__frage { font-weight: 600; color: var(--tanne); }

/* Regeln */
.regeln { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr)); }
.regel { background: var(--blatt); border-radius: 4px; padding: 1.25rem; }
.regel header { display: flex; align-items: start; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.6rem; }
.regel p { font-size: 0.9375rem; line-height: 1.5; }
.regel__grenze {
  padding-left: 0.7rem; border-left: 2px solid var(--bed-schrift);
  color: var(--zweit); font-size: 0.875rem;
}
.regel__ent { list-style: none; margin: 0 0 0.75rem; padding: 0.75rem 0 0; border-top: 1px solid var(--linie); display: flex; flex-direction: column; gap: 0.5rem; }
.regel__ent li { font-size: 0.8125rem; line-height: 1.45; color: var(--zweit); }
.regel__ent .pfeil { color: var(--leise); }
.regel__ohne { font-size: 0.8125rem; color: var(--leise); font-style: italic; }
.regel__tags { display: flex; flex-wrap: wrap; gap: 0.25rem; margin: 0; }
.regel__tags code { background: var(--grund); color: var(--leise); padding: 0.1rem 0.35rem; border-radius: 3px; }
.freigaben { list-style: none; margin: 1rem 0 0; padding: 1.25rem; background: var(--blatt); border-radius: 4px; display: grid; gap: 0.6rem; }
.freigaben li { display: grid; grid-template-columns: 13rem 1fr; gap: 0 1rem; font-size: 0.875rem; line-height: 1.45; }
.freigaben code { color: var(--ok-schrift); }

/* Chips */
.chip {
  display: inline-flex; align-items: baseline; gap: 0.4rem; flex: 0 0 auto;
  font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.02em;
  padding: 0.2rem 0.5rem; border-radius: 3px; white-space: nowrap;
}
.chip__label { font-family: var(--serif); font-weight: 400; letter-spacing: 0; opacity: 0.85; white-space: normal; }
.chip[data-status="ok"] { color: var(--ok-schrift); background: var(--ok-flaeche); }
.chip[data-status="bedingt"] { color: var(--bed-schrift); background: var(--bed-flaeche); }
.chip[data-status="meiden"] { color: var(--nein-schrift); background: var(--nein-flaeche); }
.chip[data-status="unklar"] { color: var(--unk-schrift); background: var(--unk-flaeche); }

/* Katalog */
.gruppen { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr)); align-items: start; }
.gruppe { background: var(--blatt); border-radius: 4px; padding: 1.25rem; break-inside: avoid; }
.gruppe h3 { display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; padding-bottom: 0.6rem; border-bottom: 1px solid var(--linie); }
.gruppe__zahl { font-size: 0.75rem; font-weight: 500; color: var(--leise); font-variant-numeric: tabular-nums; }
.posten-liste { list-style: none; margin: 0; padding: 0; }
.posten { padding: 0.55rem 0; border-bottom: 1px solid var(--linie); }
.posten:last-child { border-bottom: 0; padding-bottom: 0; }
.posten__name { display: block; font-size: 0.9375rem; font-weight: 600; line-height: 1.35; }
.posten__urteil { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.3rem; }
.posten--knapp {
  display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem;
}
.posten--knapp .posten__urteil { margin-top: 0; }

/* Fuss */
.fuss { margin-top: 4rem; padding-top: 1.5rem; border-top: 2px solid var(--tanne); color: var(--leise); font-size: 0.9375rem; }

@media print {
  body { background: #fff; color: #000; font-size: 10.5pt; padding: 0; }
  .teil { break-before: page; }
  .kopf + .teil { break-before: auto; }
  .punkt, .regel, .gruppe { break-inside: avoid; border: 1px solid #ccc; }
}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
</style>
${kopfZu}

<header class="kopf bahn">
  <p class="kopf__marke">Darf ich das essen? · Fachliche Durchsicht</p>
  <h1>Prüfliste zum Schwangerschaftskatalog</h1>
  <p class="kopf__lead">Diese App gibt Auskunft, auf die im Laden eine Entscheidung folgt. Der Katalog ist von mir zusammengestellt und nirgends fachlich gegengelesen. Diese Liste sagt, wo ich entschieden habe und woran ich zweifle.</p>
  <p>Teil 1 sind die zwölf Stellen, an denen meine Zeit am wenigsten wert war und Ihre am meisten. Teil 2 zeigt die Regeln, aus denen alle Urteile entstehen — steht dort etwas schief, betrifft es viele Einträge auf einmal. Teil 3 ist der vollständige Katalog zum Querlesen.</p>
  <p class="kopf__zahlen">
    <span>Stand ${datum}</span>
    <span>${regelKatalog.regeln.length} Regeln</span>
    <span>${regelKatalog.unbedenkliche_tags.length} Freigaben</span>
    <span>${lebensmittelKatalog.lebensmittel.length} Einträge</span>
    <span>${varianten} Varianten</span>
  </p>
</header>

<div class="bahn">
  <div class="teil"><span class="teil__zahl">Teil 1</span><h2>Offene Entscheidungen</h2></div>
  <p class="teil__text">Jede dieser zwölf habe ich getroffen, ohne sie fachlich absichern zu können. Sie können sich auf die Nummer beziehen.</p>
  <div class="punkte">
${punkte}
  </div>
</div>

<div class="bahn--weit">
  <div class="teil"><span class="teil__zahl">Teil 2</span><h2>Die Regeln</h2></div>
  <p class="teil__text">Jede Regel beschreibt ein Risikoprinzip. Lebensmittel verweisen über Tags darauf; das Urteil entsteht erst hier. Trifft mehr als eine Regel zu, gewinnt die strengere.</p>
  <div class="regeln">
${regeln}
  </div>

  <h3 style="margin-top:2.5rem">Tags, die ausdrücklich freigeben</h3>
  <p class="teil__text" style="margin-bottom:0">Diese lösen keine Regel aus, sondern erklären etwas für unbedenklich. 120 der ${lebensmittelKatalog.lebensmittel.length} Einträge bekommen darüber ein Ja ohne jede Rückfrage — siehe Punkt 3.</p>
  <ul class="freigaben">${freigaben}</ul>
</div>

<div class="bahn--weit">
  <div class="teil"><span class="teil__zahl">Teil 3</span><h2>Alle Einträge mit Urteil</h2></div>
  <p class="teil__text">So, wie die App sie ausgibt. Mehrere Marken heissen: die Zubereitung entscheidet, und die App fragt danach.</p>
  <div class="gruppen">
${gruppen}
  </div>
</div>

<footer class="fuss bahn">
  <p><strong>Was ich brauche:</strong> zu Teil 1 eine Einschätzung je Nummer, in Teil 3 alles, was Ihnen beim Querlesen aufstösst. Auch ein «zu streng» ist eine Antwort — die App soll nicht mehr verbieten, als nötig ist.</p>
  <p>Erzeugt aus den Katalogdateien am ${datum}. Ändern sich die Daten, wird diese Liste neu erzeugt und stimmt wieder.</p>
</footer>${fussZu}`)
