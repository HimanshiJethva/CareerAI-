import React from 'react';
import './Sidebar.css';
import { 
  LayoutDashboard, Users, GraduationCap, 
  BarChart3, Settings, LogOut, Eye, 
  BrainCircuit
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, setView }) => {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={30} /> },
    { id: 'students', label: 'Students', icon: <Users size={30} /> },
    { id: 'predictions', label: 'Predictions', icon: <GraduationCap size={30} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={30} />, badge: 'beta' },
    { id: 'models', label: 'Models', icon: <Settings size={30} /> },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="logo-box">
          <BrainCircuit size={24} color="#ff8e9e"/></div>
        <span className="logo-text">CareerAI</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div 
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="beta-badge">{item.badge}</span>}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-label">Quick Actions</div>
        
        <div className="footer-item" onClick={() => setView('landing')}>
          <Eye size={18} /> <span>Live Preview</span>
        </div>
        
        <div className="logout-btn" onClick={() => { localStorage.clear(); setView('landing'); }}>
          <LogOut size={18} /> <span> Sign Out </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;