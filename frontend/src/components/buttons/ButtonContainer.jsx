// File: src/components/buttons/ButtonContainer.jsx

import React from 'react';
import { buttonRegistry } from './buttonRegistry';

export default function ButtonContainer({
  buttons = [],
  direction = 'horizontal',
  align = 'center',
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
      className={`flex ${isVertical ? 'flex-col space-y-2' : 'flex-row gap-2'} ${alignItems} ${className}`}
    >
      {buttons.map((btn, idx) => {
        const ButtonComponent = buttonRegistry[btn.type];
        if (!ButtonComponent) {
          console.warn(`⚠️ Unknown button type: '${btn.type}'`);
          return (
            <button key={idx} className="px-4 py-2 rounded bg-gray-400 text-white">
              Unknown
            </button>
          );
        }
        return <ButtonComponent key={idx} {...btn.props} />;
      })}
    </div>
  );
}
