# Technical Design: Add Quality Testing Stack

## Technical Approach

Establish a dual-tier testing architecture combining Vitest for fast, isolated unit/component testing and Playwright for browser-level end-to-end (E2E) user journey validation. The stack integrates directly with Next.js 16 (App Router) and React 19, binding into OpenSpec (`openspec/config.yaml`) to enforce strict TDD quality gates.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| **Vitest vs Jest** | Jest requires complex Babel/SWC transforms for ESM & Next.js path aliases. Vitest offers instant native ESM execution, lower latency, and zero-config TypeScript mapping via `vite-tsconfig-paths`. | **Vitest**: Chosen for sub-second execution speed, modern ESM support, and seamless React Testing Library integration. |
| **Playwright vs Cypress** | Cypress runs inside the browser with single-domain limits and heavier overhead. Playwright provides native multi-browser support (Chromium, Firefox), multi-context isolation, and automatic Next.js `webServer` process lifecycle control. | **Playwright**: Chosen for speed, multi-browser validation, and built-in web server auto-start capabilities. |

## Data Flow

```
[ Developer / OpenSpec Runner ]
       │
       ├──► pnpm test:unit ──► Vitest (jsdom) ──► tests/unit & tests/components
       │                                               │
       │                                               └──► imports `@/*` via vite-tsconfig-paths
       │
       └──► pnpm test:e2e  ──► Playwright ──► webServer (Next.js dev server @ :3000)
                                                    │
                                                    └──► Chromium / Firefox ──► tests/e2e
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `vitest.config.ts` | Create | Vitest configuration (`jsdom`, `vite-tsconfig-paths`, setup file link) |
| `playwright.config.ts` | Create | Playwright config (`webServer` auto-start on `:3000`, Chromium & Firefox projects) |
| `tests/setup.ts` | Create | Test environment setup importing `@testing-library/jest-dom` |
| `tests/unit/currency.test.ts` | Create | Unit test baseline for currency formatting helper |
| `tests/components/ProductCard.test.tsx` | Create | Component test baseline for React 19 `ProductCard` render & states |
| `tests/e2e/catalog.spec.ts` | Create | Playwright E2E baseline covering catalog filter, cart, and route guards |
| `package.json` | Modify | Add testing dependencies and scripts (`test`, `test:unit`, `test:e2e`) |
| `openspec/config.yaml` | Modify | Update testing block (`strict_tdd: true`, `runner: vitest + playwright`, scripts) |

## Interfaces / Contracts

### `vitest.config.ts` Pattern
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
});
```

### `playwright.config.ts` Pattern
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### `openspec/config.yaml` Schema Update
```yaml
testing:
  strict_tdd: true
  runner: vitest + playwright
  layers:
    - unit
    - components
    - e2e
  scripts:
    unit: pnpm test:unit
    e2e: pnpm test:e2e
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| **Unit** (`tests/unit/`) | Utility functions (`currency.ts`), data helpers | Vitest fast assertion without DOM overhead |
| **Component** (`tests/components/`) | React 19 Client Components (`ProductCard`, drawers) | Vitest + `jsdom` + `@testing-library/react` |
| **E2E** (`tests/e2e/`) | User journeys (catalog filter, cart, checkout redirect, admin guard) | Playwright multi-browser automation against Next.js dev server |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No data migration required. Progressive adoption strategy:
1. Install testing packages (`vitest`, `@playwright/test`, `@testing-library/*`, `jsdom`, `vite-tsconfig-paths`).
2. Add configurations and baseline tests.
3. Enable `strict_tdd: true` in `openspec/config.yaml`.

## Open Questions

None.
