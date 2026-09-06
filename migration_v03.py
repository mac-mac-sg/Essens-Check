#!/usr/bin/env python3
# Migration v0.2 -> v0.3 des Essens-Check-Katalogs.
# Aus dem Repo-Wurzelverzeichnis ausfuehren: python3 migration_v03.py
# Aendert daten/lebensmittel.json und daten/regeln.json in place und schreibt daten/AENDERUNGEN.md
# Quellen: BLV-Empfehlungen zu Milchprodukten in der Schwangerschaft, BLV/BAG Jod, BfR/EFSA Methylquecksilber.

import json, copy
L=json.load(open('daten/lebensmittel.json')); R=json.load(open('daten/regeln.json'))
idx={e['id']:e for e in L['lebensmittel']}
log=[]
def note(s): log.append(s)

# ---------- REGELN ----------
for t in R['unbedenkliche_tags']:
    if t['tag']=='hartkaese':
        t['text']=("Hart- und Extrahartkäse sind auch aus Rohmilch unbedenklich: hohe Brenntemperatur, "
                   "niedriger Wassergehalt und lange Reifung lassen Listerien nicht wachsen. Rinde entfernen. "
                   "Halbhartkäse fällt NICHT darunter — dafür gilt die eigene Regel.")
        note("regeln: Text zu 'hartkaese' korrigiert, Halbhartkäse ausgenommen (BLV)")
    if t['tag']=='frischkaese-pasteurisiert':
        t['text']=("Streichfähiger und körniger Frischkäse aus pasteurisierter Milch ist unbedenklich "
                   "(Quark, Hüttenkäse, Streichfrischkäse, Ricotta, Mascarpone, Schmelzkäse), ebenso Mozzarella "
                   "und Burrata, die bei der Herstellung erhitzt werden. Nach dem Öffnen gekühlt lagern und rasch "
                   "aufbrauchen. Salzlakenkäse und stückiger Frischkäse fallen NICHT darunter.")
        note("regeln: 'Salzlakenkäse' aus dem Freigabetext entfernt — das war die Feta-Freigabe (BLV)")
    if t['tag']=='fisch-gegart':
        t['text']=("Durchgegarter Fisch ist unbedenklich und ausdrücklich empfohlen. Garen beseitigt Keime und "
                   "Parasiten, nicht aber Quecksilber — bei belasteten Arten gilt zusätzlich die Quecksilberregel.")
        note("regeln: 'fisch-gegart' als nicht abschliessend gekennzeichnet (Quecksilber)")

R['regeln'].append({
 "id":"listerien-halbhartkaese","titel":"Halbhartkäse","trifft_auf":["halbhartkaese"],"status":"meiden",
 "begruendung":("Das BLV hat seine Empfehlung ausgeweitet, nachdem Listerien auch in Halbhartkäse aus "
   "pasteurisierter Milch nachgewiesen wurden. Halbhartkäse reift kürzer und feuchter als Hartkäse; die "
   "Herstellungsschritte, die Hartkäse sicher machen, greifen hier nicht. Betrifft roh, thermisiert und pasteurisiert gleichermassen."),
 "entschaerfung":[{"durch":"durcherhitzt","auf":"ok","text":"Geschmolzen oder überbacken — Raclette, Fondue, Gratin — unbedenklich, wenn durchgehend heiss."}],
 "trimester_gewichtung":None,"nicht_entschaerfbar_durch":["pasteurisiert","rohmilch"]})
note("regeln: NEUE Regel 'listerien-halbhartkaese' (meiden, entschärfbar durch durcherhitzt)")

R['regeln'].append({
 "id":"listerien-frischkaese-stueckig","titel":"Stückiger Frischkäse","trifft_auf":["frischkaese-stueckig"],"status":"meiden",
 "begruendung":("Kleine stückige Frischkäse mit hohem Wassergehalt — Formaggini, Schaf- und Ziegenfrischkäsli, "
   "Apérokäsli — führt das BLV getrennt von streichfähigem Frischkäse und rät davon ab."),
 "entschaerfung":[{"durch":"durcherhitzt","auf":"ok","text":"Überbacken oder mitgekocht unbedenklich."}],
 "trimester_gewichtung":None,"nicht_entschaerfbar_durch":["pasteurisiert"]})
note("regeln: NEUE Regel 'listerien-frischkaese-stueckig'")

R['regeln'].append({
 "id":"nicht-bewertet","titel":"Nicht bewertet","trifft_auf":["nicht-bewertet"],"status":"unklar",
 "begruendung":("Dieser Bereich liegt ausserhalb dessen, was der Regelkatalog abbildet. Das ist eine erklärte "
   "Lücke und keine Freigabe."),"entschaerfung":[],"trimester_gewichtung":None})
note("regeln: NEUE Regel 'nicht-bewertet' (Status unklar) — die vierte Kategorie war bisher unbenutzt")

# ---------- KAESE ----------
HART=["hartkäse","extrahartkäse","gruyère","greyerzer","sbrinz","parmesan","grana padano","emmentaler","comté","pecorino","manchego","alpkäse"]
HALB=["halbhartkäse","appenzeller","bergkäse","tilsiter","mutschli","tomme","leerdamer","fol epi","raclettekäse","tête de moine","tete de moine","mönchskopf","edamer","gouda"]
e=idx['hartkaese']; e['name']="Hartkäse und Extrahartkäse"; e['synonyme']=HART
e['eigener_text']=("Hart- und Extrahartkäse sind auch aus Rohmilch unbedenklich — die lange Reifung und der niedrige "
  "Wassergehalt lassen Listerien nicht wachsen. Die Rinde grosszügig wegschneiden. Halbhartkäse wie Tilsiter oder "
  "Appenzeller gehört nicht in diese Gruppe.")
note("hartkaese: Halbhartkäse-Synonyme entfernt, Rinde-Bedingung präzisiert")

halb={"id":"halbhartkaese","name":"Halbhartkäse","gruppe":"Käse","synonyme":HALB,
 "varianten":[{"label":"Kalt, als Scheibe oder Würfel","komponenten":[{"tag":"halbhartkaese"}]},
              {"label":"Geschmolzen oder überbacken","komponenten":[{"tag":"halbhartkaese","zustand":"durcherhitzt"}]}],
 "alternativen":["Hartkäse wie Gruyère, Emmentaler oder Sbrinz","Derselbe Käse geschmolzen"],
 "frage":"Kalt oder geschmolzen?",
 "eigener_text":("Das BLV rät von Halbhartkäse ab — unabhängig davon, ob roh, thermisiert oder pasteurisiert. "
   "Grund ist der höhere Wassergehalt und die kürzere Reifung. Geschmolzen ist er unbedenklich.")}
L['lebensmittel'].insert([i for i,x in enumerate(L['lebensmittel']) if x['id']=='hartkaese'][0]+1, halb)
note("NEU: Eintrag 'halbhartkaese' (kalt meiden / geschmolzen ok)")

e=idx['tete-de-moine']; e['varianten']=[{"label":"Als Rosette gehobelt","komponenten":[{"tag":"halbhartkaese"}]},
  {"label":"Geschmolzen oder überbacken","komponenten":[{"tag":"halbhartkaese","zustand":"durcherhitzt"}]}]
e['frage']="Kalt oder geschmolzen?"; e['alternativen']=["Gruyère","Sbrinz"]
e['eigener_text']="Tête de Moine ist Halbhartkäse und wird vom BLV namentlich unter den ungeeigneten Käsen geführt. Der Risikoträger ist der Teig, nicht die Rinde — das Hobeln hilft nicht."
note("tete-de-moine: von 'hartkaese' auf 'halbhartkaese' (BLV nennt ihn namentlich); Freitext korrigiert")

e=idx['raclette']; e['varianten']=[{"label":"Geschmolzen, durchgehend heiss","komponenten":[{"tag":"halbhartkaese","zustand":"durcherhitzt"}]},
  {"label":"Kalt, als Scheibe oder Würfel","komponenten":[{"tag":"halbhartkaese"}]}]
e['frage']="Geschmolzen oder kalt?"
e['eigener_text']="Raclettekäse ist Halbhartkäse. Geschmolzen unbedenklich — durchgehend heiss, nicht nur oben angebräunt. Kalt vom Block gehört er zum Halbhartkäse und wird gemieden."
note("raclette: Variante 'kalt' ergänzt — vorher Ja unabhängig vom Schmelzen")

e=idx['fondue']; e['varianten']=[{"label":None,"komponenten":[{"tag":"halbhartkaese","zustand":"durcherhitzt"}]}]
note("fondue: Urteil bleibt ok, wird aber über 'durcherhitzt' statt über 'hartkaese' abgeleitet")

e=idx['halloumi']; e['varianten']=[{"label":"Gebraten oder gegrillt","komponenten":[{"tag":"halbhartkaese","zustand":"durcherhitzt"}]},
  {"label":"Roh, etwa im Salat","komponenten":[{"tag":"halbhartkaese"}]}]
e['frage']="Gebraten oder roh?"
note("halloumi: Variante 'roh' ergänzt")

e=idx['feta']; e['varianten']=[{"label":"Aus pasteurisierter Milch","komponenten":[{"tag":"frischkaese-stueckig","zustand":"pasteurisiert"}]},
  {"label":"Aus Rohmilch oder ohne Angabe","komponenten":[{"tag":"rohmilch-weichkaese","zustand":"rohmilch"}]},
  {"label":"Überbacken oder mitgekocht","komponenten":[{"tag":"frischkaese-stueckig","zustand":"durcherhitzt"}]}]
e['frage']="Wie verwendet?"; e['alternativen']=["Feta im Ofengericht","Mozzarella aus pasteurisierter Milch","Hartkäse"]
e['eigener_text']="Das BLV führt Feta namentlich unter den Milchprodukten, die Listerien enthalten könnten — auch aus pasteurisierter Milch. In der Ofenpfanne oder im Gratin durcherhitzt ist er unbedenklich."
note("feta: pasteurisierte Variante von ok auf meiden (BLV nennt Feta namentlich); Ofen-Variante ergänzt")

for cid in ['mozzarella','burrata']:
    idx[cid]['eigener_text']="Mozzarella und Burrata werden bei der Herstellung erhitzt — deshalb unbedenklich, nicht wegen der Pasteurisierung der Milch. Gekühlt lagern und nach dem Öffnen rasch aufbrauchen."
note("mozzarella/burrata: Urteil bestätigt (BLV), Begründung auf die Herstellungserhitzung umgestellt")

form={"id":"formaggini","name":"Formaggini und Frischkäsli","gruppe":"Käse",
 "synonyme":["formaggini","formaggino","ziegenfrischkäsli","schaffrischkäsli","frischkäsli","apérokäsli","aperokaesli"],
 "varianten":[{"label":"Kalt","komponenten":[{"tag":"frischkaese-stueckig"}]},
              {"label":"Überbacken oder mitgekocht","komponenten":[{"tag":"frischkaese-stueckig","zustand":"durcherhitzt"}]}],
 "alternativen":["Streichfrischkäse aus pasteurisierter Milch","Hüttenkäse","Quark"],"frage":"Kalt oder überbacken?",
 "eigener_text":"Stückiger Frischkäse hat einen hohen Wassergehalt und wird vom BLV getrennt von streichfähigem Frischkäse geführt."}
L['lebensmittel'].insert([i for i,x in enumerate(L['lebensmittel']) if x['id']=='feta'][0], form)
note("NEU: Eintrag 'formaggini' (stückiger Frischkäse)")

# ---------- FISCH ----------
for fid,tag,txt in [('heilbutt','raubfisch-mittel','Heilbutt gehört zu den Arten mit erhöhtem Quecksilbergehalt — Garen ändert daran nichts.'),
                    ('rotbarsch','raubfisch-mittel','Rotbarsch zeigt in Messreihen vergleichsweise hohe Quecksilberwerte.'),
                    ('makrele','raubfisch-mittel','Makrele zählt zu den Arten mit erhöhtem Quecksilbergehalt.'),
                    ('zander','raubfisch-mittel','Zander ist ein Süsswasser-Raubfisch und kann wie Hecht und Aal erhöhte Werte aufweisen.')]:
    e=idx[fid]
    for v in e['varianten']:
        if any(k['tag']=='fisch-gegart' for k in v['komponenten']):
            v['komponenten']=[{"tag":"raubfisch-mittel","zustand":"mengenbegrenzung"}]
    e['eigener_text']=txt+" Gegart ist er frei von Keimen, die Mengenempfehlung gilt trotzdem."
    note(f"{fid}: Quecksilber-Tag ergänzt — gegart ergab bisher ein bedingungsloses Ja")

e=idx['tintenfisch']
for v in e['varianten']:
    if any(k.get('zustand')=='durcherhitzt' for k in v['komponenten']):
        v['komponenten'].append({"tag":"raubfisch-mittel","zustand":"mengenbegrenzung"})
note("tintenfisch: Quecksilber-Tag zur durchgegarten Variante ergänzt")

# ---------- WEITERE ----------
e=idx['innereien']
e['varianten']=[{"label":"Vollständig durchgegart","komponenten":[{"tag":"innereien-schadstoffe"}]}]
R['regeln'].append({"id":"innereien-schadstoffe","titel":"Innereien","trifft_auf":["innereien-schadstoffe"],"status":"bedingt",
 "begruendung":("Innereien reichern neben Retinol auch Schwermetalle und andere Schadstoffe an. Mehrere Fachstellen "
  "raten in der Schwangerschaft generell davon ab, nicht nur von Leber."),
 "entschaerfung":[],"trimester_gewichtung":None})
e['eigener_text']="Nur selten und in kleinen Mengen, vollständig durchgegart. Leber und Leberprodukte sind davon ausgenommen und werden gemieden."
note("innereien: von ok auf bedingt; neue Regel 'innereien-schadstoffe'")

e=idx['johanniskraut']; e['varianten']=[{"label":None,"komponenten":[{"tag":"nicht-bewertet"}]}]
note("johanniskraut: von bedingt auf unklar — die Tag-Bezeichnung behauptete eine Wirkung, die der Text verneint")

e=idx['truthahn']; e['varianten']=[{"label":"Vollständig durchgegart","komponenten":[{"tag":"gefluegel","zustand":"durcherhitzt"}]},
  {"label":"Rosa am Knochen","komponenten":[{"tag":"gefluegel"}]}]
e['frage']="Wie durchgegart?"
note("truthahn: Garzustandsfrage ergänzt (fehlte als einzigem Fleisch-Eintrag seiner Art)")

e=idx['sauser']; e['varianten']=[{"label":"Süssmost pasteurisiert aus der Packung","komponenten":[{"tag":"obst-gewaschen"}]},
  {"label":"Süssmost frisch gepresst ab Hof","komponenten":[{"tag":"erdgemuese-ungewaschen"}]},
  {"label":"Sauser oder saurer Most, noch in Gärung","komponenten":[{"tag":"alkohol"}]}]
e['frage']="Vergoren, frisch gepresst oder aus der Packung?"
e['eigener_text']="Sauser schmeckt süss und sieht aus wie Traubensaft. Erkennbar ist er an der Trübung, am Prickeln und daran, dass er nur im Herbst und mit offenem Verschluss verkauft wird."
note("sauser: dritte Variante für frisch gepressten Most; Erkennungsmerkmale statt Geschmack")

e=idx['robiola']; e['varianten'].append({"label":"Überbacken oder mitgekocht","komponenten":[{"tag":"rohmilch-weichkaese","zustand":"durcherhitzt"}]})
note("robiola: fehlende Variante 'durcherhitzt' ergänzt")

idx['camembert']['synonyme']=[s for s in idx['camembert']['synonyme'] if s!='tomme']
note("camembert: Synonym 'tomme' entfernt (gehört zum Halbhartkäse)")
e=idx['fleischkonserve']; e['synonyme']=[s for s in e['synonyme'] if 'dose' not in s]
note("fleischkonserve: 'ravioli/chili aus der dose' entfernt — die fallen unter die Aufwärmregel")
for i,s in [('weissfisch','köhler'),('weissfisch','wels'),('huettenkaese','skyr'),('kefir','ayran'),('spaetzli','nudeln'),('spaetzli','gnocchi'),('schnitzel','chicken nuggets'),('schnitzel','nuggets'),('roesti','kartoffelstock'),('roesti','kartoffelgratin'),('roesti','rösti'),('crepes','pancakes'),('suelze','aspik'),('suelze','sülze'),('truthahn','pute'),('truthahn','truthahn'),('cremeschnitte','rahmtorte')]:
    if s in idx[i]['synonyme']: idx[i]['synonyme'].remove(s)
note("17 doppelt vergebene Synonyme entfernt, darunter alle 8 mit abweichendem Urteil")

L['version']="0.3"; R['version']=R.get('version','0.2')
L['hinweis']=L['hinweis']+" Version 0.3: gegen die BLV-Empfehlungen zu Milchprodukten und die Quecksilber-Empfehlungen geprüft und korrigiert; weiterhin nicht fachlich verifiziert."
json.dump(L,open('daten/lebensmittel.json','w'),ensure_ascii=False,indent=2)
json.dump(R,open('daten/regeln.json','w'),ensure_ascii=False,indent=2)
open('daten/AENDERUNGEN.md','w').write("# Korrekturen v0.2 -> v0.3\n\n"+"\n".join("- "+x for x in log)+"\n")
print(len(log),"Änderungen"); print("Einträge:",len(L['lebensmittel']),"| Regeln:",len(R['regeln']))
