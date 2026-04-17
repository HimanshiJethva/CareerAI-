import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Pie, PieChart, Cell, ResponsiveContainer
} from 'recharts';
import { Eye, Trash2 } from 'lucide-react'; 
import { supabase } from '../../../backend/supabaseClient';
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
  const [satisfaction, setSatisfaction] = useState(0); 
  const [recentComments, setRecentComments] = useState([]);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        // 1. Fetch Stats (Users & Predictions count)
        const { count: studentCount } = await supabase
          .from('users') 
          .select('*', { count: 'exact', head: true }); 

        const { count: predictionCount } = await supabase
          .from('predictions') 
          .select('*', { count: 'exact', head: true });

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

        // 3. DYNAMIC DONUT CHART LOGIC
        const { data: predData } = await supabase
          .from('predictions')
          .select('career_1');

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

        // 4. DYNAMIC LINE CHART LOGIC
        const { data: lineChartRaw } = await supabase
          .from('predictions')
          .select('created_at');

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

  return (
    <div className="dashboard-body">
      
      <div className="dashboard-top-layout">
        <div className="stats-column">
          <div className="section-header">
            <h3 className="section-title">
              {activeTab === 'students' ? 'Student Statistics' : 'Top Statistics Cards'}
            </h3>
          </div>
          <div className="stats-grid-vertical">
            <div className="stat-card">
              <p>Total Registered Students</p>
              <h2>{dashboardStats.totalStudents.toLocaleString()}</h2>
              <div className="card-icon">👤</div>
            </div>
            <div className="stat-card">
              <p>AI Predictions Made</p>
              <h2>{dashboardStats.totalPredictions.toLocaleString()}</h2>
              <div className="card-icon">🧠</div>
            </div>
            <div className="stat-card">
              <p>System Accuracy</p>
              <h2>{dashboardStats.accuracy}%</h2>
              <div className="card-icon">📈</div>
            </div>
          </div>
        </div>

        <div className="insights-column">
          <div className="section-header right-header">
            <h3 className="section-title">Key Insights</h3>
          </div>
          
          <div className="insights-white-box">
            <div className="insights-row-inner">
              {/* Donut Chart */}
              <div className="chart-container pie-container">
                <h4 className="chart-title">Top Career Predictions</h4>
                <div className="custom-donut-wrapper" style={{ display: 'flex', alignItems: 'center', height: '200px' }}>
                  {pieData.length > 0 ? (
                    <PieChart width={200} height={200}>
                      <Pie
                        data={pieData}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  ) : <div className="loading-placeholder">Loading...</div>}
                  
                  <div className="custom-legend">
                    {pieData.map((item, index) => (
                      <div className="legend-item" key={index}>
                        <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                        <span className="legend-text">{item.name} ({item.value}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="chart-divider"></div>

              {/* Area Chart */}
              <div className="chart-container area-container">
                <h4 className="chart-title">Prediction Volume</h4>
                <AreaChart width={420} height={220} data={lineData.length > 0 ? lineData : [{name: 'Apr', value: 0}]}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38b2ac" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#38b2ac" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: '#718096', fontSize: 11 }} dy={10} />
                  <YAxis tick={{ fill: '#718096', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#38b2ac" strokeWidth={3} fill="url(#colorValue)" />
                </AreaChart>
              </div>
            </div>
          </div>
        </div>
      </div>

{/* --- BOTTOM SECTION: Student List & Feedback --- */}
      <div className="dashboard-bottom-layout" style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        
        {/* Student Table Container */}
        <div className="student-list-container" style={{ flex: 3, background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>Recent Student Registrations</h3>
          <table className="student-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #f0f0f0', color: '#718096', fontSize: '13px' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th>Email Address</th>
                <th>Stream</th>
                <th>Registered Date</th>
                <th>AI Suggested Career</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '14px', color: '#2D3748' }}>
  {students.slice(0, showAll ? students.length : 5).map((student, idx) => (
    <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9' }}>
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

        {/* 👇 NAYA: Feedback Corner (User Satisfaction) 👇 */}
        {/* Feedback Corner */}
<div className="feedback-corner" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
  <h3 className="section-title">User Satisfaction</h3>
  <div className="satisfaction-gauge" style={{ textAlign: 'center', margin: '20px 0' }}>
    <div style={{ position: 'relative', height: '100px', overflow: 'hidden' }}>
        {/* Gauge color adjust karne ke liye borderTopColor ko dynamic bhi kar sakte hain */}
        <div style={{ 
            width: '150px', height: '150px', 
            border: '15px solid #EDF2F7', 
            borderTopColor: satisfaction > 70 ? '#48BB78' : '#FF8787', // 70% se upar green, niche red
            borderRadius: '50%', margin: '0 auto',
            transform: `rotate(${satisfaction * 1.8}deg)`, // Optional: thoda rotate karne ke liye
            transition: 'all 1s ease-out'
        }}></div>
        <h2 style={{ marginTop: '-40px' }}>{satisfaction}%</h2>
    </div>
  </div>
  
  <div className="feedback-comments" style={{ fontSize: '13px', color: '#718096' }}>
    <p>Recent positive comments:</p>
    {recentComments.length > 0 ? (
      recentComments.map((fb, index) => (
        <div key={index} style={{ marginTop: '10px' }}>
          <strong style={{ color: '#2D3748' }}>"{fb.comment}"</strong>
        </div>
      ))
    ) : (
      <p>No feedbacks yet.</p>
    )}
  </div>
</div>

      </div>
    </div>
  );
};

export default DashboardContent;