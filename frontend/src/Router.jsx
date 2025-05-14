import { Routes, Route } from 'react-router-dom';
import App from './App';
import Classifier from './pages/Classifier';
import ManualClassifier from './pages/ManualClassifier';
import Reputation from './pages/Reputation';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/classifier" element={<Classifier />} />
      <Route path="/classifier/manual-classifier" element={<ManualClassifier />} />
      <Route path="/classifier/reputation" element={<Reputation />} />
    </Routes>
  );
}
