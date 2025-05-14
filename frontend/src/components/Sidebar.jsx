import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaEnvelope, FaCalendarAlt, FaBell, FaCog } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Synthia AI Assistant
      </h1>

      <nav>
        <NavItem icon={<FaHome />} label="Home Page" onClick={() => navigate('/')} />
        <NavItem icon={<FaEnvelope />} label="Gmail Classifier" onClick={() => navigate('/classifier')} />
        <NavItem icon={<FaCalendarAlt />} label="Calendar & Tasks" onClick={() => navigate('/calendar')} />
        <NavItem icon={<FaBell />} label="Notifications" onClick={() => navigate('/notifications')} />
        <NavItem icon={<FaCog />} label="Settings" onClick={() => navigate('/settings')} />
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '2rem', fontSize: '0.75rem', color: '#9ca3af' }}>
        Synthia v1.0.0
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, onClick }) => (
  <div className="nav-item" onClick={onClick} style={{ cursor: 'pointer' }}>
    <span style={{ fontSize: '1.25rem' }}>{icon}</span>
    <span>{label}</span>
  </div>
);

export default Sidebar;
