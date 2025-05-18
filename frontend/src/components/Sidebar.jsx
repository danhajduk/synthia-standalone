import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaEnvelope, FaCalendarAlt, FaBell, FaCog } from 'react-icons/fa';
import '../styles/Sidebar.css'; // Import the stylesheet

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Synthia AI Assistant
        </h1>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'right' }}>
          v1.0.0
        </div>
      </div>

      <nav>
        <NavItem icon={<FaHome />} label="Home Page" to="/" active={location.pathname === '/'} navigate={navigate} />
        <NavItem icon={<FaEnvelope />} label="Gmail Classifier" to="/classifier" active={location.pathname === '/classifier'} navigate={navigate} />
        <NavItem icon={<FaCalendarAlt />} label="Calendar & Tasks" to="/calendar" active={location.pathname === '/calendar'} navigate={navigate} />
        <NavItem icon={<FaBell />} label="Notifications" to="/notifications" active={location.pathname === '/notifications'} navigate={navigate} />
        <NavItem icon={<FaCog />} label="Settings" to="/settings" active={location.pathname === '/settings'} navigate={navigate} />
      </nav>
    </aside>
  );
};

const NavItem = ({ icon, label, to, navigate, active }) => (
  <div
    className={`nav-item ${active ? 'active' : ''}`}
    onClick={() => navigate(to)}
  >
    <span style={{ fontSize: '1.25rem' }}>{icon}</span>
    <span>{label}</span>
  </div>
);

export default Sidebar;
