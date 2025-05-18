// File: src/components/badges/badgeRegistry.js

import StatusBadge from './StatusBadge';
import SyncBadge from './SyncBadge';
import MailBadge from './MailBadge';
import NotificationBadge from './NotificationBadge';
import ClassifierBadge from './ClassifierBadge';

// Exported registry of badge types
export const badgeRegistry = {
  status: StatusBadge,
  sync: SyncBadge,
  mail: MailBadge,
  notify: NotificationBadge,
  classifier: ClassifierBadge
};
