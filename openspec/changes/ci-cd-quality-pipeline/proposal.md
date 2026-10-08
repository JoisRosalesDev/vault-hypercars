# Proposal: CI/CD Quality Pipeline and Automation

## Intent

Establish an automated Quality Gate CI pipeline via GitHub Actions to enforce Shift-Left verification on every Pull Request and merge to `main`. 

Currently, the Vault Hypercars platform relies on manual local verification for linting, TypeScript compilation, Prisma client generation, Vitest unit/component tests, and production build checks. Without an automated gate, regressions, broken imports, type inconsistencies, or security vulnerabilities can reach the codebase unnoticed. By implementing an automated CI pipeline with pnpm caching and vulnerability scanning, the project ensures every commit meets strict quality standards before review or merge.

## Scope

### In Scope
- GitHub Actions CI workflow (`.github/workflows/ci.yml`) triggering on `pull_request` and `push` to `main`.
- Five automated quality gates:
  1. **Lint Check**: `pnpm lint` (ESLint 9).
  2. **Type Check**: `npx tsc --noEmit` (TypeScript 5).
  3. **Unit & Component Tests**: `pnpm test:unit` (Vitest).
  4. **Security Audit**: `pnpm audit --audit-level=high`.
  5. **Production Build**: `pnpm build` (`prisma generate && next build`) with isolated dummy CI environment variables.
- Caching layer for `pnpm` store and Node.js dependencies using `pnpm/action-setup@v4` and `actions/setup-node@v4`.
- Automated dependency vulnerability checks via `.github/dependabot.yml`.
- Documentation in `README.md` covering CI pipeline gates and local reproduction commands.

### Out of Scope
- Automatic deployment to production hosting (e.g., Vercel, Supabase production DB) upon merge (deferred to a dedicated CD deployment pipeline).
- E2E Playwright tests execution on every PR commit (deferred to scheduled nightly runs or release tags to keep PR CI execution under 5 minutes).
- Live database migrations against remote staging or production databases during CI runs.

## Capabilities

### New Capabilities
- `ci-cd-pipeline`: Automated quality gate workflow enforcing linting, type safety, Vitest unit/component test execution, dependency security audits, and production Next.js compilation on GitHub Actions.

### Modified Capabilities
- None

## Approach

Following the Shift-Left philosophy from the `ci-cd-and-automation` skill:
1. **Order by cost**: Static analysis (Lint & Types) runs first to fail fast within seconds, followed by Vitest unit tests, dependency auditing, and finally the Next.js production build.
2. **Deterministic environment**: Standardize on `ubuntu-latest`, Node.js `22`, and pnpm `9.x`.
3. **Hermetic CI build configuration**: Provide non-sensitive mock environment variables (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`) in the CI step environment so Prisma schema validation and Next.js build succeed without requiring external network dependencies or live database credentials.
4. **Maintenance automation**: Add `.github/dependabot.yml` to track weekly npm package updates and security patches.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.github/workflows/ci.yml` | New | Main CI workflow defining quality gates, pnpm caching, and build validation. |
| `.github/dependabot.yml` | New | Dependabot configuration for automated dependency security updates. |
| `README.md` | Modified | Add CI workflow status badge and instructions for local CI verification. |
| `package.json` | Modified | Ensure helper scripts align cleanly with CI execution targets if necessary. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Google Fonts resolution failure during Next.js headless build | Medium | Configure Next.js build environment or font fallbacks so builds remain deterministic and do not stall on remote asset fetches. |
| Slow CI pipeline exceeding 5 minutes | Low | Leverage `actions/setup-node` with pnpm store caching; avoid running heavy browser E2E suites inside PR CI. |
| Leaking sensitive credentials in CI logs | Low | Never inject production secrets into CI checks; use dummy connection strings and tokens strictly scoped for build verification. |
| CI build failure due to missing Prisma Client | Low | Enforce `pnpm prisma generate` as part of the CI build sequence before `next build`. |

## Rollback Plan

Delete or disable the `.github/workflows/ci.yml` file. Because CI workflows run in GitHub's external runner infrastructure, rolling back changes to workflow files has zero impact on application runtime code or production database states.

## Dependencies

- GitHub Actions (`ubuntu-latest` runners).
- `actions/checkout@v4`, `actions/setup-node@v4`, and `pnpm/action-setup@v4`.
- Node.js LTS (v22) and `pnpm` (v9).

## Success Criteria

- [ ] `.github/workflows/ci.yml` is created and syntactically valid.
- [ ] Pipeline runs automatically on pull requests targeting `main` and direct pushes to `main`.
- [ ] All quality gates pass successfully:
  - Lint: 0 errors.
  - TypeScript: 0 errors (`tsc --noEmit`).
  - Unit/Component Tests: 20/20 Vitest tests pass.
  - Security: `pnpm audit` passes with no high/critical vulnerabilities.
  - Build: Next.js production build completes successfully.
- [ ] Pipeline execution completes in under 5 minutes.
- [ ] `.github/dependabot.yml` is created and configured for weekly npm updates.
