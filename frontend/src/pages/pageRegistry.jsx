// src/pages/pageRegistry.jsx
import HomePage from './HomePage';
import ClassifierPage from './ClassifierPage';
import CalendarPage from './CalendarPage';

export const pageRegistry = {
  home: HomePage,
  classifier: ClassifierPage,
  calendar: CalendarPage,
  notifications: () => <div>Notifications Coming Soon</div>,
  settings: () => <div>Settings Coming Soon</div>
};
