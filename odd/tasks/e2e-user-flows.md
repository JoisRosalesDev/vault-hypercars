# Feature: E2E User Flows Testing with Playwright

## Objective
Implement comprehensive End-to-End (E2E) testing for critical user flows in Vault Hypercars using Playwright, covering the entire shopping, checkout, and authentication lifecycles.

## Scope & Constraints
- Framework: Playwright (`@playwright/test`)
- Target: Chromium
- Scope:
  1. Cart management lifecycle (adding vehicles, currency switcher recalculation, removal, empty state).
  2. VIP Checkout flow (API interception, idempotency, loading state, success redirect, error handling).
  3. Authentication & RBAC security flow (unauthorized redirect, OAuth trigger, AccessDenied error banner).
- Mirror: Pending (Engram not configured in environment).

## Implementation Tasks

- [x] `TASK-1`: Cart Lifecycle Flow E2E Tests (`tests/e2e/cart-flow.spec.ts`)
  - Route: Delegated direct
  - Verify adding items, currency switching (USD -> EUR -> AED), removing items, and verifying empty state UI.
  - Evidence: `tests/e2e/cart-flow.spec.ts` passed (1 test, full lifecycle assertion).

- [x] `TASK-2`: Checkout & Payment Flow E2E Tests (`tests/e2e/checkout-flow.spec.ts`)
  - Route: Delegated direct
  - Intercept `/api/checkout` with mock responses (success URL, 500 error).
  - Evidence: `tests/e2e/checkout-flow.spec.ts` passed (2 tests: success redirect + error banner).

- [x] `TASK-3`: Auth & Access Control Flow E2E Tests (`tests/e2e/auth-flow.spec.ts`)
  - Route: Delegated direct
  - Verify protected route redirects to `/admin/login`, Google OAuth button presence, and `?error=AccessDenied` banner.
  - Evidence: `tests/e2e/auth-flow.spec.ts` passed (4 tests: unauthorized redirect, login elements, access denied banner, navigation back).

- [x] `TASK-4`: Full Suite Execution & Cleanup
  - Route: Direct inline
  - Run all Playwright tests across Chromium to ensure 0 flaky tests.
  - Evidence: `11 passed (15.3s)` in Chromium with 4 workers. Vitest verified (10 passed). Commit: `3ef3544` on `feature/e2e-user-flows`.
