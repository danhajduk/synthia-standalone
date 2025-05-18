// File: src/pages/PageRenderer.jsx
import React from 'react';
import { pageRegistry } from './pageRegistry';

export default function PageRenderer({ pageType, props = {} }) {
  const PageComponent = pageRegistry[pageType];

  if (!PageComponent) {
    console.warn(`⚠️ Unknown page type: '${pageType}'`);
    return (
      <div className="p-4 text-red-500">
        Page not found: <code>{pageType}</code>
      </div>
    );
  }

  return <PageComponent {...props} />;
}
