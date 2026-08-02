# Tasks: Add Quality Testing Stack

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~180-250 lines |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Quality testing stack installation & verification | PR 1 | `pnpm test:unit && pnpm test:e2e` | `pnpm dev` for Playwright webServer | Revert `tests/`, configs, and `package.json` |

## Phase 1: Dependencies & Configuration

- [x] 1.1 Install dev dependencies (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@playwright/test`, `jsdom`, `@vitejs/plugin-react`, `vite-tsconfig-paths`) in `package.json`.
- [x] 1.2 Add `test`, `test:unit`, and `test:e2e` execution scripts to `package.json`.
- [x] 1.3 Create `vitest.config.ts` with `jsdom` environment, React plugin, `vite-tsconfig-paths`, and `tests/setup.ts` setup file reference.
- [x] 1.4 Create `playwright.config.ts` with `tests/e2e` directory, Chromium/Firefox browser projects, and `pnpm dev` `webServer` auto-start on `:3000`.
- [x] 1.5 Create `tests/setup.ts` importing `@testing-library/jest-dom` matchers.
- [x] 1.6 Update `openspec/config.yaml` to set `strict_tdd: true`, runner `vitest + playwright`, and script mappings for `unit` and `e2e`.

## Phase 2: Unit & Component Test Suites

- [x] 2.1 Write RED unit test in `tests/unit/currency.test.ts` asserting `currency.ts` converts prices to EUR and AED correctly.
- [x] 2.2 Verify GREEN execution of `tests/unit/currency.test.ts` with Vitest (<500ms).
- [x] 2.3 Write RED component tests in `tests/components/ProductCard.test.tsx` checking in-stock render/CTA state and out-of-stock disabled CTA indicator.
- [x] 2.4 Verify GREEN execution of `tests/components/ProductCard.test.tsx` using Vitest + React Testing Library.

## Phase 3: E2E Test Suite

- [x] 3.1 Write RED Playwright E2E spec in `tests/e2e/catalog.spec.ts` for catalog filter ("Bugatti"), vehicle modal opening, and cart drawer interaction.
- [x] 3.2 Add E2E scenario in `tests/e2e/catalog.spec.ts` for cart drawer checkout button triggering Stripe Checkout API redirection.
- [x] 3.3 Add E2E scenario in `tests/e2e/catalog.spec.ts` asserting unauthorized `/admin/dashboard` access redirects to login.
- [x] 3.4 Verify GREEN execution of all `tests/e2e/catalog.spec.ts` scenarios against Next.js dev server.

## Phase 4: OpenSpec Enforcement & Verification

- [x] 4.1 Execute `pnpm test:unit` and verify all unit and component tests pass with 0 errors.
- [x] 4.2 Execute `pnpm test:e2e` and verify all Playwright browser tests pass headlessly.
- [x] 4.3 Validate `openspec/config.yaml` strict TDD quality gate compliance and runner configuration integrity.
