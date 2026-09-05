# Projektanweisungen

Private App für eine Schwangere: Lebensmittel eingeben, eindeutige Antwort bekommen.
Vollständige Spezifikation in `SPEC.md` — vor jeder Aufgabe lesen.

## Skills

Zu Beginn jeder Aufgabe verfügbare Skills auflisten und alle passenden ohne
Rückfrage anwenden — sowohl die installierten Projekt-Skills als auch die
mitgelieferten Skills für Anwendungsentwicklung. Mehrere Skills können
gleichzeitig zutreffen; nicht auf einen beschränken.

Für dieses Projekt regelmässig einschlägig:
- Frontend- und UI-Skills bei jeder Arbeit an Komponenten, Layout oder Farbsystem
- Web-App-Skills beim Aufsetzen von Struktur, Routing und Build
- Dokumentations-Skills bei Änderungen an `SPEC.md` oder `README.md`

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

Dieses Projekt gibt Auskunft, auf die im Laden eine Entscheidung folgt.

- Keine Bewertung erfinden. Was nicht aus dem Regelkatalog folgt, ist `unklar`.
- Nie eine Freigabe raten. Ein falsches «Ja» ist der einzige echte Schadensfall.
- Bei widersprüchlichen oder mehrdeutigen Regeln greift das strengere Argument.
  Sicherheit geht vor. Das gilt für die Maschine wie für die Datenpflege: eine
  Einschränkung wird nie gelockert, um eine gefälligere Auskunft zu erzeugen.
- Keine Diagnosen, keine Mengenempfehlungen über die im Regelkatalog hinterlegten.
- Der Hinweis auf Hebamme und Ärztin bleibt auf jedem Screen sichtbar und wird
  nicht wegoptimiert.
- Bei fachlicher Unsicherheit im Antworttext markieren statt plausibel füllen.

## Arbeitsweise

- Änderungen an der Bewertungslogik immer mit Tests, die die bestehenden Urteile
  absichern. Ein Regelumbau darf kein bestehendes Urteil unbemerkt drehen.
- Datenpflege und Logik getrennt halten: neue Lebensmittel dürfen nur Daten
  hinzufügen, nicht Code.
- Keine Abhängigkeiten für Dinge, die 20 Zeilen eigener Code lösen.
- Keine Telemetrie, keine externen Fonts, keine Analytics.
- Genau eine Ausnahme kann das Gerät verlassen: die Strichcode-Abfrage bei Open
  Food Facts, und nur für einen Code, der lokal noch nicht zugeordnet ist. Sie
  ist über einen Schalter steuerbar und **standardmässig aus** — einen
  Strichcode wegzuschicken soll eine bewusste Entscheidung sein, keine
  Voreinstellung. Diese Ausnahme bleibt die einzige; jede weitere ist eine
  eigene Entscheidung.
- Was von aussen kommt, ist Fremdinhalt: es füllt Vorschläge, nie ein Urteil.
  Ein Produktname aus einer offen gepflegten Datenbank darf nie eine Freigabe
  auslösen.
