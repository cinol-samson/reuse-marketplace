import React from 'react';
import { Card } from './Card';
import { Badge, type ItemStatusType } from './Badge';

export interface ListingCardProps {
  id: number;
  title: string;
  category: string;
  listingType: 'sale' | 'donation';
  price?: number | null;
  status: ItemStatusType;
  areaLabel?: string | null;
  photoUrl?: string;
  onClick?: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  title,
  category,
  listingType,
  price,
  status,
  areaLabel,
  photoUrl,
  onClick,
}) => {
  return (
    <Card
      hoverable
      padding="none"
      onClick={onClick}
      className="flex flex-col overflow-hidden text-left group"
    >
      {/* Thumbnail photograph is the visual focus */}
      <div className="relative aspect-4/3 w-full bg-beige-100 overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <span className="text-body-sm">No photo</span>
          </div>
        )}
        <div className="absolute top-2.5 right-2.5">
          <Badge status={status} />
        </div>
        {listingType === 'donation' && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex px-2 py-0.5 rounded-sm bg-sage-300 text-ivory text-caption font-semibold">
              Free
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <span className="text-caption font-medium uppercase tracking-wider text-stone-400">
            {category}
          </span>
          <h3 className="text-body font-semibold text-earth group-hover:text-clay-400 transition-colors line-clamp-1 mt-0.5">
            {title}
          </h3>
        </div>

        <div className="mt-3 pt-3 border-t border-beige-200/80 flex items-center justify-between text-body-sm">
          <span className="font-semibold text-earth">
            {listingType === 'sale' && price != null ? `$${price.toFixed(2)}` : 'Donation'}
          </span>
          {areaLabel && (
            <span className="text-caption text-stone-400 truncate max-w-[120px]">
              📍 {areaLabel}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
