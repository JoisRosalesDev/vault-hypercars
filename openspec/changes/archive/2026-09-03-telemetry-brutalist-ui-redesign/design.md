# Design System: Telemetría Automotriz & Brutalismo Digital

## 1. Tokens Cromáticos y Variables CSS (`app/globals.css`)
- Base Carbono:
  - `--color-carbon-base: #09090b` (`bg-zinc-950`)
  - `--color-carbon-surface: #18181b` (`bg-zinc-900`)
  - `--color-carbon-border: #27272a` (`border-zinc-800`)
- Blanco Titanio:
  - `--color-titanium-pure: #fafafa`
  - `--color-titanium-muted: #a1a1aa` (`text-zinc-400`)
- Acento Dinámico Cyan Eléctrico (`:root` / `[data-theme="cyan"]`):
  - `--color-accent: #06b6d4`
  - `--color-accent-hover: #0891b2`
  - `--color-accent-glow: rgba(6, 182, 212, 0.4)`
  - `--color-accent-contrast: #000000`
- Acento Dinámico Rojo Corsa (`[data-theme="corsa"]`):
  - `--color-accent: #ef4444`
  - `--color-accent-hover: #dc2626`
  - `--color-accent-glow: rgba(239, 68, 68, 0.4)`
  - `--color-accent-contrast: #ffffff`

## 2. Tipografía Dual
- Display / Headings: `Space Grotesk` (`font-display`)
- Telemetry / Metrics: `JetBrains Mono` (`font-mono`, `tabular-nums`)

## 3. Geometría y Morfología Brutalista
- Contenedores: `rounded-none sm:rounded-sm bg-zinc-900/50 backdrop-blur-md border border-zinc-800`
- Botones CTA: `bg-accent text-accent-contrast font-display font-black text-xs tracking-widest rounded-none hover:bg-accent-hover shadow-[0_0_20px_var(--color-accent-glow)]`
- Badges Técnicos: `bg-accent/10 border border-accent/30 text-accent font-mono text-[10px] tracking-widest`
