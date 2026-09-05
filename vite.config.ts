import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'node:url'

// Die Datenkataloge liegen bewusst ausserhalb von /src unter /daten:
// Datenpflege und Logik bleiben so getrennt (siehe CLAUDE.md).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Kataloge und Code liegen vollständig im Bundle. Der Service Worker
      // legt alles ab, damit die App im Untergeschoss ohne Netz läuft.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Darf ich das essen?',
        short_name: 'Darf ich?',
        description:
          'Nachschlagewerk für die Schwangerschaft: Lebensmittel eingeben, eindeutige Antwort bekommen.',
        lang: 'de-CH',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F4F5F2',
        theme_color: '#14432F',
        categories: ['health', 'food'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
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
