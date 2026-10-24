import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/FormControls';
import { Checkbox } from '../components/common/FormControls';
import { Toast } from '../components/common/Toast';
import { Card } from '../components/common/Card';
import { getMe, patchMe, type UserMe, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { authStrings } from '../authStrings';

const s = authStrings.profile;

export const ProfilePage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable fields
  const [displayName, setDisplayName] = useState('');
  const [isArtist, setIsArtist] = useState(false);
  const [isRagPicker, setIsRagPicker] = useState(false);
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [homeAreaLabel, setHomeAreaLabel] = useState('');

  useEffect(() => {
    if (!token) return;
    getMe(token)
      .then((data) => {
        setUser(data);
        setDisplayName(data.display_name);
        setIsArtist(data.is_artist);
        setIsRagPicker(data.is_rag_picker);
        setIsDiscoverable(data.is_discoverable);
        setHomeAreaLabel(data.home_area_label ?? '');
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          navigate('/login');
        } else {
          setErrorMsg('Failed to load profile.');
        }
      })
      .finally(() => setLoading(false));
  }, [token, logout, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const updated = await patchMe(token, {
        display_name: displayName,
        is_artist: isArtist,
        is_rag_picker: isRagPicker,
        is_discoverable: isDiscoverable,
        home_area_label: homeAreaLabel || undefined,
      });
      setUser(updated);
      setEditing(false);
      setSuccessMsg('Profile updated.');
    } catch {
      setErrorMsg(s.errors.generic);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-body text-stone-400 animate-pulse">Loading profile…</p>
      </div>
    );
  }

  if (!user) return null;

  const memberYear = new Date(user.created_at).getFullYear();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <PageHeader
        title={s.title}
        action={
          <div className="flex gap-2">
            {!editing && (
              <Button id="profile-edit-btn" variant="secondary" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
            <Button id="profile-logout-btn" variant="quiet" onClick={handleLogout}>
              {s.logoutBtn}
            </Button>
          </div>
        }
      />

      {!editing ? (
        // ── View mode ───────────────────────────────────────────────────────
        <Card padding="lg" className="mt-8 space-y-5">
          {/* Name and badges */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-h3 font-heading text-earth">{user.display_name}</h2>
              <p className="text-body-sm text-stone-400 mt-0.5">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {user.is_admin && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-caption font-medium border bg-info-light text-info-text border-info/30">Admin</span>
              )}
              {user.is_artist && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-caption font-medium border bg-success-light text-success-text border-success/30">Artist</span>
              )}
              {user.is_rag_picker && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-caption font-medium border bg-beige-100 text-earth-100 border-beige-200">Rag picker</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="border-t border-beige-200 pt-4 flex gap-8">
            <div>
              <p className="text-caption text-stone-400 uppercase tracking-wide">
                {s.completedExchanges}
              </p>
              <p className="text-h3 font-heading text-earth mt-0.5">0</p>
            </div>
            <div>
              <p className="text-caption text-stone-400 uppercase tracking-wide">{s.memberSince}</p>
              <p className="text-h3 font-heading text-earth mt-0.5">{memberYear}</p>
            </div>
          </div>

          {/* Area */}
          {user.home_area_label && (
            <div className="border-t border-beige-200 pt-4">
              <p className="text-body-sm text-stone-400">
                📍 {user.home_area_label}
              </p>
            </div>
          )}

          {/* Discoverable */}
          <div className="border-t border-beige-200 pt-4">
            <p className="text-body-sm text-stone-400">
              {user.is_discoverable ? '🔍 Visible in discovery search' : '👁 Hidden from discovery'}
            </p>
          </div>
        </Card>
      ) : (
        // ── Edit mode ───────────────────────────────────────────────────────
        <form id="profile-edit-form" onSubmit={handleSave} className="mt-8 space-y-5">
          <Card padding="lg" className="space-y-5">
            <Input
              id="profile-display-name"
              label={s.displayNameLabel}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />

            <Input
              id="profile-home-area"
              label={s.homeAreaLabel}
              placeholder={s.homeAreaPlaceholder}
              value={homeAreaLabel}
              onChange={(e) => setHomeAreaLabel(e.target.value)}
            />

            <fieldset className="space-y-3 pt-1">
              <legend className="text-body-sm font-medium text-earth mb-2">Roles</legend>
              <Checkbox
                id="profile-is-artist"
                label={s.artistLabel}
                checked={isArtist}
                onChange={(e) => setIsArtist(e.target.checked)}
              />
              <Checkbox
                id="profile-is-rag-picker"
                label={s.ragPickerLabel}
                checked={isRagPicker}
                onChange={(e) => setIsRagPicker(e.target.checked)}
              />
              <Checkbox
                id="profile-is-discoverable"
                label={s.discoverableLabel}
                description="Lets other users find you in mentions and recommendations."
                checked={isDiscoverable}
                onChange={(e) => setIsDiscoverable(e.target.checked)}
              />
            </fieldset>

            <div className="flex gap-3 pt-2 border-t border-beige-200">
              <Button
                id="profile-save-btn"
                type="submit"
                variant="primary"
                isLoading={saving}
              >
                {s.saveBtn}
              </Button>
              <Button
                id="profile-cancel-btn"
                type="button"
                variant="secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </form>
      )}

      {successMsg && (
        <Toast type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />
      )}
      {errorMsg && (
        <Toast type="error" message={errorMsg} onDismiss={() => setErrorMsg(null)} />
      )}
    </div>
  );
};
