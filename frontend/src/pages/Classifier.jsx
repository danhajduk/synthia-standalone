import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SynthiaAvatar from '../components/SynthiaAvatar';
import ClassifierBadges from '../components/ClassifierBadges';
import ModelMetricsTable from '../components/ModelMetricsTable';
import ClassifierControls from '../components/ClassifierControls';
import ClassifierFetchControls from '../components/ClassifierFetchControls';
import { useApiFetch } from '../hooks/useApiFetch';
import { useBadgeStats } from '../hooks/useBadgeStats';


export default function Classifier() {
  const { data: metricsJson, loading: class_loading, error: class_error } = useApiFetch('/model/metrics');
  // const { data: stats, loading: stats_loading, error: stats_error } = useApiFetch('/api/gmail/stats');
  const { refresh: refreshBadges } = useBadgeStats(); 

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <SynthiaAvatar />
          <Header />
        </div>

        <ClassifierBadges />

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
          <ModelMetricsTable data={metricsJson || {}} />

          </div>
          <ClassifierControls onBadgeUpdate={refreshBadges} />

        </div>

        <ClassifierFetchControls />

        <footer style={{ marginTop: '3rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          Synthia v1.0.0
        </footer>
      </main>
    </div>
  );
}
