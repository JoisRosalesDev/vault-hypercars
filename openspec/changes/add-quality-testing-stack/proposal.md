# Proposal: Add Quality Testing Stack

## Intent

Establish a robust, automated quality testing architecture for `vault-hypercars` supporting TDD and RDD (Spec-Driven Development / OpenSpec). The codebase currently lacks automated test execution, making regressions difficult to prevent during feature expansion and refactoring.

## Scope

### In Scope
- Configure Vitest + React Testing Library for fast unit and component TDD.
- Configure Playwright for end-to-end (E2E) RDD testing covering key user journeys (catalog, checkout, auth, admin).
- Update `openspec/config.yaml` to enforce `strict_tdd: true` and specify active test runner scripts (`pnpm test:unit`, `pnpm test:e2e`).
- Establish standard directory layout under `tests/` (`tests/unit/`, `tests/e2e/`) with baseline tests verifying core application behaviors.

### Out of Scope
- Load/stress testing or CI/CD workflow pipeline automation (GitHub Actions setup).
- Visual regression testing or screenshot comparison suites.

## Capabilities

### New Capabilities
- `quality-testing-stack`: Comprehensive test suite architecture supporting Vitest unit/component testing and Playwright E2E testing for OpenSpec validation.

### Modified Capabilities
- None

## Approach

1. Install testing dependencies (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@playwright/test`, `jsdom`).
2. Add configuration files: `vitest.config.ts` (Jsdom, React support, path aliases) and `playwright.config.ts` (webServer auto-start, multi-browser settings).
3. Create test harness directory layout under `tests/unit/` and `tests/e2e/` with initial baseline tests for catalog filter, cart hook, and route navigation.
4. Update `package.json` scripts (`test`, `test:unit`, `test:e2e`) and update `openspec/config.yaml` to set `strict_tdd: true` and runner commands.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | Add testing dependencies and test runner scripts |
| `openspec/config.yaml` | Modified | Enable `strict_tdd: true` and set test runner configuration |
| `vitest.config.ts` | New | Configure Vitest environment and path aliases |
| `playwright.config.ts` | New | Configure Playwright E2E settings and dev server runner |
| `tests/` | New | Directory layout containing unit, component, and E2E baseline tests |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| E2E test flakiness due to dynamic server boot | Med | Use Playwright `webServer` auto-start with timeout and retry config |
| Next.js server component / context mock complexity | Med | Isolate component tests with React Testing Library context wrappers |

## Rollback Plan

Revert added `tests/`, `vitest.config.ts`, and `playwright.config.ts` files, and restore original `package.json` and `openspec/config.yaml` via git checkout.

## Dependencies

- Node.js environment with `pnpm` package manager installed.

## Success Criteria

- [ ] `pnpm test:unit` executes Vitest tests cleanly with 0 failures.
- [ ] `pnpm test:e2e` executes Playwright user journey tests successfully.
- [ ] `openspec/config.yaml` reflects `strict_tdd: true` with valid test runner commands.
- [ ] Baseline test suites exist in `tests/unit/` and `tests/e2e/`.
