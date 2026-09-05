/**
 * Typisierter Zugang zu den Katalogen. Die JSON-Dateien liegen unter /daten,
 * damit Datenpflege ohne Codeänderung möglich bleibt.
 */
import regelnJson from '@daten/regeln.json'
import lebensmittelJson from '@daten/lebensmittel.json'
import type { LebensmittelKatalog, RegelKatalog } from './typen'

export const regelKatalog = regelnJson as RegelKatalog
export const lebensmittelKatalog = lebensmittelJson as LebensmittelKatalog
