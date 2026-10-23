import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/common/FormControls';
import { Button } from '../components/common/Button';
import { Checkbox } from '../components/common/FormControls';
import { PageHeader } from '../components/common/PageHeader';
import { Toast } from '../components/common/Toast';
import { register as apiRegister, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { authStrings } from '../authStrings';
import { SketchHeroReuse } from '../components/sketches/SketchIcons';

const s = authStrings.register;

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isArtist, setIsArtist] = useState(false);
  const [isRagPicker, setIsRagPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Client-side password strength check (mirrors EC1.2)
  const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return s.errors.weakPassword;
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNonAlpha = /[^a-zA-Z]/.test(pw);
    if (!hasLetter || !hasNonAlpha) return s.errors.weakPassword;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const pwErr = validatePassword(password);
    if (pwErr) {
      setErrorMsg(pwErr);
      return;
    }

    setLoading(true);
    try {
      const data = await apiRegister({
        email,
        password,
        display_name: displayName,
        is_artist: isArtist,
        is_rag_picker: isRagPicker,
      });
      login(data.access_token);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'email_taken') {
          setErrorMsg(s.errors.emailTaken);
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
    <div className="min-h-screen bg-ivory flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-md">
        {/* Sketch accent */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-ivory-200 rounded-full border border-beige-200 shadow-paper">
            <SketchHeroReuse size={48} className="text-clay-300" />
          </div>
        </div>

        <PageHeader title={s.title} subtitle={s.subtitle} />

        <form
          id="register-form"
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 bg-ivory-50 border border-beige-200 rounded-md p-6 shadow-paper"
          noValidate
        >
          <Input
            id="register-display-name"
            label={s.displayNameLabel}
            placeholder={s.displayNamePlaceholder}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
            required
          />
          <Input
            id="register-email"
            label={s.emailLabel}
            type="email"
            placeholder={s.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            id="register-password"
            label={s.passwordLabel}
            type="password"
            placeholder={s.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <fieldset className="space-y-3 pt-1">
            <legend className="text-body-sm font-medium text-earth mb-2">I am…</legend>
            <Checkbox
              id="register-is-artist"
              label={s.artistLabel}
              checked={isArtist}
              onChange={(e) => setIsArtist(e.target.checked)}
            />
            <Checkbox
              id="register-is-rag-picker"
              label={s.ragPickerLabel}
              checked={isRagPicker}
              onChange={(e) => setIsRagPicker(e.target.checked)}
            />
          </fieldset>

          <Button
            id="register-submit"
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
              to="/login"
              className="text-clay-400 hover:text-clay-500 underline focus-visible:outline-clay-300"
            >
              {s.loginLink}
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
