import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { strings } from '../strings';
import {
  SketchHeroReuse,
  SketchWood,
  SketchMetal,
  SketchTextile,
  SketchPaper,
} from '../components/sketches/SketchIcons';

interface HealthData {
  status: string;
  version: string;
}

const materialHighlights = [
  {
    title: 'Reclaimed wood',
    description: 'Pallet strips, cedar scraps, and offcuts for furniture makers and home improvers.',
    icon: SketchWood,
  },
  {
    title: 'Metal hardware',
    description: 'Brass fittings, copper pipe, steel stock, and small repair parts with new life ahead.',
    icon: SketchMetal,
  },
  {
    title: 'Textiles & thread',
    description: 'Fabric remnants, canvas, denim, and yarn for makers who see value in the material.',
    icon: SketchTextile,
  },
];

const impactStats = [
  { label: 'Active listings', value: '240+' },
  { label: 'Makers connected', value: '1.2k' },
  { label: 'Waste diverted', value: '6.8t' },
];

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
    <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
      <section className="mb-16 grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-beige-200 bg-beige-50 px-3 py-1 text-caption font-medium text-stone-500">
            <span className="h-2 w-2 rounded-full bg-sage-300" />
            Launch City Community Beta
          </div>

          <div className="space-y-4">
            <h1 className="max-w-xl text-display font-heading text-earth text-balance">
              Giving discarded objects a second thoughtful life.
            </h1>
            <p className="max-w-xl text-body-lg text-earth-100">
              A relaxed marketplace for residents, makers, artists, and rag pickers to give away,
              trade, and rescue materials before they become waste.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <NavLink to="/nearby">
              <Button variant="primary" size="lg">
                Explore materials nearby
              </Button>
            </NavLink>
            <NavLink to="/styleguide">
              <Button variant="secondary" size="lg">
                View Style Guide
              </Button>
            </NavLink>
          </div>

          <div className="grid max-w-xl gap-4 sm:grid-cols-3">
            {impactStats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-beige-200 bg-ivory-50 p-4 shadow-paper">
                <div className="font-heading text-h3 text-earth">{stat.value}</div>
                <div className="mt-1 text-caption text-stone-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md rounded-lg border border-beige-200 bg-ivory-50 p-8 text-center shadow-card">
            <div className="mb-4 flex justify-center text-clay-300">
              <SketchHeroReuse size={120} />
            </div>
            <div className="font-heading text-h3 text-earth">Wabi-Sabi exchange</div>
            <p className="mt-2 text-body-sm text-stone-400">
              Thoughtful reuse for craft, repair, and slow living — rooted in texture, care, and
              local connection.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16 rounded-xl border border-beige-200 bg-ivory-50 p-5 shadow-paper">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`inline-block h-3 w-3 rounded-full ${
                loading
                  ? 'bg-warning animate-pulse'
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
              <p className="text-caption font-mono text-stone-400">{apiUrl}/healthz</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {health && (
              <span className="rounded bg-beige-100 px-2 py-1 text-caption font-mono text-stone-500">
                v{health.version}
              </span>
            )}
            {error && <span className="text-caption font-mono text-error-text">{error}</span>}
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.12em] text-stone-400">
              Explore by material
            </p>
            <h2 className="mt-2 text-h2 font-heading text-earth">Resource streams worth saving</h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {materialHighlights.map(({ title, description, icon: Icon }) => (
            <Card key={title} hoverable padding="md" className="flex h-full flex-col gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-beige-100 text-clay-400">
                <Icon size={32} />
              </div>
              <div>
                <h3 className="text-h4 font-heading text-earth">{title}</h3>
                <p className="mt-2 text-body-sm text-stone-400">{description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card padding="lg" className="bg-beige-100/60">
          <p className="text-caption font-semibold uppercase tracking-[0.12em] text-stone-400">
            Why it works
          </p>
          <h2 className="mt-3 text-h2 font-heading text-earth">Local reuse, built for slow design.</h2>
          <div className="mt-6 space-y-4">
            {[
              'Discover useful items before they hit the landfill.',
              'Connect with nearby makers and community members who value repair and repurposing.',
              'Keep the experience calm, tactile, and human-centred.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-sage-100 text-sage-500">
                  <SketchPaper size={12} />
                </span>
                <p className="text-body-sm text-earth-100">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="bg-ivory-50">
          <p className="text-caption font-semibold uppercase tracking-[0.12em] text-stone-400">
            Community pulse
          </p>
          <div className="mt-5 space-y-4">
            {[
              { title: 'Oak planks available', detail: 'Downtown maker hub • today' },
              { title: 'Denim offcuts needed', detail: 'Riverside studio • this afternoon' },
              { title: 'Copper pipe bundle ready', detail: 'North lane exchange • tomorrow' },
            ].map((entry) => (
              <div key={entry.title} className="rounded-md border border-beige-200 bg-white/40 p-4">
                <div className="font-heading text-h4 text-earth">{entry.title}</div>
                <div className="mt-1 text-body-sm text-stone-400">{entry.detail}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
};
