import type { Schema, Wunsch } from './farbschema'

function formatDatum(datum: string | null): string {
  if (!datum) return 'Nicht hinterlegt'
  const parsed = new Date(`${datum}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return 'Nicht hinterlegt'
  return new Intl.DateTimeFormat('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed)
}

function InstallierenSymbol() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6.5" y="2.75" width="11" height="18.5" rx="2.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.5 17.2h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 6.2v6.2M9.6 10.1 12 12.5l2.4-2.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Einstellungen({
  termin,
  schema,
  wunsch,
  installierbar,
  onInstallieren,
  onWunsch,
  onTerminAendern,
}: {
  termin: string | null
  schema: Schema
  wunsch: Wunsch
  installierbar: boolean
  onInstallieren: () => void | Promise<void>
  onWunsch: (wunsch: Wunsch) => void
  onTerminAendern: () => void
}) {
  return (
    <div className="einstellungen">
      {installierbar && (
        <section className="einstellungen__gruppe" aria-labelledby="einstellungen-app">
          <h2 className="einstellungen__titel" id="einstellungen-app">
            App
          </h2>
          <button
            className="einstellungen__zeile einstellungen__zeile--installieren"
            type="button"
            onClick={onInstallieren}
          >
            <span className="einstellungen__symbol" aria-hidden="true">
              <InstallierenSymbol />
            </span>
            <span className="einstellungen__inhalt">
              <span className="einstellungen__name">App installieren</span>
              <span className="einstellungen__wert">Als App auf deinem Startbildschirm</span>
            </span>
            <span className="einstellungen__pfeil" aria-hidden="true">›</span>
          </button>
        </section>
      )}

      <section className="einstellungen__gruppe" aria-labelledby="einstellungen-termin">
        <h2 className="einstellungen__titel" id="einstellungen-termin">
          Schwangerschaft
        </h2>
        <button className="einstellungen__zeile" type="button" onClick={onTerminAendern}>
          <span>
            <span className="einstellungen__name">Geburtstermin</span>
            <span className="einstellungen__wert">{formatDatum(termin)}</span>
          </span>
          <span className="einstellungen__pfeil" aria-hidden="true">›</span>
        </button>
      </section>

      <section className="einstellungen__gruppe" aria-labelledby="einstellungen-schema">
        <h2 className="einstellungen__titel" id="einstellungen-schema">
          Erscheinungsbild
        </h2>
        <div className="schema-auswahl" role="group" aria-label="Farbschema wählen">
          {([
            ['hell', 'Hell'],
            ['dunkel', 'Dunkel'],
            ['system', 'Gerät'],
          ] as const).map(([wert, label]) => (
            <button
              key={wert}
              className="schema-auswahl__knopf"
              type="button"
              data-aktiv={wunsch === wert || undefined}
              aria-pressed={wunsch === wert}
              onClick={() => onWunsch(wert)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="einstellungen__hilfe">
          Aktuell aktiv: {schema === 'dunkel' ? 'Dunkel' : 'Hell'}.
        </p>
      </section>

      <section className="einstellungen__gruppe" aria-labelledby="einstellungen-info">
        <h2 className="einstellungen__titel" id="einstellungen-info">
          Informationen
        </h2>
        <div className="einstellungen__info">
          <p>
            Die Angaben sind nach gängigen Schweizer Empfehlungen kuratiert. Die App ersetzt
            keine Beratung durch Hebamme oder Ärztin.
          </p>
          <p>
            Entscheidend sind häufig Zubereitung, Pasteurisierung und Erhitzung. Im Zweifel
            gilt die strengere Einschätzung.
          </p>
        </div>
      </section>
    </div>
  )
}
