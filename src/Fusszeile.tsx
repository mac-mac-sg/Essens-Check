export function Fusszeile({
  nurSicherheit = false,
  medikamente = false,
}: {
  nurSicherheit?: boolean
  medikamente?: boolean
}) {
  return (
    <footer className="fusszeile">
      <p>
        {medikamente
          ? 'Ersetzt keine Beratung durch Ärztin, Hebamme oder Apotheke. Verordnete Medikamente nicht eigenständig beginnen, absetzen oder in der Dosis verändern.'
          : nurSicherheit
            ? 'Ersetzt keine Beratung durch Hebamme oder Ärztin — im Zweifel dort nachfragen.'
            : 'Kuratierte Angaben nach gängigen Schweizer Empfehlungen. Ersetzt keine Beratung durch Hebamme oder Ärztin — im Zweifel dort nachfragen.'}
      </p>
    </footer>
  )
}
