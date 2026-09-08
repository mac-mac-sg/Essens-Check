import type { Lebensmittel, LebensmittelKatalog, RegelKatalog, Status } from '../typen'
import type { Produkt } from './produktsuche'
import { listenzeile } from './listenzeile'
import { bewerteteVorschlaege, eindeutigerVorschlag, normalisiere } from './suchen'

type Quelle = 'Produktname' | 'Bezeichnung' | 'Kategorie' | 'Zutaten'

interface KandidatIntern {
  eintrag: Lebensmittel
  punkte: number
  ankerPunkte: number
  quellen: Set<Quelle>
}

export interface ZutatenKonflikt {
  eintrag: Lebensmittel
  status: Status | 'gemischt'
}

export interface ProduktZuordnung {
  /** Kandidaten für die manuelle Auswahl, nach Evidenz sortiert. */
  kandidaten: Lebensmittel[]
  /** Nur gesetzt, wenn die Evidenz die bestehende Eindeutigkeitsschwelle erfüllt. */
  eindeutig: Lebensmittel | null
  /** Welche OFF-Felder den ersten Kandidaten stützen. */
  grundlagen: Quelle[]
  /** Explizit erkannte, bekannte Nein-/Unklar-Zutaten verhindern ein Auto-Urteil. */
  konflikte: ZutatenKonflikt[]
}

/**
 * Fremde Produkttexte enthalten kurze Funktionswörter, die als Wortanfang
 * zufällig auf Katalogbegriffe zeigen können. «mit» traf beispielsweise
 * «Mittel» in «pflanzliche Mittel». Diese Wörter tragen keinerlei
 * Produktinformation und werden nur in OFF-Ankern entfernt; die Handsuche
 * bleibt unverändert.
 */
const FREMDTEXT_STOPPWOERTER = new Set([
  'mit', 'und', 'oder', 'von', 'vom', 'aus',
  'der', 'die', 'das', 'den', 'dem', 'des',
  'ein', 'eine', 'einer', 'eines',
  'de', 'du', 'des', 'et', 'avec', 'aux',
  'the', 'with', 'and', 'of',
])

function ohneFuellwoerter(text: string): string {
  return text
    .split(/\s+/)
    .filter((wort) => {
      const sauber = normalisiere(wort).replace(/[^a-z]/g, '')
      return sauber.length > 0 && !FREMDTEXT_STOPPWOERTER.has(sauber)
    })
    .join(' ')
}

function fuegeAnkerHinzu(
  kandidaten: Map<string, KandidatIntern>,
  text: string | null,
  faktor: number,
  quelle: Exclude<Quelle, 'Zutaten'>,
  katalog: LebensmittelKatalog,
) {
  if (!text) return
  for (const vorschlag of bewerteteVorschlaege(ohneFuellwoerter(text), katalog, 12)) {
    const punkte = vorschlag.gewicht * faktor
    const vorhanden = kandidaten.get(vorschlag.eintrag.id)
    if (vorhanden) {
      vorhanden.punkte += punkte
      vorhanden.ankerPunkte += punkte
      vorhanden.quellen.add(quelle)
    } else {
      kandidaten.set(vorschlag.eintrag.id, {
        eintrag: vorschlag.eintrag,
        punkte,
        ankerPunkte: punkte,
        quellen: new Set([quelle]),
      })
    }
  }
}

/**
 * Hersteller hängen Variantenfarben oft als letztes Wort an einen Markennamen
 * («Rivella Rot», «... Blue»). Als Lebensmittelbegriff ist dieses Wort wertlos
 * und kann falsche Treffer erzeugen — «Rot» traf etwa «Rotbusch»/Rooibos.
 *
 * Nur die *nachgestellte* Farbe wird entfernt. Ein Markenname wie «Red Bull»
 * bleibt deshalb vollständig erhalten und kann weiterhin über sein explizites
 * Katalogsynonym erkannt werden.
 */
const PRODUKTNAME_ENDVARIANTEN = new Set([
  'rot', 'red', 'rouge',
  'blau', 'blue', 'bleu',
  'grun', 'green', 'vert',
  'gelb', 'yellow', 'jaune',
  'schwarz', 'black', 'noir',
  'weiss', 'white', 'blanc',
])

function produktnameOhneEndvariante(text: string): string {
  const teile = text.trim().split(/\s+/)
  if (teile.length < 2) return text
  const letztes = normalisiere(teile[teile.length - 1] ?? '').replace(/[^a-z]/g, '')
  if (!PRODUKTNAME_ENDVARIANTEN.has(letztes)) return text
  return teile.slice(0, -1).join(' ')
}

function zutatenTeile(produkt: Produkt): string[] {
  const teile = new Set<string>()
  for (const tag of produkt.zutaten) {
    const sauber = tag.trim()
    if (sauber) teile.add(sauber)
  }
  if (produkt.zutatenText) {
    for (const teil of produkt.zutatenText.split(/[,;()]/).slice(0, 60)) {
      const sauber = teil.replace(/^\s*[0-9.,]+\s*%?\s*/, '').trim()
      if (normalisiere(sauber).length >= 2) teile.add(sauber)
    }
  }
  return [...teile]
}

/**
 * Zutatenlisten verwenden für Spirituosen oft nicht das Wort «Alkohol»,
 * sondern die konkrete Zutat. In diesem engen Kontext ist «Kirsch» der Brand
 * und nicht die Frucht «Kirschen». Die Begriffe werden nur am Wortanfang mit
 * Wortgrenze erkannt: «Weinessig» oder «Bierhefe» dürfen deshalb nicht sperren.
 */
function istAlkoholzutat(teil: string): boolean {
  return /^(?:alkohol|ethanol|kirsch|rum|marsala|likor|liqueur|cognac|brandy|weinbrand|grappa|amaretto|whisky|whiskey|gin|wodka|vodka)(?:\b|\s)/u.test(
    normalisiere(teil),
  )
}

/**
 * Für ein explizites Fremddaten-Signal wie «Alkohol» wird keine fuzzy Suche
 * benutzt. Nur genau ein Katalogeintrag mit exakt diesem Namen/Synonym darf
 * stellvertretend als Konflikt dienen; bei Mehrdeutigkeit gibt es keinen Fund.
 */
function exaktBenannterEintrag(
  begriff: string,
  katalog: LebensmittelKatalog,
): Lebensmittel | null {
  const gesucht = normalisiere(begriff)
  const treffer = katalog.lebensmittel.filter((eintrag) =>
    [eintrag.name, ...eintrag.synonyme].some((text) => normalisiere(text) === gesucht),
  )
  return treffer.length === 1 ? treffer[0] ?? null : null
}

function zutatenTreffer(
  produkt: Produkt,
  katalog: LebensmittelKatalog,
): Map<string, Lebensmittel> {
  const treffer = new Map<string, Lebensmittel>()
  for (const teil of zutatenTeile(produkt)) {
    const eintrag = eindeutigerVorschlag(teil, katalog)
    if (eintrag) treffer.set(eintrag.id, eintrag)

    if (istAlkoholzutat(teil)) {
      const alkohol = exaktBenannterEintrag('alkohol', katalog)
      if (alkohol) treffer.set(alkohol.id, alkohol)
    }
  }
  return treffer
}

function hatAutoGrundlage(kandidat: KandidatIntern): boolean {
  if (kandidat.quellen.has('Produktname')) return true
  return kandidat.quellen.has('Bezeichnung') && kandidat.quellen.has('Kategorie')
}

/**
 * Verknüpft mehrere Open-Food-Facts-Merkmale mit dem lokalen Katalog.
 *
 * Produktname, generische Bezeichnung und Kategorie sind Anker. Zutaten dürfen
 * einen bereits vorhandenen Kandidaten stützen, aber nie allein einen neuen
 * automatischen Kandidaten erzeugen. Explizite Zutaten, die in unserem Katalog
 * selbst ein «meiden» oder «unklar» tragen, verhindern ein automatisches Urteil.
 * Das kann eine Auskunft also nur vorsichtiger machen, nie permissiver.
 */
export function ordneProduktZu(
  produkt: Produkt,
  katalog: LebensmittelKatalog,
  regeln: RegelKatalog,
): ProduktZuordnung {
  const kandidaten = new Map<string, KandidatIntern>()
  fuegeAnkerHinzu(
    kandidaten,
    produktnameOhneEndvariante(produkt.name),
    5,
    'Produktname',
    katalog,
  )
  fuegeAnkerHinzu(kandidaten, produkt.generischerName, 4, 'Bezeichnung', katalog)
  fuegeAnkerHinzu(
    kandidaten,
    produkt.kategorien.length > 0 ? produkt.kategorien.join(' ') : null,
    3,
    'Kategorie',
    katalog,
  )

  const zutaten = zutatenTreffer(produkt, katalog)
  for (const [id] of zutaten) {
    const kandidat = kandidaten.get(id)
    if (!kandidat) continue
    kandidat.punkte += 6
    kandidat.quellen.add('Zutaten')
  }

  const sortiert = [...kandidaten.values()].sort(
    (a, b) => b.punkte - a.punkte || b.ankerPunkte - a.ankerPunkte ||
      a.eintrag.name.localeCompare(b.eintrag.name, 'de-CH'),
  )
  const [erster, zweiter] = sortiert

  const konflikte: ZutatenKonflikt[] = []
  if (erster) {
    for (const eintrag of zutaten.values()) {
      if (eintrag.id === erster.eintrag.id) continue
      const status = listenzeile(eintrag, regeln).status
      // Nur bekannte klare Nein-/Unklar-Signale blockieren. Ein gemischtes
      // Lebensmittel wie «Milch» darf nicht jedes verarbeitete Produkt sperren.
      if (status === 'meiden' || status === 'unklar') {
        konflikte.push({ eintrag, status })
      }
    }
  }

  let eindeutig: Lebensmittel | null = null
  if (erster && hatAutoGrundlage(erster) && konflikte.length === 0) {
    const abstandReicht = !zweiter || erster.punkte >= zweiter.punkte * 2
    if (abstandReicht) eindeutig = erster.eintrag
  }

  return {
    kandidaten: sortiert.slice(0, 8).map((kandidat) => kandidat.eintrag),
    eindeutig,
    grundlagen: erster ? [...erster.quellen] : [],
    konflikte: konflikte.slice(0, 4),
  }
}
