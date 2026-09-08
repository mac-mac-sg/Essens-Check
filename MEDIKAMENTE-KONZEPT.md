# Medikamente – Fachkern vor UI-Freigabe

Stand: 08.09.2026

## Ziel

Die geplante Medikamentenfunktion bleibt fachlich und technisch vom Lebensmittelkatalog getrennt. Ein Arzneimittelurteil darf nicht aus Lebensmittelregeln abgeleitet werden. Die produktive App zeigt den Medikamentenkatalog erst, wenn Produktauflösung, UI und fachliche Freigabe abgeschlossen sind.

## Statussystem

| Status | Bedeutung in der Medikamentenfunktion |
| --- | --- |
| `geeignet` | Der kuratierte Schwangerschaftsdatensatz bewertet die hinterlegte Anwendung in diesem Kontext als geeignet. Das ist keine Aufforderung zur Selbstmedikation. |
| `mit_einschraenkung` | Anwendung ist grundsätzlich möglich, aber nur unter einer konkret hinterlegten Einschränkung, z. B. kurze Dauer oder zweite Wahl. |
| `nur_nach_ruecksprache` | Eine individuelle Nutzen-Risiko-Abwägung ist erforderlich. |
| `nicht_empfohlen` | Die hinterlegte Anwendung soll in diesem Kontext nicht erfolgen. |
| `nicht_bewertet` | Für diesen konkreten Kontext liegt im lokalen Katalog keine belastbare Bewertung vor. |

`status: null` ist kein sechster medizinischer Status. Er bedeutet, dass vor der Bewertung noch eine notwendige Information fehlt, etwa die SSW oder bei ASS das Dosis-/Anwendungsprofil.

## Sicherheitsprinzipien

1. Verordnete Medikamente nie aufgrund der App eigenständig beginnen, absetzen oder in der Dosis verändern.
2. Wirkstoff, Dosis-/Anwendungsprofil, Darreichungsweg und SSW werden getrennt modelliert.
3. Fehlt eine für die Bewertung notwendige Angabe, fragt die Engine nach; sie nimmt keinen günstigeren Kontext an.
4. Ein Handelsname wird später nur auf einen Wirkstoff beziehungsweise ein konkretes Kombinationspräparat aufgelöst. Der Handelsname selbst trägt kein Schwangerschaftsurteil.
5. Swissmedic dient als Schweizer Quelle für zugelassene Präparate, Packungen sowie Fach- und Patienteninformationen. Die Schwangerschaftsbewertung wird separat kuratiert.
6. Die Medikamentendaten werden nicht live aus einer externen medizinischen Quelle bewertet. Änderungen kommen nur über versionierte Daten, Review und Regressionstests in die App.
7. Der allgemeine Hinweis auf Ärztin, Apotheke beziehungsweise medizinische Fachperson bleibt bei Medikamenten deutlich sichtbar.

## Pilotumfang 0.1

Der erste Katalog enthält zehn Wirkstoffe, die verschiedene Modellierungsfälle abdecken:

- Paracetamol – über die Schwangerschaft einheitliche Bewertung, aber Dauerhinweis
- Ibuprofen – SSW-abhängig, zusätzliche Vorsicht ab SSW 20, nicht empfohlen ab SSW 28
- Diclofenac – SSW-abhängig, systemische Anwendung als Pilot
- Acetylsalicylsäure – zwingende Trennung Low-dose vs. analgetische Dosierung
- Amoxicillin – verschreibungspflichtiges Mittel mit einheitlicher Schwangerschaftsbewertung
- Cetirizin – einheitliche Bewertung
- Loratadin – einheitliche Bewertung
- Omeprazol – einheitliche Bewertung
- Metoclopramid – einsetzbar, aber Dauer-/Nebenwirkungsbeschränkung
- Xylometazolin – Darreichungsweg und Kurzzeitanwendung sind Teil des Profils

## Quellenarchitektur

### Schweizer Produktauflösung

- Swissmedic: Listen und OGD zu zugelassenen Humanarzneimitteln
- Swissmedic AIPS: Fach- und Patienteninformationen

Swissmedic publiziert die Arzneimittellisten und OGD-Daten monatlich. Der spätere Produktimport soll deshalb monatlich gegen einen eingefrorenen, reviewbaren Datenstand laufen und nicht bei jeder Suche live aufgerufen werden.

### Schwangerschaftsbewertung im Pilot

Die zehn Pilotbewertungen sind anhand der jeweiligen Embryotox-Wirkstoffmonografien kuratiert und paraphrasiert. Vor produktiver Freischaltung wird zusätzlich die konkrete Schweizer Fachinformation der zugeordneten Präparate geprüft. Inhalte externer Quellen werden nicht automatisch zur Laufzeit übernommen.

## Freigabegates für die nächste Phase

Bevor Medikamente in `Suchen` erscheinen, müssen mindestens folgende Punkte erfüllt sein:

1. Schweizer Handelsprodukte/Packungen werden reproduzierbar auf Wirkstoff, Stärke und Darreichungsform gemappt.
2. Kombinationspräparate können mehrere Wirkstoffe tragen und werden nicht auf nur einen Bestandteil reduziert.
3. Die UI fragt fehlende SSW-, Dosisprofil- oder Darreichungsangaben vor einem Urteil ab.
4. „Bereits eingenommen“ wird getrennt von „möchte ich einnehmen“ dargestellt.
5. Jede sichtbare Bewertung nennt Quelle und Datenstand.
6. Für alle produktiven Wirkstoffe existieren Regressionstests an den relevanten SSW-Grenzen.
7. Die Medikamentenfunktion hat einen eigenen Disclaimer und verwendet nicht die Lebensmittel-Ampeltexte „Ja/Nein“.

Erst danach wird der Pilotstatus auf `freigegeben` gesetzt und die UI an den Katalog angeschlossen.
