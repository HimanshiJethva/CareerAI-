import React, { useState, useEffect } from 'react';
import './DashboardOverview.css';
import { 
  Users, BrainCircuit, Target, Activity, 
  TrendingUp, Download, Plus, Eye, Trash2, Search, Filter
} from 'lucide-react';
// Graphs ke liye Recharts import karein
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

const DashboardOverview = () => {
  // --- DYNAMIC STATE MANAGEMENT ---
  const [statsData, setStatsData] = useState([]); // Stats cards ka data
  const [studentData, setStudentData] = useState([]); // Table ka data
  const [loading, setLoading] = useState(true); // Loading spinner logic

  // --- API CONNECTION SIMULATION (useEffect) ---
  useEffect(() => {
    // Shuru mein loading dikhao
    setLoading(true);

    // Ye dynamic data hai (Real implementation mein API call aayega)
    const fetchData = async () => {
      // simulate API delay (jaise 1 second)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stat Cards ka data
      setStatsData([
        { id: 1, label: 'Total Registered Students', value: studentData.length > 0 ? studentData.length.toLocaleString():'0', icon: <Users size={22} />, trend: '+12%', color: '#ff8e9e' },
        { id: 2, label: 'AI Predictions Made', value: '4,700', icon: <BrainCircuit size={22} />, trend: '+5%', color: '#2a9d8f' },
        { id: 3, label: 'System Accuracy', value: '88.5%', icon: <Target size={22} />, trend: '+2%', color: '#e9c46a' },
        { id: 4, label: 'Active AI Models', value: '12', icon: <Activity size={22} />, trend: 'Stable', color: '#f4a261' },
      ]);

      // Recent Students Table data (jisme filters use honge)
      setStudentData([
        { id: 101, name: 'Ashish Singh', email: 'ashishsingh@gmail.com', stream: 'PCM', date: '27/08/2024', career: 'Software Engineering', key: 'soft' },
        { id: 102, name: 'Karan Khan', email: 'karankhan@gmail.com', stream: 'PCM/PCB', date: '27/08/2024', career: 'Data Science', key: 'data' },
        { id: 103, name: 'Priya Sharma', email: 'priya@example.com', stream: 'Commerce', date: '26/08/2024', career: 'Digital Marketing', key: 'mark' },
        { id: 104, name: 'Raj Patel', email: 'rajp@gmail.com', stream: 'Arts', date: '26/08/2024', career: 'Product Management', key: 'prod' },
      ]);

      setLoading(false); // Data load hone ke baad loading band
    };

    fetchData();
  } , []); // Empty dependency means ye sirf page load hone par chalega

  // --- CHART DATA (Static for now, but easily connected to State) ---
  const pieData = [
    { name: 'Soft. Eng.', value: 30, color: '#ff8e9e' },
    { name: 'Data Science', value: 25, color: '#2a9d8f' },
    { name: 'Dig. Mark.', value: 15, color: '#e9c46a' },
    { name: 'Others', value: 30, color: '#ccc' },
  ];

  const volumeData = [
    { name: 'Jan', volume: 400 },
    { name: 'Feb', volume: 300 },
    { name: 'Mar', volume: 600 },
    { name: 'Apr', volume: 800 },
    { name: 'May', volume: 700 },
    { name: 'Jun', volume: 1100 },
  ];

  // --- Dynamic Function: Row Delete ---
  const handleDeleteStudent = (id) => {
    // Alert examiner: "State dynamically filtering"
    setStudentData(prevData => prevData.filter(student => student.id !== id));
  };

  if (loading) {
    return <div className="dashboard-loading"><h1>Loading command center...</h1></div>;
  }

  return (
    <div className="dashboard-container">
      {/* Top Header Section */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Career AI - Command Center</h1>
          <p>Real-time system insights</p>
        </div>
        <div className="header-right">
          <button className="btn-export"><Download size={18} /> Export Reports</button>
          <button className="btn-add"><Plus size={18} /> Add Category</button>
        </div>
      </header>

      {/* 4 Stats Cards (MAP loop) */}
      <div className="stats-grid">
        {statsData.map(stat => (
          <div key={stat.id} className="stat-card">
            <div className="stat-top">
              <div className="stat-label">
                <p>{stat.label}</p>
              </div>
              <div className="stat-icon" style={{ color: stat.color, background: stat.color + '10' }}>{stat.icon}</div>
            </div>
            <div className="stat-value-row">
              <h3>{stat.value}</h3>
              <div className="trend-box" style={{ background: stat.trend.includes('+') ? '#e6fffa' : '#f8f9fa' }}>
                  <TrendingUp size={16} color={stat.trend.includes('+') ? '#2a9d8f' : '#666'} />
                  <span style={{color: stat.trend.includes('+') ? '#2a9d8f' : '#666'}}>{stat.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Charts Section (RECHARTS GRAPHS) */}
      <div className="insights-grid">
        <div className="chart-card pie-chart-container">
          <h3>Top Career Predictions</h3>
          <p className="chart-sub">Category Distribution</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="pie-center-text">
                30%
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card line-chart-container">
          <h3>Prediction Volume</h3>
          <p className="chart-sub">Monthly Predictions Made</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={volumeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="volume" stroke="#2a9d8f" fill="url(#colorVolume)" />
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2a9d8f" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2a9d8f" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section with Filters */}
      <div className="recent-table-card">
        <div className="table-header-row">
          <div>
              <h3>Recent Student Registrations</h3>
              <p className="table-sub">Live feed from student application</p>
          </div>
          <div className="table-actions">
              <div className="search-input">
                <Search size={16} />
                <input type="text" placeholder="Search student..." />
              </div>
              <button className="btn-filter"><Filter size={16} /> Filter</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email Address</th>
              <th>Stream</th>
              <th>Registered Date</th>
              <th>AI Suggested Career</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {studentData.map((student) => (
                <tr key={student.id}>
                  <td className="st-name">{student.name}</td>
                  <td className="st-email">{student.email}</td>
                  <td className="st-stream">{student.stream}</td>
                  <td className="st-date">{student.date}</td>
                  <td><span className={`career-tag ${student.key}`}>{student.career}</span></td>
                  <td className="actions">
                    <button className="action-btn view-btn"><Eye size={16} /></button>
                    <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeleteStudent(student.id)}>
                        <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardOverview;