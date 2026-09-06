import type { Schema, Wunsch } from './farbschema'
import { umgelegt } from './farbschema'

/**
 * Der Hinweis auf Hebamme und Ärztin ist auf jedem Screen sichtbar
 * und wird nicht wegoptimiert (siehe CLAUDE.md).
 * Formulierung aus dem Prototyp, Umlaute korrigiert.
 */
export function Fusszeile({
  onTerminAendern,
  schema,
  wunsch,
  onWunsch,
}: {
  onTerminAendern?: () => void
  schema: Schema
  wunsch: Wunsch
  onWunsch: (wunsch: Wunsch) => void
}) {
  const dunkel = schema === 'dunkel'
  return (
    <footer className="fusszeile">
      <p>
        Kuratierte Angaben nach den gängigen Schweizer Empfehlungen. Ersetzt keine Beratung
        durch Hebamme oder Ärztin — im Zweifel dort nachfragen.
      </p>

      {/*
        Die ganze Zeile ist der Schalter. role=switch statt einer Checkbox,
        weil die Wirkung sofort eintritt und nichts abgeschickt wird.
      */}
      <button
        className="schema"
        type="button"
        role="switch"
        aria-checked={dunkel}
        onClick={() => onWunsch(umgelegt(schema))}
      >
        <span>Dunkelmodus</span>
        <span className="schalter" aria-hidden="true">
          <span className="schalter__knopf" />
        </span>
      </button>

      {/* Ohne diesen Weg gäbe es kein Zurück zur Systemeinstellung. */}
      {wunsch !== 'system' && (
        <button className="fusszeile__termin" type="button" onClick={() => onWunsch('system')}>
          Dem Gerät folgen
        </button>
      )}

      {onTerminAendern && (
        <button className="fusszeile__termin" type="button" onClick={onTerminAendern}>
          Geburtstermin ändern
        </button>
      )}
    </footer>
  )
}
