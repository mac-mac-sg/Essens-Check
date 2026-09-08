# Projektanweisungen

Private App für eine Schwangere: Lebensmittel und ausgewählte Medikamente eingeben, eindeutige beziehungsweise bewusst offene Einordnung bekommen.
Vollständige Spezifikation in `SPEC.md` — vor jeder Aufgabe lesen. Für Medikamente zusätzlich `MEDIKAMENTE.md` lesen.

## Skills

Zu Beginn jeder Aufgabe verfügbare Skills auflisten und alle passenden ohne
Rückfrage anwenden — sowohl die installierten Projekt-Skills als auch die
mitgelieferten Skills für Anwendungsentwicklung. Mehrere Skills können
gleichzeitig zutreffen; nicht auf einen beschränken.

Für dieses Projekt regelmässig einschlägig:
- Frontend- und UI-Skills bei jeder Arbeit an Komponenten, Layout oder Farbsystem
- Web-App-Skills beim Aufsetzen von Struktur, Routing und Build
- Dokumentations-Skills bei Änderungen an `SPEC.md`, `MEDIKAMENTE.md` oder `README.md`

Wenn ein Skill der Spezifikation widerspricht, gilt die Spezifikation. Abweichung
im Antworttext festhalten statt stillschweigend umsetzen.

## Sprache und Schreibweise

- Sämtliche Inhalte, UI-Texte, Commit-Messages und Antworten auf Deutsch.
- Schweizer Rechtschreibung: kein ß, immer ss.
- Umlaute korrekt als ä, ö, ü — nie als ae, oe, ue. Der Prototyp enthält
  transkribierte Umlaute; die sind bei der Migration zu korrigieren.
- Code auf Englisch, fachliche Bezeichner im Datenmodell auf Deutsch
  (`regeln`, `varianten`, `entschaerfung`).

## Inhaltliche Sorgfalt

Dieses Projekt gibt Auskunft, auf die im Laden oder bei einer Medikamentenfrage eine Entscheidung folgt.

- Keine Bewertung erfinden. Was nicht aus dem Regelkatalog folgt, ist `unklar`; bei Medikamenten bleibt der Status offen beziehungsweise `nicht_bewertet`.
- Nie eine Freigabe raten. Ein falsches «Ja» beziehungsweise eine falsche Medikamentenfreigabe ist der einzige echte Schadensfall.
- Bei widersprüchlichen oder mehrdeutigen Regeln greift das strengere Argument.
  Sicherheit geht vor. Das gilt für die Maschine wie für die Datenpflege: eine
  Einschränkung wird nie gelockert, um eine gefälligere Auskunft zu erzeugen.
- Keine Diagnosen, keine Mengenempfehlungen über die im Regelkatalog hinterlegten.
- Der Hinweis auf Hebamme und Ärztin bleibt auf jedem Screen sichtbar und wird
  nicht wegoptimiert. Medikamentenansichten nennen zusätzlich die Apotheke.
- Bei fachlicher Unsicherheit im Antworttext markieren statt plausibel füllen.

## Medikamente

- Produktidentifikation und Schwangerschaftsbewertung bleiben getrennt. Swissmedic-Daten sagen, **was** ein Schweizer Präparat ist; sie erzeugen nie allein ein Schwangerschaftsurteil.
- Der Swissmedic-Snapshot liegt lokal im Bundle und wird ausserhalb der Laufzeit aktualisiert. Die App fragt Swissmedic zur Laufzeit nicht im Netzwerk ab.
- Ein Produkt darf nur automatisch bewertet werden, wenn alle deklarierten Wirkstoffe lokal kuratiert sind.
- Kombinationspräparate erhalten kein aus Einzelurteilen errechnetes Gesamturteil. Ein bekannter Bestandteil darf einen unbekannten zweiten Wirkstoff nie überstimmen.
- Die Arzneiform muss eindeutig zu einem kuratierten Darreichungsweg passen. Lokale Formen erben keine systemischen Urteile.
- Anwendungsprofil, Dosisprofil oder SSW werden nie geraten. Wenn sie die Bewertung verändern, muss die Nutzerin sie angeben beziehungsweise den Geburtstermin hinterlegen.
- «Bereits eingenommen» ist eine eigene Aussage und wird nicht automatisch aus dem Status für eine geplante Einnahme abgeleitet.
- Verordnete Medikamente nie eigenständig beginnen, absetzen oder in der Dosis verändern.
- Details und aktueller Umfang stehen in `MEDIKAMENTE.md`.

## Arbeitsweise

- Änderungen an der Bewertungslogik immer mit Tests, die die bestehenden Urteile
  absichern. Ein Regelumbau darf kein bestehendes Urteil unbemerkt drehen.
- Datenpflege und Logik getrennt halten: neue Lebensmittel oder Medikamente dürfen nur Daten
  hinzufügen, nicht fachliche Sonderfälle als versteckten Code einbauen.
- Keine Abhängigkeiten für Dinge, die 20 Zeilen eigener Code lösen.
- Keine Telemetrie, keine externen Fonts, keine Analytics.
- Genau eine Ausnahme verlässt die App zur Laufzeit: die Strichcode-Abfrage bei Open Food
  Facts. Sie erfolgt bei jedem gelesenen Lebensmittel-Code, ohne Schalter und ohne lokalen
  Zwischenspeicher. Der Swissmedic-Import läuft nur im Entwicklungs-/CI-Prozess und ist keine Laufzeit-Netzwerkabhängigkeit.
- Die Open-Food-Facts-Abfrage darf Produktname, generische Bezeichnung,
  Kategorien und Zutaten abrufen. Diese Angaben sind **nur Evidenz für die
  Zuordnung zum lokalen Katalog** und nie eine medizinische Quelle. Sie dürfen
  eine Zuordnung stärken oder ein automatisches Urteil blockieren, aber niemals
  einen lokalen Status entschärfen oder eine Freigabe erzeugen, die der
  Schweizer Regelkatalog nicht selbst hergibt.
- Eine Kategorie allein darf nie automatisch zu einem Urteil führen. Ein
  automatischer Kandidat braucht weiterhin den Produktnamen oder mindestens
  zwei voneinander unabhängige Anker (z. B. Bezeichnung + Kategorie) und den
  bestehenden deutlichen Abstand zum nächsten Kandidaten.
- Zutaten dürfen nur einen bereits verankerten Kandidaten bestätigen. Eine
  Zutat, die der lokale Katalog klar als `meiden` oder `unklar` erkennt,
  verhindert die automatische Gesamtbeurteilung. Fehlende Zutatenangaben bei
  Open Food Facts gelten niemals als Entwarnung.
- Ein Produktname aus der Datenbank darf zu einem Urteil führen, aber nur wenn
  er **eindeutig** auf einen Katalogeintrag zeigt: allein stehend oder
  mindestens doppelt so schwer wie der nächste Treffer. Bei Gleichstand wird
  gefragt, nie geraten — «Zweifel Paprika Chips» trifft Tomaten, Gewürze und
  Chips gleich stark, und dort wäre jedes automatische Urteil falsch. Die
  Schwelle ist an echten Produktnamen geeicht und gehört zur Bewertungslogik:
  Änderungen daran nur mit Tests. Bei der Zuordnung zählen nur Wortanfänge —
  Zeichenfolgen mitten im Wort erzeugen bei fremden Namen nur Unsinn.
- Die Zuordnung bleibt fehlbar: ein Geschmackswort im Produktnamen kann auf den
  falschen Eintrag zeigen. Das wird benannt, nicht kaschiert — die Herkunftszeile
  nennt die Zuordnung, und der Weg zurück zur Auswahl bleibt offen.
