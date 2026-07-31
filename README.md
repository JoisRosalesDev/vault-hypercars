# Vault Hypercars — Plataforma de Comercio Electrónico y Administración de Hiperautos de Lujo

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-6772E5?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

Una plataforma web de nivel empresarial para el comercio electrónico y la gestión administrativa de hiperautos de ultra lujo, enfocada exclusivamente en los modelos más representativos de **Bugatti**, **Lamborghini** y **Ferrari**.

Desarrollada con **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM**, **Supabase PostgreSQL**, **NextAuth.js (Google OAuth)** y **Stripe**.

---

## Características Principales

### Experiencia del Cliente (Tienda y Catálogo)
- **Hero Inmersivo**: Banner principal con video en bucle a pantalla completa, superposición de gradiente radial oscuro y métricas de rendimiento adaptativas.
- **Catálogo Exclusivo**: Filtrado por marcas (**Bugatti**, **Lamborghini**, **Ferrari**) con coincidencia insensible a mayúsculas y minúsculas.
- **Gestión de Disponibilidad y Stock**: Indicadores visuales de inventario en tiempo real (`Stock: X u.`, `¡Última unidad!`, `AGOTADO`) con desactivación automática de botones de compra cuando el stock llega a cero.
- **Conversor de Divisas en Tiempo Real**: Cambio de moneda instantáneo entre **USD** ($), **EUR** (€), **GBP** (£) y **AED** (AED).
- **Modal de Inspección de Vehículo**: Vista detallada con tabla de especificaciones técnicas (potencia HP, velocidad máxima, aceleración 0–100 km/h y configuración del motor).
- **Carrito de Compras Desplegable**: Panel lateral deslizable con cálculo de subtotal en tiempo real, gestión de unidades y redirección hacia el proceso de pago.

### Seguridad y Procesamiento de Pagos
- **Integración con Stripe e Idempotencia**: Procesamiento de pagos protegido por encabezados de idempotencia UUID para prevenir cobros duplicados por clics repetidos.
- **Control de Condiciones de Carrera**: Transacciones atómicas en base de datos (`prisma.$transaction`) que verifican la disponibilidad de inventario antes de autorizar sesiones de pago.
- **Escuchador de Webhooks**: Endpoint verificado criptográficamente (`/api/webhooks/stripe`) para procesar la confirmación del pago (decremento de stock y actualización de estado del vehículo) y la caducidad de sesiones.
- **Autenticación Administrativa Estricta**: Inicio de sesión mediante Google OAuth restringido mediante verificación estricta de correo autorizado en el callback del servidor.
- **Protección de API y Resiliencia**: Limitación de tasa de peticiones mediante algoritmo de balde de fichas (*rate limiting*) y control de tiempos de espera (*timeouts* de 10 segundos) en consultas a la base de datos.

### Panel de Control Administrativo
- **Métricas Analíticas en Tiempo Real**: Cálculo dinámico del valor total del inventario, unidades activas, ingresos mensuales confirmados y tasa de conversión desde la base de datos PostgreSQL.
- **Gestión Completa de Inventario (CRUD)**: Creación, actualización y eliminación de vehículos con carga de imágenes vía URL o selección de archivos locales.
- **Modales de Doble Confirmación**: Diálogos de verificación secundaria para prevenir acciones accidentales en la base de datos.
- **Diseño Responsivo de la Interfaz**: Encabezado y controles de navegación optimizados para dispositivos móviles y pantallas de alta resolución.

---

## Arquitectura del Proyecto

```
vault-hypercars/
├── app/
│   ├── admin/
│   │   ├── dashboard/page.tsx   # Contenedor del Dashboard con Analíticas Vivas
│   │   └── login/page.tsx       # Página de Autenticación de Administración
│   ├── api/
│   │   ├── admin/
│   │   │   ├── analytics/route.ts # Endpoint de Analíticas en Tiempo Real
│   │   │   └── cars/
│   │   │       ├── route.ts     # Endpoint para Listar y Crear Inventario
│   │   │       └── [id]/route.ts# Endpoint para Editar y Eliminar Vehículos
│   │   ├── auth/
│   │   │   └── [...nextauth]/   # Manejador de Autenticación NextAuth
│   │   ├── catalog/route.ts     # Endpoint Público de Catálogo
│   │   ├── checkout/route.ts    # Endpoint para Sesiones de Pago en Stripe
│   │   └── webhooks/
│   │       └── stripe/route.ts  # Escuchador de Webhooks de Stripe
│   ├── components/
│   │   ├── admin/               # Componentes de Analíticas, Tablas y Modales
│   │   ├── cart/                # Componentes del Carrito de Compras
│   │   ├── catalog/             # Tarjetas, Filtros y Modales del Catálogo
│   │   ├── layout/              # Navbar, Hero y Footer
│   │   └── ui/                  # Galería de Íconos SVG y Notificaciones Toast
│   ├── context/                 # Proveedor del Estado del Carrito
│   ├── hooks/                   # Hook Personalizado useHypercarCart
│   ├── lib/                     # Utilidades de Autenticación, Moneda, Prisma y Stripe
│   └── types/                   # Definiciones de Tipos de TypeScript
├── prisma/
│   ├── schema.prisma            # Esquemas de Base de Datos PostgreSQL
│   └── seed.ts                  # Script de Inicialización de Datos
└── openspec/                    # Especificaciones y Seguimiento de Cambios SDD
```

---

## Inicio Rápido y Desarrollo Local

1. **Clonar el Repositorio e Instalar Dependencias**:
   ```bash
   git clone https://github.com/tu-usuario/vault-hypercars.git
   cd vault-hypercars
   npm install
   ```

2. **Sincronizar el Esquema de la Base de Datos**:
   ```bash
   npx prisma db push
   ```

3. **Iniciar el Servidor de Desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

---

## Despliegue en Producción

### Generación de Cliente Prisma en Entornos Serverless
El proyecto incluye scripts automatizados en el archivo `package.json` para garantizar la compilación correcta en plataformas como Vercel:
```json
"scripts": {
  "build": "prisma generate && next build",
  "postinstall": "prisma generate"
}
```

### Objetivos de Compilación para AWS Lambda / Vercel
El archivo `prisma/schema.prisma` incluye los binarios requeridos para la ejecución en servidores serverless:
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x", "rhel-openssl-3.0.x"]
}
```

---

## Sistema de Diseño y Estándar Cero Emojis

El proyecto sigue una estética de lujo industrial:
- **Paleta de Colores**: Negro Obsidiana (`#08080a`), Carbón (`#0d0d12`), Cristal Oscuro (`#0e0e14`), Oro Metálico (`#d4af37`) y Oro Champán (`#f5d061`).
- **Estándar Cero Emojis**: Toda la iconografía del sistema está construida al 100% utilizando componentes vectoriales SVG purificados en [`app/components/ui/Icons.tsx`](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/ui/Icons.tsx). No existen emojis en formato de texto en el código fuente.

---

## Comandos de Verificación de Calidad

- **Verificación de Tipos de TypeScript**:
  ```bash
  npx tsc --noEmit
  ```
- **Linter de Código**:
  ```bash
  npm run lint
  ```
- **Prueba de Compilación de Producción**:
  ```bash
  npm run build
  ```

---

## Licencia

Derechos de Autor © 2026 Vault Hypercars. Todos los derechos reservados.
