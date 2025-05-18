// File: App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PageRenderer from './pages/PageRenderer';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PageRenderer pageType="home" />} />
      <Route path="/classifier" element={<PageRenderer pageType="classifier" />} />
      <Route path="/calendar" element={<PageRenderer pageType="calendar" />} />
      <Route path="/notifications" element={<PageRenderer pageType="notifications" />} />
      <Route path="/settings" element={<PageRenderer pageType="settings" />} />
      <Route path="*" element={<div style={{ padding: '2rem' }}>404: Page Not Found</div>} />
    </Routes>
  );
}

export default App;
