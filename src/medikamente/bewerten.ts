import type {
  Medikament,
  MedikamentKatalog,
  MedikamentProfil,
  MedikamentUrteil,
} from './typen'

function quellenFuer(medikament: Medikament, katalog: MedikamentKatalog) {
  const ids = new Set(medikament.quellen)
  return katalog.quellen.filter((quelle) => ids.has(quelle.id))
}

function profilFuer(medikament: Medikament, profilId?: string): MedikamentProfil | null {
  if (profilId) return medikament.profile.find((profil) => profil.id === profilId) ?? null
  return medikament.profile.length === 1 ? medikament.profile[0] ?? null : null
}

function hinweiseFuer(
  medikament: Medikament,
  profil: MedikamentProfil,
  fensterHinweise: string[],
): string[] {
  return [
    ...(medikament.allgemeiner_hinweis ? [medikament.allgemeiner_hinweis] : []),
    ...(profil.voraussetzung ? [profil.voraussetzung] : []),
    ...fensterHinweise,
  ]
}

/**
 * Bewertet nur bereits kuratierte Wirkstoff-/Anwendungsprofile. Die Funktion
 * errät weder ein Dosisprofil noch die Schwangerschaftswoche.
 */
export function bewerteMedikament(
  medikament: Medikament,
  katalog: MedikamentKatalog,
  ssw?: number,
  profilId?: string,
): MedikamentUrteil {
  const quellen = quellenFuer(medikament, katalog)

  if (profilId && !medikament.profile.some((profil) => profil.id === profilId)) {
    return {
      medikament,
      profil: null,
      status: null,
      klaerung: 'profil',
      text: 'Dieses Anwendungsprofil ist nicht hinterlegt. Bitte die konkrete Anwendung auswählen.',
      bereits_eingenommen: null,
      hinweise: [],
      quellen,
    }
  }

  const profil = profilFuer(medikament, profilId)
  if (!profil) {
    return {
      medikament,
      profil: null,
      status: null,
      klaerung: 'profil',
      text: 'Für diesen Wirkstoff hängt die Bewertung von Dosis oder Anwendung ab. Bitte zuerst das passende Anwendungsprofil auswählen.',
      bereits_eingenommen: null,
      hinweise: medikament.allgemeiner_hinweis ? [medikament.allgemeiner_hinweis] : [],
      quellen,
    }
  }

  if (ssw !== undefined && (!Number.isInteger(ssw) || ssw < 0 || ssw > 42)) {
    return {
      medikament,
      profil,
      status: null,
      klaerung: 'ssw',
      text: 'Die Schwangerschaftswoche ist ausserhalb des unterstützten Bereichs 0 bis 42.',
      bereits_eingenommen: null,
      hinweise: hinweiseFuer(medikament, profil, []),
      quellen,
    }
  }

  if (ssw === undefined) {
    const einziges = profil.ssw_fenster.length === 1 ? profil.ssw_fenster[0] : undefined
    if (!einziges || einziges.von_ssw !== 0 || einziges.bis_ssw !== 42) {
      return {
        medikament,
        profil,
        status: null,
        klaerung: 'ssw',
        text: 'Die Bewertung dieses Wirkstoffs ändert sich im Verlauf der Schwangerschaft. Für eine Aussage wird die aktuelle SSW benötigt.',
        bereits_eingenommen: null,
        hinweise: hinweiseFuer(medikament, profil, []),
        quellen,
      }
    }
    return {
      medikament,
      profil,
      status: einziges.status,
      klaerung: null,
      text: einziges.text,
      bereits_eingenommen: einziges.bereits_eingenommen,
      hinweise: hinweiseFuer(medikament, profil, einziges.hinweise ?? []),
      quellen,
    }
  }

  const fenster = profil.ssw_fenster.find(
    (eintrag) => ssw >= eintrag.von_ssw && ssw <= eintrag.bis_ssw,
  )
  if (!fenster) {
    return {
      medikament,
      profil,
      status: 'nicht_bewertet',
      klaerung: null,
      text: 'Für diese Schwangerschaftswoche ist in diesem Profil keine Bewertung hinterlegt.',
      bereits_eingenommen: null,
      hinweise: hinweiseFuer(medikament, profil, []),
      quellen,
    }
  }

  return {
    medikament,
    profil,
    status: fenster.status,
    klaerung: null,
    text: fenster.text,
    bereits_eingenommen: fenster.bereits_eingenommen,
    hinweise: hinweiseFuer(medikament, profil, fenster.hinweise ?? []),
    quellen,
  }
}
