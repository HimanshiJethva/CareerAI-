import React, { useState, useEffect } from 'react';
import { 
   PieChart, Pie, Cell, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

import { Edit2, Eye, Trash2 } from 'lucide-react'; 
import { supabase } from '../supabaseClient';
import './DashboardContent.css';

const DashboardContent = ({ activeTab, searchTerm, setSearchTerm }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalPredictions: 0,
    accuracy: 91.9 
  });

  const [students, setStudents] = useState([]); 
  const [showAll, setShowAll] = useState(false); 
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [satisfaction, setSatisfaction] = useState(0); 
  const [recentComments, setRecentComments] = useState([]);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }); 
        const { count: predictionCount } = await supabase.from('predictions').select('*', { count: 'exact', head: true });
          // 2. Fetch Actual Student List
        // 2. UPDATED: Fetch Actual Student List with Joins
        const { data: studentsList, error: fetchError } = await supabase
          .from('users')
          .select(`
            *,
            user_inputs (stream),
            predictions (career_1)
          `)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error("Supabase Error:", fetchError.message);
        }

        if (studentsList) {
          // Data ko clean karke simple format mein convert kar rahe hain
          const formattedStudents = studentsList.map(s => ({
            ...s,
            // Agar input table mein data hai toh stream lo, varna 'N/A'
            stream: s.user_inputs?.[0]?.stream || 'N/A',
            // Agar prediction ho chuki hai toh career lo, varna 'Pending...'
            ai_career: s.predictions?.[0]?.career_1 || 'Pending...'
          }));
          
          setStudents(formattedStudents);
        }


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
           // --- 5. DYNAMIC FEEDBACK LOGIC ---
          const { data: fbData, error: fbError } = await supabase
            .from('feedbacks')
            .select('rating, comment')
            .order('created_at', { ascending: false });

          if (fbData && fbData.length > 0) {
            // Average Rating calculate karo (1 to 5 scale ko 100% mein convert karne ke liye * 20)
            const totalRating = fbData.reduce((acc, curr) => acc + curr.rating, 0);
            const avgRating = totalRating / fbData.length;
            const percentage = Math.round(avgRating * 20); 
            
            setSatisfaction(percentage);
            setRecentComments(fbData.slice(0, 2)); // Sirf 2 taaza comments dikhane ke liye
          }
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

  const exportToCSV = () => {
  if (students.length === 0) {
    alert("No data available to export!");
    return;
  }

  // 1. CSV ke Headers define karein
  const headers = ["Name", "Email", "Stream", "Registration Date","AI Suggested Career"];

  // 2. Students data ko CSV rows mein convert karein
  const csvRows = students.map(student => {
    // Check karein ki predictions array mein data hai ya nahi
    const careerResult = (student.predictions && student.predictions.length > 0) 
      ? student.predictions[0].career_1 
      : "Pending...";

    return [
    student.name,
    student.email,
    student.stream || 'N/A',
    new Date(student.created_at).toLocaleDateString(),
    careerResult.replace(/,/g,"") 
   ];
  });

  // 3. Headers aur Rows ko join karein
  const csvContent = [
    headers.join(","), 
    ...csvRows.map(row => row.join(","))
  ].join("\n");

  // 4. Blob banayein aur download link trigger karein
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Student_List_${new Date().toLocaleDateString()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div className="dashboard-body">
      
      {/* --- TOP SECTION --- */}
      <div className="dashboard-top-layout" style={{ display: (activeTab === 'students' || activeTab === 'predictions') ? 'block' : 'flex' }}>
        
        <div className="stats-column" style={{ width: (activeTab === 'students' || activeTab === 'predictions') ? '100%' : 'auto' }}>
          <div className="section-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', // Isse title left aur button right mein ho jayega
          alignItems: 'center',
          width: '100%',
          marginBottom: '20px',
          paddingRight: '20px' // Bilkul edge se chipke na, isliye thoda gap
      }}>
          <h3 className="section-title" style={{ margin: 0 }}>
              {activeTab === 'students' ? 'Student Statistics' : activeTab === 'predictions' ? 'AI Analytics' : 'Top Statistics Cards'}
          </h3>
          
          {activeTab === 'students' && (
              <button className="btn-export" onClick={exportToCSV} style={{ 
                  marginLeft: 'auto', // Extra safety for right alignment
                  padding: '10px 20px'
              }}>
                  📗 Export CSV List
              </button>
          )}
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
            <h3 className="section-title" style={{ margin: 0 }}>
      {activeTab === 'students' ? 'All Registered Students' : 'Student Registrations list'}
    </h3>

    {/* Naya Search Bar jo Table ke upar dikhega */}
    <div className="table-search-box" style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      background: '#F7FAFC',
      border: '1px solid #E2E8F0',
      borderRadius: '10px',
      padding: '8px 15px',
      width: '300px'
    }}>
      <span style={{ marginRight: '10px', color: '#A0AEC0' }}>🔍</span>
      <input 
        type="text" 
        placeholder="Search by name or email..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          border: 'none',
          background: 'transparent',
          outline: 'none',
          width: '100%',
          fontSize: '14px',
          color: '#2D3748'
        }}
      />
    </div>
  </div>
            <table className="student-table" style={{ width: '100%' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #f0f0f0', color: '#718096' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th>Email</th>
                  <th>Stream</th>
                  <th>Registered Date</th>
                  <th>AI Suggested Career</th>
                  {activeTab === 'students' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>

               {students
                  .filter((student) => {
                    if (!searchTerm) return true;
                    const s = searchTerm.toLowerCase();
                    return (
                      student.name?.toLowerCase().includes(s) ||
                      student.email?.toLowerCase().includes(s)
                    );
                  })
                  .slice(0,  showAll ? students.length : 5).map((student, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '12px' }}>{student.name}</td>
                    <td>{student.email}</td>
                     {/* 👇 Naya dynamic data 👇 */}
                    <td>{student.stream}</td>  
                    <td>{new Date(student.created_at).toLocaleDateString()}</td>
                     {/* 👇 Naya dynamic career data 👇 */}
                    <td style={{ 
                        color: student.ai_career === 'Pending...' ? '#A0AEC0' : '#38b2ac',
                        fontWeight: student.ai_career === 'Pending...' ? 'normal' : '600' 
                    }}>
                      {student.ai_career}
                    </td>
                    {activeTab === 'students' && (
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button onClick={() => alert("Viewing: " + student.name)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#38b2ac' }}>
                          <Eye size={20} />
                        </button>
                         <button  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'blue' }}>
                          <Edit2 size={20} />
                        </button>
                        <button onClick={() => handleDelete(student.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e53e3e' }}>
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {/* No results message */}
              {students.filter(s => 
                s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                s.email?.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && searchTerm !== "" && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#718096' }}>
                    No student found matching "{searchTerm}"
                  </td>
                </tr>
              )}
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