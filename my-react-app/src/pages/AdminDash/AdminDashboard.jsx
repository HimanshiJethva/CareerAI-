import React from 'react';
import AdminHeader from '../../components/AdminHeader';
import './AdminDashboard.css'; // CSS wahi same rahegi
import DashboardContent from '../../components/DashboardContent';

function AdminDashboard({ setView }) {
  return (
    <div className="admin-layout">
      {/* 1. Sidebar (Fixed) */}
      <aside className="sidebar">
        <div className="sidebar-logo">Career AI</div>
        {/* sidebar links... */}
      </aside>

      {/* 2. Main Wrapper */}
      <div className="main-wrapper">
        {/* Fixed Header */}
        <AdminHeader setView={setView} />

        {/* 👇 Content area ke ANDAR DashboardContent ko rakhein 👇 */}
        <main className="content-body">
           {/* <h1 className="page-title">Career AI - Command Center</h1> */}
           {/* 👇 NAYA: Header and Buttons Yahan Rahenge 👇 */}
           <div className="dashboard-page-header">
            <DashboardContent />
               {/* <h1 className="page-title">Career AI - Command Center</h1> */}
               {/* <div className="header-actions">
                   <button className="btn-export">
                       📗 Export Reports
                   </button>
                   <button className="btn-add">
                       Add Career Category +
                   </button>
               </div> */}
           </div>
           {/* Yahan par aapka saara cards aur charts load hoga */}
           
           
           {/* Baaki tables wagera yahan aayenge */}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;