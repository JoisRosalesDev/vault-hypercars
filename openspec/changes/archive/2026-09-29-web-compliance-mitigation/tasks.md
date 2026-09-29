# Tasks: Web Compliance Mitigation (WCAG 2.2, GDPR & Privacy)

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~650 - 780 lines (additions + modifications) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Accessibility & Form Semantics) → PR 2 (Privacy, Cookies & Data Rights) |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Accessibility, semantic landmarks, form label bindings, dialog focus trap & WCAG 2.2 AA contrast tokens | PR 1 | `pnpm test tests/components/Accessibility.test.tsx` | Run dev server and navigate using keyboard `Tab` & `Escape` | Revert frontend accessibility component changes |
| 2 | GDPR cookie consent banner, ARCO user data export/erasure endpoints, rate limiting & privacy audit logs | PR 2 | `pnpm test tests/unit/privacy.test.ts` | Test `/api/privacy/request` with curl/Postman & toggle cookie preferences | Remove privacy UI & API route without affecting core checkout |

---

## Phase 1: Accessibility Foundation & Color Contrast

- [x] 1.1 Update color contrast tokens in `app/globals.css` ensuring contrast ratio >= 4.5:1 in `corsa` theme and elevating `text-zinc-600`/`text-zinc-500` micro-labels.
- [x] 1.2 Implement reusable focus-trapping and keyboard management hook `app/hooks/useAccessibleDialog.ts` supporting `Escape` key close and focus restoration.
- [x] 1.3 Create RED unit test in `tests/components/Accessibility.test.tsx` asserting focus trap cycling and `Escape` dismissal for interactive overlays.
- [x] 1.4 Make `tests/components/Accessibility.test.tsx` GREEN by integrating `useAccessibleDialog` into test environment.

---

## Phase 2: Semantic HTML & Form Label Programmatic Association

- [x] 2.1 Refactor `app/page.tsx` to wrap page content inside a single, top-level `<main id="main-content">` landmark.
- [x] 2.2 Refactor `app/components/layout/Hero.tsx` to convert its inner container from `<main>` to a semantic `<section aria-label="Introducción">`.
- [x] 2.3 Refactor `app/components/layout/Navbar.tsx` to wrap the mobile drawer menu inside a semantic `<nav aria-label="Navegación móvil">` and add accessible labels on currency/theme buttons.
- [x] 2.4 Refactor `app/components/catalog/ProductCard.tsx` to use semantic `<article>` tags, descriptive image `alt` texts, and contextual `aria-label` on inspect buttons (`aria-label="Ver detalles de [Nombre]"`).
- [x] 2.5 Refactor `app/components/catalog/CatalogModal.tsx` to integrate `useAccessibleDialog`, `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
- [x] 2.6 Refactor `app/components/cart/CartDrawer.tsx` and `app/components/cart/CartItemRow.tsx` to integrate `useAccessibleDialog`, replace non-interactive backdrop, add live region `aria-live="polite"`, and add explicit `aria-label`s on row quantity buttons.
- [x] 2.7 Explicitly associate all `<label htmlFor={id}>` tags with corresponding `<input id={id}>`, `<select id={id}>`, and `<textarea id={id}>` elements in `app/components/admin/AdminModals.tsx`.
- [x] 2.8 Add automated component accessibility assertions to `tests/components/Accessibility.test.tsx` verifying all form fields in `AdminModals` possess accessible names.

---

## Phase 3: Privacy & Data Rights Foundation (GDPR & Ley 21.719)

- [x] 3.1 Define privacy and consent domain contracts and payload types in `app/types/privacy.ts`.
- [x] 3.2 Create RED test in `tests/unit/privacy.test.ts` for Threat Matrix case 1: Assert `POST /api/privacy/request` returns identical 200 structure for existing vs non-existing emails to prevent enumeration.
- [x] 3.3 Create RED test in `tests/unit/privacy.test.ts` for Threat Matrix case 2: Assert `POST /api/privacy/request` enforces sliding-window rate limiting (HTTP 429 when threshold exceeded).
- [x] 3.4 Create RED test in `tests/unit/privacy.test.ts` for Threat Matrix case 3: Assert `action: "delete"` anonymizes `customerEmail` without deleting fiscal `Order` records.
- [x] 3.5 Implement `app/api/privacy/request/route.ts` with rate limiting, email validation, data export handler, and atomic email anonymization handler to make tests GREEN.

---

## Phase 4: Privacy UI & Cookie Consent Management

- [x] 4.1 Create accessible `<CookieBanner />` component in `app/components/ui/CookieBanner.tsx` offering equal-prominence "Aceptar Todo" and "Rechazar No Esenciales" buttons without pre-checked options.
- [x] 4.2 Create self-service `<PrivacyModal />` component in `app/components/ui/PrivacyModal.tsx` for submitting data export and erasure requests.
- [x] 4.3 Update `app/components/layout/SiteFooter.tsx` with links to trigger cookie preferences and open the privacy rights modal.
- [x] 4.4 Mount `<CookieBanner />` and `<PrivacyModal />` inside `app/layout.tsx` ensuring zero SSR hydration mismatch.
- [x] 4.5 Add unit tests in `tests/unit/privacy.test.ts` verifying cookie banner preference persistence in `localStorage`.

---

## Phase 5: Verification & Quality Gate

- [x] 5.1 Execute unit and component test suites with `pnpm test` and assert all existing and new tests pass.
- [x] 5.2 Execute typecheck with `npx tsc --noEmit` and assert 0 errors.
- [x] 5.3 Execute linter with `pnpm lint` and assert 0 warnings or errors.
- [x] 5.4 Verify against `guia_de_normativas_web.md` (read-only) ensuring all 4 regulatory areas are satisfied.
