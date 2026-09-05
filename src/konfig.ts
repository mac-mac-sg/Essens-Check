/**
 * Errechneter Geburtstermin. Über die Umgebungsvariable VITE_GEBURTSTERMIN
 * konfigurierbar (ISO-Datum), damit er nicht im Code festgeschrieben ist.
 */
const STANDARD_GEBURTSTERMIN = '2030-01-01'

export const GEBURTSTERMIN: string =
  import.meta.env.VITE_GEBURTSTERMIN ?? STANDARD_GEBURTSTERMIN
