import { useState } from 'react'
import { Sheet } from './Sheet'

type Bereich = 'ernaehrung' | 'rezepte' | 'unterwegs'

type Wissensartikel = {
  id: string
  titel: string
  kicker: string
  kurz: string
  punkte: string[]
  quelle: string
  symbol: SymbolArt
}

type RezeptZutat = {
  text: string
  suche?: string
}

type Rezept = {
  id: string
  titel: string
  kurz: string
  zeit: string
  tags: string[]
  zutaten: RezeptZutat[]
  schritte: string[]
  hinweise: string[]
  symbol: SymbolArt
}

type SymbolArt = 'blatt' | 'tropfen' | 'korn' | 'tasse' | 'fisch' | 'schild' | 'sonne' | 'teller' | 'topf'

const ARTIKEL: Wissensartikel[] = [
  {
    id: 'folsaeure',
    titel: 'Folsäure',
    kicker: 'Früh wichtig',
    kurz: 'Folsäure ist besonders rund um den Beginn der Schwangerschaft zentral.',
    punkte: [
      'Die Schweizerische Gesellschaft für Ernährung empfiehlt zusätzlich zu einer ausgewogenen Ernährung täglich 400 Mikrogramm Folsäure.',
      'Die Einnahme soll möglichst bereits vor der Schwangerschaft beginnen und mindestens bis zur 12. Schwangerschaftswoche weitergeführt werden.',
      'Grünes Blattgemüse, Hülsenfrüchte, Vollkornprodukte, Tomaten und Orangen liefern Folat, ersetzen die empfohlene Ergänzung aber nicht zuverlässig.',
    ],
    quelle: 'Quelle: SGE, «Ernährung während der Schwangerschaft», Merkblatt aktualisiert 2024.',
    symbol: 'blatt',
  },
  {
    id: 'vitamin-d',
    titel: 'Vitamin D',
    kicker: 'Knochen & Versorgung',
    kurz: 'Vitamin D lässt sich über Lebensmittel allein nur schwer ausreichend zuführen.',
    punkte: [
      'Die SGE empfiehlt während der gesamten Schwangerschaft täglich 15 Mikrogramm beziehungsweise 600 Internationale Einheiten Vitamin D in Form von Tropfen.',
      'Vitamin D ist unter anderem für die Knochenbildung wichtig.',
      'Weitere Supplemente sollten nicht pauschal ergänzt, sondern bei Bedarf mit Ärztin oder Arzt abgestimmt werden.',
    ],
    quelle: 'Quelle: SGE, «Ernährung während der Schwangerschaft», Merkblatt aktualisiert 2024.',
    symbol: 'sonne',
  },
  {
    id: 'eisen',
    titel: 'Eisen',
    kicker: 'Blutbildung',
    kurz: 'Der Eisenbedarf steigt; die Ernährung kann die Versorgung gezielt unterstützen.',
    punkte: [
      'Eisen steckt unter anderem in Fleisch, Eiern, Vollkornprodukten, Hülsenfrüchten, Nüssen und grünem Gemüse.',
      'Vitamin-C-reiche Lebensmittel wie Peperoni, Broccoli, Beeren, Kiwi oder Zitrusfrüchte können die Aufnahme von pflanzlichem Eisen verbessern.',
      'Eisentabletten werden nicht generell empfohlen. Sie werden bei Bedarf ärztlich verordnet.',
    ],
    quelle: 'Quelle: SGE, «Ernährung während der Schwangerschaft», Merkblatt aktualisiert 2024.',
    symbol: 'korn',
  },
  {
    id: 'jod',
    titel: 'Jod',
    kicker: 'Kritischer Nährstoff',
    kurz: 'Das BLV weist bei Schwangeren auf eine häufig zu tiefe Jodzufuhr hin.',
    punkte: [
      'Im Haushalt jodiertes Speisesalz verwenden und insgesamt zurückhaltend salzen.',
      'Auch Brot mit Jodsalz, Fisch, Meeresfrüchte, Käse und Eier können Jod liefern.',
      'Das BLV empfiehlt, mit Frauenärztin oder Frauenarzt zu besprechen, ob zusätzlich Jodtabletten sinnvoll sind.',
    ],
    quelle: 'Quellen: BLV «Ernährung in Schwangerschaft und Stillzeit» und SGE-Merkblatt, Stand 2026/2024.',
    symbol: 'tropfen',
  },
  {
    id: 'koffein',
    titel: 'Koffein',
    kicker: 'Massvoll geniessen',
    kurz: 'Kaffee muss nicht komplett wegfallen, die Gesamtmenge an Koffein zählt.',
    punkte: [
      'Die SGE rät zu Zurückhaltung und nennt 200 mg Koffein pro Tag als Obergrenze, ab der ein hoher Konsum beginnt.',
      'Als Orientierung nennt das Merkblatt geringe Mengen wie 1–2 Tassen Kaffee oder etwa 4 Tassen Tee pro Tag.',
      'Koffein steckt auch in Schwarz-, Grün- und Weisstee, Eistee, Cola und weiteren Produkten. Energy Drinks sollen in der Schwangerschaft gemieden werden.',
    ],
    quelle: 'Quelle: SGE, «Ernährung während der Schwangerschaft», Merkblatt aktualisiert 2024.',
    symbol: 'tasse',
  },
  {
    id: 'fisch-omega-3',
    titel: 'Fisch & Omega-3',
    kicker: 'Bewusst auswählen',
    kurz: 'Fettreicher Fisch liefert wichtige Omega-3-Fettsäuren, die Auswahl und Zubereitung bleiben entscheidend.',
    punkte: [
      'Die SGE empfiehlt 1–2 Portionen möglichst fetthaltigen, schadstoffarmen Fisch pro Woche.',
      'Nüsse und Rapsöl ergänzen die Versorgung mit Vorstufen von Omega-3-Fettsäuren.',
      'Nicht jede Fischart und Zubereitung ist in der Schwangerschaft gleich geeignet. Konkrete Produkte deshalb über «Suchen» prüfen.',
    ],
    quelle: 'Quelle: SGE, «Ernährung während der Schwangerschaft», Merkblatt aktualisiert 2024.',
    symbol: 'fisch',
  },
  {
    id: 'infektionen',
    titel: 'Listerien & Toxoplasmose',
    kicker: 'Infektionen vermeiden',
    kurz: 'Bei einigen Lebensmitteln ist nicht der Nährwert, sondern die Keimbelastung das eigentliche Thema.',
    punkte: [
      'Das BAG nennt Schwangere als besondere Risikogruppe für Listeriose. Rohes oder halbgares Fleisch, roher Fisch sowie bestimmte Käse- und Rohmilchprodukte gehören zu den relevanten Quellen.',
      'Toxoplasmose wird häufig durch rohes oder ungenügend gegartes Fleisch übertragen. Hände und Küchengeräte nach Kontakt mit rohem Fleisch gründlich waschen.',
      'Was bei einem konkreten Lebensmittel gilt, zeigt der Lebensmittelkatalog der App. Bei Unsicherheit nie aus allgemeinen Regeln eine Freigabe ableiten.',
    ],
    quelle: 'Quellen: BAG «Listeriose» und «Toxoplasmose», Stand September 2026.',
    symbol: 'schild',
  },
  {
    id: 'ausgewogen',
    titel: 'Ausgewogen statt doppelt',
    kicker: 'Alltag',
    kurz: 'In der Schwangerschaft steigt der Bedarf an einigen Nährstoffen stärker als der Energiebedarf.',
    punkte: [
      'Eine abwechslungsreiche Ernährung mit Gemüse, Früchten, Vollkornprodukten, Hülsenfrüchten, geeigneten Proteinquellen, Nüssen und pflanzlichen Ölen bildet die Grundlage.',
      'In den ersten drei Monaten ist der Energiebedarf laut SGE kaum erhöht; später steigt er moderat. «Doppelt so gut» ist hilfreicher als «für zwei essen».',
      'Regelmässige Mahlzeiten und genügend Flüssigkeit können den Alltag zusätzlich erleichtern.',
    ],
    quelle: 'Quellen: BLV Ernährungsempfehlungen und SGE-Merkblatt Schwangerschaft, Stand 2026/2024.',
    symbol: 'teller',
  },
]

const UNTERWEGS: Wissensartikel[] = [
  {
    id: 'wandern-bewegung',
    titel: 'Wandern & Bewegung',
    kicker: 'Draussen aktiv',
    kurz: 'Bei unkomplizierter Schwangerschaft ist Bewegung erwünscht — Tour und Risiko sollten aber zur Situation passen.',
    punkte: [
      'Gesundheitsförderung Schweiz hält Bewegung bei einer unkomplizierten Schwangerschaft grundsätzlich für sinnvoll und nennt Wandern bis rund 2000 m ü. M. als gut möglich.',
      'Aktivitäten mit hoher Sturz- oder Kollisionsgefahr werden nicht empfohlen. Bei anspruchsvollen Touren zählt deshalb nicht nur die Kondition, sondern auch Gelände, Trittsicherheit und Rückzugsmöglichkeit.',
      'Bei Schmerzen oder deutlichem Unwohlsein die Aktivität abbrechen und erholen. Bei Unsicherheit oder einer Risikoschwangerschaft Touren vorher mit Ärztin oder Hebamme abstimmen.',
    ],
    quelle: 'Quelle: Gesundheitsförderung Schweiz, Bewegung in der Schwangerschaft; Empfehlungen für die Schweiz.',
    symbol: 'blatt',
  },
  {
    id: 'sonne-hitze',
    titel: 'Sonne, Hitze & Pausen',
    kicker: 'Tourentag planen',
    kurz: 'Schatten, Sonnenschutz, Flüssigkeit und ein angepasstes Tempo gehören draussen zur Grundausrüstung.',
    punkte: [
      'Das BAG empfiehlt, starke Sonne möglichst zu meiden; zwischen 11 und 16 Uhr ist die UV-Belastung besonders hoch. Kleidung, Kopfbedeckung und Sonnenbrille sind der wichtigste Schutz.',
      'Unbedeckte Haut mit einem breit wirksamen Sonnenschutz mit mindestens LSF 30 schützen und den Schutz unterwegs erneuern.',
      'An warmen Tagen Intensität und Etappenlänge anpassen, Schattenpausen einplanen und regelmässig trinken. Auf Reisen nur Wasser verwenden, dessen hygienische Qualität zuverlässig ist.',
    ],
    quelle: 'Quellen: BAG «Sonne und UV-Strahlung»; HealthyTravel, gesundes Reisen.',
    symbol: 'sonne',
  },
  {
    id: 'zecken',
    titel: 'Zecken',
    kicker: 'Nach der Tour',
    kurz: 'Zecken kommen in der ganzen Schweiz vor — Schutz und Körperkontrolle sind einfach und wirksam.',
    punkte: [
      'Im Unterholz und hohen Gras möglichst bedeckende Kleidung und geschlossenes Schuhwerk tragen; Zeckenschutzmittel können ergänzen.',
      'Nach Aufenthalten im Freien Körper und Kleidung sorgfältig absuchen. Eine gefundene Zecke möglichst rasch entfernen und die Stichstelle desinfizieren.',
      'Bei Fieber oder auffälliger Hautrötung nach einem Zeckenstich ärztlich abklären lassen.',
    ],
    quelle: 'Quelle: BAG, FAQ und Schutzempfehlungen zu Zecken und zeckenübertragenen Krankheiten, Stand 2026.',
    symbol: 'schild',
  },
  {
    id: 'essen-wasser-reise',
    titel: 'Essen & Trinkwasser unterwegs',
    kicker: 'Reisehygiene',
    kurz: 'Je ungewohnter die Hygieneverhältnisse, desto wichtiger werden heisse Speisen, sauberes Wasser und Handhygiene.',
    punkte: [
      'HealthyTravel empfiehlt konsequente Hand-, Lebensmittel- und Trinkwasserhygiene. Wo die Hygiene unsicher ist: gut durchgekocht und heiss serviert essen, Früchte selbst schälen und Wasser aus zuverlässig verschlossenen Flaschen verwenden.',
      'In der Schwangerschaft zusätzlich rohen Fisch, rohes oder ungenügend gegartes Fleisch sowie nicht pasteurisierte Milch und entsprechende Produkte vermeiden.',
      'Eiswürfel, kalte Buffets, rohe Salate oder bereits geschnittene Früchte sind bei unsicherer Wasser- und Küchenhygiene keine gute Wahl.',
    ],
    quelle: 'Quelle: HealthyTravel.ch, Nahrungsmittel und Trinkwasser sowie Reisen in Schwangerschaft und Stillzeit.',
    symbol: 'tropfen',
  },
  {
    id: 'reiseplanung-fliegen',
    titel: 'Reiseplanung & lange Wege',
    kicker: 'Vor der Abreise',
    kurz: 'Eine unkomplizierte Schwangerschaft schliesst Reisen nicht aus — Reiseziel, Versorgung und lange Sitzzeiten verdienen aber Planung.',
    punkte: [
      'HealthyTravel nennt das mittlere Drittel der Schwangerschaft häufig als günstige Reisezeit. Vor grösseren Reisen sollten medizinische Versorgung am Ziel und Versicherungsschutz für Mutter und Kind geklärt sein.',
      'Bei Flugreisen gelten je nach Airline unterschiedliche Regeln und Nachweispflichten. Diese vor der Buchung direkt bei der Fluggesellschaft prüfen.',
      'Bei langen Flug-, Auto- oder Zugreisen regelmässig die Beine bewegen, wenn möglich aufstehen und genügend trinken. Individuelle Thromboserisiken vor längeren Reisen medizinisch besprechen.',
    ],
    quelle: 'Quelle: HealthyTravel.ch, Schweizerisches Expertenkomitee für Reisemedizin, «Reisen in Schwangerschaft und Stillzeit».',
    symbol: 'teller',
  },
  {
    id: 'tropen-muecken',
    titel: 'Tropen, Malaria & Zika',
    kicker: 'Ziel entscheidet',
    kurz: 'Bei tropischen Reisezielen ist die aktuelle Risikolage wichtiger als eine statische Länderliste in der App.',
    punkte: [
      'HealthyTravel rät während der Schwangerschaft von Reisen in Malaria-Risikogebiete ab. Lässt sich eine Reise nicht vermeiden, ist vorab eine reisemedizinische Beratung erforderlich.',
      'Von Reisen in Gebiete mit einem aktuellen Zika-Ausbruch wird Schwangeren ebenfalls abgeraten. Risikogebiete können sich ändern — deshalb vor der Buchung und kurz vor Abreise aktuell auf HealthyTravel prüfen.',
      'Konsequenter Mückenschutz umfasst lange Kleidung, geeignetes Repellent und je nach Reiseziel Moskitonetz beziehungsweise geschützte Schlafräume.',
    ],
    quelle: 'Quellen: HealthyTravel.ch und BAG, Reise- und Mückenschutzempfehlungen, Stand 2026.',
    symbol: 'fisch',
  },
]

const REZEPTE: Rezept[] = [
  {
    id: 'porridge',
    titel: 'Apfel-Zimt-Porridge',
    kurz: 'Warmes Frühstück mit Haferflocken, Apfel und Baumnüssen.',
    zeit: '15 Min.',
    tags: ['Frühstück', 'Vegetarisch'],
    zutaten: [
      { text: '60 g Haferflocken' },
      { text: '250 ml Milch oder angereicherter Pflanzendrink', suche: 'Milch' },
      { text: '1 Apfel, gewaschen und gerieben' },
      { text: '1 EL Baumnüsse' },
      { text: 'Zimt nach Geschmack' },
    ],
    schritte: [
      'Haferflocken mit Milch oder Pflanzendrink aufkochen und 5–7 Minuten leise köcheln.',
      'Den geriebenen Apfel kurz mitwärmen.',
      'Mit Baumnüssen und etwas Zimt servieren.',
    ],
    hinweise: ['Milch nur pasteurisiert beziehungsweise UHT verwenden.'],
    symbol: 'topf',
  },
  {
    id: 'beeren-mueesli',
    titel: 'Beeren-Müesli',
    kurz: 'Schnelles Frühstück mit Joghurt, Hafer und Beeren.',
    zeit: '10 Min.',
    tags: ['Frühstück', 'Schnell'],
    zutaten: [
      { text: '150–200 g pasteurisierter Naturjoghurt', suche: 'Joghurt' },
      { text: '50 g Haferflocken' },
      { text: '1 Handvoll frische Beeren, gründlich gewaschen' },
      { text: '1 EL Nüsse oder Samen' },
      { text: 'Optional etwas Banane für Süsse' },
    ],
    schritte: [
      'Beeren gründlich unter fliessendem Wasser waschen.',
      'Joghurt und Haferflocken verrühren.',
      'Mit Beeren, Banane und Nüssen oder Samen toppen.',
    ],
    hinweise: ['Bei Milchprodukten auf pasteurisierte Ware achten. Früchte und Beeren gründlich waschen.'],
    symbol: 'teller',
  },
  {
    id: 'linseneintopf',
    titel: 'Tomaten-Linsen-Eintopf',
    kurz: 'Sättigend, pflanzlich und gut vorzubereiten.',
    zeit: '35 Min.',
    tags: ['Hauptgericht', 'Vegan'],
    zutaten: [
      { text: '150 g rote Linsen' },
      { text: '1 Dose gehackte Tomaten' },
      { text: '1 Rüebli und 1 kleine Zucchetti, gewaschen' },
      { text: '1 kleine Zwiebel' },
      { text: '500 ml Gemüsebouillon' },
      { text: '1 EL Rapsöl' },
    ],
    schritte: [
      'Gemüse klein schneiden und in Rapsöl kurz andünsten.',
      'Linsen, Tomaten und Bouillon zugeben.',
      '20–25 Minuten köcheln, bis Linsen und Gemüse vollständig gar sind.',
    ],
    hinweise: ['Gemüse vor der Verarbeitung gründlich waschen.'],
    symbol: 'topf',
  },
  {
    id: 'lachs-blech',
    titel: 'Lachs mit Ofengemüse',
    kurz: 'Ein Blech, wenig Aufwand und eine Portion Fisch.',
    zeit: '35 Min.',
    tags: ['Hauptgericht', 'Fisch'],
    zutaten: [
      { text: '1 Lachsfilet pro Person', suche: 'Lachs' },
      { text: 'Kartoffeln' },
      { text: 'Broccoli und Rüebli, gründlich gewaschen' },
      { text: '1 EL Rapsöl' },
      { text: 'Zitrone und Kräuter' },
    ],
    schritte: [
      'Kartoffeln und Gemüse schneiden, mit Rapsöl mischen und bei 200 °C vorgaren.',
      'Lachs nach etwa 15 Minuten dazugeben.',
      'Weitergaren, bis der Fisch im Innern vollständig durchgegart und nicht mehr glasig ist.',
    ],
    hinweise: ['Fisch vollständig durchgaren. Die Eignung einzelner Fischarten lässt sich über «Suchen» prüfen.'],
    symbol: 'fisch',
  },
  {
    id: 'kichererbsen-bowl',
    titel: 'Warme Kichererbsen-Bowl',
    kurz: 'Ofengemüse, Kichererbsen und Tahini auf Quinoa.',
    zeit: '30 Min.',
    tags: ['Hauptgericht', 'Vegan'],
    zutaten: [
      { text: '80 g Quinoa pro Person' },
      { text: '1 Dose Kichererbsen, abgespült' },
      { text: 'Peperoni, Zucchetti und Rüebli, gewaschen' },
      { text: '1 EL Tahini' },
      { text: 'Zitronensaft und Rapsöl' },
    ],
    schritte: [
      'Quinoa nach Packungsangabe vollständig garen.',
      'Gemüse und Kichererbsen im Ofen rösten, bis alles heiss und gar ist.',
      'Tahini mit etwas Wasser und Zitronensaft zu einer Sauce verrühren und über die warme Bowl geben.',
    ],
    hinweise: ['Rohes Gemüse vor dem Schneiden gründlich waschen.'],
    symbol: 'teller',
  },
  {
    id: 'spinat-curry',
    titel: 'Spinat-Kichererbsen-Curry',
    kurz: 'Cremiges Curry mit Hülsenfrüchten und viel Gemüse.',
    zeit: '30 Min.',
    tags: ['Hauptgericht', 'Vegan'],
    zutaten: [
      { text: '1 Dose Kichererbsen, abgespült' },
      { text: '200 g Spinat, gründlich gewaschen oder tiefgekühlt' },
      { text: '1 Dose Kokosmilch' },
      { text: '1 Dose gehackte Tomaten' },
      { text: 'Currypulver, Ingwer und Zwiebel' },
      { text: 'Vollkornreis' },
    ],
    schritte: [
      'Reis vollständig garen.',
      'Zwiebel und Gewürze andünsten, Tomaten und Kokosmilch zugeben.',
      'Kichererbsen und Spinat einrühren und alles mehrere Minuten gut durcherhitzen.',
    ],
    hinweise: ['Frischen Spinat gründlich waschen; Reste rasch kühlen und beim Wiedererwärmen vollständig erhitzen.'],
    symbol: 'blatt',
  },
  {
    id: 'linsen-bolognese',
    titel: 'Linsen-Bolognese',
    kurz: 'Vollkornpasta mit einer kräftigen Tomaten-Linsen-Sauce.',
    zeit: '35 Min.',
    tags: ['Hauptgericht', 'Vegetarisch'],
    zutaten: [
      { text: 'Vollkornpasta' },
      { text: '120 g rote oder braune Linsen' },
      { text: 'Passierte Tomaten' },
      { text: 'Rüebli, Sellerie und Zwiebel' },
      { text: 'Raps- oder Olivenöl' },
    ],
    schritte: [
      'Gemüse fein schneiden und in etwas Öl andünsten.',
      'Linsen und Tomaten zugeben und köcheln, bis die Linsen weich sind.',
      'Pasta vollständig garen und mit der Sauce servieren.',
    ],
    hinweise: ['Gemüse vor der Verarbeitung gründlich waschen.'],
    symbol: 'topf',
  },
  {
    id: 'gemuese-eierreis',
    titel: 'Gemüse-Eierreis',
    kurz: 'Schnelle Reispfanne mit Ei und knackigem Gemüse.',
    zeit: '25 Min.',
    tags: ['Hauptgericht', 'Schnell'],
    zutaten: [
      { text: 'Gekochter Reis, frisch zubereitet oder rasch gekühlt' },
      { text: '1–2 Eier pro Person', suche: 'Ei' },
      { text: 'Erbsen, Rüebli und Peperoni' },
      { text: 'Rapsöl' },
      { text: 'Sojasauce nach Geschmack' },
    ],
    schritte: [
      'Gemüse in einer grossen Pfanne vollständig garen.',
      'Reis zugeben und gut durcherhitzen.',
      'Eier einrühren und weiterbraten, bis das Ei vollständig gestockt und durchgegart ist.',
    ],
    hinweise: ['Ei vollständig durchgaren. Gekochten Reis nicht lange bei Raumtemperatur stehen lassen.'],
    symbol: 'teller',
  },
  {
    id: 'ofenkartoffel',
    titel: 'Ofenkartoffel mit Kräuterquark',
    kurz: 'Einfaches Abendessen mit Kartoffeln und frischen Kräutern.',
    zeit: '50 Min.',
    tags: ['Hauptgericht', 'Vegetarisch'],
    zutaten: [
      { text: 'Grosse Kartoffeln, gründlich gewaschen' },
      { text: 'Pasteurisierter Quark', suche: 'Quark' },
      { text: 'Schnittlauch oder Petersilie, gründlich gewaschen' },
      { text: 'Gurke, gründlich gewaschen' },
      { text: 'Etwas Rapsöl' },
    ],
    schritte: [
      'Kartoffeln waschen und im Ofen vollständig weich garen.',
      'Kräuter und Gurke gründlich waschen und fein schneiden.',
      'Mit pasteurisiertem Quark verrühren und zur heissen Kartoffel servieren.',
    ],
    hinweise: ['Quark nur aus pasteurisierter Milch verwenden. Kräuter und Gurke gründlich waschen.'],
    symbol: 'korn',
  },
  {
    id: 'bananen-pancakes',
    titel: 'Bananen-Hafer-Pancakes',
    kurz: 'Drei Grundzutaten für Frühstück oder Zwischenmahlzeit.',
    zeit: '20 Min.',
    tags: ['Frühstück', 'Vegetarisch'],
    zutaten: [
      { text: '1 reife Banane' },
      { text: '2 Eier', suche: 'Ei' },
      { text: '60 g Haferflocken' },
      { text: 'Etwas Rapsöl für die Pfanne' },
      { text: 'Optional Beeren, gründlich gewaschen' },
    ],
    schritte: [
      'Banane zerdrücken und mit Eiern und Haferflocken verrühren.',
      'Kleine Pancakes bei mittlerer Hitze von beiden Seiten backen.',
      'So lange backen, bis die Masse auch im Innern vollständig durchgegart ist.',
    ],
    hinweise: ['Ei vollständig durchgaren; die Pancakes nicht innen flüssig lassen.'],
    symbol: 'teller',
  },
]

function Illustration({ art }: { art: SymbolArt }) {
  const inhalt = (() => {
    switch (art) {
      case 'blatt':
        return <path d="M15.8 4.2C10.4 4.5 6.6 6.7 5.3 11.1c2.9.6 5.7-.1 8-2.2M5.3 11.1c-.7 2-.9 3.8-.7 5.4" />
      case 'tropfen':
        return <path d="M10 2.8S5.3 8.4 5.3 12a4.7 4.7 0 1 0 9.4 0C14.7 8.4 10 2.8 10 2.8Z" />
      case 'korn':
        return <><path d="M10 3.2v13.6" /><path d="M10 6.2 6.4 4.7M10 9.2 6 7.5M10 12.2l-4 1.7M10 6.2l3.6-1.5M10 9.2l4-1.7M10 12.2l4 1.7" /></>
      case 'tasse':
        return <><path d="M4 7h9.8v5.2A3.8 3.8 0 0 1 10 16H7.8A3.8 3.8 0 0 1 4 12.2V7Z" /><path d="M13.8 8.5h1.1a2 2 0 0 1 0 4h-1.1M6.5 4.7c0-1 1-1 1-2M10 4.7c0-1 1-1 1-2" /></>
      case 'fisch':
        return <><path d="M4.2 10c2.3-3 5.3-4.3 8.5-2.2l3-2v8.4l-3-2C9.5 14.3 6.5 13 4.2 10Z" /><circle cx="9.1" cy="9" r=".7" /></>
      case 'schild':
        return <path d="M10 2.8 15.5 5v4.6c0 3.5-2.1 6.1-5.5 7.6-3.4-1.5-5.5-4.1-5.5-7.6V5L10 2.8Zm-2.3 7 1.5 1.5 3.3-3.5" />
      case 'sonne':
        return <><circle cx="10" cy="10" r="3.3" /><path d="M10 2.4v2M10 15.6v2M2.4 10h2M15.6 10h2M4.6 4.6 6 6M14 14l1.4 1.4M15.4 4.6 14 6M6 14l-1.4 1.4" /></>
      case 'topf':
        return <><path d="M4.2 8h11.6v6.2a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2V8ZM2.8 8h14.4M7.4 5.2h5.2" /><path d="M7 3.5c.8-.7.8-1.3 0-2M11 3.5c.8-.7.8-1.3 0-2" /></>
      default:
        return <><path d="M3.5 10h13a6.5 6.5 0 0 1-13 0Z" /><path d="M6.2 7.4c1.4-.9 2.6-.9 3.8 0 1.2-.9 2.4-.9 3.8 0" /></>
    }
  })()

  return (
    <span className="wissen-symbol" aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {inhalt}
      </svg>
    </span>
  )
}

function ArtikelDetail({ artikel }: { artikel: Wissensartikel }) {
  return (
    <article className="wissen-detail">
      <div className="wissen-detail__intro">
        <Illustration art={artikel.symbol} />
        <div>
          <p className="wissen-detail__kicker">{artikel.kicker}</p>
          <p className="wissen-detail__lead">{artikel.kurz}</p>
        </div>
      </div>
      <ul className="wissen-detail__punkte">
        {artikel.punkte.map((punkt) => <li key={punkt}>{punkt}</li>)}
      </ul>
      <p className="wissen-quelle">{artikel.quelle}</p>
    </article>
  )
}

function RezeptDetail({ rezept, onPruefen }: { rezept: Rezept; onPruefen: (begriff: string) => void }) {
  return (
    <article className="rezept-detail">
      <div className="rezept-detail__hero">
        <Illustration art={rezept.symbol} />
        <div>
          <p className="rezept-detail__lead">{rezept.kurz}</p>
          <div className="rezept-tags" aria-label="Rezeptmerkmale">
            <span>{rezept.zeit}</span>
            {rezept.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>
      </div>

      <h3 className="wissen-detail__titel">Zutaten</h3>
      <ul className="rezept-zutaten">
        {rezept.zutaten.map((zutat) => (
          <li key={zutat.text}>
            <span>{zutat.text}</span>
            {zutat.suche && (
              <button type="button" onClick={() => onPruefen(zutat.suche!)}>
                prüfen
              </button>
            )}
          </li>
        ))}
      </ul>

      <h3 className="wissen-detail__titel">Zubereitung</h3>
      <ol className="rezept-schritte">
        {rezept.schritte.map((schritt) => <li key={schritt}>{schritt}</li>)}
      </ol>

      <div className="rezept-hinweis">
        <p className="rezept-hinweis__titel">In der Schwangerschaft beachten</p>
        <ul>
          {rezept.hinweise.map((hinweis) => <li key={hinweis}>{hinweis}</li>)}
        </ul>
      </div>
    </article>
  )
}

export function Wissensbereich({ onPruefen }: { onPruefen: (begriff: string) => void }) {
  const [bereich, setBereich] = useState<Bereich>('ernaehrung')
  const [artikelOffen, setArtikelOffen] = useState<Wissensartikel | null>(null)
  const [rezeptOffen, setRezeptOffen] = useState<Rezept | null>(null)

  return (
    <>
      <section className="wissen-start" aria-labelledby="wissen-titel">
        <p className="wissen-start__kicker">Good to know</p>
        <h2 className="wissen-start__titel" id="wissen-titel">Wissen für den Alltag</h2>
        <p className="wissen-start__text">
          Ernährung verstehen, Rezeptideen finden und auch draussen oder auf Reisen schnell die wichtigsten Punkte nachschlagen.
        </p>
      </section>

      <div className="wissen-bereiche" role="group" aria-label="Wissensbereich wählen">
        <button
          type="button"
          className="wissen-bereich"
          data-aktiv={bereich === 'ernaehrung' || undefined}
          aria-pressed={bereich === 'ernaehrung'}
          onClick={() => setBereich('ernaehrung')}
        >
          <Illustration art="blatt" />
          <span className="wissen-bereich__text">
            <strong>Ernährung</strong>
            <span>8 kompakte Themen</span>
          </span>
        </button>
        <button
          type="button"
          className="wissen-bereich"
          data-aktiv={bereich === 'rezepte' || undefined}
          aria-pressed={bereich === 'rezepte'}
          onClick={() => setBereich('rezepte')}
        >
          <Illustration art="topf" />
          <span className="wissen-bereich__text">
            <strong>Rezeptideen</strong>
            <span>10 einfache Rezepte</span>
          </span>
        </button>
        <button
          type="button"
          className="wissen-bereich"
          data-aktiv={bereich === 'unterwegs' || undefined}
          aria-pressed={bereich === 'unterwegs'}
          onClick={() => setBereich('unterwegs')}
        >
          <Illustration art="sonne" />
          <span className="wissen-bereich__text">
            <strong>Unterwegs & Reisen</strong>
            <span>6 praktische Themen</span>
          </span>
        </button>
      </div>

      {bereich === 'ernaehrung' ? (
        <section className="wissen-abschnitt" aria-labelledby="wissen-ernaehrung">
          <div className="wissen-abschnitt__kopf">
            <h2 id="wissen-ernaehrung">Ernährung in der Schwangerschaft</h2>
            <p>Orientierung nach Schweizer Empfehlungen.</p>
          </div>
          <div className="wissen-karten">
            {ARTIKEL.map((artikel) => (
              <button
                key={artikel.id}
                className="wissen-karte"
                type="button"
                onClick={() => setArtikelOffen(artikel)}
              >
                <Illustration art={artikel.symbol} />
                <span className="wissen-karte__kicker">{artikel.kicker}</span>
                <strong>{artikel.titel}</strong>
                <span className="wissen-karte__kurz">{artikel.kurz}</span>
                <span className="wissen-karte__mehr">Mehr erfahren <span aria-hidden="true">›</span></span>
              </button>
            ))}
          </div>
        </section>
      ) : bereich === 'rezepte' ? (
        <section className="wissen-abschnitt" aria-labelledby="wissen-rezepte">
          <div className="wissen-abschnitt__kopf">
            <h2 id="wissen-rezepte">Rezeptideen</h2>
            <p>Einfach, alltagstauglich und mit konkreten Zubereitungshinweisen.</p>
          </div>
          <div className="rezept-karten">
            {REZEPTE.map((rezept) => (
              <button
                key={rezept.id}
                className="rezept-karte"
                type="button"
                onClick={() => setRezeptOffen(rezept)}
              >
                <span className="rezept-karte__bild"><Illustration art={rezept.symbol} /></span>
                <span className="rezept-karte__inhalt">
                  <strong>{rezept.titel}</strong>
                  <span className="rezept-karte__kurz">{rezept.kurz}</span>
                  <span className="rezept-tags">
                    <span>{rezept.zeit}</span>
                    {rezept.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}
                  </span>
                </span>
                <span className="rezept-karte__pfeil" aria-hidden="true">›</span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="wissen-abschnitt" aria-labelledby="wissen-unterwegs">
          <div className="wissen-abschnitt__kopf">
            <h2 id="wissen-unterwegs">Unterwegs & Reisen</h2>
            <p>Praktische Orientierung für Wandern, Naturtage und Reisen — mit Schweizer Quellen.</p>
          </div>
          <div className="wissen-karten">
            {UNTERWEGS.map((artikel) => (
              <button
                key={artikel.id}
                className="wissen-karte"
                type="button"
                onClick={() => setArtikelOffen(artikel)}
              >
                <Illustration art={artikel.symbol} />
                <span className="wissen-karte__kicker">{artikel.kicker}</span>
                <strong>{artikel.titel}</strong>
                <span className="wissen-karte__kurz">{artikel.kurz}</span>
                <span className="wissen-karte__mehr">Mehr erfahren <span aria-hidden="true">›</span></span>
              </button>
            ))}
          </div>
        </section>
      )}

      <p className="wissen-einordnung">
        Wissensartikel, Reisetipps und Rezepte sind Orientierung. Konkrete Gesundheitsfragen und individuelle Reise- oder Schwangerschaftsrisiken gehören in die medizinische Beratung; für Lebensmittel und Medikamente bleibt «Suchen» massgebend.
      </p>

      {artikelOffen && (
        <Sheet titel={artikelOffen.titel} onSchliessen={() => setArtikelOffen(null)}>
          <ArtikelDetail artikel={artikelOffen} />
        </Sheet>
      )}

      {rezeptOffen && (
        <Sheet titel={rezeptOffen.titel} onSchliessen={() => setRezeptOffen(null)}>
          <RezeptDetail rezept={rezeptOffen} onPruefen={onPruefen} />
        </Sheet>
      )}
    </>
  )
}
