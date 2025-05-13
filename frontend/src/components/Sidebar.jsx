import React from 'react';
import { FaHome, FaEnvelope, FaCalendarAlt, FaBell, FaCog } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Synthia AI Assistant
      </h1>

      <nav>
        <NavItem icon={<FaHome />} label="Home Page" />
        <NavItem icon={<FaEnvelope />} label="Gmail Classifier" />
        <NavItem icon={<FaCalendarAlt />} label="Calendar & Tasks" />
        <NavItem icon={<FaBell />} label="Notifications" />
        <NavItem icon={<FaCog />} label="Settings" />
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '2rem', fontSize: '0.75rem', color: '#9ca3af' }}>
        Synthia v1.0.0
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label }) => (
  <div className="nav-item">
    <span style={{ fontSize: '1.25rem' }}>{icon}</span>
    <span>{label}</span>
  </div>
);

export default Sidebar;
