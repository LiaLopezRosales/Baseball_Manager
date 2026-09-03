import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the sidebar with Inicio option', () => {
  render(<App />);
  expect(screen.getByText('Inicio')).toBeInTheDocument();
});

test('renders the main page welcome subtitle', () => {
  render(<App />);
  expect(
    screen.getByText(/Datos, estadísticas y gestión en tiempo real/i)
  ).toBeInTheDocument();
});
