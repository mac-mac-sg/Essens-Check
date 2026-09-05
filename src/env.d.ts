/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEBURTSTERMIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
