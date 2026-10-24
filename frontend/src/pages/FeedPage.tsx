import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { FilterChip } from '../components/common/FilterChip';
import { PageHeader } from '../components/common/PageHeader';
import { getItems, type ItemRecord } from '../api/client';
import { strings } from '../strings';

const categoryOptions = [
  { id: null, label: 'All materials' },
  { id: 1, label: 'Textiles/Clothes' },
  { id: 2, label: 'Wood' },
  { id: 3, label: 'Metal' },
  { id: 4, label: 'Glass' },
  { id: 5, label: 'Paper/Cardboard' },
  { id: 6, label: 'Plastic' },
  { id: 7, label: 'Electronics/Parts' },
  { id: 8, label: 'Furniture' },
  { id: 9, label: 'Books' },
  { id: 10, label: 'Craft Supplies' },
  { id: 11, label: 'Other' },
] as const;

const listingOptions = [
  { value: 'all', label: 'All listings' },
  { value: 'sale', label: 'For sale' },
  { value: 'donation', label: 'Free' },
] as const;

const formatMoney = (value: number | null) => {
  if (value === null || value === undefined) return 'Free';
  return `£${value.toFixed(2)}`;
};

const imageSrc = (item: ItemRecord) => item.photos?.[0] ?? 'https://placehold.co/800x600?text=Reuse+Marketplace';

export const FeedPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [listingType, setListingType] = useState<'all' | 'sale' | 'donation'>('all');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getItems({
          category_id: selectedCategory ?? undefined,
          listing_type: listingType === 'all' ? undefined : listingType,
          q: query.trim() || undefined,
          limit: 20,
        });

        if (!active) return;
        setItems(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load listings.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [selectedCategory, listingType, query]);

  const categoryCount = useMemo(() => `${items.length} listings`, [items.length]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <PageHeader
        title={strings.app.name}
        subtitle="Find useful materials, furniture, and repairable goods near you."
      />

      <section className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((option) => (
            <FilterChip
              key={option.label}
              label={option.label}
              isSelected={selectedCategory === option.id}
              onClick={() => setSelectedCategory(option.id)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {listingOptions.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                isSelected={listingType === option.value}
                onClick={() => setListingType(option.value)}
              />
            ))}
          </div>

          <div className="w-full max-w-md">
            <label className="sr-only" htmlFor="feed-search">
              Search listings
            </label>
            <input
              id="feed-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title or description"
              className="w-full rounded-md border border-beige-200 bg-ivory-50 px-3 py-2 text-body-sm text-earth outline-none ring-0 transition focus:border-clay-300"
            />
          </div>
        </div>
      </section>

      <section className="mb-6 flex items-center justify-between">
        <p className="text-body-sm font-medium text-stone-500">{categoryCount}</p>
        <Link to="/nearby" className="text-body-sm font-medium text-clay-400">
          Open nearby search →
        </Link>
      </section>

      {loading && (
        <div className="rounded-md border border-beige-200 bg-ivory-50 px-4 py-8 text-center text-body-sm text-stone-400">
          Loading listings...
        </div>
      )}

      {!loading && error && (
        <Card padding="lg" className="bg-error-light/30 text-error-text">
          {error}
        </Card>
      )}

      {!loading && !error && items.length === 0 && (
        <Card padding="lg" className="text-center text-stone-500">
          {strings.emptyStates.noItems}
        </Card>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Link key={item.id} to={`/items/${item.id}`} className="block h-full">
              <Card hoverable padding="none" className="h-full overflow-hidden">
                <div className="relative">
                  <img src={imageSrc(item)} alt={item.title} className="h-48 w-full object-cover" />
                  <div className="absolute left-3 top-3 rounded-full bg-ivory/90 px-2 py-1 text-caption font-medium text-earth">
                    {item.listing_type === 'donation' ? 'Free' : 'For sale'}
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h2 className="text-h4 font-heading text-earth">{item.title}</h2>
                    <span className="text-body-sm font-semibold text-clay-400">
                      {formatMoney(item.price)}
                    </span>
                  </div>

                  <p className="mb-4 line-clamp-3 text-body-sm text-stone-500">{item.description}</p>

                  <div className="flex items-center justify-between text-caption text-stone-400">
                    <span>{item.area_label ?? 'Local pickup'}</span>
                    <span>{item.delivery_option}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
