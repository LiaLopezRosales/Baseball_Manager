import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the sidebar with Inicio option', () => {
  render(<App />);
  expect(screen.getByText('Inicio')).toBeInTheDocument();
});

test('renders the main page welcome heading', () => {
  render(<App />);
  expect(screen.getByText(/Bienvenido a la Plataforma de Gestión/i)).toBeInTheDocument();
});
