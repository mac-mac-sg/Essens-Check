import type { Produkt } from '../produktsuche'

export interface SchweizerProduktRegression {
  ean: string
  produktname: string
  /** Öffentliche Quelle, mit der EAN/Produktidentität und Kerndaten gegengeprüft wurden. */
  beleg: string
  /** Normalisierter Snapshot der für die Scanner-Zuordnung relevanten OFF-Felder. */
  produkt: Produkt
  erwartung: {
    /** Erwartete automatische Zuordnung; null bedeutet bewusst Rückfrage/kein Auto-Urteil. */
    eindeutig: string | null
    /** Erwarteter erster Kandidat, auch wenn die Eindeutigkeitsschwelle nicht reicht. */
    erster: string | null
    /** Weitere fachlich richtige Kandidaten, die in der Auswahl erhalten bleiben müssen. */
    kandidatenEnthalten?: string[]
    /** Katalogeinträge, deren bekannte Risiken das Auto-Urteil blockieren müssen. */
    konflikte?: string[]
  }
}

/**
 * Reale Produkte aus dem Schweizer Handel, Stand 08.09.2026.
 *
 * Die Snapshots sind absichtlich lokal eingefroren: CI darf nicht von Open Food
 * Facts oder einem anderen Netz-Dienst abhängen. Die EAN und Kerndaten wurden
 * gegen Hersteller-/Händlerangaben bzw. öffentliche Produktdaten gegengeprüft.
 * Open Food Facts bleibt zur Laufzeit Fremddatenquelle; die Erwartung hier ist
 * unsere eigene, sicherheitsorientierte Zuordnungsentscheidung.
 */
export const SCHWEIZER_PRODUKTE: SchweizerProduktRegression[] = [
  {
    ean: '7610095014009',
    produktname: 'Zweifel Original Chips Paprika',
    beleg: 'Migros Migipedia / Zweifel Produktdaten, GTIN 7610095014009',
    produkt: {
      name: 'Zweifel Original Chips Paprika',
      marke: 'Zweifel',
      generischerName: 'Kartoffelchips mit Paprikawürzung',
      kategorien: ['Salzige Snacks', 'Chips', 'Kartoffelchips', 'Paprikachips'],
      zutatenText:
        'Kartoffeln, Rapsöl, Gewürzzubereitung mit Paprika, Hefeextrakt, Zwiebel und Stärke',
      zutaten: ['kartoffeln', 'rapsöl', 'paprika', 'zwiebel', 'stärke'],
      vollstaendigkeit: 0.9,
    },
    // «Paprika» und «Chips» konkurrieren im Namen. Der richtige Kandidat muss
    // vorne stehen; automatisch entscheiden muss die App bei zu kleinem Abstand nicht.
    erwartung: { eindeutig: null, erster: 'chips' },
  },
  {
    ean: '7610900292813',
    produktname: 'Emmi Caffè Latte Espresso',
    beleg: 'Migros Migipedia / Emmi Datenblatt, GTIN 7610900292813',
    produkt: {
      name: 'Emmi Caffè Latte Espresso',
      marke: 'Emmi Caffè Latte',
      generischerName: 'Milchgetränk mit frisch gebrühtem Kaffee',
      kategorien: ['Getränke', 'Milchgetränke', 'Kaffeegetränke', 'Cappuccino'],
      zutatenText: 'Teilentrahmte Milch 80 %, Kaffee Arabica 16 %, Zucker',
      zutaten: ['milch', 'kaffee', 'zucker'],
      vollstaendigkeit: 0.95,
    },
    erwartung: { eindeutig: 'kaffee', erster: 'kaffee' },
  },
  {
    ean: '9001372240033',
    produktname: 'M-Budget Energy Drink',
    beleg: 'Schweizer Scanner-/GTIN-Datensatz und Migros Produktidentität, EAN 9001372240033',
    produkt: {
      name: 'M-Budget Energy Drink',
      marke: 'M-Budget',
      generischerName: 'Koffeinhaltiges Erfrischungsgetränk mit Taurin',
      kategorien: ['Getränke', 'Erfrischungsgetränke', 'Energy Drinks'],
      zutatenText: 'Wasser, Zucker, Kohlensäure, Taurin, Koffein',
      zutaten: ['wasser', 'zucker', 'taurin', 'koffein'],
      vollstaendigkeit: 0.8,
    },
    // Der richtige Kandidat steht vorne, aber die 2:1-Eindeutigkeitsschwelle
    // reicht bei den übrigen Koffein-/Getränketreffern bewusst nicht für Auto.
    erwartung: { eindeutig: null, erster: 'energydrink' },
  },
  {
    ean: '7610100034084',
    produktname: 'Thomy Mayonnaise à la française',
    beleg: 'Schweizer Handel / GS1-Produktidentität, EAN 7610100034084',
    produkt: {
      name: 'Thomy Mayonnaise à la française',
      marke: 'Thomy',
      generischerName: 'Mayonnaise',
      kategorien: ['Saucen', 'Mayonnaise'],
      zutatenText:
        'Sonnenblumenöl 80 %, Tafelessig, Eigelb 5 %, Senf 1,4 %, jodiertes Kochsalz, Zucker',
      zutaten: ['sonnenblumenöl', 'tafelessig', 'eigelb', 'senf', 'salz', 'zucker'],
      vollstaendigkeit: 0.9,
    },
    erwartung: { eindeutig: 'mayonnaise', erster: 'mayonnaise' },
  },
  {
    ean: '7614500010013',
    produktname: 'Toblerone Milch',
    beleg: 'Migros Migipedia / Open Food Repo, GTIN 7614500010013',
    produkt: {
      name: 'Toblerone',
      marke: 'Toblerone',
      generischerName: 'Milchschokolade mit Honig und Mandel-Nougat',
      kategorien: ['Süsswaren', 'Schokolade', 'Milchschokolade'],
      zutatenText:
        'Zucker, Vollmilchpulver, Kakaobutter, Kakaomasse, Honig, Butterreinfett, Mandeln, Eiklar',
      zutaten: ['zucker', 'vollmilchpulver', 'kakaobutter', 'kakaomasse', 'honig', 'mandeln'],
      vollstaendigkeit: 0.95,
    },
    erwartung: { eindeutig: 'schokolade', erster: 'schokolade' },
  },
  {
    ean: '7612100909591',
    produktname: 'Ovomaltine Crunchy Cream',
    beleg: 'Wander/Ovomaltine / Schweizer Handelsdaten, GTIN 7612100909591',
    produkt: {
      name: 'Ovomaltine Crunchy Cream',
      marke: 'Ovomaltine',
      generischerName: 'Brotaufstrich mit malzhaltigem Getränkepulver Ovomaltine',
      kategorien: ['Brotaufstriche', 'Süsse Brotaufstriche'],
      zutatenText:
        'Ovomaltine Getränkepulver, Zucker, Rapsöl, Haselnüsse, fettarmes Kakaopulver',
      zutaten: ['ovomaltine', 'zucker', 'rapsöl', 'haselnüsse', 'kakaopulver'],
      vollstaendigkeit: 0.85,
    },
    // Konservativ: Ovomaltine ist ein explizites Katalogsynonym von Kakao.
    erwartung: { eindeutig: 'kakao', erster: 'kakao' },
  },
  {
    ean: '7610827334450',
    produktname: 'Coop Prix Garantie Natürliches Mineralwasser',
    beleg: 'Schweizer GTIN-/Produktdaten, EAN 7610827334450',
    produkt: {
      name: 'Prix Garantie Natürliches Mineralwasser mit Kohlensäure',
      marke: 'Coop Prix Garantie',
      generischerName: 'Natürliches Mineralwasser mit Kohlensäure',
      kategorien: ['Getränke', 'Wasser', 'Mineralwasser'],
      zutatenText: 'Natürliches Mineralwasser, Kohlensäure',
      zutaten: ['mineralwasser', 'kohlensäure'],
      vollstaendigkeit: 0.75,
    },
    erwartung: { eindeutig: 'wasser', erster: 'wasser' },
  },
  {
    ean: '7611100054713',
    produktname: 'Knorr Original Aromat',
    beleg: 'Knorr/Schweizer Handel, EAN 7611100054713',
    produkt: {
      name: 'Knorr Original Aromat',
      marke: 'Knorr',
      generischerName: 'Streuwürze',
      kategorien: ['Würzmittel', 'Gewürzmischungen', 'Streuwürze'],
      zutatenText: 'Speisesalz, Geschmacksverstärker, Milchzucker, Zwiebeln, Gewürze',
      zutaten: ['salz', 'zwiebeln', 'gewürze'],
      vollstaendigkeit: 0.8,
    },
    erwartung: { eindeutig: 'bouillonwuerfel', erster: 'bouillonwuerfel' },
  },
  {
    ean: '7616800202303',
    produktname: 'M-Classic Orangensaft',
    beleg: 'Schweizer Produkt-/GTIN-Daten, EAN 7616800202303',
    produkt: {
      name: 'M-Classic Orangensaft',
      marke: 'M-Classic',
      generischerName: 'Orangensaft aus Orangensaftkonzentrat',
      kategorien: ['Getränke', 'Fruchtsäfte', 'Orangensaft'],
      zutatenText: '100 % Orangensaft aus Orangensaftkonzentrat',
      zutaten: ['orangensaft'],
      vollstaendigkeit: 0.8,
    },
    erwartung: { eindeutig: 'fruchtsaft', erster: 'fruchtsaft' },
  },
  {
    ean: '7610848729853',
    produktname: 'Coop Naturaplan Bio Müesli mit Beeren',
    beleg: 'Schweizer Produkt-/GTIN-Daten, EAN 7610848729853',
    produkt: {
      name: 'Naturaplan Bio Müesli mit Beeren',
      marke: 'Coop Naturaplan',
      generischerName: 'Bio Müesli mit Beeren',
      kategorien: ['Frühstück', 'Müesli', 'Frühstücksflocken'],
      zutatenText: 'Haferflocken, Getreideflocken, Beeren',
      zutaten: ['haferflocken', 'getreide', 'beeren'],
      vollstaendigkeit: 0.75,
    },
    erwartung: { eindeutig: 'muesli', erster: 'muesli' },
  },
  {
    ean: '7610097111072',
    produktname: 'Rivella Rot',
    beleg: 'Rivella Factsheet / Schweizer Handel, EAN 7610097111072',
    produkt: {
      name: 'Rivella Rot',
      marke: 'Rivella',
      generischerName: 'Erfrischungsgetränk mit Milchserum',
      kategorien: ['Getränke', 'Erfrischungsgetränke', 'Kohlensäurehaltige Getränke'],
      zutatenText:
        'Wasser, Milchserum, Zucker, Kohlensäure, Milchsäure, karamellisierter Zucker, natürliche Aromen',
      zutaten: ['wasser', 'milchserum', 'zucker', 'kohlensäure', 'milchsäure'],
      vollstaendigkeit: 0.8,
    },
    // Rivella hat keinen eigenen Katalogeintrag. «Rot» ist nur die Variante und
    // darf insbesondere keinen Rooibos-/Rotbusch-Treffer erzeugen.
    erwartung: { eindeutig: null, erster: null },
  },
  {
    ean: '7610400061049',
    produktname: 'Lindt Kirschstängeli',
    beleg: 'Migros Migipedia / Lindt Handelsdaten, EAN 7610400061049; enthält Alkohol',
    produkt: {
      name: 'Lindt Kirschstängeli',
      marke: 'Lindt',
      generischerName: 'Schokolade-Stengeli mit flüssiger Kirschfüllung',
      kategorien: ['Pralinen', 'Schokolade', 'Gefüllte Schokolade'],
      zutatenText:
        'Zucker, Kakaomasse, Kirsch 12 %, Kakaobutter, Kakaopulver, Butterreinfett, Magermilchpulver',
      zutaten: ['zucker', 'kakaomasse', 'kirsch', 'kakaobutter', 'kakaopulver'],
      vollstaendigkeit: 0.9,
    },
    // Kakao kann im Ranking vor Schokolade liegen; entscheidend ist hier:
    // Schokolade bleibt als plausibler Kandidat erhalten und Kirsch blockiert Auto.
    erwartung: {
      eindeutig: null,
      erster: 'kakao',
      kandidatenEnthalten: ['schokolade'],
      konflikte: ['wein-bier'],
    },
  },
]
