# Proposal: Critical Audit Remediations, Security, UI Polish, Showroom Removal, and Currency Restriction

## Problem Statement
A dual-agent critical audit of the Vault Hypercars platform identified multiple technical and visual gaps:
1. **Security & Persistence Vulnerabilities (P0):**
   - Exposure of administrator email (`joisrosafer@gmail.com`) in login failure UI state.
   - Use of client-ephemeral `blob:` object URLs for hypercar images, causing database corruption once the admin browser tab closes.
   - Non-functional sign-out button in the admin dashboard header.
2. **Accessibility & Modals (P1):**
   - Focus trap race condition in nested admin modals (create/edit form modal colliding with confirmation modal).
   - Inaccessible file upload input for keyboard navigation.
   - Video background in `Hero.tsx` collapsed to an empty black void (`display: none`) under `prefers-reduced-motion: reduce` with low base opacity.
3. **Product & Scope Alignments:**
   - Orphaned Showroom component disconnected from the catalog domain.
   - Currency selection containing unsupported currencies (`GBP`, `AED`) requiring restriction to target markets (`USD`, `EUR`, `CLP`).
   - Brutalist design tokens unaligned in `CatalogGrid.tsx` and sub-standard touch targets on mobile devices.

## Proposed Changes
1. Sanitize login error messages and implement dedicated authenticated `/api/admin/upload` image handling.
2. Resolve focus traps via selective pausing (`!confirmModal.isOpen`) and enhance keyboard a11y across inputs and live regions.
3. Eliminate `Showroom.tsx` and all navigation references.
4. Restrict `Currency` type and rates strictly to `USD`, `EUR`, and `CLP`.
5. Calibrate `Hero.tsx` with programmatic pause on reduced motion without black screen flashes, and enforce brutalist tokens (`bg-zinc-950`, `rounded-none`).

## Success Criteria
- Zero security leaks of administrator credentials or emails.
- Persistent file storage for uploads; rejection of ephemeral `blob:` URLs.
- 100% passing test suite across Vitest and Playwright.
- Clean TypeScript compilation without errors (`tsc --noEmit`).
