/**
 * Helles oder dunkles Schema.
 *
 * Die App folgte bisher ausschliesslich der Systemeinstellung. Der Schalter
 * überschreibt sie — der Wunsch «system» bleibt aber erhalten, sonst gäbe es
 * keinen Weg zurück zur automatischen Umschaltung.
 *
 * Gesetzt wird ein Attribut am Wurzelelement; das Stylesheet entscheidet über
 * die Farben. So bleibt die Palette an einer Stelle.
 */
export type Schema = 'hell' | 'dunkel'
export type Wunsch = Schema | 'system'

export const SCHEMA_SCHLUESSEL = 'essens-check.farbschema'

/** Farbe der Gerätestatusleiste je Schema. Muss zur Kopfzeile passen. */
export const LEISTENFARBE: Record<Schema, string> = {
  hell: '#4E0F2F',
  dunkel: '#22061A',
}

export function istWunsch(wert: unknown): wert is Wunsch {
  return wert === 'hell' || wert === 'dunkel' || wert === 'system'
}

/** Was tatsächlich gilt: der Wunsch, und bei «system» die Geräteeinstellung. */
export function ermittleSchema(wunsch: Wunsch, systemIstDunkel: boolean): Schema {
  if (wunsch === 'system') return systemIstDunkel ? 'dunkel' : 'hell'
  return wunsch
}

/** Der Wunsch nach dem Umlegen des Schalters. */
export function umgelegt(schema: Schema): Wunsch {
  return schema === 'dunkel' ? 'hell' : 'dunkel'
}

/**
 * Ohne gespeicherte Wahl gilt Hell.
 *
 * Nicht die Systemvorgabe: viele Geräte stehen dauerhaft auf Dunkel, und die
 * App soll beim ersten Öffnen so aussehen, wie sie entworfen ist. Wer dem
 * Gerät folgen will, wählt das in der Fusszeile — die Wahl wird dann
 * ausdrücklich gespeichert, sonst käme beim nächsten Start wieder Hell.
 */
export const VOREINSTELLUNG: Wunsch = 'hell'

export function leseWunsch(): Wunsch {
  try {
    const gespeichert = localStorage.getItem(SCHEMA_SCHLUESSEL)
    if (istWunsch(gespeichert)) return gespeichert
  } catch {
    // Gesperrter Speicher — dann eben die Voreinstellung.
  }
  return VOREINSTELLUNG
}

export function speichereWunsch(wunsch: Wunsch): void {
  try {
    // Auch «system» wird geschrieben. Würde der Schlüssel dabei gelöscht,
    // läse der nächste Start die Voreinstellung und «Dem Gerät folgen» hielte
    // nur bis zum Schliessen der App.
    localStorage.setItem(SCHEMA_SCHLUESSEL, wunsch)
  } catch {
    // Nicht speicherbar: die Wahl gilt dann nur für diese Sitzung.
  }
}

export function wendeAn(schema: Schema): void {
  document.documentElement.dataset.schema = schema
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', LEISTENFARBE[schema])
}
