import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const NewListingPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader
        title="New listing"
        subtitle="List something you want to sell or give away."
      />

      <Card padding="lg" className="mt-8 space-y-4">
        <div className="space-y-2">
          <label className="block text-body-sm font-medium text-earth">Title</label>
          <input
            className="w-full rounded-md border border-beige-200 bg-ivory-50 px-3 py-2 text-body-sm text-earth outline-none focus:border-clay-300"
            placeholder="Example: Oak desk drawer"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-body-sm font-medium text-earth">Description</label>
          <textarea
            rows={6}
            className="w-full rounded-md border border-beige-200 bg-ivory-50 px-3 py-2 text-body-sm text-earth outline-none focus:border-clay-300"
            placeholder="Add details about condition, dimensions, and pickup info."
          />
        </div>

        <div className="flex justify-end">
          <Button variant="primary">Publish listing</Button>
        </div>
      </Card>
    </div>
  );
};
