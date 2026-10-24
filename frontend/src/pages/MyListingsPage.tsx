import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/common/Card';

export const MyListingsPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="My listings"
        subtitle="Manage the items you’ve posted."
      />

      <Card padding="lg" className="mt-8 text-center text-stone-500">
        You have no listings yet. Create your first one from the new listing page.
      </Card>
    </div>
  );
};
