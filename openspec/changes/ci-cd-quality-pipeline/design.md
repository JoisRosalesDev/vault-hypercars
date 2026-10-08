# Design: CI/CD Quality Pipeline and Automation

## Technical Approach

The Continuous Integration architecture implements an automated Quality Gate pipeline deployed as a GitHub Actions workflow (`.github/workflows/ci.yml`), complemented by automated dependency patch monitoring (`.github/dependabot.yml`).

The technical strategy adheres to the **Shift-Left** principle outlined in `ci-cd-and-automation`:
1. Execute the cheapest and fastest checks first (Linting and Type Checking in < 30 seconds).
2. Execute automated unit and component testing (Vitest).
3. Execute security vulnerability auditing (`pnpm audit`).
4. Execute hermetic production compilation (`prisma generate && next build`) using isolated, mock environment variables that require no live external database connection or secrets.

## Architecture Decisions

### Decision: Single Consolidated CI Job vs Multi-Job Parallelism

**Choice**: Single consolidated `quality` job running sequential fail-fast steps.  
**Alternatives considered**: Multiple parallel jobs (separate jobs for `lint`, `typecheck`, `test`, `audit`, and `build`).  
**Rationale**: In small to mid-sized repositories with fast unit test suites (~20 tests, execution < 25s), spinning up 5 separate GitHub Actions virtual machines incurs ~2–3 minutes of repeated VM provisioning and dependency installation overhead. A single job with shared `node_modules` runs from start to finish in under 90 seconds, failing instantly at the first broken step.

### Decision: Package Manager & Caching Strategy

**Choice**: `pnpm/action-setup@v4` with `actions/setup-node@v4` configured with `cache: 'pnpm'` and `pnpm install --frozen-lockfile`.  
**Alternatives considered**: Standard `npm ci` or generic caching using `actions/cache`.  
**Rationale**: The repository uses `pnpm` (evidenced by `pnpm-lock.yaml` and `pnpm-workspace.yaml`). Utilizing native pnpm caching in `actions/setup-node` guarantees reproducible dependency resolution, prevents lockfile drift with `--frozen-lockfile`, and restores packages from cache within seconds.

### Decision: Hermetic Build Isolation via Mock Environment Variables

**Choice**: Supply explicit, safe mock values for build-time environment variables directly within the CI step `env` block.  
**Alternatives considered**: Requiring GitHub repository secrets for Pull Requests, or connecting to a staging Supabase instance during build.  
**Rationale**: Next.js App Router and Prisma require environment variables during client generation and production page compilation (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.). Forked PRs do not have access to repository secrets by default in GitHub Actions. Using deterministic mock strings (`postgresql://mock:mock@localhost:5432/mock`) allows hermetic compilation without external network calls or risk of secret leakage.

### Decision: Dependabot Automation for Dependency Vulnerabilities

**Choice**: Add `.github/dependabot.yml` configured for weekly npm updates and security alerts.  
**Alternatives considered**: Manual periodic `pnpm audit` checks or third-party paid security SaaS.  
**Rationale**: Native Dependabot integrates seamlessly with GitHub, auto-generates pull requests for critical security advisories, and triggers our CI quality gates on those PRs to verify that updates do not break existing code.

## Data Flow

```
   Pull Request Opened / Push to main
                 │
                 ▼
     GitHub Actions Runner (ubuntu-latest)
                 │
  ┌──────────────┴────────────────────────────────────────┐
  │  Step 1: actions/checkout@v4                          │
  │  Step 2: pnpm/action-setup@v4 (pnpm 9)                │
  │  Step 3: actions/setup-node@v4 (Node 22, pnpm cache)  │
  │  Step 4: pnpm install --frozen-lockfile               │
  │                                                       │
  │  [Quality Gate 1] pnpm lint                           │
  │       │ (pass)                                        │
  │  [Quality Gate 2] npx tsc --noEmit                    │
  │       │ (pass)                                        │
  │  [Quality Gate 3] pnpm test:unit                      │
  │       │ (pass)                                        │
  │  [Quality Gate 4] pnpm audit --audit-level=high       │
  │       │ (pass)                                        │
  │  [Quality Gate 5] pnpm build                          │
  │       ├── prisma generate (isolated)                  │
  │       └── next build (mock env)                       │
  └──────────────┬────────────────────────────────────────┘
                 │
                 ▼
   GitHub PR Status Check: Pass (Green) / Fail (Red)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.github/workflows/ci.yml` | Create | GitHub Actions workflow configuration defining quality gates, triggers, and mock environment variables. |
| `.github/dependabot.yml` | Create | Dependabot configuration for npm package security updates. |
| `README.md` | Modify | Add GitHub Actions CI status badge and reproduction guide for running quality gates locally. |

## Interfaces / Contracts

### CI Workflow Configuration (`.github/workflows/ci.yml`)

```yaml
name: CI Quality Gate

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Quality Gates
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js (v22)
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: 1. Lint Check
        run: pnpm run lint

      - name: 2. Type Check
        run: npx tsc --noEmit

      - name: 3. Unit & Component Tests
        run: pnpm run test:unit

      - name: 4. Security Audit
        run: pnpm audit --audit-level=high

      - name: 5. Build Verification
        run: pnpm run build
        env:
          DATABASE_URL: "postgresql://ci_dummy:dummy_pass@localhost:5432/vault_test?pgbouncer=true"
          DIRECT_URL: "postgresql://ci_dummy:dummy_pass@localhost:5432/vault_test"
          NEXTAUTH_SECRET: "ci-dummy-nextauth-secret-key-32-chars-minimum"
          NEXTAUTH_URL: "http://localhost:3000"
          ADMIN_ALLOWED_EMAIL: "ci-admin@vault-hypercars.test"
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_ci_mock_stripe_publishable_key"
          STRIPE_SECRET_KEY: "sk_test_ci_mock_stripe_secret_key"
          STRIPE_WEBHOOK_SECRET: "whsec_ci_mock_stripe_webhook_secret"
```

### Dependabot Configuration (`.github/dependabot.yml`)

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
    labels:
      - dependencies
      - security
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Workflow Validation | YAML syntax and GitHub Actions schema correctness | Validate YAML structure, required action versions, and syntax against GitHub schema. |
| Static Checks | Local execution of Lint and Typecheck | Run `pnpm lint` and `npx tsc --noEmit` locally before committing workflow. |
| Test Runner | Vitest test execution in CI environment | Ensure `pnpm test:unit` executes headlessly with 0 interactive prompts. |
| Build Isolation | Hermetic build step execution with mock environment | Verify `prisma generate` and Next.js build succeed when isolated with mock environment variables. |

## Threat Matrix

| Boundary | Minimum adversarial cases | Applicability | Design response | Planned RED tests |
|---|---|---|---|---|
| Documentation-like paths | Executable markdown, shell scripts in docs | N/A | Only vetted package scripts (`pnpm ...`) defined in `package.json` are executed by the workflow runner. | N/A |
| Git repository selection | `git -C`, unexpected worktree roots | N/A | `actions/checkout@v4` roots execution strictly to the repository root directory. | N/A |
| Commit state | Empty index, staged changes | N/A | Workflow operates on immutable git commits delivered by GitHub webhook payload. | N/A |
| Push state | Tracking branch, first push | N/A | Workflow triggers on standard branch events (`[main]`). | N/A |
| PR commands & secrets | Untrusted PR script execution, credential exposure in logs | Applicable | Use pinned action versions (`@v4`), `pnpm install --frozen-lockfile`, and dummy non-sensitive build variables. | Test that CI configuration contains zero production secrets or unpinned external scripts. |

## Migration / Rollout

No database or application runtime migration required.  
Rollout plan:
1. Commit `.github/workflows/ci.yml` and `.github/dependabot.yml`.
2. Push branch to remote.
3. Observe GitHub Actions workflow execution in GitHub UI.
4. Verify all 5 quality gates complete with green checkmarks.

## Open Questions

None. All technical choices and environment boundaries are resolved.
