// Baseball_Management/src/components/NotificationBell.test.jsx
// WP5 - Campana de notificaciones: invitado no consulta ni pinta la campana;
// logueado pinta badge con no leidas, despliega el dropdown, marca una
// notificacion (endpoint /read/) y "Marcar leidas" llama a /read-all/.
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationBell from './NotificationBell';
import { apiGet, apiPost } from '../api';

jest.mock('../api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiDelete: jest.fn(),
}));

function seedNotifications() {
  return {
    notifications: [
      { id: 1, message: 'Tu equipo gano 5-2. Revisa el boletin.', is_read: false, created_at: '2026-09-20T10:00:00Z' },
      { id: 2, message: 'Nuevo juego agendado.', is_read: true, created_at: '2026-09-19T09:00:00Z' },
    ],
    unread_count: 1,
  };
}

describe('NotificationBell (WP5)', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('invitado: no consulta la API ni pinta la campana', () => {
    render(<NotificationBell />);
    expect(
      screen.queryByRole('button', { name: /notificaciones/i })
    ).not.toBeInTheDocument();
    expect(apiGet).not.toHaveBeenCalled();
  });

  it('logueado: badge de no leidas y dropdown lista notificaciones', async () => {
    localStorage.setItem('token', 'tok-lia');
    apiGet.mockResolvedValue(seedNotifications());

    render(<NotificationBell />);
    const bell = screen.getByRole('button', { name: /notificaciones/i });
    expect(await screen.findByText('1')).toBeInTheDocument();

    fireEvent.click(bell);
    expect(await screen.findByText('Tu equipo gano 5-2. Revisa el boletin.')).toBeInTheDocument();
    expect(screen.getByText('Nuevo juego agendado.')).toBeInTheDocument();
  });

  it('marcar una notificacion usa el endpoint /read/ de esa notificacion', async () => {
    localStorage.setItem('token', 'tok-lia');
    apiGet.mockResolvedValue(seedNotifications());
    apiPost.mockResolvedValue({ ok: true });

    render(<NotificationBell />);
    const bell = screen.getByRole('button', { name: /notificaciones/i });
    fireEvent.click(bell);
    const item = await screen.findByText('Tu equipo gano 5-2. Revisa el boletin.');
    fireEvent.click(item);
    await waitFor(() =>
      expect(apiPost).toHaveBeenCalledWith('/api/notifications/1/read/')
    );
  });

  it('"Marcar leidas" llama a /read-all/', async () => {
    localStorage.setItem('token', 'tok-lia');
    apiGet.mockResolvedValue(seedNotifications());
    apiPost.mockResolvedValue({ ok: true });

    render(<NotificationBell />);
    const bell = screen.getByRole('button', { name: /notificaciones/i });
    fireEvent.click(bell);
    fireEvent.click(await screen.findByText(/Marcar le/));
    expect(apiPost).toHaveBeenCalledWith('/api/notifications/read-all/');
  });
});
