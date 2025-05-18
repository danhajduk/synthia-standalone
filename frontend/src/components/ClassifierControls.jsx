import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatusAndRefresh } from '../hooks/useStatusAndRefresh';
import ButtonContainer from './buttons/ButtonContainer';

export default function ClassifierControls({ onBadgeUpdate, onRetrainSuccess }) {
  const [threshold, setThreshold] = useState(0.5);
  const navigate = useNavigate();
  const { trigger, loading } = useStatusAndRefresh();

  const buttons = (setThreshold) => [
    {
      type: 'fetch',
      props: {
        label: 'Train Model',
        loadingLabel: 'Training...',
        icon: '📥',
        endpoint: '/api/gmail/reputation/train',
        method: 'POST',
        fullWidth: true
      }
    },
    {
      type: 'action',
      props: {
        label: 'Re-evaluate Now',
        icon: '🔁',
        onClick: () => console.log('Re-evaluate Now'),
        fullWidth: true
      }
    },
    {
      type: 'action',
      props: {
        label: 'Reset Threshold',
        icon: '🎯',
        onClick: () => setThreshold(0.5),
        fullWidth: true
      }
    },
    {
      type: 'action',
      props: {
        label: 'Clear DB Labels',
        icon: '🗑️',
        onClick: () => console.log('Clear DB Labels'),
        fullWidth: true
      }
    },
    {
      type: 'action',
      props: {
        label: 'Sync with Gmail',
        icon: '🔄',
        onClick: () => console.log('Sync with Gmail'),
        fullWidth: true
      }
    },
    {
      type: 'link',
      props: {
        label: 'Manual Classification',
        icon: '📝',
        navigateTo: '/classifier/manual-classifier',
        fullWidth: true
      }
    },
    {
      type: 'link',
      props: {
        label: 'Sender Reputation',
        icon: '📊',
        navigateTo: '/classifier/reputation',
        fullWidth: true
      }
    },
    {
      type: 'link',
      props: {
        label: 'Sender Reputation',
        icon: '📊',
        navigateTo: '/classifier/reputation',
        fullWidth: true
      }
    }
  ];
  
  const remoteButtons = [
    {
      type: 'fetch',
      props: {
        label: "Classify One Batch",
        loadingLabel: "Classifying...",
        icon: "🔬",
        endpoint: "/api/gmail/debug/classify-one-batch",
        method: "GET",
        onSuccess: onBadgeUpdate,
        fullWidth: true
      }
    },
    {
      type: 'fetch',
      props: {
        label: "Classify All",
        loadingLabel: "Classifying...",
        icon: "🧪",
        endpoint: "/api/gmail/debug/classify-all",
        method: "GET",
        onSuccess: onBadgeUpdate,
        fullWidth: true
      }
    }
  ];
  
  return (
    <div style={{ minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 🧠 Local Model Controls */}

        <div>
        <h3 style={{ marginBottom: '0rem' }}>Model Threshold:</h3>
          <ButtonContainer
            direction="vertical"
            align="start"
            buttons={buttons(setThreshold)}
          />
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginTop: '0.25rem',
              borderRadius: '0.375rem',
              border: '1px solid #4b5563',
              background: '#1f2937',
              color: '#fff'
            }}
          />
        </div>

      {/* ☁️ Remote AI Classification */}
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Remote Classification</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <ButtonContainer
          direction="vertical"
          align="start"
          buttons={remoteButtons}
        />
        </div>
      </div>
    </div>
  );
}
