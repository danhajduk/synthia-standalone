import { Routes, Route } from 'react-router-dom';
import App from './App';
import Classifier from './pages/ClassifierPage';
import ManualClassifier from './pages/ManualClassifier';
import Reputation from './pages/Reputation';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import './index.css';
import CalendarPage from './pages/CalendarPage';

export default function Router() {
  return (
<Routes>
  <Route path="/" element={<App />} />
  <Route path="/classifier" element={<Classifier />} />
  <Route path="/classifier/manual-classifier" element={<ManualClassifier />} />
  <Route path="/classifier/reputation" element={<Reputation />} />
  <Route path="/settings" element={<Settings />} />
  <Route path="/calendar" element={<CalendarPage />} />
  <Route path="/notifications" element={<Notifications />} /> or placeholder
</Routes>
  );
}
