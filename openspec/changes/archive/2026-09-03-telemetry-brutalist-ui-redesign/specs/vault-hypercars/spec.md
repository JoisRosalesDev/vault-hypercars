# Delta Specification: Telemetry Brutalist Presentation & Dynamic Theme Engine

## ADDED Requirements

### Requirement: Dynamic Telemetry Theme Engine
The application MUST provide a dynamic theme switching engine allowing instant switching between Cyan Eléctrico (`data-theme="cyan"`) and Rojo Corsa (`data-theme="corsa"`), with state persistence in `localStorage` and zero hydration mismatch.

#### Scenario: User toggles theme
- **GIVEN** a user visiting any public or admin route
- **WHEN** the user clicks the `ThemeToggle` atom (`CYAN` // `CORSA`)
- **THEN** `document.documentElement` updates the `data-theme` attribute synchronously
- **AND** the preference is saved to `localStorage` under key `vault-hypercars-theme`
- **AND** the accent color CSS variables (`--color-accent`, `--color-accent-hover`, `--color-accent-glow`, `--color-accent-contrast`) update immediately across all components.

#### Scenario: Prevention of Hydration Mismatch and Flicker
- **GIVEN** a user with a stored theme in `localStorage`
- **WHEN** the page is loaded or reloaded
- **THEN** an inline synchronous script in `app/layout.tsx` reads `localStorage` and sets `data-theme` prior to initial paint
- **AND** `<html>` specifies `suppressHydrationWarning` to avoid React hydration mismatches.

### Requirement: Performance Monospace Telemetry Metrics
All numerical vehicle performance indicators (power HP, 0-100 acceleration, top speed, inventory stock, and catalog prices) MUST be rendered using a monospaced font (`JetBrains Mono` / `font-mono`) with tabular numbers (`tabular-nums`) to guarantee visual alignment and engineering rigor.

### Requirement: Eradication of Generic Gold Palette
All generic gold, amber, and warm yellow tokens (`#d4af37`, `#f5d061`, `amber-*`, `yellow-*`) MUST be completely purged across all user-facing and administrator interfaces, replaced by the dynamic semantic tokens (`bg-accent`, `text-accent`, `border-accent`) on Carbon Gray backgrounds (`bg-zinc-950`, `bg-zinc-900/50`).
