import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductCard from '@/app/components/catalog/ProductCard';
import { CatalogItem } from '@/app/types/catalog';

const mockItemInStock: CatalogItem = {
  id: 'car-1',
  name: 'Chiron Super Sport',
  brand: 'Bugatti',
  year: '2024',
  power: '1,600 HP',
  topSpeed: '440 km/h',
  priceUSD: 3800000,
  status: 'Disponible',
  stock: 3,
  description: 'Hiperauto exclusivo',
  image: '/images/chiron.jpg',
};

const mockItemLastUnit: CatalogItem = {
  ...mockItemInStock,
  id: 'car-2',
  stock: 1,
};

const mockItemOutOfStock: CatalogItem = {
  ...mockItemInStock,
  id: 'car-3',
  stock: 0,
};

describe('ProductCard component', () => {
  it('renders hypercar item details and formatted price correctly', () => {
    const onAddToCart = vi.fn();
    const onInspectItem = vi.fn();

    render(
      <ProductCard
        item={mockItemInStock}
        formattedPrice="$3,800,000"
        onAddToCart={onAddToCart}
        onInspectItem={onInspectItem}
      />
    );

    expect(screen.getByText('Bugatti')).toBeInTheDocument();
    expect(screen.getByText('Chiron Super Sport')).toBeInTheDocument();
    expect(screen.getByText('MODELO 2024')).toBeInTheDocument();
    expect(screen.getByText('1,600 HP')).toBeInTheDocument();
    expect(screen.getByText('440 km/h')).toBeInTheDocument();
    expect(screen.getByText('$3,800,000')).toBeInTheDocument();
  });

  it('renders stock badge and enabled button for in-stock item', () => {
    const onAddToCart = vi.fn();
    const onInspectItem = vi.fn();

    render(
      <ProductCard
        item={mockItemInStock}
        formattedPrice="$3,800,000"
        onAddToCart={onAddToCart}
        onInspectItem={onInspectItem}
      />
    );

    expect(screen.getByText('Stock: 3 u.')).toBeInTheDocument();
    const addButton = screen.getByRole('button', { name: /AÑADIR AL CARRITO/i });
    expect(addButton).not.toBeDisabled();
  });

  it('renders last unit warning badge for item with stock = 1', () => {
    render(
      <ProductCard
        item={mockItemLastUnit}
        formattedPrice="$3,800,000"
        onAddToCart={vi.fn()}
        onInspectItem={vi.fn()}
      />
    );

    expect(screen.getByText('¡Última unidad!')).toBeInTheDocument();
  });

  it('renders out-of-stock indicator and disabled button for item with stock = 0', () => {
    render(
      <ProductCard
        item={mockItemOutOfStock}
        formattedPrice="$3,800,000"
        onAddToCart={vi.fn()}
        onInspectItem={vi.fn()}
      />
    );

    const outOfStockElements = screen.getAllByText('AGOTADO');
    expect(outOfStockElements.length).toBeGreaterThanOrEqual(1);
    const disabledButton = screen.getByRole('button', { name: /AGOTADO/i });
    expect(disabledButton).toBeDisabled();
  });

  it('triggers onAddToCart and onInspectItem callbacks when clicked', () => {
    const onAddToCart = vi.fn();
    const onInspectItem = vi.fn();

    render(
      <ProductCard
        item={mockItemInStock}
        formattedPrice="$3,800,000"
        onAddToCart={onAddToCart}
        onInspectItem={onInspectItem}
      />
    );

    const addButton = screen.getByRole('button', { name: /AÑADIR AL CARRITO/i });
    fireEvent.click(addButton);
    expect(onAddToCart).toHaveBeenCalledWith(mockItemInStock);

    const inspectButton = screen.getByRole('button', { name: /Ver detalles/i });
    fireEvent.click(inspectButton);
    expect(onInspectItem).toHaveBeenCalledWith(mockItemInStock);
  });
});
