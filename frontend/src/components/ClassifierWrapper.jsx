import React from 'react';
import Header from './Header';
import StatusBadge from './badges/StatusBadge';
import MailBadge from './badges/MailBadge';
import NotificationBadge from './badges/NotificationBadge';
import SyncBadge from './badges/SyncBadge';
import ClassifierBadge from './badges/ClassifierBadge';
import { useBadgeStats } from '../hooks/useBadgeStats'; // Import the hook

export default function HeaderWrapper() {
    const { data = {}, loading, error, refresh } = useBadgeStats(); // Ensure data has a default value

    if (loading) {
        return <div>Loading...</div>; // Handle loading state
    }

    if (error) {
        return <div>Error loading badges</div>; // Handle error state
    }

    return (
        <div className="flex items-start justify-between mb-4 w-full">
            <div className="w-10/12">
                <Header />
            </div>
            <div className="w-2/12 flex flex-col items-end space-y-2">
                <MailBadge label="Stored" value={data.unread || 0} fullWidth /> 
                <MailBadge label="Unclasified" value={data.unclassified || 0} fullWidth /> 
                <ClassifierBadge label="Last Trained" value={data.last_trained} fullWidth />
            </div>
            <div className="w-2/12 flex flex-col items-end space-y-2">
                <StatusBadge label="BackEnd" endpoint="/api/hello" statusKey="backend" fullWidth />
                <NotificationBadge label="Alerts" value={0} fullWidth />
                <MailBadge label="Unread" value={data.unread || 0} fullWidth />
                <SyncBadge label="Last Synced" value={"09:29"} fullWidth />
                <ClassifierBadge label="Pre-classify" value={data.last_preclassify} fullWidth />
            </div>
        </div>
    );
}
