import React, { useState } from 'react';
import Sidebar from '../../components/Admin_components/Sidebar'; // Path sahi hai na? Check kar lena
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
      <main className="admin-content" style={{ flex: 1, backgroundColor: '#f9f7f2', padding: '40px' }}>
        
        {/* Render content based on Active Tab */}
        {activeTab === 'dashboard' && (
          <section>
            <h1 style={{ color: '#2C3E50', marginBottom: '20px' }}>System Overview</h1>
            {/* Yahan aapke Cards aur Charts aayenge */}
            <div style={{ background: 'white', padding: '40px', borderRadius: '15px' }}>
                Dashboard Content Loading...
            </div>
          </section>
        )}

        {activeTab === 'students' && (
          <section>
            <h1 style={{ color: '#2C3E50', marginBottom: '20px' }}>Student Management</h1>
            {/* Student Table yahan aayega */}
          </section>
        )}

        {/* Isi tarah Analytics, Predictions, aur Models ke liye add karein */}
        
      </main>
    </div>
  );
};

export default AdminDashboard;