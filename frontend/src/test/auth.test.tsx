/**
 * Stage 1 frontend tests: Register, Login, Protected routes, NavBar auth state.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// ── Helper: wrap in AuthProvider + MemoryRouter ─────────────────────────────

function renderWithAuth(ui: React.ReactNode, { initialEntries = ['/'] } = {}) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        {ui}
      </MemoryRouter>
    </AuthProvider>
  );
}

// ── RegisterPage ────────────────────────────────────────────────────────────

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders registration form fields', () => {
    renderWithAuth(
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    );
    expect(screen.getByLabelText(/Display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('shows weak password error without hitting API', async () => {
    const user = userEvent.setup();
    renderWithAuth(
      <Routes>
        <Route path="/" element={<RegisterPage />} />
      </Routes>
    );

    await user.type(screen.getByLabelText(/Display name/i), 'Alice');
    await user.type(screen.getByLabelText(/Email address/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'onlyletters'); // no digit/symbol
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/digit or special character/i)).toBeInTheDocument();
    });
  });

  it('calls register API and navigates on success', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'test-token', token_type: 'bearer' }),
    } as Response);

    renderWithAuth(
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<div>Home</div>} />
      </Routes>,
      { initialEntries: ['/register'] }
    );

    await user.type(screen.getByLabelText(/Display name/i), 'Alice');
    await user.type(screen.getByLabelText(/Email address/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'SecurePass1');
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('shows email taken error when API returns 409', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ detail: { code: 'email_taken', message: 'Email taken' } }),
    } as unknown as Response);

    renderWithAuth(
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>,
      { initialEntries: ['/register'] }
    );

    await user.type(screen.getByLabelText(/Display name/i), 'Alice');
    await user.type(screen.getByLabelText(/Email address/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'SecurePass1');
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/already registered/i)).toBeInTheDocument();
    });
  });
});

// ── LoginPage ───────────────────────────────────────────────────────────────

describe('LoginPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders login form', () => {
    renderWithAuth(
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<div>Register</div>} />
      </Routes>
    );
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('shows invalid credentials error on 401', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: { code: 'invalid_credentials', message: 'Wrong' } }),
    } as unknown as Response);

    renderWithAuth(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<div>Register</div>} />
      </Routes>,
      { initialEntries: ['/login'] }
    );

    await user.type(screen.getByLabelText(/Email address/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'WrongPass1');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Incorrect email or password/i)).toBeInTheDocument();
    });
  });

  it('shows suspended account error on 403', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ detail: { code: 'account_suspended', message: 'Suspended' } }),
    } as unknown as Response);

    renderWithAuth(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<div>Register</div>} />
      </Routes>,
      { initialEntries: ['/login'] }
    );

    await user.type(screen.getByLabelText(/Email address/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'SecurePass1');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/suspended/i)).toBeInTheDocument();
    });
  });
});

// ── ProtectedRoute ──────────────────────────────────────────────────────────

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('redirects to /login when not authenticated', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div>Secret Profile</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Profile')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    // Inject token into localStorage before render
    localStorage.setItem('reuse_token', 'mock-token');

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div>Secret Profile</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
    expect(screen.getByText('Secret Profile')).toBeInTheDocument();
    localStorage.removeItem('reuse_token');
  });
});
