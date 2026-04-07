import React from 'react';
import './Sidebar.css';
import { supabase } from '../../supabaseClient';
import { 
  LayoutDashboard, Users, GraduationCap, 
  LogOut, Eye, BrainCircuit, User, Settings, Monitor
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, setView }) => {

  // Logout Function: Component ke andar hona chahiye taaki setView chale
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.clear(); 
      setView('landing');   
    } catch (error) {
      console.error("Logout Error:", error.message);
      // Force logout if supabase fails
      localStorage.clear();
      setView('landing');
    }
  };

  return (
    <aside className="admin-sidebar">
      {/* Brand Logo Section */}
      <div className="sidebar-header">
        <div className="logo-box">
          <BrainCircuit size={28} color="#ff8e9e"/>
        </div>
        <div className="logo-text">
          <span className="skill">Career</span> <span className="link">AI</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* MAIN MENU SECTION */}
        <div className="nav-section">
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={28} /> <span className="nav-label">Dashboard</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={28} /> <span className="nav-label">Students</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictions')}
          >
            <GraduationCap size={30} /> <span className="nav-label">Predictions</span>
          </div>
        </div>

        {/* ACCOUNT SECTION */}
        <div className="nav-section">
          <div className="section-title">ACCOUNT</div>
          
          <div className={`nav-item ${activeTab === 'My Profile' ? 'active' : ''}`}
            onClick={() => setView('profile')}>
            <User size={28} /> <span className="nav-label">My Profile</span>
          </div>
          
          <div className={`nav-item ${activeTab === 'Settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('Settings')}>
            <Settings size={28} /> <span className="nav-label">Settings</span>
          </div>
        </div>

        {/* LIVE PREVIEWS SECTION */}
        <div className="nav-section">
          <div className="section-title">PREVIEWS</div>
          
          <div className="nav-item secondary" onClick={() => setView('landing')}>
            <Eye size={28} /> <span className="nav-label">Landing Page</span>
          </div>

          <div className="nav-item secondary" onClick={() => setView('DashboardPage')}>
            <Monitor size={28} /> <span className="nav-label">Student View</span>
          </div>
        </div>
      </nav>

      {/* Logout at bottom */}
      <div className="sidebar-footer">
        <div className="logout-btn" onClick={handleLogout}>
          <LogOut size={28} /> <span>Logout</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;