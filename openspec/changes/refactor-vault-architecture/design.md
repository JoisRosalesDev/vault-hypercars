# Technical Design Document: Refactoring & Reorganizing Vault Hypercars Architecture

**Change ID**: `refactor-vault-architecture`  
**Mode**: `hybrid`  
**Target Project**: Vault Hypercars Platform (`vault-hypercars`)  
**Status**: Draft / Proposed Design  

---

## 1. Executive Summary & Architectural Goals

The primary goal of `refactor-vault-architecture` is to decompose monolithic page components and inline type definitions into a domain-layered modular architecture. The application is refactored into distinct layers:
1. **Domain & Data Layer**: Enforces type safety across catalog items, shopping cart states, currency conversions, and admin actions (`app/types/`, `app/data/`, `app/lib/`).
2. **State Management & Custom Hook Layer**: Encapsulates cart actions, drawer states, currency conversion, and toast notifications into `useHypercarCart` and `CartContext` (`app/hooks/`, `app/context/`).
3. **Atomic Component Hierarchy**: Decomposes layout, customer catalog, shopping cart, and admin dashboard controls into clean, single-responsibility components (`app/components/`).
4. **Lightweight Page Containers**: Simplifies top-level page routes (`app/page.tsx`, `app/admin/dashboard/page.tsx`) into declarative container components.

---

## 2. Target File Tree & Architecture

```
app/
├── admin/
│   ├── dashboard/
│   │   └── page.tsx                 # Lightweight container composing Admin Modals & Analytics
│   └── login/
│       └── page.tsx                 # Secure Admin Login container
├── components/
│   ├── admin/
│   │   ├── AdminModals.tsx          # Form & Double Confirmation modal dialogs
│   │   ├── CatalogTable.tsx         # Catalog management table
│   │   └── DashboardAnalytics.tsx   # Analytics metrics overview cards
│   ├── cart/
│   │   ├── CartDrawer.tsx           # Slide-over cart drawer with checkout
│   │   └── CartItemRow.tsx          # Individual cart item row component
│   ├── catalog/
│   │   ├── CatalogFilter.tsx        # Brand selection filter (Bugatti, Lamborghini, Ferrari, All)
│   │   ├── CatalogGrid.tsx          # Responsive grid layout
│   │   ├── CatalogModal.tsx         # Hypercar detail modal viewer
│   │   └── ProductCard.tsx          # Atomic hypercar card component
│   ├── layout/
│   │   ├── Hero.tsx                 # Background video loop hero section
│   │   ├── Navbar.tsx               # Glassmorphism navbar & mobile menu toggle
│   │   └── SiteFooter.tsx           # Global footer with Admin link
│   └── ui/
│       ├── Icons.tsx                # Vector SVG icon dictionary
│       └── ToastNotification.tsx    # Floating feedback toast banner
├── context/
│   └── CartContext.tsx              # Context provider for shopping cart & currency state
├── data/
│   └── initialCatalog.ts            # Hypercar catalog static initial dataset
├── hooks/
│   └── useHypercarCart.ts           # Custom hook encapsulating cart actions & currency conversion
├── lib/
│   └── currency.ts                  # Multi-currency exchange rates & formatting utilities
├── types/
│   ├── admin.ts                     # Admin dashboard & modal form type definitions
│   ├── cart.ts                      # Shopping cart, currency & rate types
│   └── catalog.ts                   # Hypercar catalog item, brand & specs types
├── globals.css                      # Tailwind CSS v4 styling rules
├── layout.tsx                       # Root layout & CartProvider wrapper
└── page.tsx                         # Customer landing page composing layout & catalog components
```

---

## 3. Domain Layer Contracts & Types

### 3.1 Catalog Domain (`app/types/catalog.ts`)

```typescript
export type Brand = 'Bugatti' | 'Lamborghini' | 'Ferrari' | 'All';

export type ItemStatus = 'Disponible' | 'Unidad Final' | 'Reservado' | 'Vendido';

export interface HypercarSpecs {
  power: string;         // e.g. "1,800 HP"
  topSpeed: string;      // e.g. "445 km/h"
  acceleration?: string; // e.g. "0-100 km/h en 2.0s"
  engine?: string;       // e.g. "V16 8.3L Atmosférico + 3 Motores Eléctricos"
}

export interface CatalogItem {
  id: string;
  name: string;
  brand: Exclude<Brand, 'All'>;
  year: string;
  power: string;
  topSpeed: string;
  priceUSD: number;
  status: ItemStatus;
  description: string;
  image: string;
  specs?: HypercarSpecs;
}
```

### 3.2 Cart & Currency Domain (`app/types/cart.ts`)

```typescript
import { Brand } from './catalog';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'AED';

export interface CurrencyDetails {
  symbol: string;
  rate: number;
}

export type CurrencyRatesMap = Record<Currency, CurrencyDetails>;

export interface CartItem {
  id: string;
  name: string;
  brand: Exclude<Brand, 'All'>;
  priceUSD: number;
  image: string;
  quantity: number;
}

export type AddToCartInput = Omit<CartItem, 'quantity'>;
```

### 3.3 Admin Domain (`app/types/admin.ts`)

```typescript
import { Brand, ItemStatus, CatalogItem } from './catalog';

export type AdminModalAction = 'create' | 'update' | 'delete' | null;

export interface CatalogFormData {
  id?: string;
  brand: Exclude<Brand, 'All'>;
  name: string;
  year: string;
  power: string;
  topSpeed: string;
  priceUSD: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'AED';
  status: ItemStatus;
  description: string;
  image: string;
}

export interface ConfirmModalState {
  isOpen: boolean;
  action: AdminModalAction;
  targetItem: CatalogItem | null;
}

export interface DashboardMetrics {
  totalInventoryUSD: number;
  activeUnitsCount: number;
  monthlyRevenueUSD: number;
  conversionRatePercent: number;
}
```

---

## 4. Data & Utility Layer Specifications

### 4.1 Static Dataset (`app/data/initialCatalog.ts`)

```typescript
import { CatalogItem } from '../types/catalog';

export const initialCatalogItems: CatalogItem[] = [
  {
    id: "c1",
    name: "Bugatti Tourbillon V16",
    brand: "Bugatti",
    year: "2026",
    power: "1,800 HP",
    topSpeed: "445 km/h",
    priceUSD: 4100000,
    status: "Disponible",
    description: "Motor V16 atmosférico de 8.3 litros combinado con 3 motores eléctricos e ingeniería analógica de relojería suiza.",
    image: ""
  },
  {
    id: "c2",
    name: "Bugatti Bolide Track-Only",
    brand: "Bugatti",
    year: "2025",
    power: "1,850 HP",
    topSpeed: "501 km/h",
    priceUSD: 4400000,
    status: "Unidad Final",
    description: "Desarrollado exclusivamente para circuito. Carrocería radical con peso de tan solo 1,240 kg.",
    image: ""
  },
  {
    id: "c3",
    name: "Lamborghini Revuelto HPEV",
    brand: "Lamborghini",
    year: "2026",
    power: "1,015 HP",
    topSpeed: "350 km/h",
    priceUSD: 600000,
    status: "Disponible",
    description: "El primer súper deportivo híbrido V12 HPEV de Sant'Agata Bolognese con tracción integral vectorial.",
    image: ""
  },
  {
    id: "c4",
    name: "Lamborghini Sián FKP 37",
    brand: "Lamborghini",
    year: "2025",
    power: "819 HP",
    topSpeed: "355 km/h",
    priceUSD: 3700000,
    status: "Unidad Final",
    description: "Primer súper deportivo con tecnología híbrida impulsada por supercondensadores de alta densidad de energía.",
    image: ""
  },
  {
    id: "c5",
    name: "Ferrari Daytona SP3 Icona",
    brand: "Ferrari",
    year: "2026",
    power: "840 HP",
    topSpeed: "340 km/h",
    priceUSD: 2250000,
    status: "Disponible",
    description: "Motor V12 de aspiración natural a 9,500 RPM. Diseño aerodinámico escultural sin componentes activos.",
    image: ""
  },
  {
    id: "c6",
    name: "Ferrari SF90 XX Stradale",
    brand: "Ferrari",
    year: "2026",
    power: "1,030 HP",
    topSpeed: "320 km/h",
    priceUSD: 890000,
    status: "Disponible",
    description: "Primera versión XX homologada para carretera. Aerodinámica de carrera de resistencia con alerón fijo posterior.",
    image: ""
  }
];
```

### 4.2 Multi-Currency Helper (`app/lib/currency.ts`)

```typescript
import { Currency, CurrencyRatesMap } from '../types/cart';

export const CURRENCY_RATES: CurrencyRatesMap = {
  USD: { symbol: "$", rate: 1.0 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.78 },
  AED: { symbol: "AED ", rate: 3.67 }
};

export function formatPrice(priceUSD: number, currency: Currency = 'USD'): string {
  const { symbol, rate } = CURRENCY_RATES[currency] ?? CURRENCY_RATES.USD;
  const converted = Math.round(priceUSD * rate);
  return `${symbol}${converted.toLocaleString()}`;
}
```

---

## 5. State Management & Custom Hooks

### 5.1 Context Provider (`app/context/CartContext.tsx`)

```typescript
import React from 'react';
import { CartItem, AddToCartInput, Currency } from '../types/cart';

export interface CartContextType {
  cart: CartItem[];
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  addToCart: (item: AddToCartInput) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  formatPrice: (priceUSD: number) => string;
  toastMessage: string | null;
}

export interface CartProviderProps {
  children: React.ReactNode;
}
```

### 5.2 Custom Hook (`app/hooks/useHypercarCart.ts`)

```typescript
import { useContext } from 'react';
import { CartContext, CartContextType } from '../context/CartContext';

export interface UseHypercarCartReturn extends CartContextType {
  cartCount: number;
  totalUSD: number;
  formattedTotal: string;
}

export function useHypercarCart(): UseHypercarCartReturn {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useHypercarCart must be used within a CartProvider");
  }

  const cartCount = context.cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalUSD = context.cart.reduce((acc, item) => acc + item.priceUSD * item.quantity, 0);
  const formattedTotal = context.formatPrice(totalUSD);

  return {
    ...context,
    cartCount,
    totalUSD,
    formattedTotal
  };
}

export { useHypercarCart as useCart };
```

---

## 6. Component Architecture & Interface Contracts

### 6.1 Layout Components (`app/components/layout/`)

#### `Navbar.tsx`
- **Props**:
  ```typescript
  export interface NavbarProps {
    onOpenCart?: () => void;
  }
  ```
- **Responsibility**: Top glassmorphism header with logo, section links, cart trigger badge, and mobile drawer menu toggle.

#### `Hero.tsx`
- **Props**: None (Self-contained presentation layout).
- **Responsibility**: Video background loop, title typography, call-to-action button, and key performance stats grid.

#### `SiteFooter.tsx`
- **Props**: None (Self-contained footer presentation layout).
- **Responsibility**: Copyright declaration and discrete `ACCESO ADMIN` link targeting `/admin/login`.

---

### 6.2 Catalog Components (`app/components/catalog/`)

#### `CatalogFilter.tsx`
- **Props**:
  ```typescript
  import { Brand } from '../../types/catalog';

  export interface CatalogFilterProps {
    selectedBrand: string; // 'all' | 'bugatti' | 'lamborghini' | 'ferrari'
    onSelectBrand: (brand: string) => void;
  }
  ```
- **Responsibility**: Renders tabbed buttons for brand selection (`TODAS LAS MARCAS`, `BUGATTI`, `LAMBORGHINI`, `FERRARI`) with active gold highlight.

#### `ProductCard.tsx`
- **Props**:
  ```typescript
  import { CatalogItem } from '../../types/catalog';

  export interface ProductCardProps {
    item: CatalogItem;
    onViewDetails: (item: CatalogItem) => void;
    onAddToCart: (item: CatalogItem) => void;
    formattedPrice: string;
  }
  ```
- **Responsibility**: Renders individual hypercar card containing vehicle brand badge, name, manufacturing year, HP, top speed, formatted price, details view button, and add to cart action button.

#### `CatalogGrid.tsx`
- **Props**:
  ```typescript
  import { CatalogItem } from '../../types/catalog';

  export interface CatalogGridProps {
    items: CatalogItem[];
    onViewDetails: (item: CatalogItem) => void;
    onAddToCart: (item: CatalogItem) => void;
    formatPrice: (priceUSD: number) => string;
  }
  ```
- **Responsibility**: Responsive CSS Grid layout displaying array of `ProductCard` components.

#### `CatalogModal.tsx`
- **Props**:
  ```typescript
  import { CatalogItem } from '../../types/catalog';

  export interface CatalogModalProps {
    item: CatalogItem | null;
    onClose: () => void;
    onAddToCart: (item: CatalogItem) => void;
    formattedPrice: string;
  }
  ```
- **Responsibility**: Detailed hypercar modal inspector showing specifications (power, top speed, manufacturing year, price) and primary acquisition trigger.

---

### 6.3 Cart Components (`app/components/cart/`)

#### `CartItemRow.tsx`
- **Props**:
  ```typescript
  import { CartItem } from '../../types/cart';

  export interface CartItemRowProps {
    item: CartItem;
    onRemove: (id: string) => void;
    formattedPrice: string;
  }
  ```
- **Responsibility**: Renders individual row inside the shopping cart drawer, including model name, brand tag, formatted price, quantity indicator, and deletion trigger.

#### `CartDrawer.tsx`
- **Props**: None (Consumes `useHypercarCart`).
- **Responsibility**: Slide-over drawer rendering cart items using `CartItemRow`, currency switcher buttons (`USD`, `EUR`, `GBP`, `AED`), subtotal calculation, and VIP checkout execution trigger.

---

### 6.4 Admin Components (`app/components/admin/`)

#### `DashboardAnalytics.tsx`
- **Props**:
  ```typescript
  import { DashboardMetrics } from '../../types/admin';

  export interface DashboardAnalyticsProps {
    metrics: DashboardMetrics;
  }
  ```
- **Responsibility**: Metric card dashboard displaying Total Inventory Value ($M USD), Active Units Count, Sales of the Month, and VIP Conversion Rate.

#### `CatalogTable.tsx`
- **Props**:
  ```typescript
  import { CatalogItem } from '../../types/catalog';

  export interface CatalogTableProps {
    items: CatalogItem[];
    onOpenCreate: () => void;
    onOpenEdit: (item: CatalogItem) => void;
    onRequestDelete: (item: CatalogItem) => void;
  }
  ```
- **Responsibility**: Management table rendering hypercar inventory rows with actions to create, edit, or delete items.

#### `AdminModals.tsx`
- **Props**:
  ```typescript
  import { CatalogItem } from '../../types/catalog';
  import { CatalogFormData, ConfirmModalState } from '../../types/admin';

  export interface AdminModalsProps {
    isCreateModalOpen: boolean;
    isEditModalOpen: boolean;
    confirmModal: ConfirmModalState;
    editingItem: CatalogItem | null;
    formData: CatalogFormData;
    setFormData: React.Dispatch<React.SetStateAction<CatalogFormData>>;
    onCloseCreate: () => void;
    onCloseEdit: () => void;
    onRequestConfirm: (action: 'create' | 'update' | 'delete', targetItem?: CatalogItem) => void;
    onCancelConfirm: () => void;
    onExecuteAction: () => void;
    onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
  ```
- **Responsibility**: Encapsulates both `ProductFormModal` (for creating/editing hypercars with image upload/URL support) and `ConfirmModal` (for double confirmation safety checks).

---

### 6.5 UI Shared Components (`app/components/ui/`)

#### `Icons.tsx`
- **Props & Signatures**:
  ```typescript
  export interface IconProps {
    className?: string;
  }

  export function ShoppingCartIcon(props: IconProps): React.JSX.Element;
  export function SparklesIcon(props: IconProps): React.JSX.Element;
  export function LockIcon(props: IconProps): React.JSX.Element;
  export function MenuIcon(props: IconProps): React.JSX.Element;
  export function CloseIcon(props: IconProps): React.JSX.Element;
  export function ChevronRightIcon(props: IconProps): React.JSX.Element;
  export function FolderIcon(props: IconProps): React.JSX.Element;
  export function AlertTriangleIcon(props: IconProps): React.JSX.Element;
  export function CarIcon(props: IconProps): React.JSX.Element;
  ```
- **Responsibility**: Pure SVG vector icon library replacing emoji graphics across the entire platform.

#### `ToastNotification.tsx`
- **Props**:
  ```typescript
  export interface ToastNotificationProps {
    message: string | null;
  }
  ```
- **Responsibility**: Floating feedback toast notification banner in the viewport.

---

## 7. Page Container Architecture & Flow

### 7.1 `app/layout.tsx`
- Injects global metadata, Google Geist fonts, Tailwind CSS v4 `globals.css`, and wraps root application children with `CartProvider`.

### 7.2 `app/page.tsx`
- Customer landing page container composing layout and catalog features cleanly:
```tsx
export default function Home() {
  return (
    <CartProvider>
      <MainLandingPage />
    </CartProvider>
  );
}
```
- `MainLandingPage` integrates `Navbar`, `Hero`, `CatalogFilter`, `CatalogGrid`, `CatalogModal`, `CartDrawer`, `ToastNotification`, and `SiteFooter`.

### 7.3 `app/admin/dashboard/page.tsx`
- Lightweight container managing inventory state (`items`), form modal state (`formData`), and confirmation state (`confirmModal`).
- Calculates `DashboardMetrics` dynamically and renders `DashboardAnalytics`, `CatalogTable`, and `AdminModals`.

---

## 8. Design Verification & Quality Criteria

1. **Type Verification**: Execute `npx tsc --noEmit` to verify 100% strict type safety across all components, hooks, types, and utility functions.
2. **Linter Compliance**: Execute `pnpm lint` to ensure zero ESLint errors or warnings.
3. **Zero Visual Regression**: Ensure exact visual fidelity for brand filter buttons, background video hero loop, cart slide-over drawer, currency conversions (USD, EUR, GBP, AED), and admin double-confirmation dialogs.
