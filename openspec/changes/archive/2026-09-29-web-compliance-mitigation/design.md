# Design: Web Compliance Mitigation (WCAG 2.2, GDPR & Privacy)

## Technical Approach

This design establishes a clean, modular implementation to resolve all compliance failures across accessibility and data privacy. The solution focuses on:
1. **Zero External Heavy UI Dependencies**: Rather than adding heavy third-party UI component libraries (such as Radix UI or Headless UI) that could bloat bundle size or break React 19 / Next.js 16 compiler setups, we implement lightweight, strictly typed custom hooks (`useAccessibleDialog`) to manage focus trapping, key listeners (`Escape`), and focus restoration.
2. **Deterministic Form Label Association**: Explicit, unique ID scoping across all modal form elements in `AdminModals.tsx` to establish immediate WCAG 2.2 / EAA compliance.
3. **Standards-Compliant Privacy & Consent Architecture**: A lightweight, accessible client-side Cookie Consent Banner and modal preference manager backed by `localStorage` and a dedicated server-side privacy request API route (`/api/privacy/request`) with sliding-window rate limiting.
4. **Contrast Hardening in Telemetry Brutalism**: Fine-tuning color tokens in `globals.css` and replacing non-compliant `zinc-600`/`zinc-500` micro-labels with `zinc-400` (7.3:1 contrast ratio against carbon `#09090b`).
5. **Automated Continuous Accessibility Gate**: Introducing automated component and page-level accessibility assertions using `axe-core` in the existing testing layer.

---

## Architecture Decisions

### Decision: Custom `useAccessibleDialog` Hook vs. Third-Party Dialog Primitives

**Choice**: Implement a lightweight custom React 19 hook (`app/hooks/useAccessibleDialog.ts`) that manages keyboard focus trap, `Escape` key dismissal, initial focus, and return-of-focus to the trigger element.  
**Alternatives considered**: Installing `@radix-ui/react-dialog` or `@headlessui/react`.  
**Rationale**: 
- `vault-hypercars` relies on React 19.2 and Next.js 16.2. Installing Radix or Headless UI primitives frequently introduces peer dependency conflicts with React 19 release channels.
- The existing codebase uses native HTML with custom Tailwind brutalist styling. A ~60-line custom hook cleanly wraps existing modal containers (`CatalogModal`, `CartDrawer`, `AdminModals`) without imposing external DOM wrappers, preserving our strict brutalist geometry and performance.

### Decision: Cookie Consent Persistence Strategy

**Choice**: Store structured consent metadata (`{ essential: true, analytics: boolean, timestamp: string, version: string }`) in browser `localStorage` under the key `vault_cookie_consent`, with an optional lightweight cookie for SSR synchronization. Provide equal-prominence "Aceptar Todo" and "Rechazar No Esenciales" buttons.  
**Alternatives considered**: Third-party SaaS widgets (e.g., OneTrust, Cookiebot).  
**Rationale**: 
- External SaaS cookie banners inject third-party trackers, slow down Core Web Vitals (LCP/INP), clash visually with the telemetry aesthetic, and fail local styling compliance.
- A first-party native component provides 100% control over keyboard accessibility, ARIA compliance, zero extra network round-trips, and zero telemetry leakage before consent.

### Decision: Data Portability and Erasure (ARCO / GDPR) Architecture

**Choice**: Introduce a unified endpoint `POST /api/privacy/request` that accepts `{ email: string, action: "export" | "delete" }`.
- For `action: "export"`: Queries database orders matching `customerEmail`, sanitizing internal Stripe IDs and returning machine-readable JSON.
- For `action: "delete"`: Anonymizes `customerEmail` in `Order` records by replacing it with a deterministic anonymized format `anonymized_<UUID>@vault.invalid` inside an atomic transaction.  
**Alternatives considered**: Complete row deletion (`DELETE FROM "Order"`).  
**Rationale**: 
- Financial accounting regulations require preserving transaction records (amounts, currency, purchased hypercars, dates, status).
- Anonymizing the personal identifier (`customerEmail`) severs the personal link while preserving financial and stock auditability, fully complying with both GDPR Art. 17 (Right to Erasure) and fiscal accounting mandates.

### Decision: Color Contrast Token Tuning

**Choice**:
- In `corsa` theme (`data-theme="corsa"`), update `--color-accent-contrast` to `#000000` (6.76:1 contrast ratio against `#ef4444`, passing AAA) or deepen the accent to `#dc2626` when used with white text.
- Replace utility text classes `text-zinc-600` and small `text-zinc-500` across footers and cards with `text-zinc-400` (#a1a1aa, 7.3:1 contrast against `#09090b`).  
**Alternatives considered**: Inverting the entire dark mode to light mode for accessibility.  
**Rationale**: 
- The telemetry brutalist identity requires dark carbon surfaces. Upgrading the text color values achieves full WCAG 2.2 AA (and many AAA) contrast compliance without disrupting the dark aesthetic.

---

## Data Flow

### 1. Dialog Focus Management Flow

```
User Click Trigger ───→ Modal Opens (isOpen = true)
                             │
                             ├── Save trigger element to previousActiveElementRef
                             ├── Query all focusable elements inside dialogRef
                             ├── Set focus to first focusable element
                             │
                     User Presses Tab
                             │
                             ├── Is on last element? Wrap to first element
                             └── Is on first element (Shift+Tab)? Wrap to last element
                             │
                     User Presses Escape or Closes
                             │
                             ├── Trigger onClose()
                             └── Restore focus to previousActiveElementRef.current
```

### 2. Privacy & Cookie Consent Flow

```
User Visits Site ───→ Read localStorage('vault_cookie_consent')
                             │
              ┌──────────────┴──────────────┐
       [Found State]                 [Not Found]
              │                             │
       Apply preferences             Render <CookieBanner />
                                            │
                               ┌────────────┴────────────┐
                        [Click Accept]            [Click Reject]
                               │                         │
                         Save consent              Save consent
                     analytics = true          analytics = false
                               └────────────┬────────────┘
                                            │
                               Dismiss banner & update state
```

### 3. User Data Rights (ARCO / GDPR) Request Flow

```
User enters email in Privacy UI ──→ POST /api/privacy/request
                                            │
                                   [Rate Limit Check] (60 req/min)
                                            │
                                   [Validate Email Format]
                                            │
                             ┌──────────────┴──────────────┐
                      [action: "export"]            [action: "delete"]
                             │                             │
                     Find orders by email         Anonymize customerEmail
                             │                             │
                     Return JSON data             Return confirmation
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/hooks/useAccessibleDialog.ts` | Create | Custom hook for focus trap, Escape key dismiss, and focus restoration for overlays. |
| `app/components/ui/CookieBanner.tsx` | Create | Accessible cookie consent banner with equal-prominence accept/reject actions. |
| `app/components/ui/PrivacyModal.tsx` | Create | Self-service UI for data export and erasure requests (ARCO / GDPR). |
| `app/api/privacy/request/route.ts` | Create | Secure REST endpoint handling data export and anonymization requests. |
| `app/types/privacy.ts` | Create | TypeScript types for cookie consent preferences and privacy API payloads. |
| `app/globals.css` | Modify | Adjust color tokens for Corsa contrast ratio (>= 4.5:1) and uplift low-contrast text. |
| `app/layout.tsx` | Modify | Mount `<CookieBanner />`, `<PrivacyModal />`, and verify `html lang="es"`. |
| `app/page.tsx` | Modify | Encompass page body within a single top-level `<main id="main-content">` landmark. |
| `app/components/layout/Hero.tsx` | Modify | Change inner container from `<main>` to a semantic `<section aria-label="Introducción">`. |
| `app/components/layout/Navbar.tsx` | Modify | Wrap mobile menu in `<nav aria-label="Menú móvil">` and add accessible labels to currency/theme buttons. |
| `app/components/layout/SiteFooter.tsx` | Modify | Add links for "Configuración de Cookies" and "Derechos de Privacidad (ARCO)". |
| `app/components/catalog/ProductCard.tsx` | Modify | Replace `<div>` container with `<article>`, contextualize `aria-label="Ver detalles de [Nombre]"`. |
| `app/components/catalog/CatalogModal.tsx` | Modify | Integrate `useAccessibleDialog`, add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`. |
| `app/components/cart/CartDrawer.tsx` | Modify | Integrate `useAccessibleDialog`, replace non-interactive backdrop, add live region. |
| `app/components/cart/CartItemRow.tsx` | Modify | Add explicit `aria-label`s on decrement, increment, and remove buttons. |
| `app/components/admin/AdminModals.tsx` | Modify | Bind every `<label htmlFor={id}>` to `<input id={id}>`, add dialog accessibility attributes. |
| `tests/unit/privacy.test.ts` | Create | Unit tests verifying cookie consent state handling and privacy API payload validations. |
| `tests/components/Accessibility.test.tsx` | Create | Component accessibility tests for forms, labels, landmarks, and dialog focus trap. |

---

## Interfaces / Contracts

### 1. Privacy Domain Types (`app/types/privacy.ts`)

```typescript
export interface CookieConsentPreferences {
  essential: true;
  analytics: boolean;
  timestamp: string;
  version: string;
}

export type PrivacyAction = "export" | "delete";

export interface PrivacyRequestPayload {
  email: string;
  action: PrivacyAction;
}

export interface PrivacyExportResponse {
  email: string;
  requestDate: string;
  orders: Array<{
    id: string;
    totalAmount: number;
    currency: string;
    status: string;
    createdAt: string;
    items: Array<{
      carName: string;
      brand: string;
      quantity: number;
      priceUSD: number;
    }>;
  }>;
}

export interface PrivacyDeleteResponse {
  success: boolean;
  message: string;
  recordsAffected: number;
}
```

### 2. Accessible Dialog Hook Contract (`app/hooks/useAccessibleDialog.ts`)

```typescript
export interface UseAccessibleDialogOptions {
  isOpen: boolean;
  onClose: () => void;
  dialogRef: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

export function useAccessibleDialog({
  isOpen,
  onClose,
  dialogRef,
  initialFocusRef
}: UseAccessibleDialogOptions): void;
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| **Unit** | Form label associations in `AdminModals.tsx` | Vitest + React Testing Library: Assert every `<input>`, `<select>`, `<textarea>` has a programmatic accessible name matching its `<label>`. |
| **Unit** | Focus trapping and keyboard handling in `useAccessibleDialog` | Vitest + RTL + `@testing-library/user-event`: Verify Tab wraps around and Escape triggers `onClose`. |
| **Unit** | Privacy route `/api/privacy/request` validation & processing | Vitest API handler tests with mocked Prisma client: Test export format, non-existent email handling, and email anonymization. |
| **Component** | Cookie consent banner rendering & persistence | Vitest + RTL: Assert equal button prominence, no pre-selected checkboxes, and `localStorage` persistence. |
| **Component** | Semantic landmark checks | Assert single `<main>` in `page.tsx` and `<article>` tags in `ProductCard`. |

---

## Threat Matrix

| Threat | Applicable? | Safe / Failure Behavior | Planned RED Test |
|---|---|---|---|
| User email enumeration or exposure via `/api/privacy/request` | Applicable | For `export` with non-existent email, return HTTP 200 with empty orders array rather than 404 to prevent user enumeration attacks. | Unit test verifying identical 200 response structure for existing and non-existing email queries. |
| Denial of Service / Spam on `/api/privacy/request` | Applicable | Apply IP-based sliding-window rate limit (capped at 20 requests per minute). Returns HTTP 429 when exceeded. | Unit test asserting HTTP 429 after 21 rapid calls from same IP identifier. |
| Accidental data destruction during deletion request | Applicable | Anonymize `customerEmail` rather than executing cascade deletion of fiscal `Order` records. | Unit test asserting `Order` records remain in database with anonymized email string. |
| Shell execution / Process integration | N/A | No shell commands, subprocesses, or executable file processing boundaries exist in this change. | N/A |

---

## Migration / Rollout

No database migration required. The PostgreSQL schema already has nullable `customerEmail` on `Order` and standard string fields. All changes are backward-compatible frontend refactors and new non-breaking API routes.

---

## Open Questions

- None. All architectural constraints, WCAG criteria, and privacy guidelines have been mapped to concrete file structures.
