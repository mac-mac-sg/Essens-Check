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

      <section className="einstellungen__gruppe" aria-labelledby="einstellungen-quellen">
        <h2 className="einstellungen__titel" id="einstellungen-quellen">
          Quellen &amp; medizinische Grundlage
        </h2>
        <div className="einstellungen__info">
          <p>
            Die Einschätzungen beruhen auf dokumentierten Fachinformationen und Empfehlungen
            anerkannter Gesundheitsbehörden und medizinischer Fachstellen. Das Regelwerk wird
            bei fachlichen Änderungen anhand dieser Grundlagen aktualisiert.
          </p>
          <p>Stand der hinterlegten fachlichen Prüfung: 08.09.2026.</p>
        </div>

        <details className="gruppe">
          <summary className="gruppe__titel">
            <span className="gruppe__name">Quellen für Lebensmittel</span>
            <span className="gruppe__pfeil" aria-hidden="true">›</span>
          </summary>
          <div className="einstellungen__info">
            <p>
              Das Lebensmittel-Regelwerk stützt sich insbesondere auf Schweizer Primärquellen
              von SGE, BLV und BAG. Für einzelne Fragestellungen wird ergänzend Swissmedic
              herangezogen.
            </p>
            <ul>
              <li>
                <a href="https://www.sge-ssn.ch/media/02apbag5/sge_mb_schwangerschaft_de.pdf" target="_blank" rel="noreferrer">
                  SGE – Ernährung während der Schwangerschaft
                </a>
              </li>
              <li>
                <a href="https://www.blv.admin.ch/de/ernaehrung-schwangere-und-stillende" target="_blank" rel="noreferrer">
                  BLV – Ernährung in Schwangerschaft und Stillzeit
                </a>
              </li>
              <li>
                <a href="https://www.bag.admin.ch/de/toxoplasmose-de" target="_blank" rel="noreferrer">
                  BAG – Toxoplasmose
                </a>
              </li>
              <li>
                <a href="https://www.bag.admin.ch/de/listeriose" target="_blank" rel="noreferrer">
                  BAG – Listeriose
                </a>
              </li>
              <li>
                <a href="https://www.blv.admin.ch/de/blei" target="_blank" rel="noreferrer">
                  BLV – Blei im Wildfleisch
                </a>
              </li>
              <li>
                <a href="https://www.blv.admin.ch/de/jodiertes-salz" target="_blank" rel="noreferrer">
                  BLV – Jodiertes Salz und Algen
                </a>
              </li>
              <li>
                <a href="https://www.blv.admin.ch/de/bedarf-nahrungsergaenzungsmitteln" target="_blank" rel="noreferrer">
                  BLV – Bedarf an Nahrungsergänzungsmitteln
                </a>
              </li>
              <li>
                <a href="https://www.swissmedic.ch/swissmedic/de/home/news/mitteilungen/fencheltee-fuer-schwangere-kinder-unter-4-jahren.html" target="_blank" rel="noreferrer">
                  Swissmedic – Fencheltee in Schwangerschaft und früher Kindheit
                </a>
              </li>
            </ul>
          </div>
        </details>

        <details className="gruppe">
          <summary className="gruppe__titel">
            <span className="gruppe__name">Quellen für Medikamente</span>
            <span className="gruppe__pfeil" aria-hidden="true">›</span>
          </summary>
          <div className="einstellungen__info">
            <p>
              Die Schwangerschaftsbewertungen der aktuell kuratierten Wirkstoffe basieren auf
              Embryotox. Swissmedic liefert die Schweizer Produkt-, Wirkstoff- und
              Packungsinformationen. Diese Produktdaten allein erzeugen keine medizinische
              Freigabe oder Bewertung.
            </p>
            <ul>
              <li>
                <a href="https://www.embryotox.de/" target="_blank" rel="noreferrer">
                  Embryotox – Arzneimittelsicherheit in Schwangerschaft und Stillzeit
                </a>
              </li>
              <li>
                <a href="https://www.swissmedic.ch/swissmedic/de/home/services/listen_neu.html" target="_blank" rel="noreferrer">
                  Swissmedic – Listen und OGD zu zugelassenen Arzneimitteln
                </a>
              </li>
              <li>
                <a href="https://www.swissmedic.ch/swissmedic/de/home/humanarzneimittel/authorisations/aips.html" target="_blank" rel="noreferrer">
                  Swissmedic – Fach- und Patienteninformationen (AIPS)
                </a>
              </li>
            </ul>
          </div>
        </details>
      </section>

      <section className="einstellungen__gruppe" aria-labelledby="einstellungen-info">
        <h2 className="einstellungen__titel" id="einstellungen-info">
          Informationen
        </h2>
        <div className="einstellungen__info">
          <p>
            Die App ersetzt keine individuelle Beratung durch Hebamme, Ärztin, Arzt oder
            Apotheke. Verordnete Medikamente nicht eigenständig beginnen, absetzen oder in der
            Dosis verändern.
          </p>
          <p>
            Bei Lebensmitteln sind häufig Zubereitung, Pasteurisierung und Erhitzung
            entscheidend. Im Zweifel gilt die strengere Einschätzung.
          </p>
        </div>
      </section>
    </div>
  )
}
