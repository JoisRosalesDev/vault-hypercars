import React, { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAccessibleDialog } from '@/app/hooks/useAccessibleDialog';
import { AdminModals } from '@/app/components/admin/AdminModals';

function TestDialogComponent({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useAccessibleDialog({ isOpen, onClose, dialogRef });

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      data-testid="test-dialog"
    >
      <h2 id="dialog-title">Diálogo de Prueba</h2>
      <button data-testid="first-btn">Primer Botón</button>
      <input data-testid="test-input" placeholder="Escribe aquí" />
      <button data-testid="last-btn" onClick={onClose}>Cerrar</button>
    </div>
  );
}

describe('Accessibility Foundation: useAccessibleDialog hook', () => {
  it('calls onClose when Escape key is pressed while dialog is open', () => {
    const handleClose = vi.fn();
    render(<TestDialogComponent isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('cycles focus back to first element when Tab is pressed on last element', () => {
    const handleClose = vi.fn();
    render(<TestDialogComponent isOpen={true} onClose={handleClose} />);

    const firstBtn = screen.getByTestId('first-btn');
    const lastBtn = screen.getByTestId('last-btn');

    lastBtn.focus();
    expect(document.activeElement).toBe(lastBtn);

    fireEvent.keyDown(lastBtn, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(firstBtn);
  });

  it('cycles focus back to last element when Shift+Tab is pressed on first element', () => {
    const handleClose = vi.fn();
    render(<TestDialogComponent isOpen={true} onClose={handleClose} />);

    const firstBtn = screen.getByTestId('first-btn');
    const lastBtn = screen.getByTestId('last-btn');

    firstBtn.focus();
    expect(document.activeElement).toBe(firstBtn);

    fireEvent.keyDown(firstBtn, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(lastBtn);
  });
});

describe('AdminModals Form Accessibility (WCAG 2.2 / EAA)', () => {
  it('programmatically associates all form controls with their visible labels in Create Modal', () => {
    const mockFormData = {
      brand: 'Bugatti' as const,
      name: 'Chiron',
      year: '2026',
      power: '1,500 HP',
      topSpeed: '420 km/h',
      priceUSD: 3000000,
      currency: 'USD' as const,
      status: 'Disponible' as const,
      stock: 1,
      description: 'Test description',
      image: 'https://example.com/car.jpg'
    };

    render(
      <AdminModals
        isCreateOpen={true}
        isEditOpen={false}
        editingItem={null}
        formData={mockFormData}
        setFormData={vi.fn()}
        confirmModal={{ isOpen: false, action: null, targetItem: null }}
        onCloseCreate={vi.fn()}
        onCloseEdit={vi.fn()}
        onRequestConfirm={vi.fn()}
        onExecuteConfirm={vi.fn()}
        onCancelConfirm={vi.fn()}
        handleImageFileChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/MARCA/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/MODELO DE HIPERAUTO/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/AÑO DE FABRICACIÓN/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/POTENCIA \(HP\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/VELOCIDAD MÁXIMA/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PRECIO DE VENTA \(USD\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/IMAGEN DEL VEHÍCULO/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ESTADO DE DISPONIBILIDAD/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/UNIDADES EN INVENTARIO \(STOCK\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/DESCRIPCIÓN DETALLADA/i)).toBeInTheDocument();
  });
});
