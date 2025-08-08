import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { AppProvider } from '../../context/AppContext';
import App from '../../App';

// Mock the API service
vi.mock('../../services/api', () => ({
  getBusinesses: vi.fn(() => Promise.resolve([])),
  getEvents: vi.fn(() => Promise.resolve([])),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      <HashRouter>
        {component}
      </HashRouter>
    </AppProvider>
  );
};

describe('App', () => {
  it('renders without crashing', () => {
    renderWithProviders(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('displays header', () => {
    renderWithProviders(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays footer', () => {
    renderWithProviders(<App />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
