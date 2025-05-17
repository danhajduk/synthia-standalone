import React, { useState, useEffect } from 'react';
import Header from './Header';
import StatusBadge from './badges/StatusBadge';
import MailBadge from './badges/MailBadge';
import NotificationBadge from './badges/NotificationBadge';
import SyncBadge from './badges/SyncBadge';
import ClassifierBadge from './badges/ClassifierBadge';

export default function HeaderWrapper() {

  return (
    <div className="flex items-start justify-between mb-4 w-full">
      <div className="w-10/12">
        <Header />
      </div>

      <div className="w-2/12 flex flex-col items-end space-y-2">
        <StatusBadge label="BackEnd" endpoint="/api/hello" statusKey="backend" fullWidth />
        <NotificationBadge label="Alerts" value={0} fullWidth />
        <MailBadge label="Unread" value={0} fullWidth />
        <SyncBadge label="Last Synced" value={"09:29"} fullWidth />
        <ClassifierBadge label="Model" value={0} fullWidth />
      </div>
    </div>
  );
}
