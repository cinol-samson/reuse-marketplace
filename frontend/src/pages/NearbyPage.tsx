import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { getNearbyItems, type ItemRecord } from '../api/client';
import { strings } from '../strings';

const STORAGE_KEY = 'reuse_last_location';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const categoryLabel = (item: ItemRecord) => {
  const labels: Record<number, string> = {
    1: 'Textiles/Clothes',
    2: 'Wood',
    3: 'Metal',
    4: 'Glass',
    5: 'Paper/Cardboard',
    6: 'Plastic',
    7: 'Electronics/Parts',
    8: 'Furniture',
    9: 'Books',
    10: 'Craft Supplies',
    11: 'Other',
  };
  return labels[item.category_id] ?? 'Material';
};

export const NearbyPage: React.FC = () => {
  const [lat, setLat] = useState<number>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return 51.5072;

    try {
      const parsed = JSON.parse(saved) as { lat: number; lng: number };
      if (Number.isFinite(parsed.lat)) return Number(parsed.lat);
    } catch {
      // ignore malformed saved location
    }
    return 51.5072;
  });
  const [lng, setLng] = useState<number>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return -0.1276;

    try {
      const parsed = JSON.parse(saved) as { lat: number; lng: number };
      if (Number.isFinite(parsed.lng)) return Number(parsed.lng);
    } catch {
      // ignore malformed saved location
    }
    return -0.1276;
  });
  const [radius, setRadius] = useState<number>(5);
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng }));

    let active = true;

    const loadNearby = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getNearbyItems(lat, lng, radius, 20);
        if (!active) return;
        setItems(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load nearby listings.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadNearby();

    return () => {
      active = false;
    };
  }, [lat, lng, radius]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
      },
      () => {
        setError('We could not access your location. You can adjust the coordinates manually.');
      },
    );
  };

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const aDistance = a.lat != null && a.lng != null ? haversineKm(lat, lng, a.lat, a.lng) : Number.POSITIVE_INFINITY;
        const bDistance = b.lat != null && b.lng != null ? haversineKm(lat, lng, b.lat, b.lng) : Number.POSITIVE_INFINITY;
        return aDistance - bDistance;
      }),
    [items, lat, lng],
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <PageHeader
        title="Nearby"
        subtitle="Adjust your point on the map and search within a local radius for useful materials."
        action={
          <Button variant="secondary" onClick={useCurrentLocation}>
            Use my location
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card padding="lg" className="space-y-5">
          <div>
            <label className="mb-1 block text-body-sm font-medium text-earth">Latitude</label>
            <input
              type="number"
              step="0.0001"
              value={lat}
              onChange={(event) => setLat(Number(event.target.value))}
              className="w-full rounded-md border border-beige-200 bg-ivory-50 px-3 py-2 text-body-sm text-earth"
            />
          </div>

          <div>
            <label className="mb-1 block text-body-sm font-medium text-earth">Longitude</label>
            <input
              type="number"
              step="0.0001"
              value={lng}
              onChange={(event) => setLng(Number(event.target.value))}
              className="w-full rounded-md border border-beige-200 bg-ivory-50 px-3 py-2 text-body-sm text-earth"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-body-sm text-earth">
              <span>Radius</span>
              <span>{radius} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={radius}
              onChange={(event) => setRadius(clamp(Number(event.target.value), 1, 50))}
              className="w-full accent-clay-400"
            />
          </div>

          <div className="rounded-md border border-beige-200 bg-beige-50 px-3 py-2 text-caption text-stone-500">
            Last saved point: {lat.toFixed(4)}, {lng.toFixed(4)}
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-body-sm font-medium text-stone-500">
              {sortedItems.length} nearby listings in {radius} km
            </p>
            <Link to="/" className="text-body-sm font-medium text-clay-400">
              View all listings →
            </Link>
          </div>

          {loading && (
            <Card padding="lg" className="text-center text-stone-400">
              Finding nearby listings...
            </Card>
          )}

          {!loading && error && (
            <Card padding="lg" className="bg-error-light/30 text-error-text">
              {error}
            </Card>
          )}

          {!loading && !error && sortedItems.length === 0 && (
            <Card padding="lg" className="text-center text-stone-500">
              {strings.emptyStates.noItems}
            </Card>
          )}

          {!loading && !error && sortedItems.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedItems.map((item) => {
                const distance = item.lat != null && item.lng != null ? haversineKm(lat, lng, item.lat, item.lng) : null;
                const badge = item.listing_type === 'donation' ? 'Free' : 'For sale';

                return (
                  <Link key={item.id} to={`/items/${item.id}`} className="block h-full">
                    <Card hoverable padding="none" className="h-full overflow-hidden">
                      <div className="relative">
                        <img
                          src={item.photos?.[0] ?? 'https://placehold.co/800x600?text=Reuse+Marketplace'}
                          alt={item.title}
                          className="h-40 w-full object-cover"
                        />
                        <div className="absolute left-3 top-3 rounded-full bg-ivory/90 px-2 py-1 text-caption font-medium text-earth">
                          {badge}
                        </div>
                      </div>

                      <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="text-h4 font-heading text-earth">{item.title}</h2>
                          <span className="text-body-sm font-semibold text-clay-400">
                            {item.listing_type === 'donation' ? 'Free' : `£${item.price ?? 0}`}
                          </span>
                        </div>

                        <p className="text-body-sm text-stone-500">{categoryLabel(item)}</p>
                          <div className="flex items-center justify-between text-caption text-stone-400">
                            <span>{item.area_label ?? 'Local pickup'}</span>
                            <span>{distance !== null ? `${distance.toFixed(1)} km` : '—'}</span>
                          </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
