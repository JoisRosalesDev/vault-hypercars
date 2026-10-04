# Design Document: Audit Remediations, Security Architecture & Experience Polish

## Architectural Decisions

### 1. Image Persistence Pipeline
- **Decision:** Build a Next.js App Router POST handler at `app/api/admin/upload/route.ts`.
- **Implementation:** Validates NextAuth admin session, parses `multipart/form-data`, checks MIME types (`image/jpeg`, `image/png`, `image/webp`), enforces 5MB file caps, generates unique filenames via `crypto.randomUUID()`, and persists to `public/uploads/`.
- **Validation:** Car creation and update endpoints (`/api/admin/cars`) explicitly reject any payload containing `image.startsWith("blob:")`.

### 2. Nested Modal Focus Management
- **Decision:** Enhance `useAccessibleDialog` integration in `AdminModals.tsx`.
- **Implementation:** When a confirmation modal opens over an active create/edit dialog, the parent dialog's focus trap is paused conditionally (`isOpen: isCreateOpen && !confirmModal.isOpen`). This eliminates conflicting event listeners fighting for `document.activeElement`.

### 3. Accessible Motion Degradation (Hero Video)
- **Decision:** Do NOT hide the `<video>` element with `motion-reduce:hidden` because doing so leaves an empty black container (`bg-zinc-950`).
- **Implementation:** Attach a `videoRef` and listen for `(prefers-reduced-motion: reduce)`. If active, call `videoRef.current.pause()` to freeze the first frame as a crisp photographic background.
- **Lighting & Contrast:** Increase base opacity to `opacity-55` and adjust dark radial gradient to `via-zinc-950/60 to-zinc-950/40`, preserving WCAG AAA text contrast.

### 4. Currency Restriction & Exchange Rates
- **Decision:** Narrow `Currency` union from `"USD" | "EUR" | "GBP" | "AED"` to `"USD" | "EUR" | "CLP"`.
- **Implementation:**
  - `USD`: { symbol: "$", rate: 1.0 }
  - `EUR`: { symbol: "€", rate: 0.92 }
  - `CLP`: { symbol: "CLP $", rate: 950 }
  - Integer rounding formatting for CLP to handle large Chilean Peso nominal amounts cleanly.

### 5. Architectural Cleanliness (Dead Code Pruning)
- **Decision:** Remove `Showroom.tsx` and barrel files (`CartDrawer.tsx`, `Catalogo.tsx`, `Icons.tsx`).
- **Implementation:** Direct module imports enforce screaming architecture and avoid bundle duplication.
