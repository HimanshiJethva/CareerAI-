import React from 'react';
import './Sidebar.css';
import { supabase } from '../../../../backend/supabaseClient';
import { 
  LayoutDashboard, Users, GraduationCap, 
  LogOut, Eye, BrainCircuit, User, Settings, Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';


const Sidebar = ({ activeTab, setActiveTab, navigate }) => {

  // Logout Function: Component ke andar hona chahiye taaki setView chale
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.clear();  
      navigate('/login');
      toast.success("Logout successfully!");  
    } catch (error) {
      console.error("Logout Error:", error.message);
      // Force logout if supabase fails
      localStorage.clear();
       navigate('/login');
      
      
    }
  };

  return (
    <aside className="admin-sidebar">
      {/* Brand Logo Section */}
      <div className="sidebar-header">
        {/* <div className="logo-box">
          <BrainCircuit size={28} color="#ff8e9e"/>
        </div> */}
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
            <LayoutDashboard size={23} /> <span className="nav-label">Dashboard</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={23} /> <span className="nav-label">Students</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictions')}
          >
            <GraduationCap size={23} /> <span className="nav-label">Predictions</span>
          </div>
        </div>

        {/* ACCOUNT SECTION */}
        <div className="nav-section">
          {/* <div className="section-title">ACCOUNT</div> */}
          
          <div className={`nav-item ${activeTab === 'My Profile' ? 'active' : ''}`}
            onClick={() => navigate('/profile')}>
            <User size={23} /> <span className="nav-label">My Profile</span>
          </div>
          
          <div className={`nav-item ${activeTab === 'Settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('Settings')}>
            <Settings size={23} /> <span className="nav-label">Settings</span>
          </div>
        </div>

        {/* LIVE PREVIEWS SECTION */}
        {/* <div className="nav-section">
          <div className="section-title">PREVIEWS</div>
          
          <div className="nav-item secondary" onClick={() => navigate('/')}>
            <Eye size={22} /> <span className="nav-label">Landing Page</span>
          </div>

          <div className="nav-item secondary" onClick={() => navigate('/Dashboardpage')}>
            <Monitor size={22} /> <span className="nav-label">Student View</span>
          </div>
        </div> */}
      </nav>

      {/* Logout at bottom */}
      <div className="sidebar-footer">
        <div className="logout-btn" onClick={handleLogout}>
          <LogOut size={25} /> <span>Logout</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;