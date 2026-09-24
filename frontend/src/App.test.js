import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the landing navigation', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument();
});

test('renders the register call to action for guests', () => {
  render(<App />);
  expect(
    screen.getByRole('button', { name: 'Crear Cuenta' })
  ).toBeInTheDocument();
});
