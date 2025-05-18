import React from 'react';
import Header from './ClassHeader';
import StatusBadge from './badges/StatusBadge';
import MailBadge from './badges/MailBadge';
import NotificationBadge from './badges/NotificationBadge';
import SyncBadge from './badges/SyncBadge';
import ClassifierBadge from './badges/ClassifierBadge';
import { dashboardBadges } from './badges/dashboardBadges';
import { classifierBadges } from './badges/classifierBadges';
import BadgeContainer from './badges/BadgeContainer';

export default function HeaderWrapper({ stats = {}, metrics = {} }) {
    const safeStats = stats || {}; // Ensure stats is not null or undefined

    // Validate and parse the last synced date
    const lastSynced = safeStats.last_synced;
    const parsedLastSynced = lastSynced ? new Date(lastSynced) : null;
    const isValidDate = parsedLastSynced && !isNaN(parsedLastSynced.getTime());
    const formattedLastSynced = isValidDate
        ? parsedLastSynced.toISOString() // Pass ISO string for consistency
        : null;

    return (
      <div className="flex items-start justify-between mb-4 w-full">
        <div className="w-8/12">
          <Header data={metrics} />
        </div>
        <BadgeContainer
            direction="vertical"
            align="end"
            className="w-2/12"
            badges={classifierBadges(stats)}
            />
        <BadgeContainer
            direction="vertical"
            align="end"
            className="w-2/12"
            badges={dashboardBadges}
            />
      </div>
    );
}
