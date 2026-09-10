import { normalisiere } from './engine/suchen'

export interface GerichtBestandteil {
  label: string
  /** Suchwort für den bestehenden Lebensmittel-Katalog. Fehlt es dort, bleibt der Bestandteil nur informativ. */
  suchbegriff?: string
}

export interface Gericht {
  id: string
  name: string
  synonyme: readonly string[]
  bestandteile: readonly GerichtBestandteil[]
  hinweis?: string
}

const b = (label: string, suchbegriff = label): GerichtBestandteil => ({ label, suchbegriff })

/**
 * Kuratierter Gerichte-Katalog. Er enthält bewusst keine Schwangerschaftsurteile.
 * Er beschreibt nur typische Bestandteile; deren Bewertung bleibt vollständig beim
 * bestehenden Lebensmittel-Regelwerk. Restaurant- und Hausrezepte können abweichen.
 */
export const GERICHTE: readonly Gericht[] = [
  {
    id: 'pasta-cinque-pi',
    name: 'Pasta Cinque Pi',
    synonyme: ['cinque pi', 'cinque-pi', 'pasta cinque pi', 'pasta cinque-pi', '5 pi', '5p pasta'],
    bestandteile: [b('Pasta'), b('Rahm'), b('Tomaten'), b('Parmesan')],
    hinweis: 'Je nach Rezept können weitere Zutaten dazukommen.',
  },
  {
    id: 'carbonara',
    name: 'Pasta Carbonara',
    synonyme: ['carbonara', 'spaghetti carbonara'],
    bestandteile: [b('Pasta'), b('Ei'), b('Speck'), b('Parmesan')],
    hinweis: 'Ei und Fleischprodukt können je nach Rezept und Zubereitung unterschiedlich sein.',
  },
  {
    id: 'cacio-e-pepe',
    name: 'Cacio e Pepe',
    synonyme: ['cacio pepe', 'pasta cacio e pepe'],
    bestandteile: [b('Pasta'), b('Hartkäse', 'Parmesan')],
  },
  {
    id: 'amatriciana',
    name: 'Pasta all’Amatriciana',
    synonyme: ['amatriciana', 'pasta amatriciana', 'spaghetti amatriciana'],
    bestandteile: [b('Pasta'), b('Speck'), b('Tomaten'), b('Hartkäse', 'Parmesan')],
  },
  {
    id: 'bolognese',
    name: 'Pasta Bolognese',
    synonyme: ['bolognese', 'spaghetti bolognese', 'pasta bolognese'],
    bestandteile: [b('Pasta'), b('Hackfleisch'), b('Tomaten')],
  },
  {
    id: 'lasagne',
    name: 'Lasagne',
    synonyme: ['lasagne al forno', 'lasagna'],
    bestandteile: [b('Hackfleisch'), b('Tomaten'), b('Käse')],
  },
  {
    id: 'pesto-pasta',
    name: 'Pasta al Pesto',
    synonyme: ['pasta pesto', 'pesto pasta', 'spaghetti pesto'],
    bestandteile: [b('Pasta'), b('Parmesan'), b('Pinienkerne', 'Nüsse')],
  },
  {
    id: 'gnocchi-gorgonzola',
    name: 'Gnocchi mit Gorgonzola',
    synonyme: ['gnocchi gorgonzola', 'gorgonzola gnocchi'],
    bestandteile: [b('Gorgonzola'), b('Rahm')],
  },
  {
    id: 'ravioli-ricotta',
    name: 'Ravioli Ricotta e Spinaci',
    synonyme: ['ravioli ricotta', 'ricotta spinat ravioli', 'ravioli ricotta spinaci'],
    bestandteile: [b('Ricotta'), b('Spinat')],
  },
  {
    id: 'pizza-margherita',
    name: 'Pizza Margherita',
    synonyme: ['margherita', 'pizza margarita'],
    bestandteile: [b('Mozzarella'), b('Tomaten')],
  },
  {
    id: 'pizza-prosciutto',
    name: 'Pizza Prosciutto',
    synonyme: ['prosciutto pizza', 'pizza schinken'],
    bestandteile: [b('Schinken'), b('Mozzarella'), b('Tomaten')],
  },
  {
    id: 'pizza-salami',
    name: 'Pizza Salami',
    synonyme: ['salami pizza'],
    bestandteile: [b('Salami'), b('Mozzarella'), b('Tomaten')],
  },
  {
    id: 'risotto-funghi',
    name: 'Risotto ai Funghi',
    synonyme: ['pilzrisotto', 'risotto funghi', 'risotto mit pilzen'],
    bestandteile: [b('Pilze'), b('Parmesan'), b('Weisswein', 'Alkohol')],
    hinweis: 'Wein wird je nach Rezept verwendet oder weggelassen.',
  },
  {
    id: 'risotto-milanese',
    name: 'Risotto alla Milanese',
    synonyme: ['risotto milanese', 'safranrisotto'],
    bestandteile: [b('Parmesan'), b('Weisswein', 'Alkohol')],
    hinweis: 'Wein wird je nach Rezept verwendet oder weggelassen.',
  },
  {
    id: 'caprese',
    name: 'Insalata Caprese',
    synonyme: ['caprese', 'tomaten mozzarella', 'tomate mozzarella'],
    bestandteile: [b('Mozzarella'), b('Tomaten')],
  },
  {
    id: 'burrata-salat',
    name: 'Burrata mit Tomaten',
    synonyme: ['burrata salat', 'burrata tomate', 'burrata tomaten'],
    bestandteile: [b('Burrata'), b('Tomaten')],
  },
  {
    id: 'tiramisu',
    name: 'Tiramisu',
    synonyme: ['tiramisu dessert'],
    bestandteile: [b('Ei'), b('Mascarpone'), b('Kaffee'), b('Alkohol')],
    hinweis: 'Ei, Kaffee und Alkohol unterscheiden sich je nach Rezept deutlich.',
  },
  {
    id: 'mousse-au-chocolat',
    name: 'Mousse au Chocolat',
    synonyme: ['schokoladenmousse', 'chocolate mousse', 'mousse chocolat'],
    bestandteile: [b('Ei'), b('Schokolade'), b('Rahm')],
    hinweis: 'Die Zubereitung mit oder ohne rohes Ei variiert.',
  },
  {
    id: 'panna-cotta',
    name: 'Panna Cotta',
    synonyme: ['pannacotta'],
    bestandteile: [b('Rahm')],
  },
  {
    id: 'creme-brulee',
    name: 'Crème brûlée',
    synonyme: ['creme brulee', 'crème brulée'],
    bestandteile: [b('Ei'), b('Rahm')],
  },
  {
    id: 'cheesecake',
    name: 'Cheesecake',
    synonyme: ['käsekuchen', 'kaesekuchen'],
    bestandteile: [b('Frischkäse'), b('Ei')],
    hinweis: 'Gebackene und ungebackene Varianten unterscheiden sich.',
  },
  {
    id: 'caesar-salad',
    name: 'Caesar Salad',
    synonyme: ['caesar salat', 'cesar salad', 'cesar salat'],
    bestandteile: [b('Salat'), b('Ei'), b('Parmesan'), b('Poulet')],
    hinweis: 'Dressing und Poulet-Zubereitung unterscheiden sich je nach Anbieter.',
  },
  {
    id: 'club-sandwich',
    name: 'Club Sandwich',
    synonyme: ['clubsandwich'],
    bestandteile: [b('Poulet'), b('Speck'), b('Ei'), b('Mayonnaise')],
  },
  {
    id: 'eggs-benedict',
    name: 'Eggs Benedict',
    synonyme: ['egg benedict', 'eier benedict'],
    bestandteile: [b('Ei'), b('Schinken')],
  },
  {
    id: 'french-toast',
    name: 'French Toast',
    synonyme: ['arme ritter', 'pain perdu'],
    bestandteile: [b('Ei'), b('Milch')],
  },
  {
    id: 'birchermueesli',
    name: 'Birchermüesli',
    synonyme: ['birchermuesli', 'bircher müsli', 'bircher muesli'],
    bestandteile: [b('Joghurt'), b('Früchte', 'Obst'), b('Nüsse')],
  },
  {
    id: 'fondue',
    name: 'Käsefondue',
    synonyme: ['fondue', 'cheese fondue'],
    bestandteile: [b('Käse'), b('Weisswein', 'Alkohol')],
    hinweis: 'Käsemischung und Menge des Weins unterscheiden sich je nach Rezept.',
  },
  {
    id: 'raclette',
    name: 'Raclette',
    synonyme: ['raclettekäse', 'raclette kaese'],
    bestandteile: [b('Raclettekäse', 'Käse')],
  },
  {
    id: 'cordon-bleu',
    name: 'Cordon bleu',
    synonyme: ['cordonbleu'],
    bestandteile: [b('Fleisch'), b('Schinken'), b('Käse')],
  },
  {
    id: 'zuercher-geschnetzeltes',
    name: 'Zürcher Geschnetzeltes',
    synonyme: ['zürigeschnetzeltes', 'zuerigeschnetzeltes', 'geschnetzeltes zürcher art'],
    bestandteile: [b('Kalbfleisch', 'Fleisch'), b('Rahm'), b('Weisswein', 'Alkohol')],
  },
  {
    id: 'roesti-spiegelei',
    name: 'Rösti mit Spiegelei',
    synonyme: ['rösti ei', 'roesti ei', 'rösti mit ei', 'roesti mit ei'],
    bestandteile: [b('Ei')],
  },
  {
    id: 'aelplermagronen',
    name: 'Älplermagronen',
    synonyme: ['älplermakkaronen', 'aelplermagronen', 'alplermagronen'],
    bestandteile: [b('Rahm'), b('Käse')],
  },
  {
    id: 'kaeseschnitte',
    name: 'Käseschnitte',
    synonyme: ['kaeseschnitte', 'chässchnitte', 'chaesschnitte'],
    bestandteile: [b('Käse'), b('Weisswein', 'Alkohol')],
    hinweis: 'Wein gehört nicht in jede Variante.',
  },
  {
    id: 'flammkuchen',
    name: 'Flammkuchen',
    synonyme: ['tarte flambee', 'tarte flambée'],
    bestandteile: [b('Crème fraîche', 'Rahm'), b('Speck')],
  },
  {
    id: 'quiche-lorraine',
    name: 'Quiche Lorraine',
    synonyme: ['quiche lorraine', 'speckquiche'],
    bestandteile: [b('Ei'), b('Rahm'), b('Speck')],
  },
  {
    id: 'croque-monsieur',
    name: 'Croque Monsieur',
    synonyme: ['croque monsieur'],
    bestandteile: [b('Schinken'), b('Käse')],
  },
  {
    id: 'croque-madame',
    name: 'Croque Madame',
    synonyme: ['croque madame'],
    bestandteile: [b('Schinken'), b('Käse'), b('Ei')],
  },
  {
    id: 'burger',
    name: 'Hamburger',
    synonyme: ['burger', 'beef burger', 'hamburger'],
    bestandteile: [b('Hackfleisch'), b('Salat')],
    hinweis: 'Gargrad und Belag variieren.',
  },
  {
    id: 'cheeseburger',
    name: 'Cheeseburger',
    synonyme: ['cheese burger'],
    bestandteile: [b('Hackfleisch'), b('Käse'), b('Salat')],
    hinweis: 'Gargrad und Belag variieren.',
  },
  {
    id: 'hotdog',
    name: 'Hot Dog',
    synonyme: ['hotdog'],
    bestandteile: [b('Wurst')],
  },
  {
    id: 'doener',
    name: 'Döner Kebab',
    synonyme: ['döner', 'doener', 'kebab', 'döner kebab', 'doner kebab'],
    bestandteile: [b('Fleisch'), b('Salat'), b('Joghurtsauce', 'Joghurt')],
    hinweis: 'Fleisch, Salat und Sauce hängen vom Anbieter ab.',
  },
  {
    id: 'falafel-wrap',
    name: 'Falafel Wrap',
    synonyme: ['falafel dürüm', 'falafel durum', 'falafel sandwich'],
    bestandteile: [b('Salat'), b('Hummus')],
  },
  {
    id: 'shawarma',
    name: 'Shawarma',
    synonyme: ['schawarma'],
    bestandteile: [b('Fleisch'), b('Salat'), b('Sauce')],
    hinweis: 'Fleisch, Salat und Sauce hängen vom Anbieter ab.',
  },
  {
    id: 'pad-thai',
    name: 'Pad Thai',
    synonyme: ['phad thai'],
    bestandteile: [b('Ei'), b('Sprossen'), b('Erdnüsse', 'Nüsse')],
  },
  {
    id: 'fried-rice',
    name: 'Gebratener Reis',
    synonyme: ['fried rice', 'egg fried rice', 'bratreis'],
    bestandteile: [b('Ei')],
  },
  {
    id: 'ramen',
    name: 'Ramen',
    synonyme: ['ramen nudelsuppe'],
    bestandteile: [b('Ei'), b('Fleisch')],
    hinweis: 'Toppings und Gargrade unterscheiden sich stark.',
  },
  {
    id: 'pho',
    name: 'Pho',
    synonyme: ['phở', 'vietnamesische nudelsuppe'],
    bestandteile: [b('Fleisch'), b('Sprossen')],
    hinweis: 'Fleisch und Sprossen können je nach Variante unterschiedlich serviert werden.',
  },
  {
    id: 'thai-curry',
    name: 'Thai Curry',
    synonyme: ['rotes curry', 'grünes curry', 'gruenes curry', 'red curry', 'green curry'],
    bestandteile: [b('Fleisch'), b('Kokosmilch')],
  },
  {
    id: 'sushi-platte',
    name: 'Sushi',
    synonyme: ['sushi platte', 'sushi mix', 'sushi platter'],
    bestandteile: [b('Roher Fisch', 'Sushi'), b('Reis')],
    hinweis: 'Sushi kann roh, gegart oder vegetarisch sein; die konkrete Sorte ist entscheidend.',
  },
  {
    id: 'poke-bowl',
    name: 'Poke Bowl',
    synonyme: ['poké bowl', 'poke', 'pokebowl'],
    bestandteile: [b('Fisch'), b('Reis'), b('Salat')],
    hinweis: 'Fisch kann roh oder gegart sein; auch vegetarische Varianten sind verbreitet.',
  },
  {
    id: 'ceviche',
    name: 'Ceviche',
    synonyme: ['seviche'],
    bestandteile: [b('Roher Fisch', 'Fisch roh')],
  },
  {
    id: 'tataki',
    name: 'Tataki',
    synonyme: ['tuna tataki', 'beef tataki', 'thunfisch tataki', 'rind tataki'],
    bestandteile: [b('Fisch oder Fleisch', 'Fleisch')],
    hinweis: 'Tataki kann Fisch oder Fleisch enthalten und wird typischerweise nur kurz angebraten.',
  },
  {
    id: 'steak-tatar',
    name: 'Steak Tatar',
    synonyme: ['steak tartare', 'beef tartare', 'rindstatar', 'rindertatar'],
    bestandteile: [b('Rohes Fleisch', 'Tatar'), b('Ei')],
  },
  {
    id: 'carpaccio',
    name: 'Carpaccio',
    synonyme: ['beef carpaccio', 'rindercarpaccio'],
    bestandteile: [b('Rohes Fleisch', 'Carpaccio'), b('Parmesan')],
  },
  {
    id: 'vitello-tonnato',
    name: 'Vitello tonnato',
    synonyme: ['vitello tonato'],
    bestandteile: [b('Kalbfleisch', 'Fleisch'), b('Thunfisch'), b('Mayonnaise')],
  },
  {
    id: 'griechischer-salat',
    name: 'Griechischer Salat',
    synonyme: ['greek salad', 'bauernsalat griechisch'],
    bestandteile: [b('Feta'), b('Salat'), b('Tomaten')],
  },
  {
    id: 'shakshuka',
    name: 'Shakshuka',
    synonyme: ['shakshouka'],
    bestandteile: [b('Ei'), b('Tomaten')],
    hinweis: 'Der Gargrad des Eis kann variieren.',
  },
  {
    id: 'hummus-teller',
    name: 'Hummus-Teller',
    synonyme: ['hummus plate', 'hummus teller'],
    bestandteile: [b('Hummus'), b('Sesam')],
  },
  {
    id: 'kaiserschmarrn',
    name: 'Kaiserschmarrn',
    synonyme: ['kaiserschmarren'],
    bestandteile: [b('Ei'), b('Milch')],
  },
  {
    id: 'pancakes',
    name: 'Pancakes',
    synonyme: ['pfannkuchen', 'omeletten süss', 'omeletten suess'],
    bestandteile: [b('Ei'), b('Milch')],
  },
  {
    id: 'waffeln',
    name: 'Waffeln',
    synonyme: ['waffles'],
    bestandteile: [b('Ei'), b('Milch')],
  },
]

const SONDERZEICHEN = /[^a-z0-9]+/g

/** Satzzeichen und Bindestriche sollen bei Gerichtsnamen keine Rolle spielen. */
export function normalisiereGericht(text: string): string {
  return normalisiere(text).replace(SONDERZEICHEN, ' ').replace(/\s+/g, ' ').trim()
}

function begriffe(gericht: Gericht): string[] {
  return [gericht.name, ...gericht.synonyme].map(normalisiereGericht)
}

function guete(gericht: Gericht, anfrage: string): number | null {
  let beste: number | null = null
  for (const begriff of begriffe(gericht)) {
    let wert: number | null = null
    if (begriff === anfrage) wert = 0
    else if (begriff.startsWith(anfrage)) wert = 1
    else if (begriff.split(' ').some((wort) => wort.startsWith(anfrage))) wert = 2
    if (wert !== null && (beste === null || wert < beste)) beste = wert
  }
  return beste
}

/** Bekannte Gerichte, ohne fuzzy/semantisches Raten. */
export function sucheGerichte(anfrage: string, hoechstens = 3): Gericht[] {
  const gesucht = normalisiereGericht(anfrage)
  if (gesucht.length < 3) return []
  return GERICHTE
    .map((gericht) => ({ gericht, guete: guete(gericht, gesucht) }))
    .filter((kandidat): kandidat is { gericht: Gericht; guete: number } => kandidat.guete !== null)
    .sort((a, b) => a.guete - b.guete || a.gericht.name.localeCompare(b.gericht.name, 'de-CH'))
    .slice(0, hoechstens)
    .map(({ gericht }) => gericht)
}
