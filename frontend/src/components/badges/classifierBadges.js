// File: src/config/emailStatsBadges.js

export function classifierBadges(stats = {}) {
    const safeStats = stats || {};
  
    return [
      {
        type: 'mail',
        props: {
          label: 'Unread',
          value: safeStats.unread || 0,
          fullWidth: true
        }
      },
      {
        type: 'mail',
        props: {
          label: 'Stored',
          value: safeStats.total || 0,
          fullWidth: true
        }
      },
      {
        type: 'mail',
        props: {
          label: 'Unclassified',
          value: safeStats.unclassified || 0,
          fullWidth: true
        }
      },
      {
        type: 'classifier',
        props: {
          label: 'Trained',
          value: safeStats.last_trained || 'N/A',
          fullWidth: true
        }
      }
    ];
  }
  