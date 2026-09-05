/**
 * Der Hinweis auf Hebamme und Ärztin ist auf jedem Screen sichtbar
 * und wird nicht wegoptimiert (siehe CLAUDE.md).
 * Formulierung aus dem Prototyp, Umlaute korrigiert.
 */
export function Fusszeile() {
  return (
    <footer className="fusszeile">
      <p>
        Kuratierte Angaben nach den gängigen Schweizer Empfehlungen. Ersetzt keine Beratung
        durch Hebamme oder Ärztin — im Zweifel dort nachfragen.
      </p>
    </footer>
  )
}
