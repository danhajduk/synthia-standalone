// File: src/pages/ClassifierPage.jsx
import React from 'react';
import Sidebar from '../components/Sidebar';
import SynthiaAvatar from '../components/SynthiaAvatar';
import ModelMetricsTable from '../components/ModelMetricsTable';
import ClassifierControls from '../components/ClassifierControls';
import ClassifierFetchControls from '../components/ClassifierFetchControls';
import { useApiFetch } from '../hooks/useApiFetch';
import { useBadgeStats } from '../hooks/useBadgeStats';
import HeaderWrapper from '../components/ClassifierWrapper';
import '../index.css';

export default function ClassifierPage() {
  const { data: badgeStats, loading, error, refresh } = useBadgeStats();
  const {
    data: metricsJson,
    loading: class_loading,
    error: class_error,
    refresh: refreshMetrics
  } = useApiFetch('/model/metrics');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <SynthiaAvatar />
          <HeaderWrapper stats={badgeStats} metrics={metricsJson} />
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <ModelMetricsTable data={metricsJson || {}} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <ClassifierControls onBadgeUpdate={refresh} onRetrainSuccess={refreshMetrics} />
          </div>
        </div>
      </main>
    </div>
  );
}
