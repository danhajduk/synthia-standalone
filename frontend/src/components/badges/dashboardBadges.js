// File: src/components/badges/dashboardBadges.js

export const dashboardBadges = [
    {
      type: 'status',
      props: {
        label: 'BackEnd',
        endpoint: '/api/hello',
        statusKey: 'backend',
        fullWidth: true
      }
    },
    {
      type: 'notify',
      props: {
        label: 'Alerts',
        value: 0,
        fullWidth: true
      }
    },
    {
      type: 'sync',
      props: {
        label: 'Last Synced',
        value: '2025-05-17T12:00:00Z',
        fullWidth: true
      }
    },
    {
      type: 'classifier',
      props: {
        label: 'Model',
        endpoint: '/api/gmail/stats',
        statusKey: 'last_trained',
        fullWidth: true
      }
    }
  ];
  
