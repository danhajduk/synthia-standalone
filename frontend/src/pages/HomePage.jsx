import React from 'react';
import Sidebar from '../components/Sidebar';
import SynthiaAvatar from '../components/SynthiaAvatar';
import SummaryCard from '../components/SummaryCard';
import { useApiFetch } from '../hooks/useApiFetch';
import HeaderWrapper from '../components/HeaderWrapper';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function GmailClassifierCard({ stats, loading, error }) {
  if (loading) return <SummaryCard title="Gmail Classifier" details={["Loading..."]} actions={[]} />;
  if (error) return <SummaryCard title="Gmail Classifier" details={["Error loading data"]} actions={[]} />;

  return (
    <SummaryCard
      title="Gmail Classifier"
      details={[`${stats.total} emails Stored`, `${stats.unclassified} unclassified`]}
      actions={[]}
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

export default function HomePage() {
  const navigate = useNavigate();
  const { data: stats, loading, error } = useApiFetch('/api/gmail/stats');

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <SynthiaAvatar />
            <HeaderWrapper />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginTop: '2rem',
            }}
          >
            <GmailClassifierCard stats={stats} loading={loading} error={error} />
            <PlaceHolderCard />
            <PlaceHolderCard />
            <PlaceHolderCard />
          </div>

          <footer style={{ marginTop: '3rem', fontSize: '0.875rem', color: '#9ca3af' }}>
            Synthia v1.0.0
          </footer>
        </main>
      </div>
    </>
  );
}
