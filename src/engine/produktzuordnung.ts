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

function fuegeAnkerHinzu(
  kandidaten: Map<string, KandidatIntern>,
  text: string | null,
  faktor: number,
  quelle: Exclude<Quelle, 'Zutaten'>,
  katalog: LebensmittelKatalog,
) {
  if (!text) return
  for (const vorschlag of bewerteteVorschlaege(text, katalog, 12)) {
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

function zutatenTreffer(
  produkt: Produkt,
  katalog: LebensmittelKatalog,
): Map<string, Lebensmittel> {
  const treffer = new Map<string, Lebensmittel>()
  for (const teil of zutatenTeile(produkt)) {
    const eintrag = eindeutigerVorschlag(teil, katalog)
    if (eintrag) treffer.set(eintrag.id, eintrag)
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
  fuegeAnkerHinzu(kandidaten, produkt.name, 5, 'Produktname', katalog)
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
