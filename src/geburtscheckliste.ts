import eintraege from '@daten/geburtscheckliste.json'

export const CHECKLISTE = eintraege
export const CHECKLIST_KEY = 'essens-check:geburtscheckliste:v1'
export type CheckStatus = 'offen' | 'erledigt' | 'entfaellt'
export type CheckStand = Record<string, CheckStatus>
const ids = new Set(CHECKLISTE.map((e) => e.id))

export function parseCheckStand(raw: string | null): CheckStand {
  try {
    const data: unknown = JSON.parse(raw ?? '{}')
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
    return Object.fromEntries(Object.entries(data).filter(([id, status]) =>
      ids.has(id) && (status === 'erledigt' || status === 'entfaellt'),
    ))
  } catch { return {} }
}

export function readCheckStand(): CheckStand {
  try { return parseCheckStand(localStorage.getItem(CHECKLIST_KEY)) }
  catch { return {} }
}
