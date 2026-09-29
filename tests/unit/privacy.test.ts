import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextRequest } from 'next/server';

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

import { prisma } from '@/app/lib/prisma';
import { POST } from '@/app/api/privacy/request/route';
import { CookieBanner } from '@/app/components/ui/CookieBanner';

describe('Privacy & Data Rights API: POST /api/privacy/request (GDPR / Ley 21.719)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid or missing email format with HTTP 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/privacy/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', action: 'export' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/correo electrónico válido/i);
  });

  it('Threat Matrix Case 1 (Anti-Enumeration): returns 200 with standard structure whether email exists or not', async () => {
    vi.mocked(prisma.order.findMany).mockResolvedValueOnce([] as never);

    const req = new NextRequest('http://localhost:3000/api/privacy/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unknown@example.com', action: 'export' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.email).toBe('unknown@example.com');
    expect(Array.isArray(json.orders)).toBe(true);
    expect(json.orders).toHaveLength(0);
  });

  it('Threat Matrix Case 3 (Right to Erasure): anonymizes customerEmail in orders without deleting fiscal records', async () => {
    vi.mocked(prisma.order.updateMany).mockResolvedValueOnce({ count: 2 } as never);

    const req = new NextRequest('http://localhost:3000/api/privacy/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'client@example.com', action: 'delete' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.recordsAffected).toBe(2);

    expect(prisma.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { customerEmail: 'client@example.com' },
        data: expect.objectContaining({
          customerEmail: expect.stringMatching(/^anonymized_.+@vault\.invalid$/),
        }),
      })
    );
  });

  it('Threat Matrix Case 2 (Rate Limiting DoS guard): enforces sliding-window limit returning HTTP 429 when exceeded', async () => {
    vi.mocked(prisma.order.findMany).mockResolvedValue([] as never);
    const testIp = '198.51.100.42';

    let lastRes;
    for (let i = 0; i < 62; i++) {
      const req = new NextRequest('http://localhost:3000/api/privacy/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': testIp,
        },
        body: JSON.stringify({ email: 'client@example.com', action: 'export' }),
      });
      lastRes = await POST(req);
    }

    expect(lastRes?.status).toBe(429);
    const json = await lastRes?.json();
    expect(json.error).toMatch(/too many requests/i);
  });
});

describe('CookieBanner Component (GDPR & Ley 21.719 Compliance)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders with equal prominence buttons for accepting and rejecting when no consent is stored', () => {
    render(React.createElement(CookieBanner));

    const acceptBtn = screen.getByRole('button', { name: /ACEPTAR TODO/i });
    const rejectBtn = screen.getByRole('button', { name: /RECHAZAR NO ESENCIALES/i });

    expect(acceptBtn).toBeInTheDocument();
    expect(rejectBtn).toBeInTheDocument();
  });

  it('persists analytics: true to localStorage when Aceptar Todo is clicked', () => {
    render(React.createElement(CookieBanner));

    const acceptBtn = screen.getByRole('button', { name: /ACEPTAR TODO/i });
    fireEvent.click(acceptBtn);

    const saved = localStorage.getItem('vault_cookie_consent');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.essential).toBe(true);
    expect(parsed.analytics).toBe(true);
    expect(parsed.version).toBe('1.0');
  });

  it('persists analytics: false to localStorage when Rechazar No Esenciales is clicked', () => {
    render(React.createElement(CookieBanner));

    const rejectBtn = screen.getByRole('button', { name: /RECHAZAR NO ESENCIALES/i });
    fireEvent.click(rejectBtn);

    const saved = localStorage.getItem('vault_cookie_consent');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.essential).toBe(true);
    expect(parsed.analytics).toBe(false);
  });
});
