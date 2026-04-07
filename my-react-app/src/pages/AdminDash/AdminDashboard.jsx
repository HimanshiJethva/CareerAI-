// import React, { useState } from 'react';
// import AdminHeader from '../../components/AdminHeader';
// import './AdminDashboard.css'; // CSS wahi same rahegi
// import DashboardContent from '../../components/DashboardContent';
// import Sidebar from './sidebar';
// import ProfilePage from '../ProfilePage';


// function AdminDashboard({ setView }) {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   return (
//     <div className="admin-layout">
//       {/* 1. Sidebar (Fixed) */}
//       <aside className="sidebar">
//         {/* sidebar links... */}
//        <Sidebar 
//         activeTab={activeTab} 
//         setActiveTab={setActiveTab} 
//         setView={setView} 
//       />
//       </aside>

//       {/* 2. Main Wrapper */}
//       <div className="main-wrapper">
//         {/* Fixed Header */}
//         <AdminHeader setView={setView} />

//         {/* 👇 Content area ke ANDAR DashboardContent ko rakhein 👇 */}
//         <main className="content-body">
//            {/* <h1 className="page-title">Career AI - Command Center</h1> */}
//            {/* 👇 NAYA: Header and Buttons Yahan Rahenge 👇 */}
//            <div className="dashboard-page-header">
//             {/* <DashboardContent /> */}
//             {/* Dashboard Tab */}
//         {activeTab === 'dashboard' && <DashboardContent />}

//         {/* 👇 Profile Tab Fix 👇 */}
//         {activeTab === 'My Profile' && <ProfilePage/>}

//         {/* Students Tab */}
//         {activeTab === 'students' && (
//           <section><h1>Student Management Coming Soon...</h1></section>
//         )}

//         {activeTab === 'predictions' && (
//           <section><h1>prediction Management Coming Soon...</h1></section>
//         )}
               
//            </div>
//            {/* Yahan par aapka saara cards aur charts load hoga */}
           
           
//            {/* Baaki tables wagera yahan aayenge */}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;
import React, { useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import './AdminDashboard.css'; 
import DashboardContent from '../../components/DashboardContent';
import Sidebar from './sidebar';
import AdminProfile from '../AdminProfile';


function AdminDashboard({ setView }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="admin-layout">
      {/* 1. Sidebar (Fixed) */}
      <aside className="sidebar">
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

        {/* Content area */}
        <main className="content-body">
           <div className="dashboard-page-header">
            
            {/* Dashboard Tab: Pura content dikhayega */}
            {activeTab === 'dashboard' && <DashboardContent activeTab={activeTab} />}

            {/* Students Tab: Wahi component load hoga par sirf Table aur User Count dikhayega */}
            {activeTab === 'students' && <DashboardContent activeTab={activeTab} />}

            {/* Profile Tab */}
            {activeTab === 'My Profile' && <AdminProfile/>}

            {/* Predictions Tab: Isme bhi hum DashboardContent use kar sakte hain agar future mein filters lagane hon */}
            {activeTab === 'predictions' && <DashboardContent activeTab={activeTab}/>}

            {/* Settings Tab (Agar aapne Sidebar mein add kiya hai) */}
            {activeTab === 'Settings' && (
               <section><h1>Settings Page Coming Soon...</h1></section>
            )}
               
           </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;