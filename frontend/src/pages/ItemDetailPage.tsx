import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/common/Card';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader title="Item details" subtitle={`Viewing listing #${id ?? 'unknown'}`} />

      <Card padding="lg" className="mt-8 space-y-4">
        <p className="text-body-sm text-stone-500">
          This listing detail page is ready for the later inventory stage.
        </p>
        <Link to="/" className="text-body-sm font-medium text-clay-400">
          ← Back to listings
        </Link>
      </Card>
    </div>
  );
};
