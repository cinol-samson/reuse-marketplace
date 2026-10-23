import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Input, Textarea, Select, Checkbox } from '../components/common/FormControls';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Dialog } from '../components/common/Dialog';
import { Toast } from '../components/common/Toast';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { FilterChip } from '../components/common/FilterChip';
import { ListingCard } from '../components/common/ListingCard';
import {
  SketchTextile,
  SketchWood,
  SketchMetal,
  SketchGlass,
  SketchPaper,
  SketchPlastic,
  SketchElectronics,
  SketchEmptySearch,
  SketchEmptyInbox,
  SketchHeroReuse,
} from '../components/sketches/SketchIcons';

export const StyleguidePage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [selectedChip, setSelectedChip] = useState('Wood');

  const palette = [
    { name: 'Ivory', hex: '#F8F4ED', cls: 'bg-ivory text-earth border-beige-200' },
    { name: 'Beige', hex: '#E8DFD0', cls: 'bg-beige text-earth border-beige-200' },
    { name: 'Sage', hex: '#7A9B8A', cls: 'bg-sage text-ivory border-sage' },
    { name: 'Clay', hex: '#B5704A', cls: 'bg-clay text-ivory border-clay' },
    { name: 'Stone', hex: '#9B9589', cls: 'bg-stone text-ivory border-stone' },
    { name: 'Earth', hex: '#2C2519', cls: 'bg-earth text-ivory border-earth' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 text-left">
      <PageHeader
        title="Wabi-Sabi × Conceptual Sketch Style Guide"
        subtitle="Visual design tokens, typography, hand-drawn sketch assets, and reusable components for Reuse Marketplace."
        action={
          <Button variant="secondary" onClick={() => setToastOpen(true)}>
            Trigger Toast
          </Button>
        }
      />

      {/* 1. Color Palette */}
      <section className="mb-12">
        <h2 className="text-h2 font-heading mb-4">1. Color Palette (WCAG AA Compliant)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {palette.map((c) => (
            <div
              key={c.name}
              className={`p-4 rounded-md border flex flex-col justify-between h-28 shadow-paper ${c.cls}`}
            >
              <span className="font-semibold">{c.name}</span>
              <span className="text-caption font-mono opacity-90">{c.hex}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Typography */}
      <section className="mb-12">
        <h2 className="text-h2 font-heading mb-4">2. Typography Pairings</h2>
        <div className="space-y-4 bg-ivory-50 p-6 rounded-md border border-beige-200">
          <div>
            <span className="text-caption text-stone-400 font-mono">Display (Playfair Display)</span>
            <p className="text-display font-heading text-earth">Second Life for Discarded Goods</p>
          </div>
          <div>
            <span className="text-caption text-stone-400 font-mono">Heading 1</span>
            <h1 className="text-h1 font-heading text-earth">Sustainable Material Exchange</h1>
          </div>
          <div>
            <span className="text-caption text-stone-400 font-mono">Heading 2</span>
            <h2 className="text-h2 font-heading text-earth">Makers, Artists & Upcyclers</h2>
          </div>
          <div>
            <span className="text-caption text-stone-400 font-mono">Body (Inter)</span>
            <p className="text-body text-earth max-w-2xl">
              Every discarded item has potential. Antigravity brings local creators together to
              divert waste, share scrap materials, and spark sustainable craftsmanship.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Sketch SVG Assets */}
      <section className="mb-12">
        <h2 className="text-h2 font-heading mb-4">3. Conceptual Sketch Line Art (Inline SVG)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { comp: <SketchTextile size={36} />, label: 'Textiles' },
            { comp: <SketchWood size={36} />, label: 'Wood' },
            { comp: <SketchMetal size={36} />, label: 'Metal' },
            { comp: <SketchGlass size={36} />, label: 'Glass' },
            { comp: <SketchPaper size={36} />, label: 'Paper' },
            { comp: <SketchPlastic size={36} />, label: 'Plastic' },
            { comp: <SketchElectronics size={36} />, label: 'Electronics' },
            { comp: <SketchEmptySearch size={36} />, label: 'Empty Search' },
            { comp: <SketchEmptyInbox size={36} />, label: 'Empty Inbox' },
            { comp: <SketchHeroReuse size={36} />, label: 'Reuse Sprout' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-md border border-beige-200 bg-ivory-50 flex flex-col items-center gap-2 text-stone-500 shadow-paper"
            >
              <div className="text-clay-300">{item.comp}</div>
              <span className="text-caption font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Buttons & Badges */}
      <section className="mb-12">
        <h2 className="text-h2 font-heading mb-4">4. Buttons & Status Badges</h2>
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="quiet">Quiet Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="primary" isLoading>
            Loading
          </Button>
          <Button variant="primary" onClick={() => setDialogOpen(true)}>
            Open Dialog Modal
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Badge status="available" />
          <Badge status="reserved" />
          <Badge status="completed" />
          <Badge status="pending" />
          <Badge status="hidden" />
          <Badge status="expired" />
        </div>
      </section>

      {/* 5. Form Controls */}
      <section className="mb-12">
        <h2 className="text-h2 font-heading mb-4">5. Form Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-ivory-50 p-6 rounded-md border border-beige-200">
          <Input label="Item Title" placeholder="e.g. Reclaimed cedar planks" />
          <Select
            label="Category"
            options={[
              { value: 'wood', label: 'Wood & Timber' },
              { value: 'metal', label: 'Metal' },
            ]}
          />
          <Textarea label="Description" placeholder="Provide dimensions, condition, and origin..." />
          <div className="flex flex-col gap-3">
            <Checkbox
              label="I agree to terms of material exchange"
              description="Pickup and delivery terms will be coordinated directly."
            />
            <div className="flex gap-2 pt-2">
              {['All', 'Wood', 'Metal', 'Textiles'].map((cat) => (
                <FilterChip
                  key={cat}
                  label={cat}
                  isSelected={selectedChip === cat}
                  onClick={() => setSelectedChip(cat)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Cards & Listing Card */}
      <section className="mb-12">
        <h2 className="text-h2 font-heading mb-4">6. Cards & Listing Preview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <ListingCard
            id={1}
            title="Salvaged Oak Table Top (Solid wood)"
            category="Wood"
            listingType="sale"
            price={35.0}
            status="available"
            areaLabel="Downtown Arts"
          />
          <ListingCard
            id={2}
            title="Cotton Denim Fabric Offcuts (15 lbs)"
            category="Textiles"
            listingType="donation"
            status="reserved"
            areaLabel="East Riverside"
          />
          <Card padding="md" className="flex flex-col justify-between">
            <div>
              <span className="text-caption text-clay-400 font-semibold uppercase">Organic Card</span>
              <h3 className="text-h4 font-heading text-earth mt-1">Artist Scrap Materials Needed</h3>
              <p className="text-body-sm text-stone-400 mt-2">
                Sculptor seeking brass fittings and copper sheets for an upcoming gallery exhibition.
              </p>
            </div>
            <Button variant="secondary" size="sm" className="mt-4 self-start">
              Recommend Item
            </Button>
          </Card>
        </div>
      </section>

      {/* 7. Empty State */}
      <section className="mb-12">
        <h2 className="text-h2 font-heading mb-4">7. Empty States</h2>
        <div className="border border-beige-200 rounded-md bg-ivory-50">
          <EmptyState
            illustration={<SketchEmptySearch size={64} className="text-clay-300 mx-auto" />}
            title="No scrap items found nearby"
            description="Try expanding your search radius or exploring another material category."
            actionText="Clear Filters"
            onAction={() => setSelectedChip('All')}
          />
        </div>
      </section>

      {/* Modals & Toasts */}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Confirm Reservation Release"
        description="Are you sure you want to release this reservation? The item will immediately become available for other makers."
        confirmText="Release Item"
        onConfirm={() => {
          setDialogOpen(false);
          setToastOpen(true);
        }}
      />

      {toastOpen && (
        <Toast
          type="success"
          message="Item released back to available listings."
          onDismiss={() => setToastOpen(false)}
        />
      )}
    </div>
  );
};
