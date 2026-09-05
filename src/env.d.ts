/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEBURTSTERMIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * BarcodeDetector ist noch nicht in den Standard-Typen von TypeScript. Nur
 * das Nötigste deklariert; die Verfügbarkeit wird zur Laufzeit geprüft.
 */
interface ErkannterCode {
  rawValue: string
  format: string
}

declare class BarcodeDetector {
  constructor(optionen?: { formats?: string[] })
  detect(quelle: CanvasImageSource): Promise<ErkannterCode[]>
}
