// frontend/src/components/UserDashboard.test.jsx
// WP5 - "Tu panel": con sesion consulta /api/user/dashboard/ y pinta el panel
// (equipo, radar del favorito) usando la API; sin sesion no consulta la API
// ni pinta el panel. RadarChart real usa echarts (canvas) -> mock con stub.
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserDashboard from './UserDashboard';
import { apiGet } from '../api';

jest.mock('../api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiDelete: jest.fn(),
}));

jest.mock('./ui/RadarChart', () =>
  function StubRadar({ stats }) {
    return (
      <div data-testid="radar-stub" data-labels={stats.map((s) => s.label).join(',')}>
        Radar stub ({stats.length} ejes: {stats.map((s) => s.label).join(', ')})
      </div>
    );
  }
);

function seedDashboard() {
  return {
    favorite_team: { id: 3, name: 'Sacramento Republic' },
    favorite_players: [
      { id: 55, name: 'Javier Lopez', batting_average: '0.313', experience: 12 },
    ],
    recent_games: [
      { game_id: 11, date: '2026-09-14', rival_initials: 'SAC', local_score: 5, rival_score: 2 },
    ],
  };
}

function wrap(ui) {
  return <MemoryRouter>{ui}</MemoryRouter>;
}

describe('UserDashboard (WP5)', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('sin sesion: no consulta la API ni pinta el panel', () => {
    render(wrap(<UserDashboard />));
    expect(apiGet).not.toHaveBeenCalled();
    expect(screen.queryByText('Tu panel')).not.toBeInTheDocument();
  });

  it('con sesion: consulta la API y pinta el panel con el radar del favorito', async () => {
    localStorage.setItem('token', 'tok-lia');
    apiGet.mockResolvedValue(seedDashboard());

    render(wrap(<UserDashboard />));

    expect(await screen.findByText('Tu panel')).toBeInTheDocument();
    expect(screen.getByText(/Sacramento Republic/)).toBeInTheDocument();
    expect(apiGet).toHaveBeenCalledWith('/api/user/dashboard/');

    const radar = screen.getByTestId('radar-stub');
    expect(radar.dataset.labels).toContain('Bateo');
  });
});
