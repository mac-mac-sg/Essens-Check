import type { Produkt } from './produktsuche'

export type ProduktmerkmalArt = 'info' | 'vorsicht' | 'entlastend'

export interface Produktmerkmal {
  id: string
  label: string
  wert: string
  art: ProduktmerkmalArt
  hinweis: string
}

function normalisiere(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('de-CH')
    .replace(/\s+/gu, ' ')
    .trim()
}

function gesamttext(produkt: Produkt): string {
  return normalisiere(
    [
      produkt.name,
      produkt.generischerName ?? '',
      ...produkt.kategorien,
      produkt.zutatenText ?? '',
      ...produkt.zutaten,
    ].join(' '),
  )
}

const FISCHARTEN = [
  ['lachs', 'Lachs'],
  ['thunfisch', 'Thunfisch'],
  ['hering', 'Hering'],
  ['makrele', 'Makrele'],
  ['zander', 'Zander'],
  ['hecht', 'Hecht'],
  ['heilbutt', 'Heilbutt'],
  ['rotbarsch', 'Rotbarsch'],
  ['seeteufel', 'Seeteufel'],
  ['sardine', 'Sardine'],
  ['forelle', 'Forelle'],
] as const

/**
 * Liest nur ausdrücklich vorhandene Produkttexte. Die Merkmale sind
 * Transparenz- und Rückfragehilfen; sie erzeugen niemals selbst ein Ja und
 * dürfen das lokale Regelurteil nicht lockern.
 */
export function analysiereProduktmerkmale(produkt: Produkt): Produktmerkmal[] {
  const text = gesamttext(produkt)
  const merkmale: Produktmerkmal[] = []

  if (/\b(rohmilch|raw milk|lait cru)\b/u.test(text)) {
    merkmale.push({
      id: 'rohmilch',
      label: 'Milch',
      wert: 'Rohmilch ausdrücklich erkannt',
      art: 'vorsicht',
      hinweis: 'Dieses Signal kann für die genaue Katalogvariante entscheidend sein.',
    })
  } else if (/\b(pasteurisiert|pasteurized|pasteurise)\b/u.test(text)) {
    merkmale.push({
      id: 'pasteurisiert',
      label: 'Milch',
      wert: 'Pasteurisierung ausdrücklich erkannt',
      art: 'entlastend',
      hinweis: 'Pasteurisierung allein ist keine pauschale Freigabe; Produktart und weitere Regeln bleiben massgebend.',
    })
  }

  if (/\b(alkohol|ethanol|rum|kirsch|likor|liqueur|cognac|brandy|grappa|amaretto|whisky|whiskey|gin|wodka|vodka)\b/u.test(text)) {
    merkmale.push({
      id: 'alkohol',
      label: 'Alkohol',
      wert: 'Alkoholhinweis in Produktdaten erkannt',
      art: 'vorsicht',
      hinweis: 'Das Merkmal darf ein automatisches Urteil nur strenger machen, nie lockern.',
    })
  }

  if (/\b(koffein|caffeine|guarana|mate)\b/u.test(text)) {
    merkmale.push({
      id: 'koffein',
      label: 'Koffein',
      wert: 'Koffeinhaltige Zutat erkannt',
      art: 'info',
      hinweis: 'Für die Einordnung zählt die Gesamtmenge über den Tag; die Produktdaten enthalten hier nicht zuverlässig eine Dosis.',
    })
  }

  const fisch = FISCHARTEN.find(([suchwort]) => text.includes(suchwort))
  if (fisch) {
    merkmale.push({
      id: 'fischart',
      label: 'Fischart',
      wert: fisch[1],
      art: 'info',
      hinweis: 'Die Fischart kann für Schadstoff- und Herkunftsregeln entscheidend sein.',
    })
  }

  if (/\b(roh(?:es|e|en)? ei|rohe eier|raw egg)\b/u.test(text)) {
    merkmale.push({
      id: 'rohes-ei',
      label: 'Ei',
      wert: 'Rohes Ei ausdrücklich erwähnt',
      art: 'vorsicht',
      hinweis: 'Nur ein ausdrücklich vorhandener Roh-Hinweis wird erkannt; aus „Ei“ allein wird keine rohe Zubereitung abgeleitet.',
    })
  }

  if (/\b(durchgegart|durcherhitzt|vollstandig gegart|fully cooked)\b/u.test(text)) {
    merkmale.push({
      id: 'erhitzt',
      label: 'Zubereitung',
      wert: 'Erhitzung ausdrücklich beschrieben',
      art: 'entlastend',
      hinweis: 'Auch dieses Merkmal wird nur als Hinweis gezeigt; die lokale Regel definiert, ob Erhitzen tatsächlich entschärft.',
    })
  }

  return merkmale
}
