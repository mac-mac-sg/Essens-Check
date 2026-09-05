/**
 * Beschriftung und Farbe je Urteil. Formulierungen aus dem Prototyp.
 *
 * Jedes Urteil trägt immer auch das Wort, nie nur die Farbe — sonst wäre die
 * Auskunft bei Rot-Grün-Schwäche verloren.
 */
import type { Status } from './typen'

export interface Ampelstufe {
  /** Ausgeschrieben, für die Einzelaussage. */
  wort: string
  /** Kurzform für die Marke neben einer Variante. */
  kurz: string
  farbe: string
  flaeche: string
}

export const AMPEL: Record<Status, Ampelstufe> = {
  ok: { wort: 'Ja', kurz: 'Ja', farbe: '#14432F', flaeche: '#DBE7DE' },
  bedingt: { wort: 'Mit Bedingung', kurz: 'Bedingt', farbe: '#7A5311', flaeche: '#EFE6D5' },
  meiden: { wort: 'Besser nicht', kurz: 'Nein', farbe: '#7A1E28', flaeche: '#F0DCDE' },
  unklar: { wort: 'Nicht hinterlegt', kurz: 'Unklar', farbe: '#55605A', flaeche: '#E4E6E1' },
}

/** Häufige Begriffe als Einstieg. Alle im Katalog hinterlegt. */
export const BELIEBT = ['Camembert', 'Lachs', 'Kaffee', 'Salami', 'Tiramisu', 'Thunfisch']
