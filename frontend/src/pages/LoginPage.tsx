import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '../components/common/FormControls';
import { Button } from '../components/common/Button';
import { PageHeader } from '../components/common/PageHeader';
import { Toast } from '../components/common/Toast';
import { login as apiLogin, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { authStrings } from '../authStrings';
import { SketchHeroReuse } from '../components/sketches/SketchIcons';

const s = authStrings.login;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const data = await apiLogin({ email, password });
      login(data.access_token);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'invalid_credentials') {
          setErrorMsg(s.errors.invalidCredentials);
        } else if (err.code === 'account_suspended') {
          setErrorMsg(s.errors.suspended);
        } else {
          setErrorMsg(s.errors.generic);
        }
      } else {
        setErrorMsg(s.errors.generic);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        {/* Sketch accent */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-ivory-200 rounded-full border border-beige-200 shadow-paper">
            <SketchHeroReuse size={48} className="text-clay-300" />
          </div>
        </div>

        <PageHeader
          title={s.title}
          subtitle={s.subtitle}
        />

        <form
          id="login-form"
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 bg-ivory-50 border border-beige-200 rounded-md p-6 shadow-paper"
          noValidate
        >
          <Input
            id="login-email"
            label={s.emailLabel}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            id="login-password"
            label={s.passwordLabel}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <Button
            id="login-submit"
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full mt-2"
          >
            {s.submitBtn}
          </Button>

          <p className="text-body-sm text-center text-stone-400 pt-1">
            <Link
              to="/register"
              className="text-clay-400 hover:text-clay-500 underline focus-visible:outline-clay-300"
            >
              {s.registerLink}
            </Link>
          </p>
        </form>
      </div>

      {errorMsg && (
        <Toast type="error" message={errorMsg} onDismiss={() => setErrorMsg(null)} />
      )}
    </div>
  );
};
