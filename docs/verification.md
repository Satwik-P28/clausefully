# Verification record

Verified on 2026-09-04 with Node.js 22+ and npm 11.19.0.

## Automated checks

```text
npm run check                 PASS
  TypeScript                  PASS
  oxlint                      PASS
  oxfmt --check               PASS
  Vitest                      16/16 tests passed
  production build            PASS
npm audit --audit-level=low   PASS — 0 vulnerabilities
clean-copy npm ci             PASS
clean-copy npm run check      PASS
credential-pattern scan      PASS — no matches
public Sites deployment      PASS
```

The clean-copy check copied the repository without caches or dependencies, ran
`npm ci --ignore-scripts`, and repeated the complete check suite. The ignored
install scripts are optional for the checks; the repository explicitly allows
the pinned `esbuild`, `sharp`, and `workerd` scripts for normal installs.

## Browser checks

- Desktop viewport: page loaded, no horizontal overflow, and all visible icon
  actions exposed accessible names.
- Mobile viewport (390 × 844): no horizontal overflow; the editor, lock fields,
  review area, and footer stayed usable in one column.
- Primary journey: requested a deterministic review, received the exact
  before/after edit, accepted it, and confirmed the draft changed only after the
  explicit action.
- Provider journey: opened settings and confirmed the Demo connection check
  returned ready without a key or external request.
- Automated accessibility scan: no serious or critical Axe violations (color
  contrast excluded in jsdom and inspected in the rendered browser).

Screenshots: [desktop](assets/gentleedit-desktop.png) and
[mobile](assets/gentleedit-mobile.png).

## Packaging limitation

The Dockerfile was reviewed, but its image could not be built in this
environment because the Docker CLI was present while the Docker daemon was not
running. Local and clean-copy production builds both passed. This limitation
does not affect the Sites deployment artifact.

## Provider limitation

OpenAI and Anthropic adapters are covered with mocked integration tests. Live
provider calls were intentionally not made because no maintainer credential is
stored or funded; users supply their own keys.
