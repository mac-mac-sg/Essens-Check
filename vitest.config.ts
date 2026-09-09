import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Der Vollständigkeitstest läuft über sämtliche Lebensmittel-Synonyme und
    // liegt auf GitHub Actions inzwischen knapp über dem Vitest-Standard von 5 s.
    // 10 s verhindert einen rein laufzeitbedingten Fehlalarm, ohne Hänger lange
    // zu verdecken.
    testTimeout: 10_000,
  },
})
