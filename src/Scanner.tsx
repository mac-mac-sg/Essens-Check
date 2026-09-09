import { useEffect, useRef, useState } from 'react'
import { istGueltigeEan } from './engine/barcodes'
import type { ScanEintrag } from './meineChecks'

type Zustand = 'startet' | 'laeuft' | 'nicht-unterstuetzt' | 'kein-zugriff'

/**
 * Liest EAN-8 und EAN-13 über die Kamera.
 *
 * Derselbe Scanner wird für Lebensmittel und Medikamente verwendet. Nach dem
 * Scan entscheidet erst die lokale Zuordnung, ob der Code eindeutig zu einer
 * kuratierten Swissmedic-Packung gehört; sonst läuft der bestehende
 * Lebensmittelweg über Open Food Facts.
 */
export function Scanner({
  onErkannt,
  onAbbruch,
  scans,
  onScanWaehlen,
  onScansLeeren,
}: {
  onErkannt: (ean: string) => void
  onAbbruch: () => void
  scans: readonly ScanEintrag[]
  onScanWaehlen: (ean: string) => void
  onScansLeeren: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [zustand, setZustand] = useState<Zustand>('startet')

  // Über eine Referenz, damit ein neuer Rückruf nicht die Kamera neu startet.
  const melden = useRef(onErkannt)
  melden.current = onErkannt

  useEffect(() => {
    let beendet = false
    let strom: MediaStream | null = null
    let zeitgeber: number | undefined

    const aufraeumen = () => {
      beendet = true
      if (zeitgeber !== undefined) window.clearTimeout(zeitgeber)
      strom?.getTracks().forEach((spur) => spur.stop())
    }

    const starten = async () => {
      if (!('BarcodeDetector' in window)) {
        setZustand('nicht-unterstuetzt')
        return
      }
      try {
        strom = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
      } catch {
        if (!beendet) setZustand('kein-zugriff')
        return
      }
      if (beendet || !videoRef.current) {
        strom.getTracks().forEach((spur) => spur.stop())
        return
      }

      videoRef.current.srcObject = strom
      await videoRef.current.play().catch(() => undefined)
      setZustand('laeuft')

      const leser = new BarcodeDetector({ formats: ['ean_13', 'ean_8'] })
      const suchen = async () => {
        if (beendet || !videoRef.current) return
        try {
          const treffer = await leser.detect(videoRef.current)
          const code = treffer.find((t) => istGueltigeEan(t.rawValue))?.rawValue
          if (code) {
            aufraeumen()
            melden.current(code)
            return
          }
        } catch {
          // Ein einzelner Fehlversuch ist normal — weitersuchen.
        }
        zeitgeber = window.setTimeout(suchen, 200)
      }
      void suchen()
    }

    void starten()
    return aufraeumen
  }, [])

  return (
    <section className="scanner" aria-labelledby="scanner-titel">
      <h2 className="abschnitt__titel" id="scanner-titel">
        Produkt scannen
      </h2>
      <p className="scanner__meldung">
        Strichcode von Lebensmittel oder Medikament in den Rahmen halten.
      </p>

      {zustand === 'nicht-unterstuetzt' ? (
        <p className="scanner__meldung">
          Dieser Browser kann keine Strichcodes lesen. Auf dem iPhone funktioniert es
          derzeit nicht — dort weiterhin über die Suche.
        </p>
      ) : zustand === 'kein-zugriff' ? (
        <p className="scanner__meldung">
          Ohne Kamerazugriff geht es nicht. In den Browsereinstellungen freigeben und
          erneut versuchen.
        </p>
      ) : (
        <div className="scanner__bild">
          <video ref={videoRef} playsInline muted aria-label="Kamerabild" />
          <div className="scanner__rahmen" aria-hidden="true" />
        </div>
      )}

      {scans.length > 0 && (
        <section className="scan-verlauf" aria-labelledby="scan-verlauf-titel">
          <div className="scan-verlauf__kopf">
            <h3 id="scan-verlauf-titel">Letzte Scans</h3>
            <button type="button" onClick={onScansLeeren}>Leeren</button>
          </div>
          <div className="scan-verlauf__liste">
            {scans.map((scan) => (
              <button type="button" key={scan.ean} onClick={() => onScanWaehlen(scan.ean)}>
                <span>
                  <strong>{scan.label}</strong>
                  <small>{scan.ean}</small>
                </span>
                <span aria-hidden="true">›</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <button className="zurueck zurueck--flaeche" type="button" onClick={onAbbruch}>
        Abbrechen
      </button>
    </section>
  )
}
