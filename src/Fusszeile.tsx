export function Fusszeile({ hinweisSteht = false }: { hinweisSteht?: boolean }) {
  return (
    <footer className="fusszeile">
      {!hinweisSteht && (
        <p>
          Kuratierte Angaben nach gängigen Schweizer Empfehlungen. Ersetzt keine Beratung
          durch Hebamme oder Ärztin — im Zweifel dort nachfragen.
        </p>
      )}
    </footer>
  )
}
