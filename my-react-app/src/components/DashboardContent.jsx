import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip 
} from 'recharts'; // Dhyan dein: Pie aur Cell hata diye hain
import { supabase } from '../supabaseClient';
import './DashboardContent.css';

const DashboardContent = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalPredictions: 0,
    accuracy: 91.9 
  });

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { count: studentCount } = await supabase
          .from('users') 
          .select('*', { count: 'exact', head: true }); 

        const { count: predictionCount } = await supabase
          .from('predictions') 
          .select('*', { count: 'exact', head: true });

        setDashboardStats({
          totalStudents: studentCount || 7,
          totalPredictions: predictionCount || 0,
          accuracy: 91.9 
        });
      } catch (error) {
        console.error("Data fetch error:", error);
      }
    };
    fetchRealData();
  }, []);

  const pieData = [
    { name: 'Software Engineering', value: 30, color: '#ff857d' },
    { name: 'Data Science', value: 25, color: '#1a365d' },
    { name: 'Digital Marketing', value: 15, color: '#6b46c1' },
    { name: 'Product Management', value: 30, color: '#38b2ac' },
  ];

  const lineData = [
    { name: 'Last', value: 100 },
    { name: 'Month', value: 300 },
    { name: 'Month', value: 450 },
  ];

  return (
    <div className="dashboard-body">
      
      <div className="dashboard-top-layout">
        
        {/* --- Left Column: Cards --- */}
        <div className="stats-column">
          <div className="section-header">
            <h3 className="section-title">Top Statistics Cards</h3>
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

        {/* --- Right Column: Insights --- */}
        <div className="insights-column">
          <div className="section-header right-header">
            <h3 className="section-title">Key Insights</h3>
            <div className="header-actions">
              <button className="btn-export">📗 Export Reports</button>
              <button className="btn-add">Add Career Category +</button>
            </div>
          </div>
          
          <div className="insights-white-box">
            <div className="insights-row-inner">
              
              {/* CUSTOM PIE (DONUT) CHART */}
              <div className="chart-container pie-container">
                <h4 className="chart-title">Top Career Predictions</h4>
                
                <div className="custom-donut-wrapper">
                    <div className="custom-donut-chart">
                        <div className="donut-hole"></div>
                    </div>
                    <div className="custom-legend">
                        {pieData.map((item, index) => (
                            <div className="legend-item" key={index}>
                                <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                                <span className="legend-text">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
              </div>

              {/* DIVIDER LINE */}
              <div className="chart-divider"></div>

              {/* AREA CHART */}
              {/* AREA (LINE) CHART SECTION - Modern BCA Dashboard Design */}
{/* AREA (LINE) CHART SECTION - Final Fixed Version */}
              <div className="chart-container area-container">
                <h4 className="chart-title" style={{ marginBottom: '20px' }}>Prediction Volume</h4>
                
                {/* ResponsiveContainer ko hata diya, direct chart render kiya */}
                <AreaChart 
                    width={400} 
                    height={220} 
                    data={lineData} 
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38b2ac" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#38b2ac" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  
                  <Tooltip />
                  
                  <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#38b2ac" 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      strokeWidth={3} 
                  />
                </AreaChart>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
    </div>
  );
};

export default DashboardContent;