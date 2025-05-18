// File: src/components/badges/BadgeContainer.jsx
import React from 'react';
import { badgeRegistry } from './badgeRegistry';

export default function BadgeContainer({
  badges = [],
  direction = 'horizontal',
  align = 'center',
  wrap = false,
  className = ''
}) {
  const isVertical = direction === 'vertical';
  const alignItems = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end'
  }[align] || 'items-center';

  return (
    <div
      className={`
        flex
        ${isVertical ? 'flex-col space-y-2' : `flex-row gap-2 ${wrap ? 'flex-wrap' : ''}`}
        ${alignItems}
        ${className}
      `}
    >
      {badges.map((badge, idx) => {
        const BadgeComponent = badgeRegistry[badge.type];
        if (!BadgeComponent) {
          console.warn(`⚠️ Unknown badge type: '${badge.type}'`);
          return (
            <div
              key={`unknown-${idx}`}
              className="px-3 py-1 text-sm text-white bg-gray-400 rounded-md"
            >
              Unknown: {badge.type}
            </div>
          );
        }
        return <BadgeComponent key={idx} {...badge.props} />;
      })}
    </div>
  );
}
