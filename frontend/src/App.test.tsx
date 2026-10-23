import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App & Home Page (Stage 0)', () => {
  it('renders the top navigation bar with brand and links', () => {
    render(<App />);
    expect(screen.getByText('Reuse Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Nearby')).toBeInTheDocument();
    expect(screen.getByText('Styleguide')).toBeInTheDocument();
  });

  it('renders the hero title and style guide link', () => {
    render(<App />);
    expect(
      screen.getByText(/Giving discarded objects a second thoughtful life/i)
    ).toBeInTheDocument();
    expect(screen.getByText('View Style Guide')).toBeInTheDocument();
  });

  it('renders health check status indicator and resolves connected state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', version: '0.1.0' }),
    } as Response);

    render(<App />);
    expect(screen.getByText(/Checking backend connection/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Backend operational/i)).toBeInTheDocument();
    });
  });
});
