import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SynthiaAvatar from './components/SynthiaAvatar';
import SummaryCard from './components/SummaryCard';
import { useApiFetch } from './hooks/useApiFetch';
import Classifier from './pages/Classifier'; // make sure you create this file
import { Routes, Route, useNavigate } from 'react-router-dom';



function GmailClassifierCard({ stats, loading, error, navigate }) {
  if (loading) {
    return <SummaryCard title="Gmail Classifier" details={["Loading..."]} actions={[]} />;
  }

  if (error) {
    return <SummaryCard title="Gmail Classifier" details={["Error loading data"]} actions={[]} />;
  }

  return (
    <SummaryCard
      title="Gmail Classifier"
      details={[`${stats.total} emails Stored`, `${stats.unclassified} unclassified`]}
      actions={[]}
    />
  );
}

function CalendarCard() {
  return (
    <SummaryCard
      title="Calendar"
      details={["Calendar placeholder 1", "Calendar placeholder 2"]}
      actions={[
        { label: "Action 1", onClick: () => console.log("Action 1") },
        { label: "Action 2", onClick: () => console.log("Action 2") },
        { label: "Action 3", onClick: () => console.log("Action 3") },
      ]}
    />
  );
}
function PlaceHolderCard() {
  return (
    <SummaryCard
      title="Placeholder"
      details={["Placeholder 1", "Placeholder 2"]}
      actions={[
        { label: "Action 1", onClick: () => console.log("Action 1") },
        { label: "Action 2", onClick: () => console.log("Action 2") },
        { label: "Action 3", onClick: () => console.log("Action 3") },
      ]}
    />
  );
}

function App() {
  const navigate = useNavigate();
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
          <GmailClassifierCard
            stats={stats}
            loading={stats_loading}
            error={stats_error}
            navigate={navigate}
          />
          <PlaceHolderCard />
          <PlaceHolderCard />
          <PlaceHolderCard />
        </div>

        <footer style={{ marginTop: '3rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          Synthia v1.0.0
        </footer>
      </main>
    </div>
  );
}

export default App;
