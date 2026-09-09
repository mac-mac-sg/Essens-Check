import { useEffect, useState } from 'react'
import { FavoritKnopf } from './FavoritKnopf'
import { ResultHero, type ResultTone } from './ResultHero'
import { Sheet } from './Sheet'

export type WissensBereich = 'ernaehrung' | 'unterwegs'

export type Wissensartikel = {
  id: string
  titel: string
  kicker: string
  kurz: string
  punkte: string[]
  quelle: string
  symbol: SymbolArt
}

type WissensEinordnung = {
  kicker: string
  status: string
  tone: ResultTone
  grad: string
}

type SymbolArt =
  | 'blatt'
  | 'tropfen'
  | 'korn'
  | 'tasse'
  | 'fisch'
  | 'schild'
  | 'sonne'
  | 'teller'
  | 'berg'
  | 'koffer'
  | 'muecke'
  | 'velo'
  | 'lauf'
  | 'ski'
  | 'schlitten'
  | 'hantel'
  | 'ball'

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
    titel: 'Wandern, Höhe & Bewegung',
    kicker: 'Draussen aktiv',
    kurz: 'Bei unkomplizierter Schwangerschaft ist Bewegung erwünscht — bei Bergtouren zählen Höhe, Belastung und Gelände.',
    punkte: [
      'Für körperliche Aktivität nennt Gesundheitsförderung Schweiz Höhen bis rund 2000 m ü. M. als gut möglich. Das ist die praktische Orientierung für Wanderungen und aktive Bergtouren.',
      'Ein Aufstieg und Aufenthalt für einige Stunden bis etwa 2500 m ü. M. gilt bei unkomplizierter Schwangerschaft grundsätzlich als möglich, wenn dabei keine stärkere körperliche Belastung dazukommt.',
      'Über 2500 m sollte man in der Schwangerschaft zurückhaltend sein. Das gilt besonders bei schnellem Aufstieg aus dem Flachland oder längerem Aufenthalt.',
      'Aktivitäten mit hoher Sturz- oder Kollisionsgefahr werden nicht empfohlen. Bei anspruchsvollen Touren zählen deshalb neben der Höhe auch Gelände, Trittsicherheit und eine einfache Rückzugsmöglichkeit.',
      'Bei Schmerzen, Schwindel, Atemnot oder deutlichem Unwohlsein die Tour abbrechen. Bei Risikoschwangerschaft oder geplanten Aufenthalten nahe beziehungsweise über 2500 m die Tour vorher mit Ärztin oder Hebamme besprechen.',
    ],
    quelle: 'Quellen: Gesundheitsförderung Schweiz, «Gesundheitswirksame Bewegung bei Frauen während und nach der Schwangerschaft»; HealthyTravel / Schweizerisches Expertenkomitee für Reisemedizin, Schwangerschaft und Reisen.',
    symbol: 'berg',
  },
  {
    id: 'mountainbiking',
    titel: 'Mountainbiking',
    kicker: 'Sturzrisiko',
    kurz: 'Unwegsames Gelände und Tempo machen Mountainbiking in der Schwangerschaft zu einer ungünstigen Wahl.',
    punkte: [
      'Gesundheitsförderung Schweiz empfiehlt Bewegungsformen mit hohem Sturzrisiko während der Schwangerschaft generell nicht.',
      'Beim Mountainbiken lässt sich das Sturzrisiko durch Wurzeln, Steine, Gefälle und wechselnden Untergrund auch mit viel Erfahrung nicht zuverlässig ausschliessen.',
      'Für Ausdauertraining ohne vergleichbares Sturzrisiko eignen sich beispielsweise Ergometer oder angepasstes Spinning besser.',
    ],
    quelle: 'Grundlage: Gesundheitsförderung Schweiz, «Gesundheitswirksame Bewegung bei Frauen während und nach der Schwangerschaft».',
    symbol: 'velo',
  },
  {
    id: 'jogging',
    titel: 'Jogging',
    kicker: 'Gewohnte Aktivität',
    kurz: 'Wer bereits vor der Schwangerschaft gelaufen ist, kann sich am eigenen Wohlbefinden und an der Belastung orientieren.',
    punkte: [
      'Die Schweizer Empfehlungen geben für Jogging kein eigenes pauschales Verbot. Bereits vor der Schwangerschaft aktive Frauen können ihre gewohnten Sportarten grundsätzlich weiterführen, solange sie sich dabei wohl fühlen.',
      'Tempo, Dauer und Technik bei Bedarf reduzieren. Die Belastung soll nicht bis zur Erschöpfung gehen.',
      'Wer neu mit intensivem Lauftraining beginnen möchte, sollte dies vorher mit einer Gesundheitsfachperson besprechen.',
      'Bei Schmerzen, Schwindel, Blutungen, Atemnot oder deutlichem Unwohlsein Training abbrechen und medizinisch abklären.',
    ],
    quelle: 'Grundlage: Gesundheitsförderung Schweiz, «Gesundheitswirksame Bewegung bei Frauen während und nach der Schwangerschaft».',
    symbol: 'lauf',
  },
  {
    id: 'skifahren',
    titel: 'Skifahren',
    kicker: 'Nicht empfohlen',
    kurz: 'Alpines Skifahren gehört wegen des Sturz- und Kollisionsrisikos nicht zu den empfohlenen Sportarten in der Schwangerschaft.',
    punkte: [
      'Gesundheitsförderung Schweiz nennt Skifahren ausdrücklich als Beispiel für eine Bewegungsform mit hohem Sturzrisiko, die in der Schwangerschaft nicht empfohlen wird.',
      'Auch sehr gute Fahrtechnik verhindert weder einen eigenen Sturz noch eine Kollision mit anderen Personen zuverlässig.',
      'Zusätzlich spielt im Skigebiet die Höhe eine Rolle: Körperliche Aktivität wird in den Schweizer Empfehlungen bis etwa 2000 m als unproblematisch eingeordnet.',
    ],
    quelle: 'Quelle: Gesundheitsförderung Schweiz, «Gesundheitswirksame Bewegung bei Frauen während und nach der Schwangerschaft».',
    symbol: 'ski',
  },
  {
    id: 'langlaufen',
    titel: 'Langlaufen',
    kicker: 'Gelände & Intensität',
    kurz: 'Langlauf ist nicht pauschal ausgeschlossen; entscheidend sind Erfahrung, Tempo, Spur und Sturzrisiko.',
    punkte: [
      'Die Schweizer Schwangerschaftsempfehlung nennt Langlauf nicht als eigene verbotene Sportart. Es gelten deshalb die allgemeinen Kriterien für gewohnte Bewegung, Intensität und Sturzrisiko.',
      'Wer bereits sicher langläuft, kann eine ruhige Einheit auf einfacher, gut präparierter Loipe eher an diese Kriterien anpassen als technisch anspruchsvolle oder schnelle Abfahrten.',
      'Bei eisigen Bedingungen, schwierigen Abfahrten oder unsicherem Gleichgewicht besser auf eine Aktivität ohne Sturzrisiko wechseln.',
      'Bei körperlicher Aktivität in der Höhe gilt rund 2000 m ü. M. als praktische Schweizer Orientierung.',
    ],
    quelle: 'Grundlagen: Gesundheitsförderung Schweiz, «Gesundheitswirksame Bewegung bei Frauen während und nach der Schwangerschaft»; ergänzend swissmom, Bewegung und Sport in der Schwangerschaft.',
    symbol: 'ski',
  },
  {
    id: 'schlitteln',
    titel: 'Schlitteln',
    kicker: 'Besser auslassen',
    kurz: 'Tempo, Erschütterungen, Stürze und mögliche Kollisionen sprechen gegen Schlitteln in der Schwangerschaft.',
    punkte: [
      'Die Schweizer Bewegungsempfehlungen raten generell von Sportarten mit hohem Sturz- oder Kollisionsrisiko ab.',
      'Auf Schlittelpisten können Geschwindigkeit und Bremsweg schwer kontrollierbar sein; Stürze oder Zusammenstösse lassen sich nicht zuverlässig vermeiden.',
      'Für einen Wintertag sind Spaziergänge, einfache Wanderungen oder andere Aktivitäten mit kontrollierbarer Belastung die risikoärmere Wahl.',
    ],
    quelle: 'Grundlagen: Gesundheitsförderung Schweiz; ergänzend swissmom, «Ungünstige Sportarten für Schwangere».',
    symbol: 'schlitten',
  },
  {
    id: 'spinning',
    titel: 'Spinning',
    kicker: 'Gut anpassbar',
    kurz: 'Training auf dem stationären Rad lässt sich gut dosieren und vermeidet das Sturzrisiko des Fahrens im Gelände.',
    punkte: [
      'Velofahren gehört in den Schweizer Empfehlungen zu den Beispielen für Bewegung mittlerer Intensität. Auf dem stationären Rad entfällt zusätzlich das verkehrs- oder geländebedingte Sturzrisiko.',
      'Widerstand und Tempo so wählen, dass die Einheit fordernd, aber nicht erschöpfend wird. Ausreichend trinken und bei Überhitzung oder Unwohlsein pausieren.',
      'Wer vor der Schwangerschaft nicht regelmässig trainiert hat, beginnt mit tieferer Intensität und steigert langsam.',
      'Eine neue hochintensive Trainingsform sollte vorab mit einer Gesundheitsfachperson besprochen werden.',
    ],
    quelle: 'Grundlage: Gesundheitsförderung Schweiz, «Gesundheitswirksame Bewegung bei Frauen während und nach der Schwangerschaft».',
    symbol: 'velo',
  },
  {
    id: 'bodypump',
    titel: 'BodyPump',
    kicker: 'Gewichte anpassen',
    kurz: 'Das Kursformat ist nicht eigens bewertet; mit angepassten Gewichten gelten die Grundsätze für leichtes Krafttraining.',
    punkte: [
      'Gesundheitsförderung Schweiz empfiehlt leichtes Krafttraining ohne Pressatmung auch während der Schwangerschaft mindestens zweimal pro Woche.',
      'Für BodyPump bedeutet das: Gewichte und Wiederholungen so anpassen, dass die Technik sauber bleibt und keine Pressatmung nötig wird.',
      'Übungen in Rückenlage sollen wegen eines möglichen Vena-Cava-Syndroms mit Vorsicht und bei Bedarf in einer angepassten Position durchgeführt werden.',
      'Bei Schmerzen, Schwindel oder deutlichem Unwohlsein die Übung abbrechen. Neue hochintensive Trainingsformen vorher fachlich besprechen.',
    ],
    quelle: 'Grundlage: Gesundheitsförderung Schweiz, «Gesundheitswirksame Bewegung bei Frauen während und nach der Schwangerschaft».',
    symbol: 'hantel',
  },
  {
    id: 'volleyball',
    titel: 'Volleyball',
    kicker: 'Kollisionsrisiko',
    kurz: 'Volleyball gehört zu den Mannschaftssportarten, von denen in der Schwangerschaft abgeraten wird.',
    punkte: [
      'Gesundheitsförderung Schweiz rät von Mannschaftssportarten mit Kollisionsgefahr ab und nennt Volleyball in den praktischen Empfehlungen ausdrücklich als Beispiel.',
      'Neben Zusammenstössen gehören schnelle Richtungswechsel, Sprünge und unkontrollierbare Spielsituationen zum normalen Spielverlauf.',
      'Für Bewegung mit vergleichbarem Trainingsziel besser auf kontrollierbare Ausdauer- und Kraftformen ohne Körperkontakt ausweichen.',
    ],
    quelle: 'Quelle: Gesundheitsförderung Schweiz, «Tipps für Bewegung in der Schwangerschaft und nach der Geburt».',
    symbol: 'ball',
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
    symbol: 'koffer',
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
    symbol: 'muecke',
  },
]

const EINORDNUNGEN: Record<string, WissensEinordnung> = {
  folsaeure: { kicker: 'Nährstoff', status: 'Empfohlen', tone: 'ok', grad: 'Klare Empfehlung' },
  'vitamin-d': { kicker: 'Nährstoff', status: 'Empfohlen', tone: 'ok', grad: 'Klare Empfehlung' },
  eisen: { kicker: 'Nährstoff', status: 'Bedarf individuell prüfen', tone: 'bedingt', grad: 'Versorgung abhängig vom Bedarf' },
  jod: { kicker: 'Nährstoff', status: 'Auf Versorgung achten', tone: 'bedingt', grad: 'Individuelle Ergänzung möglich' },
  koffein: { kicker: 'Genussmittel', status: 'Begrenzen', tone: 'bedingt', grad: 'Menge entscheidend' },
  'fisch-omega-3': { kicker: 'Ernährung', status: 'Empfohlen mit Auswahl', tone: 'bedingt', grad: 'Art und Zubereitung entscheidend' },
  infektionen: { kicker: 'Infektionsschutz', status: 'Risikolebensmittel meiden', tone: 'meiden', grad: 'Klare Vorsichtsmassnahmen' },
  ausgewogen: { kicker: 'Ernährung', status: 'Empfohlen', tone: 'ok', grad: 'Grundlage der Ernährung' },
  'wandern-bewegung': { kicker: 'Berg & Bewegung', status: 'Mit Anpassung möglich', tone: 'bedingt', grad: 'Höhe, Belastung und Gelände entscheidend' },
  mountainbiking: { kicker: 'Sturzrisiko', status: 'Besser nicht', tone: 'meiden', grad: 'Klare Einschränkung' },
  jogging: { kicker: 'Ausdauer', status: 'Bei Gewohnheit möglich', tone: 'bedingt', grad: 'Belastung und Erfahrung entscheidend' },
  skifahren: { kicker: 'Sturzrisiko', status: 'Besser nicht', tone: 'meiden', grad: 'Klare Einschränkung' },
  langlaufen: { kicker: 'Ausdauer', status: 'Mit Anpassung möglich', tone: 'bedingt', grad: 'Gelände und Sturzrisiko entscheidend' },
  schlitteln: { kicker: 'Sturzrisiko', status: 'Besser nicht', tone: 'meiden', grad: 'Klare Einschränkung' },
  spinning: { kicker: 'Ausdauer', status: 'Mit Anpassung möglich', tone: 'bedingt', grad: 'Intensität und Wohlbefinden entscheidend' },
  bodypump: { kicker: 'Krafttraining', status: 'Mit Anpassung möglich', tone: 'bedingt', grad: 'Gewicht, Technik und Position entscheidend' },
  volleyball: { kicker: 'Mannschaftssport', status: 'Besser nicht', tone: 'meiden', grad: 'Kollisionsrisiko entscheidend' },
  'sonne-hitze': { kicker: 'Hitze & UV', status: 'Mit Schutzmassnahmen möglich', tone: 'bedingt', grad: 'Schutz und Belastung entscheidend' },
  zecken: { kicker: 'Natur', status: 'Schutz empfohlen', tone: 'bedingt', grad: 'Schutz und Kontrolle wichtig' },
  'essen-wasser-reise': { kicker: 'Reisehygiene', status: 'Hygiene konsequent beachten', tone: 'bedingt', grad: 'Hygiene entscheidend' },
  'reiseplanung-fliegen': { kicker: 'Reisen', status: 'Mit Planung möglich', tone: 'bedingt', grad: 'Reiseziel und Dauer entscheidend' },
  'tropen-muecken': { kicker: 'Reisen', status: 'Risikogebiete meiden', tone: 'meiden', grad: 'Aktuelle Risikolage entscheidend' },
}

export function findeWissensartikel(id: string): Wissensartikel | undefined {
  return [...ARTIKEL, ...UNTERWEGS].find((artikel) => artikel.id === id)
}

export function wissensbereichFuer(id: string): WissensBereich | undefined {
  if (ARTIKEL.some((artikel) => artikel.id === id)) return 'ernaehrung'
  if (UNTERWEGS.some((artikel) => artikel.id === id)) return 'unterwegs'
  return undefined
}

const FOKUS_IDS: Record<1 | 2 | 3, string[]> = {
  1: ['folsaeure', 'infektionen', 'ausgewogen', 'vitamin-d', 'koffein'],
  2: ['eisen', 'jod', 'fisch-omega-3', 'jogging', 'reiseplanung-fliegen', 'sonne-hitze'],
  3: ['ausgewogen', 'jod', 'spinning', 'essen-wasser-reise', 'sonne-hitze', 'reiseplanung-fliegen'],
}

export function wissensFokusFuer(ssw?: number, trimester?: number): Wissensartikel[] {
  const trimesterSicher = trimester === 1 || trimester === 2 || trimester === 3 ? trimester : 2
  const ids = FOKUS_IDS[trimesterSicher]
  const versatz = Number.isFinite(ssw) ? Math.abs(Math.trunc(ssw ?? 0)) % ids.length : 0
  const rotiert = [...ids.slice(versatz), ...ids.slice(0, versatz)].slice(0, 3)
  return rotiert.flatMap((id) => {
    const artikel = findeWissensartikel(id)
    return artikel ? [artikel] : []
  })
}

function einordnungFuer(artikel: Wissensartikel): WissensEinordnung {
  return EINORDNUNGEN[artikel.id] ?? {
    kicker: artikel.kicker,
    status: 'Orientierung',
    tone: 'unklar',
    grad: 'Einordnung im Detail',
  }
}

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
      case 'berg':
        return <><path d="M2.7 16 7.5 8l2.2 3.1 2.6-4.4L17.3 16H2.7Z" /><path d="m6.2 10.2 1.3-2.2 1.3 1.9" /></>
      case 'koffer':
        return <><rect x="4" y="6.2" width="12" height="9.2" rx="1.8" /><path d="M7.5 6.2V4.8c0-.7.5-1.2 1.2-1.2h2.6c.7 0 1.2.5 1.2 1.2v1.4M7 10.8h6M10 8.8v4" /></>
      case 'muecke':
        return <><ellipse cx="10" cy="10.5" rx="1.8" ry="3.2" /><path d="M8.5 8.8 5.2 6.2M11.5 8.8l3.3-2.6M8.4 11l-3.6 1.5M11.6 11l3.6 1.5M10 7.3V4.5M10 13.7v2.2" /></>
      case 'velo':
        return <><circle cx="5.2" cy="13.2" r="3" /><circle cx="14.8" cy="13.2" r="3" /><path d="m5.2 13.2 3-6h3l3.6 6M8.2 7.2l3.1 6H5.2M10.8 5.2h2.5" /></>
      case 'lauf':
        return <><circle cx="11.8" cy="4.1" r="1.5" /><path d="m10.7 6.2-2.4 3.2 2.3 2.2-2 4.1M8.3 9.4 5 11M10.6 11.6l3.2 1.2 2.2 3" /></>
      case 'ski':
        return <><path d="M3 15.2c3.5 1.3 8.4 1.3 14 0M7 5.2l3.2 3.1-1.8 4.4M10.2 8.3l3.2-1.3M6.2 13.4 4.4 7M13.8 13.4l1.8-6.4" /><circle cx="7.2" cy="3.5" r="1.3" /></>
      case 'schlitten':
        return <><path d="M4 7.2h9.8l1.4 5.8H5.4L4 7.2ZM6 7.2V4.5M12 7.2V4.5M3.5 15.2h10.7c1.7 0 2.7-.5 3.3-1.4" /></>
      case 'hantel':
        return <><path d="M6.2 10h7.6M4.2 7v6M2.7 8.3v3.4M15.8 7v6M17.3 8.3v3.4" /></>
      case 'ball':
        return <><circle cx="10" cy="10" r="6.5" /><path d="M4.3 7.1c3.3.7 7.8.6 11.4-.2M4.5 13.4c3.4-.9 7.7-.8 11 .1M8.1 3.8c1.8 3.7 1.8 8.7 0 12.4M12 3.8c-1.8 3.7-1.8 8.7 0 12.4" /></>
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

function ArtikelDetail({
  artikel,
  favorit,
  onFavorit,
}: {
  artikel: Wissensartikel
  favorit: boolean
  onFavorit?: () => void
}) {
  const meta = einordnungFuer(artikel)

  return (
    <article className="wissen-detail">
      <ResultHero
        subject={artikel.titel}
        status={meta.status}
        tone={meta.tone}
        grad={meta.grad}
        context={[meta.kicker]}
      />

      {onFavorit && <FavoritKnopf aktiv={favorit} onUmschalten={onFavorit} />}

      <p className="wissen-detail__lead">{artikel.kurz}</p>

      <section className="detailblock detailblock--worauf">
        <h3>Worauf kommt es an?</h3>
        <ul className="wissen-detail__punkte">
          {artikel.punkte.map((punkt) => <li key={punkt}>{punkt}</li>)}
        </ul>
      </section>

      <section className="detailblock detailblock--quellen">
        <h3>Quelle</h3>
        <p className="wissen-quelle">{artikel.quelle}</p>
      </section>
    </article>
  )
}

export function Wissensbereich({
  bereich,
  startId,
  startToken,
  onGeoeffnet,
  istFavorit,
  onFavorit,
}: {
  bereich: WissensBereich
  startId?: string
  startToken?: number
  onGeoeffnet?: (id: string) => void
  istFavorit?: (id: string) => boolean
  onFavorit?: (id: string) => void
}) {
  const [artikelOffen, setArtikelOffen] = useState<Wissensartikel | null>(null)
  const artikel = bereich === 'ernaehrung' ? ARTIKEL : UNTERWEGS

  useEffect(() => {
    if (!startId) return
    const start = artikel.find((eintrag) => eintrag.id === startId)
    if (!start) return
    setArtikelOffen(start)
    onGeoeffnet?.(start.id)
  }, [bereich, startId, startToken])

  const oeffnen = (eintrag: Wissensartikel) => {
    setArtikelOffen(eintrag)
    onGeoeffnet?.(eintrag.id)
  }

  return (
    <>
      <section
        className="wissen-abschnitt"
        aria-labelledby={bereich === 'ernaehrung' ? 'wissen-ernaehrung' : 'wissen-unterwegs'}
      >
        <div className="wissen-abschnitt__kopf">
          {bereich === 'ernaehrung' ? (
            <>
              <h2 id="wissen-ernaehrung">Ernährung in der Schwangerschaft</h2>
              <p>Orientierung nach Schweizer Empfehlungen.</p>
            </>
          ) : (
            <>
              <h2 id="wissen-unterwegs">Unterwegs & Aktiv</h2>
              <p>Sport, Naturtage und Reisen — mit Fokus auf Belastung, Sturzrisiko und praktische Planung.</p>
            </>
          )}
        </div>

        <div className="wissen-karten">
          {artikel.map((eintrag) => {
            const meta = einordnungFuer(eintrag)
            return (
              <button
                key={eintrag.id}
                className="wissen-karte"
                data-wissen-artikel={eintrag.id}
                type="button"
                onClick={() => oeffnen(eintrag)}
              >
                <Illustration art={eintrag.symbol} />
                <span className="wissen-karte__kicker">{meta.kicker}</span>
                <strong>{eintrag.titel}</strong>
                <span className="wissen-karte__kurz">{eintrag.kurz}</span>
                <span className="wissen-karte__mehr">Mehr erfahren <span aria-hidden="true">›</span></span>
              </button>
            )
          })}
        </div>
      </section>

      <p className="wissen-einordnung">
        Wissensartikel, Sport- und Reisetipps sind Orientierung. Konkrete Gesundheitsfragen und individuelle Schwangerschaftsrisiken gehören in die medizinische Beratung; für Lebensmittel und Medikamente bleibt «Suchen» massgebend.
      </p>

      {artikelOffen && (
        <Sheet titel={artikelOffen.titel} onSchliessen={() => setArtikelOffen(null)}>
          <ArtikelDetail
            artikel={artikelOffen}
            favorit={istFavorit?.(artikelOffen.id) ?? false}
            {...(onFavorit ? { onFavorit: () => onFavorit(artikelOffen.id) } : {})}
          />
        </Sheet>
      )}
    </>
  )
}
