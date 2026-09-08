export function Fusszeile({ nurSicherheit = false }: { nurSicherheit?: boolean }) {
  return (
    <footer className="fusszeile">
      <p>
        {nurSicherheit
          ? 'Ersetzt keine Beratung durch Hebamme oder Ärztin — im Zweifel dort nachfragen.'
          : 'Kuratierte Angaben nach gängigen Schweizer Empfehlungen. Ersetzt keine Beratung durch Hebamme oder Ärztin — im Zweifel dort nachfragen.'}
      </p>
    </footer>
  )
}
