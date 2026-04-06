// export default AdminDashboard;
import React, { useState } from 'react';
import Sidebar from '../../components/Admin_components/sidebar'; // Path sahi hai na? Check kar lena
import DashboardOverview from '../../components/Admin_components/DashboardOverview';
import ProfilePage from '../ProfilePage';
// import './AdminDashboard.css'; // Dashboard ka apna CSS

const AdminDashboard = ({ setView }) => {
  // 1. Current active tab track karne ke liye state
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="admin-page-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* 2. Sidebar with Props */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setView={setView} 
      />

      {/* 3. Right Side Content Area */}
      <main className="admin-content" style={{ flex: 1, backgroundColor: '#f9f7f2', padding: '40px', marginLeft: '260px'}}>
        
        {/* Render content based on Active Tab */}
        {activeTab === 'dashboard' && <DashboardOverview/>}

        {activeTab === 'students' && (
          <section>
            <h1 style={{ color: '#2C3E50', marginBottom: '20px' }}>Student Management</h1>
            {/* Student Table yahan aayega */}
          </section>
        )}
        {activeTab === 'My Profile' && <ProfilePage/>}

        {/* Isi tarah Analytics, Predictions, aur Models ke liye add karein */}
        
      </main>
    </div>
  );
};

export default AdminDashboard;