# CI/CD Pipeline Specification

## Purpose

This specification defines the functional and operational requirements for the automated Continuous Integration (CI) Quality Gate pipeline and dependency vulnerability scanning in the Vault Hypercars platform. It establishes automated validation standards for every proposed code change before integration into the `main` branch.

## Requirements

### Requirement: Automated Quality Gate Pipeline on Code Changes

The CI system MUST automatically trigger on any Pull Request targeting the `main` branch and any direct `push` event to the `main` branch. The pipeline MUST sequentially or conditionally execute the following five quality gates:
1. Static lint analysis (`pnpm lint`)
2. TypeScript type checking (`npx tsc --noEmit`)
3. Vitest unit and component test execution (`pnpm test:unit`)
4. Dependency vulnerability security audit (`pnpm audit --audit-level=high`)
5. Production compilation and Prisma client generation (`pnpm build`)

#### Scenario: All quality gates pass successfully on Pull Request
- GIVEN a pull request targeting `main` with valid, formatted, typed, tested, and secure code
- WHEN GitHub Actions runs the CI workflow
- THEN the lint check MUST exit with code 0
- AND the TypeScript compiler check MUST exit with code 0
- AND all 20 Vitest unit/component tests MUST pass
- AND the security audit MUST find no high or critical vulnerabilities
- AND the Prisma generation and Next.js build MUST produce a valid production build artifact
- AND the overall workflow status MUST be set to Success

#### Scenario: Lint or Typecheck failure blocks merge
- GIVEN a pull request containing a syntax error, unused variable violating lint rules, or TypeScript type mismatch
- WHEN GitHub Actions runs the CI workflow
- THEN the failing gate (lint or type check) MUST terminate with a non-zero exit code
- AND the workflow run MUST immediately be marked as Failed
- AND the merge status check on the pull request MUST report a failure

#### Scenario: Unit or Component test regression blocks merge
- GIVEN a pull request introducing a regression that breaks an existing unit or component test
- WHEN GitHub Actions runs the `test:unit` gate
- THEN Vitest MUST report the failed test assertion
- AND the step MUST exit with code 1
- AND subsequent build steps MUST NOT proceed
- AND the pull request status MUST display a red failure check

---

### Requirement: Shift-Left Fast Failure Order

The pipeline MUST prioritize cheaper, faster static checks before executing heavier build and test processes.

#### Scenario: Early exit on static analysis failure
- GIVEN a commit with a TypeScript type error
- WHEN the CI workflow executes
- THEN the type check step MUST fail within 60 seconds
- AND heavy build and packaging jobs MUST NOT be dispatched, conserving runner minutes

---

### Requirement: Hermetic Build Environment & Secrets Isolation

The CI environment MUST execute Prisma client generation and Next.js production builds hermetically without requiring external database network connectivity or exposing production credentials.

The workflow step environment MUST provide isolated mock values for:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `ADMIN_ALLOWED_EMAIL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Production secrets or live API keys MUST NOT be required or embedded in CI job configuration.

#### Scenario: Production build executes with mock configuration
- GIVEN a CI runner in an isolated environment without connection to the production Supabase database
- WHEN `pnpm build` executes with mock environment variables
- THEN `prisma generate` MUST generate the Prisma client into `node_modules`
- AND `next build` MUST compile pages and route handlers successfully
- AND no runtime credentials MUST be leaked in GitHub Actions console logs

#### Scenario: Missing required environment variable halts build
- GIVEN a configuration where a required NextAuth or database connection string variable is completely omitted
- WHEN `next build` attempts compilation
- THEN the build step MUST fail with a clear diagnostic message explaining the missing build-time environment variable

---

### Requirement: Dependency Caching & Execution Performance

The CI system MUST utilize package manager caching for `pnpm` store and Node.js runtime to ensure high-performance pipeline execution.

The total workflow execution time on cached runs SHOULD complete in under 5 minutes.

#### Scenario: Cache hit on consecutive workflow run
- GIVEN a runner executing a PR where `pnpm-lock.yaml` has not changed from a recent run
- WHEN the workflow executes `actions/setup-node` and `pnpm/action-setup`
- THEN the pnpm store MUST be restored from the cache
- AND package installation via `pnpm install --frozen-lockfile` MUST complete in under 30 seconds

#### Scenario: Cache miss on dependency update
- GIVEN a PR that updates dependencies in `package.json` and `pnpm-lock.yaml`
- WHEN the workflow runs
- THEN pnpm MUST download the new packages and compile the new store
- AND the updated store cache MUST be saved for future workflow runs

---

### Requirement: Automated Dependency Vulnerability Monitoring

The repository MUST maintain a Dependabot configuration (`.github/dependabot.yml`) configured for `npm` ecosystem updates on a weekly schedule.

#### Scenario: Automated security advisory PR creation
- GIVEN a newly discovered high or critical vulnerability in a project dependency
- WHEN Dependabot evaluates the repository on its weekly schedule or upon security alert
- THEN Dependabot MUST automatically open a Pull Request updating the affected package to a patched version
- AND the CI Quality Gate workflow MUST automatically trigger and validate the Dependabot PR
