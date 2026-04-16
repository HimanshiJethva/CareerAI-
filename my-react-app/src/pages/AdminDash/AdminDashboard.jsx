// import React, { useState } from 'react';
// import AdminHeader from '../../components/AdminHeader';
// import './AdminDashboard.css'; 
// import DashboardContent from '../../components/DashboardContent';
// import Sidebar from './sidebar';
// import ProfilePage from '../ProfilePage';


// function AdminDashboard({ setView }) {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [searchTerm, setSearchTerm] = useState("");
//   return (
//     <div className="admin-layout">
//       {/* 1. Sidebar (Fixed) */}
//       <aside className="sidebar">
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

//         {/* Content area */}
//         <main className="content-body">
//            <div className="dashboard-page-header">
            
//             {/* Dashboard Tab: Pura content dikhayega */}
//             {activeTab === 'dashboard' && <DashboardContent activeTab={activeTab} />}

//             {/* Students Tab: Wahi component load hoga par sirf Table aur User Count dikhayega */}
//             {activeTab === 'students' && <DashboardContent activeTab={activeTab} />}

//             {/* Profile Tab */}
//             {activeTab === 'My Profile' && <ProfilePage/>}

//             {/* Predictions Tab: Isme bhi hum DashboardContent use kar sakte hain agar future mein filters lagane hon */}
//             {activeTab === 'predictions' && <DashboardContent activeTab={activeTab}/>}

//             {/* Settings Tab (Agar aapne Sidebar mein add kiya hai) */}
//             {activeTab === 'Settings' && (
//                <section><h1>Settings Page Coming Soon...</h1></section>
//             )}
               
//            </div>
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
import ProfilePage from '../ProfilePage';

function AdminDashboard({ setView }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState(""); // State yahan hai

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
            
            {/* --- MAINE YAHAN PROPS ADD KAR DIYE HAIN --- */}

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <DashboardContent 
                activeTab={activeTab} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
              />
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <DashboardContent 
                activeTab={activeTab} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
              />
            )}

            {/* Predictions Tab */}
            {activeTab === 'predictions' && (
              <DashboardContent 
                activeTab={activeTab} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
              />
            )}

            {/* Profile Tab */}
            {activeTab === 'My Profile' && <ProfilePage setView={setView} />}

            {/* Settings Tab */}
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