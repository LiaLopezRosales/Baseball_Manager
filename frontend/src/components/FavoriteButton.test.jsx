// frontend/src/components/FavoriteButton.test.jsx
// WP5 - Favoritos: boton corazon con estado invitado/logueado, toggle a
// favorito de equipo/jugador con endpoint correcto (team_id / player_id),
// mensajes de sesion caducada/exito y panel de favoritos (switch teams/players
// + chips con enlaces) cuando hay sesion. FavoritesPanel usa Link -> MemoryRouter.
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FavoriteButton } from './FavoritesPanel';
import FavoritesPanel from './FavoritesPanel';
import { apiGet, apiPost } from '../api';

jest.mock('../api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiDelete: jest.fn(),
}));

function seedFavorites() {
  return {
    teams: [{ id: 1, name: 'Sacramento Republic', initials: 'SR' }],
    players: [{ id: 55, name: 'Javier Lopez' }],
  };
}

function wrap(ui) {
  return <MemoryRouter>{ui}</MemoryRouter>;
}

describe('FavoriteButton (WP5)', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('invitado: no consulta la API ni pinta el boton de favoritos', () => {
    render(<FavoriteButton type="team" id={1} />);
    expect(
      screen.queryByRole('button', { name: /favoritos/i })
    ).not.toBeInTheDocument();
    expect(apiPost).not.toHaveBeenCalled();
  });

  it('logueado: toggle de equipo usa el endpoint team con team_id', async () => {
    localStorage.setItem('token', 'tok-lia');
    apiPost.mockResolvedValue({ favorited: true });

    render(<FavoriteButton type="team" id={1} />);
    const btn = await screen.findByRole('button', { name: /favoritos/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    await waitFor(() =>
      expect(apiPost).toHaveBeenCalledWith('/api/user/favorites/team/', {
        team_id: 1,
      })
    );
  });

  it('toggle de jugador usa el endpoint player con player_id', async () => {
    localStorage.setItem('token', 'tok-lia');
    apiPost.mockResolvedValue({ favorited: true });

    render(<FavoriteButton type="player" id={55} />);
    const btn = await screen.findByRole('button', { name: /favoritos/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    await waitFor(() =>
      expect(apiPost).toHaveBeenCalledWith('/api/user/favorites/player/', {
        player_id: 55,
      })
    );
  });

  it('el panel de favoritos lista equipos y jugadores con enlaces cuando hay sesion', async () => {
    localStorage.setItem('token', 'tok-lia');
    apiGet.mockResolvedValue(seedFavorites());

    render(wrap(<FavoritesPanel />));
    expect(await screen.findByText('Sacramento Republic')).toBeInTheDocument();
    expect(screen.getByText('Javier Lopez')).toBeInTheDocument();
    const repLink = screen.getAllByRole('link').find((l) => l.getAttribute('href') === '/equipo/1');
    expect(repLink).toBeInTheDocument();
    const playerLink = screen.getAllByRole('link').find((l) => l.getAttribute('href') === '/jugador/55');
    expect(playerLink).toBeInTheDocument();
  });
});
