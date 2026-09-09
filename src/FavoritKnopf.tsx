export function FavoritKnopf({
  aktiv,
  onUmschalten,
}: {
  aktiv: boolean
  onUmschalten: () => void
}) {
  return (
    <button
      className="favorit-knopf"
      type="button"
      aria-pressed={aktiv}
      aria-label={aktiv ? 'Aus gespeicherten Checks entfernen' : 'Check speichern'}
      onClick={onUmschalten}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20.2 4.8 13.4A5.1 5.1 0 0 1 12 6.2a5.1 5.1 0 0 1 7.2 7.2L12 20.2Z" />
      </svg>
      <span>{aktiv ? 'Gespeichert' : 'Speichern'}</span>
    </button>
  )
}
