import React from 'react';

interface SketchProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

// 1. Textiles / Clothes Sketch
export const SketchTextile: React.FC<SketchProps> = ({ className = '', size = 32, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <path d="M16 8 L24 13 L32 8 L40 14 L36 24 L31 22 L31 40 L17 40 L17 22 L12 24 L8 14 Z" />
    <path d="M24 13 L24 22" strokeDasharray="2 2" />
    <path d="M21 28 Q24 30 27 28" />
  </svg>
);

// 2. Wood / Timber Sketch
export const SketchWood: React.FC<SketchProps> = ({ className = '', size = 32, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <ellipse cx="14" cy="24" rx="6" ry="12" />
    <path d="M14 12 L38 12 Q44 12 44 24 Q44 36 38 36 L14 36" />
    <path d="M14 18 Q16 24 14 30" />
    <path d="M22 18 C28 20 32 20 40 18" strokeDasharray="3 2" />
    <path d="M20 28 C28 30 34 29 42 28" strokeDasharray="3 2" />
  </svg>
);

// 3. Metal Sketch
export const SketchMetal: React.FC<SketchProps> = ({ className = '', size = 32, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <path d="M24 8 L38 16 L38 32 L24 40 L10 32 L10 16 Z" />
    <circle cx="24" cy="24" r="6" />
    <path d="M24 8 L24 18" strokeDasharray="2 2" />
    <path d="M38 32 L29 27" strokeDasharray="2 2" />
  </svg>
);

// 4. Glass Sketch
export const SketchGlass: React.FC<SketchProps> = ({ className = '', size = 32, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <path d="M18 6 L30 6 L30 14 Q36 20 36 28 Q36 42 24 42 Q12 42 12 28 Q12 20 18 14 Z" />
    <path d="M16 6 L32 6" />
    <path d="M22 24 Q24 34 26 36" strokeDasharray="2 3" />
  </svg>
);

// 5. Paper / Cardboard Box Sketch
export const SketchPaper: React.FC<SketchProps> = ({ className = '', size = 32, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <path d="M24 6 L40 14 L24 22 L8 14 Z" />
    <path d="M8 14 L8 34 L24 42 L24 22" />
    <path d="M40 14 L40 34 L24 42" />
    <path d="M24 22 L32 18" strokeDasharray="2 2" />
  </svg>
);

// 6. Plastic / Container Sketch
export const SketchPlastic: React.FC<SketchProps> = ({ className = '', size = 32, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <path d="M18 6 L30 6 L30 10 L18 10 Z" />
    <path d="M18 10 L15 16 L15 40 L33 40 L33 16 L30 10" />
    <path d="M15 22 L33 22" strokeDasharray="2 2" />
    <path d="M20 28 Q24 30 28 28" />
  </svg>
);

// 7. Electronics / Parts Sketch
export const SketchElectronics: React.FC<SketchProps> = ({ className = '', size = 32, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <rect x="14" y="14" width="20" height="20" rx="3" />
    <path d="M20 6 L20 14 M28 6 L28 14" />
    <path d="M20 34 L20 42 M28 34 L28 42" />
    <path d="M6 20 L14 20 M6 28 L14 28" />
    <path d="M34 20 L42 20 M34 28 L42 28" />
    <circle cx="24" cy="24" r="3" />
  </svg>
);

// 8. Empty Search / No Results Sketch
export const SketchEmptySearch: React.FC<SketchProps> = ({ className = '', size = 64, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <circle cx="28" cy="28" r="16" />
    <path d="M40 40 L56 56" />
    <path d="M22 28 Q28 24 34 28" strokeDasharray="2 2" />
    <path d="M28 22 L28 23" />
  </svg>
);

// 9. Empty Inbox / Messages Sketch
export const SketchEmptyInbox: React.FC<SketchProps> = ({ className = '', size = 64, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <rect x="10" y="16" width="44" height="32" rx="4" />
    <path d="M10 20 L32 36 L54 20" />
    <path d="M24 38 Q32 44 40 38" strokeDasharray="2 2" />
  </svg>
);

// 10. Hero Brand / Upcycling Sketch (Giving objects new life)
export const SketchHeroReuse: React.FC<SketchProps> = ({ className = '', size = 120, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    {...props}
  >
    {/* Sprout emerging from a bowl / cup */}
    <path d="M35 70 Q60 100 85 70 L80 90 Q60 105 40 90 Z" />
    <path d="M35 70 Q60 62 85 70" />
    {/* Stem and gentle leaf */}
    <path d="M60 66 Q58 40 45 28" />
    <path d="M45 28 Q62 25 60 48" />
    <path d="M59 44 Q75 32 80 42 Q68 55 58 50" />
    {/* Sketch annotation arrow */}
    <path d="M88 35 Q102 45 92 65" strokeDasharray="3 3" />
    <path d="M92 65 L95 58 M92 65 L86 62" />
  </svg>
);
