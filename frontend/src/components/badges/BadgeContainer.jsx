// components/Badges/BadgeContainer.jsx
import React from 'react';
import StatusBadge from './StatusBadge';
import ModuleBadge from './ModuleBadge';
import UnreadBadge from './UnreadBadge';

const badgeMap = {
  status: StatusBadge,
  module: ModuleBadge,
  unread: UnreadBadge
};

export default function BadgeContainer({ badges = [] }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {badges.map((badge, idx) => {
        const BadgeComponent = badgeMap[badge.type];
        if (!BadgeComponent) return null;
        return <BadgeComponent key={idx} {...badge.props} />;
      })}
    </div>
  );
}
