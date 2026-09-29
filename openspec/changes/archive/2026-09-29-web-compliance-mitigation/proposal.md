# Proposal: Web Compliance Mitigation (WCAG 2.2, GDPR & Privacy)

## Intent

The current state of Vault Hypercars fails multiple mandatory requirements defined in `guia_de_normativas_web.md` across web accessibility (WCAG 2.1/2.2 AA, European Accessibility Act, Chilean Law 20.422) and user data privacy (GDPR / RGPD, Chilean Law 21.719).

To reach full production compliance and prevent regulatory liability, this change addresses all detected compliance gaps:
1. **Accessibility**: Missing semantic landmarks (`<main>`, `<article>`, `<nav>`), unassociated form `<label>` and `<input>` elements in admin modals, lack of keyboard focus traps and `Escape` handlers in dialogs/drawers, missing/unclear ARIA labels, and color contrast failures in high-contrast themes.
2. **Privacy & Data Protection**: Absence of a compliant cookie consent banner (with equal-weight accept/reject actions), missing audit logging for user consent versions/timestamps, and lack of self-service user data export/erasure (ARCO / GDPR rights).
3. **Automated Quality**: Absence of automated accessibility regression testing (`axe-core`).

## Scope

### In Scope
- **Semantic HTML & Landmark Structure**: Enclose the main customer-facing page layout in a global `<main>` landmark, convert `ProductCard` containers into `<article>` elements, and wrap mobile navigation menus into semantic `<nav>` elements.
- **Form Label Association**: Explicitly connect every form `<label htmlFor={id}>` to its target `<input id={id}>`, `<select id={id}>`, or `<textarea id={id}>` across all modals in `AdminModals.tsx`.
- **Keyboard Navigation & Dialog Accessibility**: Implement accessible modal/drawer behavior in `CatalogModal`, `CartDrawer`, and `AdminModals` (proper `role="dialog"` or `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, active keyboard focus trapping with Tab cycle, `Escape` key close listener, and focus restoration to the triggering element).
- **ARIA & Screen Reader Enhancements**: Contextualize generic button labels (e.g., `aria-label="Ver detalles de [Nombre]"`), add `aria-live="polite"` regions for cart mutations and toast alerts, and state indicators (`aria-pressed`, `aria-current`) on toggle controls.
- **Color Contrast Hardening**: Adjust CSS color tokens in `app/globals.css` ensuring contrast ratio >= 4.5:1 for normal text and >= 3.0:1 for large/bold text across both `cyan` and `corsa` themes, and uplift low-contrast `zinc-500`/`zinc-600` micro-labels.
- **Cookie Consent Banner**: Implement a GDPR/Ley 21.719-compliant banner with equal prominence for "Aceptar" and "Rechazar", no pre-checked options, and persistent user preference handling.
- **User Privacy & Consent Management**: Add privacy policy and terms links in the footer, create a self-service data management interface and API endpoint (`/api/privacy/request`) allowing users to request data export or data erasure by email, and log consent metadata (version, timestamp) on orders.
- **Automated Accessibility Testing**: Add `@axe-core/playwright` or `vitest-axe` test suites to ensure 0 critical/serious WCAG 2.2 AA violations in CI.

### Out of Scope
- Full enterprise multi-tenant IAM or OAuth provider replacements (NextAuth with Google OAuth remains unchanged).
- Redesigning the brutalist visual language of the site (telemetry aesthetic is preserved while elevating contrast).
- Backend database overhaul (existing Prisma schema is extended minimally with privacy/consent audit fields).

## Capabilities

### New Capabilities
- `privacy-cookie-consent`: Accessible cookie consent banner and persistent user preference state with equal-prominence accept/reject controls.
- `user-data-rights`: Privacy endpoints and user-facing mechanism for data portability (export) and erasure (right to be forgotten) to fulfill GDPR and ARCO regulations.
- `automated-accessibility-testing`: Automated accessibility test coverage using `axe-core` integrated into component and E2E test runs.

### Modified Capabilities
- `vault-hypercars`: Hardening semantic markup, form associations, modal focus management, ARIA contracts, and color contrast tokens across customer and admin workflows.

## Approach

1. **Accessibility & Semantics First**:
   - Refactor `app/page.tsx` and `app/components/layout/Hero.tsx` so that `<main>` wraps all primary page content, including `Hero` and `Catalogo`.
   - Update `app/components/catalog/ProductCard.tsx` to `<article>` tags and supply unique `aria-label` descriptors for each vehicle action.
   - Refactor `AdminModals.tsx`: Assign unique, stable IDs to all form fields and associate corresponding `<label>` tags via `htmlFor`.
   - Create a reusable focus-trap and keyboard hook (`useAccessibleDialog`) to power `CatalogModal`, `CartDrawer`, and `AdminModals` with standard WAI-ARIA dialog practices.
   - Fix theme token contrast in `globals.css` for `--color-accent-contrast` in Corsa theme and adjust small utility font classes.

2. **Privacy & Regulatory Compliance**:
   - Implement an accessible `<CookieBanner />` component rendered at the root layout with options to accept, reject, or customize essential vs analytical telemetry.
   - Add a privacy center / modal or dedicated route allowing users to input their email and request either a complete export of their order history or submit a deletion request.
   - Record consent timestamps and policy version in the order transaction payload.
   - Update `SiteFooter.tsx` with links to Privacy Policy and Legal Notice.

3. **Automated Verification**:
   - Add unit/integration tests with `@testing-library/react` and component a11y checks.
   - Integrate `axe-core` tests in Playwright or Vitest to assert zero WCAG 2.1/2.2 AA violations on the homepage, catalog modal, cart drawer, and admin login.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/layout.tsx` | Modified | Mount cookie consent banner and update global accessibility attributes. |
| `app/page.tsx` | Modified | Wrap core content inside global `<main>` landmark. |
| `app/globals.css` | Modified | Adjust color contrast tokens for Corsa theme and secondary typography. |
| `app/components/layout/Hero.tsx` | Modified | Convert inner container from `<main>` to a semantic `<section>` / container. |
| `app/components/layout/Navbar.tsx` | Modified | Wrap mobile menu in `<nav>` and add accessible attributes to currency/theme buttons. |
| `app/components/layout/SiteFooter.tsx` | Modified | Add privacy policy, cookie policy, and legal notice links. |
| `app/components/catalog/ProductCard.tsx` | Modified | Use `<article>`, unique accessible labels for inspection, and enhanced `alt` texts. |
| `app/components/catalog/CatalogModal.tsx` | Modified | Add dialog role, focus trap, Escape listener, and accessible labeling. |
| `app/components/cart/CartDrawer.tsx` | Modified | Add dialog role, accessible backdrop button, focus trap, and live region for cart updates. |
| `app/components/cart/CartItemRow.tsx` | Modified | Add explicit `aria-label`s on increment, decrement, and delete buttons. |
| `app/components/admin/AdminModals.tsx` | Modified | Add `id` on inputs, `htmlFor` on labels, and modal accessibility dialog controls. |
| `app/components/ui/CookieBanner.tsx` | New | Accessible cookie consent banner with accept/reject handlers. |
| `app/components/ui/PrivacyModal.tsx` | New | Self-service UI for ARCO / GDPR user data export and deletion requests. |
| `app/api/privacy/request/route.ts` | New | API endpoint handling privacy inquiries, data export, and erasure requests. |
| `tests/components/Accessibility.test.tsx` | New | Automated accessibility tests asserting form labels, ARIA roles, and keyboard navigation. |
| `tests/e2e/accessibility.spec.ts` | New | E2E axe-core automated audit on primary customer and admin user journeys. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Brutalist telemetry visual style degraded by contrast changes | Low | Keep pure dark background `#09090b` and adjust foreground accent/text tones specifically to meet 4.5:1 ratio without losing cyberpunk aesthetic. |
| Keyboard focus trap interfering with existing modal click flows | Medium | Use robust, tested focus management hook that cleanly restores focus to the trigger element on unmount. |
| Cookie banner blocking critical first-paint user interactions | Low | Position banner at bottom as non-blocking floating bar with clear, accessible keyboard focus order. |

## Rollback Plan

All modifications are isolated in modular frontend components and a standalone privacy route. If any issue arises, Git revision revert will immediately restore prior presentation without breaking database schema or payment gateway integrations.

## Dependencies

- `@axe-core/playwright` or `vitest-axe` for automated accessibility verification in test suites.

## Success Criteria

- [ ] All inputs, selects, and textareas in `AdminModals.tsx` are programmatically linked to `<label>` tags via matching `id` and `htmlFor`.
- [ ] Landmark hierarchy validation passes with a single top-level `<main>` and semantic `<article>` tags in the catalog.
- [ ] Modals and drawers trap keyboard focus, dismiss on `Escape`, and return focus to triggering buttons.
- [ ] Theme contrast passes WCAG 2.2 AA (>= 4.5:1 for normal text) across all supported theme modes.
- [ ] Cookie consent banner renders with equal ease of acceptance and rejection and records user choices.
- [ ] Self-service privacy UI and API endpoint allows users to request data export or deletion.
- [ ] Automated accessibility test suite runs and passes with 0 critical or serious violations.
