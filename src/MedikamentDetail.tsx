import { useMemo, useState } from 'react'
import { entscheidungsgradMedikament } from './entscheidungsgrad'
import { bewerteMedikament } from './medikamente/bewerten'
import { findeMedikament, medikamentKatalog } from './medikamente/daten'
import { medikamentProduktSnapshot } from './medikamente/produkte'
import { bereiteProduktBewertungVor } from './medikamente/suche'
import { MEDIKAMENT_STATUS_META, type MedikamentProfil } from './medikamente/typen'
import type { SwissmedicProdukt } from './medikamente/swissmedic'

type Perspektive = 'einnehmen' | 'bereits-eingenommen'

function formatiereDatum(iso: string): string {
  const [jahr, monat, tag] = iso.split('-')
  return jahr && monat && tag ? `${tag}.${monat}.${jahr}` : iso
}

function Produktdaten({ produkt }: { produkt: SwissmedicProdukt }) {
  return (
    <div className="med-detail__produktdaten">
      <span className="med-detail__produktart">Schweizer Präparat</span>
      <p className="med-detail__produktname">{produkt.name}</p>
      <dl className="med-detail__datenliste">
        <div>
          <dt>Arzneiform</dt>
          <dd>{produkt.arzneiform}</dd>
        </div>
        <div>
          <dt>Wirkstoff{produkt.wirkstoffe.length === 1 ? '' : 'e'}</dt>
          <dd>
            {produkt.wirkstoffe.map((wirkstoff) => (
              <span key={wirkstoff.stoff_id}>
                {wirkstoff.name}
                {wirkstoff.menge ? ` · ${wirkstoff.menge}${wirkstoff.einheit ? ` ${wirkstoff.einheit}` : ''}` : ''}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt>Swissmedic</dt>
          <dd>Zulassung {produkt.zulassungsnummer}</dd>
        </div>
      </dl>
    </div>
  )
}

function Profilwahl({
  profile,
  onWaehlen,
}: {
  profile: MedikamentProfil[]
  onWaehlen: (id: string) => void
}) {
  return (
    <div className="med-detail__klaerung">
      <p className="med-detail__klaerung-titel">Welche Anwendung trifft zu?</p>
      <p className="med-detail__klaerung-text">
        Bei diesem Wirkstoff hängt die Bewertung von Dosis oder Anwendung ab. Die App rät
        nicht, welches Profil gemeint ist.
      </p>
      <div className="med-detail__profilwahl">
        {profile.map((profil) => (
          <button key={profil.id} type="button" onClick={() => onWaehlen(profil.id)}>
            <strong>{profil.label}</strong>
            <span>{profil.beschreibung}</span>
            {profil.voraussetzung && <small>{profil.voraussetzung}</small>}
          </button>
        ))}
      </div>
    </div>
  )
}

export function MedikamentDetail({
  produkt,
  medikamentId,
  ssw,
  sswAnzeige,
  onTerminAendern,
  onWirkstoffOeffnen,
}: {
  produkt?: SwissmedicProdukt | null
  medikamentId?: string | null
  ssw?: number
  sswAnzeige?: string
  onTerminAendern: () => void
  onWirkstoffOeffnen: (id: string) => void
}) {
  const [profilId, setProfilId] = useState<string | null>(null)
  const [perspektive, setPerspektive] = useState<Perspektive>('einnehmen')

  const vorbereitet = useMemo(
    () => (produkt ? bereiteProduktBewertungVor(produkt) : null),
    [produkt],
  )
  const direktesMedikament = medikamentId ? findeMedikament(medikamentId) : null
  const medikament =
    vorbereitet?.art === 'bereit' ? vorbereitet.medikament : direktesMedikament
  const profile =
    vorbereitet?.art === 'bereit'
      ? vorbereitet.profile
      : direktesMedikament?.profile ?? []

  if (produkt && vorbereitet?.art === 'gesperrt') {
    const unbekannte = produkt.wirkstoffe.filter((wirkstoff) => !wirkstoff.medikament_id)
    return (
      <article className="med-detail">
        <Produktdaten produkt={produkt} />

        <div className="med-detail__sperre" role="status">
          <p className="med-detail__sperre-titel">
            {vorbereitet.grund === 'unvollstaendig'
              ? 'Keine automatische Gesamtbewertung'
              : vorbereitet.grund === 'kombination'
                ? 'Kombinationspräparat'
                : vorbereitet.grund === 'darreichungsform'
                  ? 'Diese Arzneiform ist noch nicht bewertet'
                  : 'Wirkstoff nicht eindeutig zugeordnet'}
          </p>
          <p>
            {vorbereitet.grund === 'unvollstaendig'
              ? 'Mindestens ein von Swissmedic deklarierter Wirkstoff ist noch nicht im kuratierten Schwangerschaftskatalog bewertet. Ein bekannter Bestandteil darf deshalb nicht als Freigabe des Gesamtprodukts verwendet werden.'
              : vorbereitet.grund === 'kombination'
                ? 'Alle Wirkstoffe sind einzeln bekannt, für das Kombinationspräparat wird aber bewusst kein gemeinsames Schwangerschaftsurteil aus Einzelurteilen errechnet.'
                : vorbereitet.grund === 'darreichungsform'
                  ? 'Die Swissmedic-Arzneiform lässt sich keinem für diesen Wirkstoff kuratierten Anwendungsprofil sicher zuordnen. Die App übernimmt deshalb kein Urteil einer anderen Darreichungsform.'
                  : 'Die Produktdaten lassen sich nicht sicher auf den lokalen Medikamentenkatalog abbilden.'}
          </p>
          {unbekannte.length > 0 && (
            <p className="med-detail__unbekannt">
              Noch nicht bewertet: {unbekannte.map((wirkstoff) => wirkstoff.name).join(', ')}
            </p>
          )}
        </div>

        <section className="entscheidungsgrad" data-grad="offen">
          <span>Entscheidungsgrad</span>
          <strong>Keine belastbare Gesamtbewertung</strong>
          <small>Produktdaten allein erzeugen kein medizinisches Urteil.</small>
        </section>

        {vorbereitet.grund === 'kombination' && vorbereitet.medikamente.length > 0 && (
          <div className="med-detail__einzelwirkstoffe">
            <p className="med-detail__klaerung-titel">Einzelwirkstoffe ansehen</p>
            <p className="med-detail__klaerung-text">
              Diese Ansichten gelten nur für den jeweiligen Wirkstoff, nicht als Freigabe des
              Kombinationspräparats.
            </p>
            {vorbereitet.medikamente.map((eintrag) => (
              <button key={eintrag.id} type="button" onClick={() => onWirkstoffOeffnen(eintrag.id)}>
                {eintrag.wirkstoff} einzeln prüfen
              </button>
            ))}
          </div>
        )}

        <p className="med-detail__sicherheit">{medikamentKatalog.sicherheitshinweis}</p>
      </article>
    )
  }

  if (!medikament) {
    return (
      <article className="med-detail">
        <div className="med-detail__sperre" role="status">
          <p className="med-detail__sperre-titel">Keine belastbare Zuordnung</p>
          <p>Für diesen Eintrag ist kein kuratierter Wirkstoff hinterlegt.</p>
        </div>
        <section className="entscheidungsgrad" data-grad="offen">
          <span>Entscheidungsgrad</span>
          <strong>Keine belastbare Einordnung</strong>
        </section>
        <p className="med-detail__sicherheit">{medikamentKatalog.sicherheitshinweis}</p>
      </article>
    )
  }

  const effektivesProfil = profile.length === 1 ? profile[0]?.id : profilId ?? undefined
  const urteil = effektivesProfil
    ? bewerteMedikament(medikament, medikamentKatalog, ssw, effektivesProfil)
    : null

  return (
    <article className="med-detail">
      {produkt ? (
        <Produktdaten produkt={produkt} />
      ) : (
        <div className="med-detail__wirkstoffkopf">
          <span className="med-detail__produktart">Wirkstoff</span>
          <p className="med-detail__produktname">{medikament.wirkstoff}</p>
          <p>{medikament.gruppe}</p>
        </div>
      )}

      {profile.length > 1 && !profilId && (
        <Profilwahl profile={profile} onWaehlen={setProfilId} />
      )}

      {profile.length > 1 && profilId && (
        <button className="med-detail__profil-aendern" type="button" onClick={() => setProfilId(null)}>
          Anwendung ändern
        </button>
      )}

      {urteil?.klaerung === 'ssw' && (
        <div className="med-detail__klaerung">
          <p className="med-detail__klaerung-titel">Aktuelle SSW benötigt</p>
          <p className="med-detail__klaerung-text">{urteil.text}</p>
          <button className="med-detail__aktion" type="button" onClick={onTerminAendern}>
            Geburtstermin eintragen
          </button>
        </div>
      )}

      {urteil?.status && (() => {
        const grad = entscheidungsgradMedikament(urteil.status)
        return (
          <>
            <div className="med-detail__kontext kontextleiste">
              {sswAnzeige && <span>SSW {sswAnzeige}</span>}
              {urteil.profil && <span>{urteil.profil.label}</span>}
            </div>

            <div className="med-detail__perspektive" role="group" aria-label="Fragestellung">
              <button
                type="button"
                aria-pressed={perspektive === 'einnehmen'}
                onClick={() => setPerspektive('einnehmen')}
              >
                Kann ich es einnehmen?
              </button>
              <button
                type="button"
                aria-pressed={perspektive === 'bereits-eingenommen'}
                onClick={() => setPerspektive('bereits-eingenommen')}
              >
                Bereits eingenommen
              </button>
            </div>

            {perspektive === 'einnehmen' ? (
              <div className="med-detail__bewertung">
                <div className="med-status" data-status={urteil.status}>
                  <span>Einordnung</span>
                  <strong>{MEDIKAMENT_STATUS_META[urteil.status].label}</strong>
                </div>

                <section className="entscheidungsgrad" data-grad={grad.grad}>
                  <span>Entscheidungsgrad</span>
                  <strong>{grad.label}</strong>
                  <small>{grad.erklaerung}</small>
                </section>

                <section className="detailblock">
                  <h3>Warum?</h3>
                  <p className="med-detail__haupttext">{urteil.text}</p>
                </section>

                {urteil.hinweise.length > 0 && (
                  <section className="detailblock detailblock--worauf">
                    <h3>Worauf kommt es an?</h3>
                    <ul className="med-detail__hinweise">
                      {[...new Set(urteil.hinweise)].map((hinweis) => (
                        <li key={hinweis}>{hinweis}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            ) : (
              <div className="med-detail__eingenommen">
                <p className="med-detail__eingenommen-titel">Wenn du es bereits eingenommen hast</p>
                <p>
                  {urteil.bereits_eingenommen ??
                    'Für eine bereits erfolgte Einnahme ist keine eigene lokale Aussage hinterlegt. Bitte medizinisch oder pharmazeutisch Rücksprache halten.'}
                </p>
              </div>
            )}

            {urteil.quellen.length > 0 && (
              <div className="med-detail__quellen">
                <p>Quellen zur Schwangerschaftsbewertung</p>
                <ul>
                  {urteil.quellen.map((quelle) => (
                    <li key={quelle.id}>
                      <a href={quelle.url} target="_blank" rel="noreferrer">
                        {quelle.titel}
                      </a>
                    </li>
                  ))}
                </ul>
                {produkt && (
                  <small>
                    Produktdaten: Swissmedic-Snapshot, Stand {formatiereDatum(medikamentProduktSnapshot.stand)}.
                  </small>
                )}
              </div>
            )}
          </>
        )
      })()}

      <p className="med-detail__sicherheit">{medikamentKatalog.sicherheitshinweis}</p>
    </article>
  )
}
