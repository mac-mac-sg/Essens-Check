import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Die Datenkataloge liegen bewusst ausserhalb von /src unter /daten:
// Datenpflege und Logik bleiben so getrennt (siehe CLAUDE.md).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@daten': fileURLToPath(new URL('./daten', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
