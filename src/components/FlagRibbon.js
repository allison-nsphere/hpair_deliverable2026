import React, { useId } from 'react';

// A decorative bunting ribbon whose flags curve along an arc.
//
// The flags are laid out with SVG <textPath>, so they genuinely follow the
// curve instead of being individually rotated. The ribbon is purely decorative,
// so it is hidden from assistive technology.

const FLAGS = [
  '🇺🇸', '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇳', '🇸🇬', '🇮🇩', '🇵🇭',
  '🇹🇭', '🇻🇳', '🇲🇾', '🇧🇩', '🇵🇰', '🇱🇰', '🇳🇵', '🇰🇭',
  '🇦🇺', '🇳🇿', '🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇵🇹',
  '🇧🇷', '🇲🇽', '🇦🇷', '🇨🇦', '🇿🇦', '🇳🇬', '🇰🇪', '🇪🇬',
  '🇦🇪', '🇹🇷', '🇸🇦', '🇷🇺', '🇵🇱', '🇸🇪', '🇳🇴', '🇳🇱'
];

const FlagRibbon = ({ variant = 'top' }) => {
  // useId keeps the <path> ids unique so the top and bottom ribbons never
  // resolve to each other's curve.
  const pathId = `ribbon-curve-${useId().replace(/:/g, '')}-${variant}`;
  const gradId = `${pathId}-grad`;

  // Top ribbon sags like a garland strung across the page; bottom ribbon
  // mirrors it, arching upward.
  const curve =
    variant === 'top'
      ? 'M -10,26 Q 600,118 1210,26'
      : 'M -10,104 Q 600,12 1210,104';

  // Flags hang below the cord at the top, and sit above it at the bottom.
  const flagOffset = variant === 'top' ? 15 : -15;

  return (
    <div className={`ribbon ribbon--${variant}`} aria-hidden="true">
      <svg viewBox="0 0 1200 126" role="presentation" focusable="false">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a51c30" />
            <stop offset="35%" stopColor="#d4a017" />
            <stop offset="65%" stopColor="#d4a017" />
            <stop offset="100%" stopColor="#a51c30" />
          </linearGradient>
          <path id={pathId} d={curve} fill="none" />
        </defs>

        {/* the cord itself */}
        <use href={`#${pathId}`} stroke={`url(#${gradId})`} strokeWidth="5" strokeLinecap="round" />

        {/* flags riding the curve */}
        <text className="ribbon__flags" fill="#1f2933">
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle" dy={flagOffset}>
            {FLAGS.join(' ')}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default FlagRibbon;
