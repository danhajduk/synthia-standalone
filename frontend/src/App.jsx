import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SynthiaAvatar from './components/SynthiaAvatar';
import SummaryCard from './components/SummaryCard';
import { useApiFetch } from './hooks/useApiFetch';

function App() {
  const { data: stats, loading: stats_loading, error: stats_error } = useApiFetch('/api/gmail/stats');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <SynthiaAvatar />
          <Header />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem',
        }}>
        {stats_loading ? (
          <SummaryCard title="Gmail Classifier" details={["Loading..."]} actions={[]} 
          />
        ) : stats_error ? (
          <SummaryCard title="Gmail Classifier" details={["Error loading data"]} actions={[]}
          />
        ) : (
          <SummaryCard 
            title="Gmail Classifier" 
            details={[`${stats.total} emails Stored`, `${stats.unclassified} unclassified` ]}
            actions={["Classify Now", "View Inbox" ]}
          />
        )}
          <SummaryCard
            title="Calendar"
            details={["Calendar placeholder 1", "Calendar placeholder 2"]}
            actions={["Action 1", "Action 2", "Action 3"]}
          />

          <SummaryCard
            title="Reminders & Tasks"
            details={["Reminder placeholder 1", "Reminder placeholder 2"]}
            actions={["Action 1", "Action 2"]}
          />

          <SummaryCard
            title="System Monitor"
            details={["System placeholder 1", "System placeholder 2"]}
            actions={["Action 1"]}
          />

          <SummaryCard
            title="Notifications"
            details={["Notification placeholder 1", "Notification placeholder 2"]}
            actions={["Action 1"]}
          />

          <SummaryCard
            title="Assistant Tools"
            details={["Tool placeholder 1", "Tool placeholder 2", "Tool placeholder 3"]}
            actions={["Action 1"]}
          />
        </div>

        <footer style={{ marginTop: '3rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          Synthia v1.0.0
        </footer>
      </main>
    </div>
  );
}

export default App;
