import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { strings } from '../strings';
import { SketchHeroReuse, SketchWood, SketchMetal, SketchTextile } from '../components/sketches/SketchIcons';

interface HealthData {
  status: string;
  version: string;
}

export const HomePage: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    fetch(`${apiUrl}/healthz`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: HealthData) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to connect');
        setLoading(false);
      });
  }, [apiUrl]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-left">
      {/* Hero section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-beige-100 text-stone-500 text-caption border border-beige-200">
            <span className="w-2 h-2 rounded-full bg-sage-300" />
            <span>Launch City Community Beta</span>
          </div>

          <h1 className="text-display font-heading text-earth">
            Giving discarded objects a second thoughtful life.
          </h1>

          <p className="text-body-lg text-earth-100 max-w-xl">
            A quiet marketplace where residents, artists, makers, and rag pickers share, buy, and
            donate unused materials for creative reuse and zero-waste upcycling.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <NavLink to="/nearby">
              <Button variant="primary" size="lg">
                Explore Materials Nearby
              </Button>
            </NavLink>
            <NavLink to="/styleguide">
              <Button variant="secondary" size="lg">
                View Style Guide
              </Button>
            </NavLink>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <div className="p-8 bg-ivory-50 rounded-lg border border-beige-200 shadow-card flex flex-col items-center text-center">
            <SketchHeroReuse size={140} className="text-clay-300 mb-4" />
            <span className="font-heading text-h3 text-earth">Wabi-Sabi Aesthetic</span>
            <p className="text-body-sm text-stone-400 mt-2 max-w-xs">
              Handcrafted, sustainable, and organic. Celebrating textures, repair, and creative
              materials.
            </p>
          </div>
        </div>
      </div>

      {/* Backend connection status badge */}
      <div className="mb-12">
        <Card padding="md" className="max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full ${
                  loading
                    ? 'bg-warning-light animate-pulse'
                    : health?.status === 'ok'
                    ? 'bg-success'
                    : 'bg-error'
                }`}
              />
              <div>
                <p className="text-body-sm font-semibold text-earth">
                  {loading
                    ? strings.health.checking
                    : health?.status === 'ok'
                    ? strings.health.connected
                    : strings.health.error}
                </p>
                <p className="text-caption text-stone-400 font-mono">
                  {apiUrl}/healthz
                </p>
              </div>
            </div>
            {health && (
              <span className="text-caption font-mono bg-beige-100 px-2 py-1 rounded text-stone-500">
                v{health.version}
              </span>
            )}
            {error && (
              <span className="text-caption text-error-text font-mono">
                {error}
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Material Categories Showcase */}
      <section className="mb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-h2 font-heading text-earth">Featured Material Streams</h2>
            <p className="text-body-sm text-stone-400 mt-1">
              Connect directly with residents and creators sharing salvageable resources.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverable padding="md" className="flex items-start gap-4">
            <div className="p-3 bg-beige-100 rounded text-clay-400 shrink-0">
              <SketchWood size={32} />
            </div>
            <div>
              <h3 className="text-h4 font-heading text-earth">Reclaimed Wood & Timber</h3>
              <p className="text-body-sm text-stone-400 mt-1">
                Hardwood pallets, cedar offcuts, vintage flooring, and carpentry salvage.
              </p>
            </div>
          </Card>

          <Card hoverable padding="md" className="flex items-start gap-4">
            <div className="p-3 bg-beige-100 rounded text-clay-400 shrink-0">
              <SketchMetal size={32} />
            </div>
            <div>
              <h3 className="text-h4 font-heading text-earth">Metal & Hardware</h3>
              <p className="text-body-sm text-stone-400 mt-1">
                Copper piping, brass hardware, steel offcuts, and antique wire spools.
              </p>
            </div>
          </Card>

          <Card hoverable padding="md" className="flex items-start gap-4">
            <div className="p-3 bg-beige-100 rounded text-clay-400 shrink-0">
              <SketchTextile size={32} />
            </div>
            <div>
              <h3 className="text-h4 font-heading text-earth">Textiles & Fabrics</h3>
              <p className="text-body-sm text-stone-400 mt-1">
                Denim remnants, upholstery swatches, canvas drop cloths, and yarn spools.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
