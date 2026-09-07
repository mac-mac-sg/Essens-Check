/**
 * Beschriftung je Urteil. Die Farben stehen bewusst nicht hier, sondern in
 * styles.css: sie hängen vom Farbschema ab, und ein Inline-Style kennt
 * `prefers-color-scheme` nicht. Die Komponenten setzen `data-status`, das
 * Stylesheet entscheidet über die Farbe.
 *
 * Jedes Urteil trägt immer auch das Wort, nie nur die Farbe — sonst wäre die
 * Auskunft bei Rot-Grün-Schwäche verloren.
 */
export interface Ampelstufe {
  /** Ausgeschrieben, für die Einzelaussage. */
  wort: string
  /** Kurzform für die Marke neben einer Variante. */
  kurz: string
}

export const AMPEL: Record<import('./typen').Status, Ampelstufe> = {
  ok: { wort: 'Ja', kurz: 'Ja' },
  bedingt: { wort: 'Mit Bedingung', kurz: 'Bedingt' },
  meiden: { wort: 'Besser nicht', kurz: 'Nein' },
  unklar: { wort: 'Nicht bewertet', kurz: 'Unklar' },
}

/**
 * Wort für eine Listenzeile, deren Varianten verschieden urteilen.
 *
 * Bewusst keine der vier Stufen: «Bedingt» wäre eine Aussage der Regelmaschine
 * über das Lebensmittel, das hier ist eine Aussage über die Liste — sie kann
 * dieses Urteil nicht in einer Farbe zeigen, ohne zu lügen.
 */
export const GEMISCHT_WORT = 'Kommt drauf an'

/**
 * Wortlaut für die Suche ohne Treffer.
 *
 * Bewusst nicht `AMPEL.unklar.wort`: die beiden Fälle sehen gleich aus, meinen
 * aber Verschiedenes. «Nicht bewertet» heisst, der Eintrag steht im Katalog und
 * die App sagt bewusst nichts dazu. Hier steht er gar nicht drin. Wer beides
 * gleich beschriftet, nimmt der erklärten Lücke ihre Aussage.
 */
export const NICHTS_GEFUNDEN = 'Nichts gefunden'

/** Häufige Begriffe als Einstieg. Alle im Katalog hinterlegt. */
export const BELIEBT = ['Camembert', 'Lachs', 'Kaffee', 'Salami', 'Tiramisu', 'Thunfisch']
