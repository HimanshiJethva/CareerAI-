// import React, { useState, useEffect } from 'react';
// import { 
//   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
// } from 'recharts';
// import { Eye, Trash2 } from 'lucide-react'; 
// import { supabase } from '../supabaseClient';
// import './DashboardContent.css';

// const DashboardContent = ({ activeTab }) => {
//   const [dashboardStats, setDashboardStats] = useState({
//     totalStudents: 0,
//     totalPredictions: 0,
//     accuracy: 91.9 
//   });

//   const [students, setStudents] = useState([]); 
//   const [showAll, setShowAll] = useState(false); 

//   useEffect(() => {
//     const fetchRealData = async () => {
//       try {
//         // 1. Fetch Stats (Users count)
//         const { count: studentCount } = await supabase
//           .from('users') 
//           .select('*', { count: 'exact', head: true }); 

//         // 2. Fetch Stats (Predictions count)
//         const { count: predictionCount } = await supabase
//           .from('predictions') 
//           .select('*', { count: 'exact', head: true });

//         // 3. Fetch Actual Student List from 'users' table
//         // Students fetch karne ka sahi tarika
//             const { data: studentsData, error: fetchError } = await supabase
//               .from('users')
//               .select('*') // 👈 '*' use karne se saare existing columns aa jayenge bina error ke
//               .order('created_at', { ascending: false });

//             if (fetchError) {
//               console.error("Supabase Error:", fetchError.message);
//             }

//             if (studentsData) {
//               setStudents(studentsData);
//             }

//         setDashboardStats({
//           totalStudents: studentCount || 0,
//           totalPredictions: predictionCount || 0,
//           accuracy: 91.9 
//         });
//       } catch (error) {
//         console.error("Data fetch error:", error.message);
//       }
//     };
//     fetchRealData();
//   }, []);

//   const lineData = [
//     { name: 'Last', value: 100 },
//     { name: '', value: 250 },
//     { name: 'Month', value: 300 },
//     { name: '', value: 380 },
//     { name: 'Month', value: 450 },
//   ];

//   const pieData = [
//     { name: 'Software Engineering', value: 30, color: '#ff857d' },
//     { name: 'Data Science', value: 25, color: '#1a365d' },
//     { name: 'Digital Marketing', value: 15, color: '#6b46c1' },
//     { name: 'Product Management', value: 30, color: '#38b2ac' },
//   ];

//   return (
//     <div className="dashboard-body">
      
//       {/* --- TOP SECTION: Cards & Charts --- */}
//       <div className="dashboard-top-layout">
        
//         {/* Left: Stats Cards */}
//         <div className="stats-column">
//           <div className="section-header">
//             <h3 className="section-title">
//               {activeTab === 'students' ? 'Student Statistics' : 'Top Statistics Cards'}
//             </h3>
//           </div>
//           <div className="stats-grid-vertical">
//             <div className="stat-card">
//               <p>Total Registered Students</p>
//               <h2>{dashboardStats.totalStudents.toLocaleString()}</h2>
//               <div className="card-icon">👤</div>
//             </div>
//             <div className="stat-card">
//               <p>AI Predictions Made</p>
//               <h2>{dashboardStats.totalPredictions.toLocaleString()}</h2>
//               <div className="card-icon">🧠</div>
//             </div>
//             <div className="stat-card">
//               <p>System Accuracy</p>
//               <h2>{dashboardStats.accuracy}%</h2>
//               <div className="card-icon">📈</div>
//             </div>
//           </div>
//         </div>

//         {/* Right: Insights (Charts) */}
//         <div className="insights-column">
//           <div className="section-header right-header">
//             <h3 className="section-title">Key Insights</h3>
//             <div className="header-actions">
//               <button className="btn-export">📗 Export Reports</button>
//               <button className="btn-add">Add Career Category +</button>
//             </div>
//           </div>
          
//           <div className="insights-white-box">
//             <div className="insights-row-inner">
              
//               {/* Donut Chart Simulation */}
//               <div className="chart-container pie-container">
//                 <h4 className="chart-title">Top Career Predictions</h4>
//                 <div className="custom-donut-wrapper">
//                     <div className="custom-donut-chart">
//                         <div className="donut-hole"></div>
//                     </div>
//                     <div className="custom-legend">
//                         {pieData.map((item, index) => (
//                             <div className="legend-item" key={index}>
//                                 <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
//                                 <span className="legend-text">{item.name}</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//               </div>

//               <div className="chart-divider"></div>

//               {/* Area Chart - Accurate Reference Style */}
//               <div className="chart-container area-container">
//                 <h4 className="chart-title" style={{ marginBottom: '20px' }}>Prediction Volume</h4>
//                 <AreaChart width={420} height={220} data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
//                   <defs>
//                     <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#38b2ac" stopOpacity={0.3}/>
//                       <stop offset="95%" stopColor="#38b2ac" stopOpacity={0}/>
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f0f0f0" />
//                   <XAxis dataKey="name" axisLine={{ stroke: '#E2E8F0' }} tickLine={false} tick={{ fill: '#718096', fontSize: 11 }} dy={10} />
//                   <YAxis axisLine={false} tickLine={false} tick={{ fill: '#718096', fontSize: 11 }} domain={[0, 500]} ticks={[0, 100, 200, 300, 400, 500]} />
//                   <Tooltip />
//                   <Area type="monotone" dataKey="value" stroke="#38b2ac" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
//                 </AreaChart>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* --- BOTTOM SECTION: Student List & Feedback --- */}
//       <div className="dashboard-bottom-layout" style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        
//         {/* Student Table */}
//         <div className="student-list-container" style={{ flex: 3, background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
//           <h3 className="section-title" style={{ marginBottom: '20px' }}>Recent Student Registrations</h3>
//           <table className="student-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
//             <thead>
//               <tr style={{ textAlign: 'left', borderBottom: '1px solid #f0f0f0', color: '#718096', fontSize: '13px' }}>
//                 <th style={{ padding: '12px' }}>Name</th>
//                 <th>Email Address</th>
//                 <th>Stream</th>
//                 <th>Registered Date</th>
//                 <th>AI Suggested Career</th>
//                 {/* <th>Action</th> */}
//               </tr>
//             </thead>
//             <tbody style={{ fontSize: '14px', color: '#2D3748' }}>
//               {students.slice(0, showAll ? students.length : 5).map((student, idx) => (
//                 <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9' }}>
//                   <td style={{ padding: '12px' }}>{student.name}</td>
//                   <td>{student.email}</td>
//                   <td>{student.stream || 'N/A'}</td>
//                   <td>{new Date(student.created_at).toLocaleDateString()}</td>
//                   <td style={{ color: '#A0AEC0', fontStyle: 'italic' }}>Pending AI...</td>
//                   {/* <td style={{ display: 'flex', gap: '10px', alignItems: 'center', paddingTop: '10px' }}>
//                     <button style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
//                       <Eye size={18} strokeWidth={2} color="#4A5568" />
//                     </button>
//                     <button style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
//                       <Trash2 size={18} strokeWidth={2} color="#e53e3e" />
//                     </button>
//                   </td> */}
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* View All Button */}
//           {!showAll && students.length > 5 && (
//             <div style={{ textAlign: 'center', marginTop: '20px' }}>
//               <button 
//                 onClick={() => setShowAll(true)}
//                 style={{ background: '#38b2ac', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
//               >
//                 View All Records
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Feedback Corner */}
//         <div className="feedback-corner" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
//           <h3 className="section-title">User Satisfaction</h3>
//           <div className="satisfaction-gauge" style={{ textAlign: 'center', margin: '20px 0' }}>
//             <div style={{ position: 'relative', height: '100px', overflow: 'hidden' }}>
//                 <div style={{ width: '150px', height: '150px', border: '15px solid #EDF2F7', borderTopColor: '#FF8787', borderRadius: '50%', margin: '0 auto' }}></div>
//                 <h2 style={{ marginTop: '-40px' }}>85%</h2>
//             </div>
//           </div>
//           <div className="feedback-comments" style={{ fontSize: '13px', color: '#718096' }}>
//             <p>Recent positive comments:</p>
//             <strong style={{ color: '#2D3748' }}>"Extremely helpful!"</strong>
//             <p style={{ marginTop: '10px' }}>Comments:</p>
//             <strong style={{ color: '#2D3748' }}>"Changed my life."</strong>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default DashboardContent;

import React, { useState, useEffect } from 'react';
import { 
   PieChart, Pie, Cell, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

import { Eye, Trash2 } from 'lucide-react'; 
import { supabase } from '../supabaseClient';
import './DashboardContent.css';

const DashboardContent = ({ activeTab }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalPredictions: 0,
    accuracy: 91.9 
  });

  const [students, setStudents] = useState([]); 
  const [showAll, setShowAll] = useState(false); 
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }); 
        const { count: predictionCount } = await supabase.from('predictions').select('*', { count: 'exact', head: true });
        const { data: studentsData } = await supabase.from('users').select('*').order('created_at', { ascending: false });

        if (studentsData) {setStudents(studentsData);}

        const { data: predData } = await supabase.from('predictions').select('career_1');
        if (predData && predData.length > 0) {
          const counts = predData.reduce((acc, curr) => {
            const career = curr.career_1 || 'Unknown';
            acc[career] = (acc[career] || 0) + 1;
            return acc;
          }, {});

          const colors = ['#ff857d', '#1a365d', '#6b46c1', '#38b2ac', '#fbbf24'];
          const formattedPie = Object.keys(counts).map((key, index) => ({
            name: key,
            value: Math.round((counts[key] / predData.length) * 100),
            color: colors[index % colors.length]
          }));
          setPieData(formattedPie);
        }

        const { data: lineChartRaw } = await supabase.from('predictions').select('created_at');
        if (lineChartRaw && lineChartRaw.length > 0) {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const monthlyCounts = lineChartRaw.reduce((acc, curr) => {
            const date = new Date(curr.created_at);
            const monthName = months[date.getMonth()];
            acc[monthName] = (acc[monthName] || 0) + 1;
            return acc;
          }, {});

          const formattedLineData = Object.keys(monthlyCounts).map(month => ({
            name: month,
            value: monthlyCounts[month]
          }));
          setLineData(formattedLineData);
        }

        setDashboardStats({
          totalStudents: studentCount || 0,
          totalPredictions: predictionCount || 0,
          accuracy: 91.9 
        });
      } catch (error) {
        console.error("Data fetch error:", error.message);
      }
    };
    fetchRealData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) {
        setStudents(students.filter(student => student.id !== id));
        alert("Student deleted successfully!");
      } else {
        alert("Error: " + error.message);
      }
    }
  };

  return (
    <div className="dashboard-body">
      
      {/* --- TOP SECTION --- */}
      <div className="dashboard-top-layout" style={{ display: (activeTab === 'students' || activeTab === 'predictions') ? 'block' : 'flex' }}>
        
        <div className="stats-column" style={{ width: (activeTab === 'students' || activeTab === 'predictions') ? '100%' : 'auto' }}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="section-title">
              {activeTab === 'students' ? 'Student Statistics' : activeTab === 'predictions' ? 'AI Analytics' : 'Top Statistics Cards'}
            </h3>
            {activeTab === 'students' && <button className="btn-export">📗 Export CSV List</button>}
          </div>

          <div className="stats-grid-vertical" style={{ display: (activeTab === 'students' || activeTab === 'predictions') ? 'block' : 'grid' }}>
            
            {/* Total Students Card: Students aur Dashboard par dikhega */}
            {(activeTab === 'dashboard' || activeTab === 'students') && (
              <div className="stat-card" style={{ width: activeTab === 'students' ? '200%' : 'auto', marginBottom: '20px' }}>
                <p>Total Registered Students</p>
                <h2>{dashboardStats.totalStudents.toLocaleString()}</h2>
                <div className="card-icon">👤</div>
              </div>
            )}

            {/* AI Predictions Card: Dashboard aur Predictions par dikhega */}
            {(activeTab === 'dashboard' || activeTab === 'predictions') && (
              <div className="stat-card" style={{ width: activeTab === 'predictions' ? '200%' : 'auto', marginBottom: '20px' }}>
                <p>AI Predictions Made</p>
                <h2>{dashboardStats.totalPredictions.toLocaleString()}</h2>
                <div className="card-icon">🧠</div>
              </div>
            )}

            {/* Accuracy Card: Sirf Dashboard par */}
            {activeTab === 'dashboard' && (
              <div className="stat-card">
                <p>System Accuracy</p>
                <h2>{dashboardStats.accuracy}%</h2>
                <div className="card-icon">📈</div>
              </div>
            )}
          </div>
        </div>

        {/* GRAPHS: Dashboard aur Predictions par dikhenge */}
        {(activeTab === 'dashboard' || activeTab === 'predictions') && (
          <div className="insights-column" style={{ width: activeTab === 'predictions' ? '110%' : 'auto', marginTop: activeTab === 'predictions' ? '20px' : '0' }}>
            <div className='section-header right-header'>
                <h3 className='section-title'>Key Insights</h3>
              </div>
            <div className="insights-white-box">
              <div className="insights-row-inner">
                <div className="chart-container pie-container">
                  <h4 className="chart-title">Top Career Predictions</h4>
                  <div className="custom-donut-wrapper" style={{ display: 'flex', alignItems: 'center', height: '200px' }}>
                    {pieData.length > 0 ? (
                      <>
                        <PieChart width={200} height={200}>
                          <Pie data={pieData} innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                        <div className="custom-legend">
                          {pieData.map((item, index) => (
                            <div className="legend-item" key={index}>
                              <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                              <span className="legend-text">{item.name} ({item.value}%)</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : <div>Loading...</div>}
                  </div>
                </div>
                <div className="chart-divider"></div>
                <div className="chart-container area-container">
                  <h4 className="chart-title">Prediction Volume</h4>
                  <AreaChart width={activeTab === 'predictions' ? 500 : 420} height={220} data={lineData}>
                  {/* margin{{top: 10, right: 45, left: 0, bottom:20}} */}
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38b2ac" stopOpacity={0.3}/><stop offset="95%" stopColor="#38b2ac" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#38b2ac" strokeWidth={3} fill="url(#colorValue)" />
                  </AreaChart>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM SECTION: Student Table --- */}
      {(activeTab === 'dashboard' || activeTab === 'students') && (
        <div className="dashboard-bottom-layout" style={{ display: 'flex', gap: '20px', marginTop: activeTab === 'students' ? '5px' : '30px' }}>
          <div className="student-list-container" style={{ flex: 3, background: 'white', padding: '20px', borderRadius: '15px' }}>
            <h3 className="section-title">
              {activeTab === 'students' ? 'All Registered Students' : 'Student Registrations list'}
            </h3>
            <table className="student-table" style={{ width: '100%' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #f0f0f0', color: '#718096' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th>Email</th>
                  <th>Stream</th>
                  <th>Date</th>
                  <th>Career</th>
                  {activeTab === 'students' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {students.slice(0,  showAll ? students.length : 5).map((student, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '12px' }}>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.stream || 'N/A'}</td>
                    <td>{new Date(student.created_at).toLocaleDateString()}</td>
                    <td>Pending...</td>
                    {activeTab === 'students' && (
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button onClick={() => alert("Viewing: " + student.name)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#38b2ac' }}>
                          <Eye size={20} />
                        </button>
                        <button onClick={() => handleDelete(student.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e53e3e' }}>
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              </tbody>
            </table>
            
             {/* 👇 NAYA: Toggle Button (View All / View Less) 👇 */}
             
          {students.length > 5 && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              {showAll ? (
                // Jab saare records dikh rahe hon, tab 'View Less' dikhao
                <button 
                  onClick={() => setShowAll(false)}
                  style={{ 
                    background: '#FF8787', // Thoda alag color taaki pata chale ye 'Less' ke liye hai
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold' 
                  }}
                >
                  View Less Records
                </button>
              ) : (
                // Jab sirf 5 records dikh rahe hon, tab 'View All' dikhao
                <button 
                  onClick={() => setShowAll(true)}
                  style={{ 
                    background: '#FF8787', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold' 
                  }}
                >
                  View All Records
                </button>
              )}
            </div>
            )}
          </div>

           {/* Feedback Corner: Sirf Dashboard par dikhega */}
        {activeTab !== 'students' && (
          <div className="feedback-corner" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '15px' }}>
            <h3 className="section-title">User Satisfaction</h3>
            {/* Feedback Corner ka gauge code yahan rahega... */}
            <div className="satisfaction-gauge" style={{ textAlign: 'center', margin: '20px 0' }}>
               <div style={{ position: 'relative', height: '100px', overflow: 'hidden' }}>
                  <div style={{ width: '150px', height: '150px', border: '15px solid #EDF2F7', borderTopColor: '#FF8787', borderRadius: '50%', margin: '0 auto' }}></div>
                  <h2 style={{ marginTop: '-40px' }}>85%</h2>
               </div>
                <div className="feedback-comments" style={{ fontSize: '13px', color: '#718096' }}>
             <p>Recent positive comments:</p>
             <strong style={{ color: '#2D3748' }}>"Extremely helpful!"</strong>
             <p style={{ marginTop: '10px' }}>Comments:</p>
             <strong style={{ color: '#2D3748' }}>"Changed my life."</strong>
           </div>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
};
export default DashboardContent;