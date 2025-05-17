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
import HeaderWrapper  from '../components/ClassifierWrapper';


export default function Classifier() {
  const { data: metricsJson, loading: class_loading, error: class_error } = useApiFetch('/model/metrics');
  const { data, loading, error, refresh } = useBadgeStats();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <SynthiaAvatar />
          <HeaderWrapper/>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
          <ModelMetricsTable data={metricsJson || {}} />

          </div>
          <ClassifierControls onBadgeUpdate={refresh} />

        </div>

        <ClassifierFetchControls />

      </main>
    </div>
  );
}
