/**
 * Der Hinweis auf Hebamme und Ärztin ist auf jedem Screen sichtbar
 * und wird nicht wegoptimiert (siehe CLAUDE.md).
 */
export function Fusszeile() {
  return (
    <footer className="fusszeile">
      <p>
        Diese App ersetzt keine Beratung. Im Zweifel entscheiden Hebamme und Ärztin —
        nicht dieser Bildschirm.
      </p>
    </footer>
  )
}
