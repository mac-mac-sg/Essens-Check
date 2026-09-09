import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function lese(pfad: string) {
  return readFileSync(resolve(process.cwd(), pfad), 'utf8')
}

describe('Browser-Härtung', () => {
  it('erzwingt eine CSP ohne Inline-JavaScript', () => {
    const html = lese('index.html')
    expect(html).toContain('http-equiv="Content-Security-Policy"')
    expect(html).toContain("script-src 'self'")
    expect(html).toContain("script-src-attr 'none'")
    expect(html).toContain('https://world.openfoodfacts.org')
    expect(html).toContain("object-src 'none'")

    const inlineScript = /<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/i
    expect(inlineScript.test(html)).toBe(false)
  })
})

describe('Supply-Chain-Härtung', () => {
  const workflows = [
    '.github/workflows/deploy.yml',
    '.github/workflows/swissmedic-medikamente.yml',
  ]

  it('pinnt jede externe GitHub Action auf einen vollständigen Commit-SHA', () => {
    for (const workflow of workflows) {
      const inhalt = lese(workflow)
      const refs = [...inhalt.matchAll(/uses:\s+[^\s@]+@([^\s#]+)/g)].map((treffer) => treffer[1])
      expect(refs.length).toBeGreaterThan(0)
      for (const ref of refs) expect(ref).toMatch(/^[0-9a-f]{40}$/)
    }
  })

  it('prüft bekannte High- und Critical-Abhängigkeitsschwachstellen in CI', () => {
    for (const workflow of workflows) {
      expect(lese(workflow)).toContain('npm audit --audit-level=high')
    }
  })

  it('lässt Dependabot npm und GitHub Actions regelmässig aktualisieren', () => {
    const dependabot = lese('.github/dependabot.yml')
    expect(dependabot).toContain('package-ecosystem: npm')
    expect(dependabot).toContain('package-ecosystem: github-actions')
    expect(dependabot.match(/interval: weekly/g)).toHaveLength(2)
  })
})
