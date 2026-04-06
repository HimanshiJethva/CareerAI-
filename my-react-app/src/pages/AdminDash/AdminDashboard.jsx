// // export default AdminDashboard;
// import React, { useState } from 'react';
// import Sidebar from './sidebar'; // Path sahi hai na? Check kar lena
// import DashboardOverview from '../../components/Admin_components/DashboardOverview';
// import ProfilePage from '../ProfilePage';
// // import './AdminDashboard.css'; // Dashboard ka apna CSS

// const AdminDashboard = ({ setView }) => {
//   // 1. Current active tab track karne ke liye state
//   const [activeTab, setActiveTab] = useState('dashboard');

//   return (
//     <div className="admin-page-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      
//       {/* 2. Sidebar with Props */}
//       <Sidebar 
//         activeTab={activeTab} 
//         setActiveTab={setActiveTab} 
//         setView={setView} 
//       />

//       {/* 3. Right Side Content Area */}
//       <main className="admin-content" style={{ flex: 1, backgroundColor: '#f9f7f2', padding: '40px', marginLeft: '260px'}}>
        
//         {/* Render content based on Active Tab */}
//         {activeTab === 'dashboard' && <DashboardOverview/>}

//         {activeTab === 'students' && (
//           <section>
//             <h1 style={{ color: '#2C3E50', marginBottom: '20px' }}>Student Management</h1>
//             {/* Student Table yahan aayega */}
//           </section>
//         )}
//         {activeTab === 'My Profile' && <ProfilePage/>}

//         {/* Isi tarah Analytics, Predictions, aur Models ke liye add karein */}
        
//       </main>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import './AdminDashboard.css'; // CSS wahi same rahegi
import DashboardContent from '../../components/DashboardContent';
import Sidebar from './sidebar';
import ProfilePage from '../ProfilePage';




function AdminDashboard({ setView }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  return (
    <div className="admin-layout">
      {/* 1. Sidebar (Fixed) */}
      <aside className="sidebar">
        {/* sidebar links... */}
       <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setView={setView} 
      />
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
            {/* <DashboardContent /> */}
            {/* Dashboard Tab */}
        {activeTab === 'dashboard' && <DashboardContent />}

        {/* 👇 Profile Tab Fix 👇 */}
        {activeTab === 'My Profile' && <ProfilePage/>}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <section><h1>Student Management Coming Soon...</h1></section>
        )}

        {activeTab === 'predictions' && (
          <section><h1>prediction Management Coming Soon...</h1></section>
        )}
               
           </div>
           {/* Yahan par aapka saara cards aur charts load hoga */}
           
           
           {/* Baaki tables wagera yahan aayenge */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;