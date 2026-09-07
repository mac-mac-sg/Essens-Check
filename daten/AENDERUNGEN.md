# Korrekturen v0.2 -> v0.3

- regeln: Text zu 'hartkaese' korrigiert, Halbhartkäse ausgenommen (BLV)
- regeln: 'fisch-gegart' als nicht abschliessend gekennzeichnet (Quecksilber)
- regeln: 'Salzlakenkäse' aus dem Freigabetext entfernt — das war die Feta-Freigabe (BLV)
- regeln: NEUE Regel 'listerien-halbhartkaese' (meiden, entschärfbar durch durcherhitzt)
- regeln: NEUE Regel 'listerien-frischkaese-stueckig'
- regeln: NEUE Regel 'nicht-bewertet' (Status unklar) — die vierte Kategorie war bisher unbenutzt
- hartkaese: Halbhartkäse-Synonyme entfernt, Rinde-Bedingung präzisiert
- NEU: Eintrag 'halbhartkaese' (kalt meiden / geschmolzen ok)
- tete-de-moine: von 'hartkaese' auf 'halbhartkaese' (BLV nennt ihn namentlich); Freitext korrigiert
- raclette: Variante 'kalt' ergänzt — vorher Ja unabhängig vom Schmelzen
- fondue: Urteil bleibt ok, wird aber über 'durcherhitzt' statt über 'hartkaese' abgeleitet
- halloumi: Variante 'roh' ergänzt
- feta: pasteurisierte Variante von ok auf meiden (BLV nennt Feta namentlich); Ofen-Variante ergänzt
- mozzarella/burrata: Urteil bestätigt (BLV), Begründung auf die Herstellungserhitzung umgestellt
- NEU: Eintrag 'formaggini' (stückiger Frischkäse)
- heilbutt: Quecksilber-Tag ergänzt — gegart ergab bisher ein bedingungsloses Ja
- rotbarsch: Quecksilber-Tag ergänzt — gegart ergab bisher ein bedingungsloses Ja
- makrele: Quecksilber-Tag ergänzt — gegart ergab bisher ein bedingungsloses Ja
- zander: Quecksilber-Tag ergänzt — gegart ergab bisher ein bedingungsloses Ja
- tintenfisch: Quecksilber-Tag zur durchgegarten Variante ergänzt
- innereien: von ok auf bedingt; neue Regel 'innereien-schadstoffe'
- johanniskraut: von bedingt auf unklar — die Tag-Bezeichnung behauptete eine Wirkung, die der Text verneint
- truthahn: Garzustandsfrage ergänzt (fehlte als einzigem Fleisch-Eintrag seiner Art)
- sauser: dritte Variante für frisch gepressten Most; Erkennungsmerkmale statt Geschmack
- robiola: fehlende Variante 'durcherhitzt' ergänzt
- camembert: Synonym 'tomme' entfernt (gehört zum Halbhartkäse)
- fleischkonserve: 'ravioli/chili aus der dose' entfernt — die fallen unter die Aufwärmregel
- 17 doppelt vergebene Synonyme entfernt, darunter alle 8 mit abweichendem Urteil

# Korrekturen v0.3 -> v0.4

Rückmeldung zu den offenen Punkten P08, P12, P13, P16 und P17 aus
`offene-punkte.json`. Die Rückmeldung ist ein Vorschlag für die fachliche
Durchsicht, nicht deren Ersatz — die Punkte bleiben in der Datei stehen.

- NEU: Feld `zusatz_text` — ergänzt die Regelbegründung, statt sie zu ersetzen,
  und steht einmal unter der Karte statt unter jeder Variante
- 17 Einträge mit unterschiedlich urteilenden Varianten von `eigener_text` auf
  `zusatz_text` umgestellt; ihre Regelbegründung ist wieder sichtbar
- halloumi/mozzarella/burrata: der beruhigende Satz stand auch unter dem roten
  Urteil — umformuliert, sodass er für beide Varianten stimmt
- glühwein: die Alkoholwarnung stand auch über dem alkoholfreien Punsch
- NEUER Test: `eigener_text` ist unzulässig, wo Varianten verschieden urteilen
- P08 jod: verweist jetzt auf die Algen-Obergrenze, statt sie zu verdecken
- P08 algen/braunalgen: verweisen zurück auf das verordnete Jodpräparat
- P08: weiterhin keine Milligramm- oder Mikrogrammangabe, jetzt mit Test
- P16 cheddar: nach Reifung getrennt — gereift Ja, jung oder mild wie
  Halbhartkäse Nein, geschmolzen Ja. Vorher galt das Ja für jeden Cheddar
- P17: NEUE Liste `grundsaetze` in regeln.json, erster Eintrag die Käserinde;
  in der App als «Gilt immer» auf dem Startbildschirm
- P17: die Rinde belastet weiterhin keinen der acht Hartkäse-Einträge — die
  Zahl «zwölf» in offene-punkte.json war zu hoch und ist korrigiert
- P12: Rochen, Cremeschnitte und Frozen Yogurt nachgesehen — bereits gedeckt;
  der Rest von Teil 3 bleibt ungeprüft

# Korrekturen v0.4 -> v0.5

Fachliche Antwort auf P13 (Halbhartkäse), eingearbeitet. Die strenge BLV-Linie
ist bestätigt — kein Urteil ändert sich. Nachgetragen wurde, was fehlte.

- NEU: Grundsatz «Erhitzen, das zählt» — mindestens 70 °C Kerntemperatur
  während zwei Minuten, die Angabe des BLV
- 70-Grad-Angabe in allen fünf Listerien-Entschärfungen durch `durcherhitzt`
- listerien-halbhartkaese: neue Begründung — Pasteurisieren beseitigt die
  Listerien der Milch, aber der Käse reift danach Wochen bis Monate weiter und
  kann dabei erneut belastet werden
- listerien-nicht-erhitzt: Begründung präzisiert — gefährdet ist kalte,
  verzehrfertige, lange gekühlte Ware; jedes Schneiden und Umfüllen ist eine
  weitere Gelegenheit
- hartkaese (Tag UND Eintrag): «lassen Listerien nicht wachsen» war zu viel
  behauptet. Richtig ist ein deutlich ungünstigeres Milieu und ein klar
  niedrigeres Risiko — nicht null
- halbhartkaese: Zusatztext von der Wiederholung der Regel auf die Sortenliste
  umgestellt
- NEU in offene-punkte.json: P18 — das Tag «vorgeschnitten» meint an zwölf
  Einträgen Verschiedenes: offene Theke, industriell abgepackte Kühlware, und
  beim Kebab den rohen Salat darin. Geflügelaufschnitt frisch abgepackt ist ein Ja, Sandwich aus
  derselben Kühltheke ein Nein. Kein Urteil geändert: strenger stellen ginge
  ohne Quelle, lockern ist der Schadensfall.

# Ergänzung zu v0.5

- P12 ausgeschrieben: der Blocker war «Teil 3 lag nicht vor». Die dreizehn der
  achtundzwanzig neuen Einträge, die überhaupt ein Urteil tragen, stehen jetzt
  als `urteile_zum_gegenlesen` im Punkt — sechs davon als strittig markiert,
  weil sie keiner namentlichen BLV-Nennung folgen. Kein Urteil geändert.
- hebammenliste.ts druckt diese Tabelle mit, strittige Zeilen mit Marke am Rand
- P12 wartet damit nicht mehr auf eine Zulieferung, sondern auf eine Antwort

# Ergänzung zu v0.5, zweiter Teil

- P05 geschlossen: der Bedingungstext für Aufgewärmtes beschrieb, statt
  anzuweisen. Jetzt eine Handlung, mit der 70-Grad-Angabe
- Punkte können ein Feld `gespraech` tragen: die Frage in der Form, in der sie
  im Sprechzimmer gestellt wird, mit Material und den Folgen jeder Antwort
- NEU: `npm run hebammenfragen` — Kurzform für einen Termin, drei Seiten
- Die Prüfliste übernimmt die Burgunder-Palette der App
