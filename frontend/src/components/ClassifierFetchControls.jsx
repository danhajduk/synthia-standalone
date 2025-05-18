import React from 'react';
import { useNavigate } from 'react-router-dom';
import SynthiaButton from '../components/SynthiaButton';
import ButtonContainer from './buttons/ButtonContainer';

export default function ClassifierFetchControls() {
  const buttons = [
    {
      type: 'fetch',
      props: {
        label: "Fetch Today's Emails",
        loadingLabel: "Fetching...",
        icon: "📥",
        endpoint: "/api/gmail/fetch",
        method: "GET"
      }
    },
    {
      type: 'fetch',
      props: {
        label: "Fetch Last 14 Days",
        loadingLabel: "Fetching...",
        icon: "🗓️",
        endpoint: "/api/gmail/debug/fetch14",
        method: "GET"
      }
    },
    {
      type: 'fetch',
      props: {
        label: "Fetch Last 90 Days",
        loadingLabel: "Fetching...",
        icon: "📆",
        endpoint: "/api/gmail/debug/fetch90",
        method: "GET"
      }
    },
    {
      type: 'fetch',
      props: {
        label: "Reprocess All Emails",
        loadingLabel: "Reprocessing...",
        icon: "♻️",
        endpoint: "/api/gmail/reprocess",
        method: "POST"
      }
    },
    {
      type: 'fetch',
      props: {
        label: "Export Labeled Dataset",
        loadingLabel: "Exporting...",
        icon: "📤",
        endpoint: "/api/gmail/export",
        method: "GET"
      }
    },
    {
      type: 'fetch',
      props: {
        label: "Download Model Snapshot",
        loadingLabel: "Downloading...",
        icon: "💾",
        endpoint: "/api/gmail/download-model",
        method: "GET"
      }
    }
  ];
  return (
    <ButtonContainer
      direction="horizontal"
      align="start"
      wrap
      className="mt-8 gap-3 flex-wrap"
      buttons={buttons}
    />
  );
}
  
