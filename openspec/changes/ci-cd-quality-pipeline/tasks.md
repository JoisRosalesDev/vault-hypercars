# Tasks: CI/CD Quality Pipeline and Automation

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~95 lines |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Automated CI Quality Gates & Dependabot | PR 1 | `pnpm test:unit` | `npx tsc --noEmit && pnpm test:unit` | `.github/workflows/ci.yml`, `.github/dependabot.yml` |

---

## Phase 1: CI Workflow Setup (Infrastructure)

- [x] 1.1 Create `.github/workflows/ci.yml` with triggers on `pull_request` (branches: `[main]`) and `push` (branches: `[main]`), concurrency cancellation, and `ubuntu-latest` runner.
- [x] 1.2 Configure pnpm v9 and Node.js v22 runtime with `pnpm/action-setup@v4`, `actions/setup-node@v4` with `cache: 'pnpm'`, and `pnpm install --frozen-lockfile`.
- [x] 1.3 Add Shift-Left static checks and test steps to `.github/workflows/ci.yml`:
  - `1. Lint Check`: `pnpm run lint`
  - `2. Type Check`: `npx tsc --noEmit`
  - `3. Unit & Component Tests`: `pnpm run test:unit`
  - `4. Security Audit`: `pnpm audit --audit-level=high`
- [x] 1.4 Add hermetic production build step `5. Build Verification`: `pnpm run build` in `.github/workflows/ci.yml` configured with isolated dummy environment variables (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_ALLOWED_EMAIL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).

---

## Phase 2: Dependency Automation & Security

- [x] 2.1 Create `.github/dependabot.yml` configured for `npm` ecosystem on weekly schedule with labels `dependencies` and `security`.

---

## Phase 3: Verification & Harness Simulation

- [x] 3.1 Validate syntax and YAML structure of `.github/workflows/ci.yml` and `.github/dependabot.yml`.
- [x] 3.2 Execute local verification of the static quality gates (`pnpm run lint`, `npx tsc --noEmit`, `pnpm run test:unit`, `pnpm audit --audit-level=high`) to ensure 0 failures before pipeline deployment.

---

## Phase 4: Documentation

- [x] 4.1 Update `README.md` to add the GitHub Actions CI status badge and document the 5 Quality Gates and local reproduction commands.
