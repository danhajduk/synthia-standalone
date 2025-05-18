import React, { useState, useEffect } from 'react';
import Header from './Header';
// import StatusBadge from './badges/StatusBadge';
// import MailBadge from './badges/MailBadge';
// import NotificationBadge from './badges/NotificationBadge';
// import SyncBadge from './badges/SyncBadge';
// import ClassifierBadge from './badges/ClassifierBadge';
import { dashboardBadges } from './badges/dashboardBadges';
import BadgeContainer from './badges/BadgeContainer';



export default function HeaderWrapper() {

  return (
    <div className="flex items-start justify-between mb-4 w-full">
      <div className="w-10/12">
        <Header />
      </div>

      <BadgeContainer
        direction="vertical"
        align="end"
        className="w-2/12"
        badges={dashboardBadges}
      />
    </div>
  );
}
