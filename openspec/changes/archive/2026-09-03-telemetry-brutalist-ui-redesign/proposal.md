# Propuesta: Rediseño Exclusivo de UI/UX - VAULT Hypercars

## 1. Contexto y Objetivos
Reestructuración integral de la dirección de arte del e-commerce y panel administrativo de Vault Hypercars, transicionando de la estética dorada convencional hacia un lenguaje visual de vanguardia basado en **Telemetría Automotriz** y **Brutalismo Digital**.

## 2. Límites de Alcance e Inmutabilidad (Tolerancia Cero)
- **Inmutabilidad de Base de Datos y Backend:** Estrictamente prohibido modificar `prisma/schema.prisma`, directorios `app/api/`, lógica de sesión (`getServerSession`), proveedores de autenticación NextAuth o endpoints REST.
- **Acoplamiento Frontend:** El rediseño se limita estrictamente a la capa de presentación de React y clases de utilidad de Tailwind CSS v4, consumiendo exactamente las mismas interfaces y props de datos.

## 3. Pilares de Dirección de Arte
1. **Paleta Cromática de Telemetría:**
   - Base inmutable: Gris Carbono (`--color-carbon-*`, `bg-zinc-950` y `bg-zinc-900`).
   - Textos primarios: Blanco Titanio (`--color-titanium-*`, `text-white` y `text-zinc-400`).
   - Acento dinámico conmutable: **Cyan Eléctrico** (`#06b6d4`) y **Rojo Corsa** (`#ef4444`).
2. **Tipografía de Rendimiento:**
   - Títulos y marcas: `Space Grotesk` (geométrica, angular, presencia de competición).
   - Métricas y datos de telemetría: `JetBrains Mono` con `tabular-nums` para alineación de cifras (HP, 0-100, velocidad, precios y stock).
3. **Morfología Brutalista y Chasis Visual:**
   - Erradicación de bordes redondeados orgánicos (`rounded-full`, `rounded-xl` en contenedores).
   - Adopción de micro-bordes cortantes (`rounded-none`, `rounded-sm`), divisiones técnicas (`border-zinc-800`), superficies translúcidas *glassmorphism* agresivo (`bg-zinc-900/50 backdrop-blur-md`) y resplandores técnicos (`shadow-[0_0_15px_var(--color-accent-glow)]`).
