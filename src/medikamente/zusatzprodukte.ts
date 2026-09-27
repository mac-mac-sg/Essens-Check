import type { SwissmedicProdukt } from './swissmedic'

/**
 * Gezielte Produktidentifikation anhand der aktuellen Herstellerseiten.
 * Diese Einträge gehören nicht zum datierten Swissmedic-OGD-Pilotsnapshot.
 * Ohne kuratiertes Schwangerschaftsprofil bleiben sie immer gesperrt.
 * Stand der Herstellerseiten-Prüfung: 27.09.2026.
 */
const basis = 'https://www.mebucaine.ch/produkte/'

function mebucaine(
  id: string,
  name: string,
  arzneiform: string,
  stoffe: string[],
  quellpfad: string,
): SwissmedicProdukt {
  return {
    id: `hersteller:${id}`,
    produktquelle: `${basis}${quellpfad}`,
    zulassungsnummer: '',
    sequenznummer: '',
    name,
    arzneiform,
    zulassungsstatus: 'Herstellerangabe',
    wirkstoffe: stoffe.map((stoff, index) => ({ stoff_id: `${id}:${index}`, name: stoff })),
    medikament_ids: [],
    kombinationspraeparat: stoffe.length > 1,
    vollstaendig_gemappt: false,
    packungen: [],
  }
}

export const zusatzprodukte: SwissmedicProdukt[] = [
  mebucaine('mebucaine-n', 'Mebucaïne N', 'Lutschtabletten', ['Lidocain', 'Cetylpyridin'], 'mebucaine-n'),
  mebucaine('mebucaine-dolo-orange', 'Mebucaïne Dolo Orange', 'Lutschtabletten', ['Flurbiprofen'], 'mebucaine-dolo'),
  mebucaine('mebucaine-dolo-honig-zitrone', 'Mebucaïne Dolo Honig-Zitrone', 'Lutschtabletten', ['Flurbiprofen'], 'mebucaine-dolo'),
  mebucaine('mebucaine-dolo-spray', 'Mebucaïne Dolo Spray', 'Spray zur Anwendung im Rachen', ['Flurbiprofen'], 'mebucaine-dolo-spray'),
  mebucaine('mebucaine-plus-lemon', 'Mebucaïne Plus Lemon', 'Lutschtabletten', ['Tyrothricin', 'Cetrimoniumbromid', 'Lidocain'], 'mebucaine-plus-lemon-und-mebucaine-plus-cherry'),
  mebucaine('mebucaine-plus-cherry', 'Mebucaïne Plus Cherry', 'Lutschtabletten', ['Tyrothricin', 'Cetrimoniumbromid', 'Lidocain'], 'mebucaine-plus-lemon-und-mebucaine-plus-cherry'),
  mebucaine('mebucaine-extra', 'Mebucaïne Extra', 'Lutschtabletten', ['Benzoxoniumchlorid', 'Lidocain'], 'mebucaine-extra'),
  mebucaine('mebucaine-extra-spray', 'Mebucaïne Extra Spray', 'Spray zur Anwendung im Rachen', ['Benzoxoniumchlorid', 'Lidocain'], 'mebucaine-extra-spray'),
]
