/* Früh vor React ausführen, damit das gespeicherte Farbschema ohne sichtbaren Wechsel gilt. */
(function () {
  var wunsch = null
  try {
    wunsch = localStorage.getItem('essens-check.farbschema')
  } catch (_fehler) {
    /* gesperrter Speicher */
  }

  var dunkel =
    wunsch === 'dunkel' ||
    (wunsch === 'system' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  document.documentElement.dataset.schema = dunkel ? 'dunkel' : 'hell'
  var leiste = document.querySelector('meta[name="theme-color"]')
  if (leiste) leiste.setAttribute('content', dunkel ? '#032F3B' : '#075F74')
})()
