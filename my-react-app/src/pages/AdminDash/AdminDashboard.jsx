// import React from 'react';
// import './AdminDashboard.css';

// function AdminDashboard() {
//   return (
//     <div className="admin-container">
      
//       {/* 1. SIDEBAR */}
//       <aside className="sidebar">
//         <div className="sidebar-logo">
//           🧠 <h2>CareerAI</h2>
//         </div>
//         <ul className="sidebar-menu">
//           <li className="active"><span>🎛️</span> Dashboard</li>
//           <li><span>👨‍🎓</span> Students</li>
//           <li><span>🎯</span> Predictions</li>
//           <li><span>📊</span> Analytics <span className="badge">beta</span></li>
//           <li><span>⚙️</span> Models</li>
//         </ul>
//         <div className="sidebar-logout">
//           <span>🗑️</span> Log Out
//         </div>
//       </aside>

//       {/* 2. MAIN CONTENT AREA */}
//       <main className="main-content">
        
//         {/* TOP HEADER */}
//         <header className="admin-header">
//           <div className="search-bar">
//             <span>🔍</span>
//             <input type="text" placeholder="Search search..." />
//           </div>
//           <div className="header-actions">
//             <button className="btn-export">📊 Export Reports</button>
//             <button className="btn-add">Add Career Category +</button>
//           </div>
//         </header>

//         <h1 className="page-title">Career AI - Command Center</h1>

//         {/* 3. STATS CARDS */}
//         <div className="section-title">Top Statistics Cards</div>
//         <div className="stats-grid">
//           <div className="stat-card">
//             <p>Total Registered Students</p>
//             <h3>1,450</h3>
//           </div>
//           <div className="stat-card">
//             <p>AI Predictions Made</p>
//             <h3>4,700</h3>
//           </div>
//           <div className="stat-card">
//             <p>System Accuracy</p>
//             <h3>88.5%</h3>
//           </div>
//           <div className="stat-card">
//             <p>System Accuracy (Recent)</p>
//             <h3>88.5%</h3>
//           </div>
//         </div>

//         {/* 4. CHARTS SECTION (Placeholders for now) */}
//         <div className="section-title">Key Insights</div>
//         <div className="charts-grid">
//           <div className="chart-card">
//             <h4>Top Career Predictions</h4>
//             <div className="placeholder-box">
//               <p>Pie Chart aayega yahan (Install recharts)</p>
//             </div>
//           </div>
//           <div className="chart-card">
//             <h4>Prediction Volume</h4>
//             <div className="placeholder-box">
//               <p>Line Chart aayega yahan (Install recharts)</p>
//             </div>
//           </div>
//         </div>

//         {/* 5. TABLE & FEEDBACK SECTION */}
//         <div className="bottom-grid">
          
//           <div className="table-section">
//             <div className="section-title">Student List</div>
//             <div className="table-card">
//               <h4>Recent Student Registrations</h4>
//               <table className="admin-table">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Email Address</th>
//                     <th>Stream</th>
//                     <th>Registered Date</th>
//                     <th>AI Suggested Career</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td>Ashish Singh</td>
//                     <td>ashish@gmail.com</td>
//                     <td>PCM</td>
//                     <td>27/08/2024</td>
//                     <td>Software Engineering</td>
//                     <td>👁️ 🗑️</td>
//                   </tr>
//                   <tr>
//                     <td>Karan Khan</td>
//                     <td>karan@gmail.com</td>
//                     <td>PCM/PCB</td>
//                     <td>27/08/2024</td>
//                     <td>Data Science</td>
//                     <td>👁️ 🗑️</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           <div className="feedback-section">
//             <div className="section-title">Feedback Corner</div>
//             <div className="feedback-card">
//               <h4>User Satisfaction</h4>
//               <div className="gauge-placeholder">
//                 <h2 style={{color: '#ff6b6b'}}>85%</h2>
//               </div>
//               <p className="feedback-text">Recent positive comments: <strong>"Extremely helpful!"</strong></p>
//               <p className="feedback-text">Comments: <strong>"Changed my life."</strong></p>
//             </div>
//           </div>

//         </div>

//       </main>
//     </div>
//   );
// }

// export default AdminDashboard;
import React, { useState } from 'react';
import Sidebar from '../../components/Admin_components/sidebar'; // Path sahi hai na? Check kar lena
import DashboardOverview from '../../components/Admin_components/DashboardOverview';
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

        {/* Isi tarah Analytics, Predictions, aur Models ke liye add karein */}
        
      </main>
    </div>
  );
};

export default AdminDashboard;