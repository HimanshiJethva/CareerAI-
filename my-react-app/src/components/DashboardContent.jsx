import React, { useState, useEffect } from 'react';
import { 
   PieChart, Pie, Cell, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Edit2, Eye, Trash2 } from 'lucide-react'; 
import { supabase } from '../../../backend/supabaseClient';
import './DashboardContent.css';

// ✅ Helper: Find the exact input for a prediction using input_id foreign key
const getInputForPrediction = (allInputs, prediction) => {
  if (!allInputs || allInputs.length === 0 || !prediction) return null;
  
  // Direct match via input_id (most accurate)
  if (prediction.input_id) {
    const exactMatch = allInputs.find(input => input.id === prediction.input_id);
    if (exactMatch) return exactMatch;
  }
  
  // Fallback: closest input by timestamp if input_id is NULL
  const predTime = new Date(prediction.created_at).getTime();
  const validInputs = allInputs.filter(input => 
    new Date(input.created_at).getTime() <= predTime
  );
  if (validInputs.length === 0) return allInputs[0];
  return validInputs.reduce((closest, curr) => 
    new Date(curr.created_at) > new Date(closest.created_at) ? curr : closest
  );
};

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
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('overview');
  const [selectedPrediction, setSelectedPrediction] = useState(0);

  const [editStudent, setEditStudent] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { data: allUsers, error: fetchError } = await supabase
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

        if (allUsers) {
          const filteredStudents = allUsers.filter(user => {
            if (user.role && user.role === 'admin') return false;
            if (user.name && user.name.toLowerCase() === 'admin') return false;
            if (user.email && (
              user.email.toLowerCase().includes('support') || 
              user.email.toLowerCase().includes('admin')
            )) return false;
            return true;
          });

          const formattedStudents = filteredStudents.map(s => ({
            ...s,
            stream: s.user_inputs?.[0]?.stream || 'N/A',
            ai_career: s.predictions?.[0]?.career_1 || 'Pending...'
          }));
          
          setStudents(formattedStudents);
          setDashboardStats(prev => ({
            ...prev,
            totalStudents: formattedStudents.length
          }));
        }

        const { count: predictionCount } = await supabase
          .from('predictions')
          .select('*', { count: 'exact', head: true });

        const { data: predData } = await supabase.from('predictions').select('career_1');
        if (predData && predData.length > 0) {
          const counts = predData.reduce((acc, curr) => {
            const career = curr.career_1 || 'Unknown';
            acc[career] = (acc[career] || 0) + 1;
            return acc;
          }, {});

          const colors = ['#ff857d', '#1a365d', '#6b46c1', '#38b2ac', '#fbbf24'];

          // Pehle total predictions count rakh lo
        const totalPredictions = predData.length; // already hai tumhare code mein
          const formattedPie = Object.keys(counts).map((key, index) => ({
            name: key,
            value: Math.round((counts[key] / predData.length) * 100),
             count: counts[key], // ← yeh add karo
            color: colors[index % colors.length]
          }));
          setPieData(formattedPie);
        }

        // const { data: lineChartRaw } = await supabase.from('predictions').select('created_at');
        // if (lineChartRaw && lineChartRaw.length > 0) {
        //   const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        //   const monthlyCounts = lineChartRaw.reduce((acc, curr) => {
        //     const date = new Date(curr.created_at);
        //     const monthName = months[date.getMonth()];
        //     acc[monthName] = (acc[monthName] || 0) + 1;
        //     return acc;
        //   }, {});

        //   const formattedLineData = Object.keys(monthlyCounts).map(month => ({
        //     name: month,
        //     value: monthlyCounts[month]
        //   }));
        //   setLineData(formattedLineData);
        // }
        const { data: lineChartRaw } = await supabase
          .from('predictions')
          .select('created_at');

        if (lineChartRaw && lineChartRaw.length > 0) {

          // Week wise count — Mon, Tue, Wed...
          const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          
          // Pehle sab 0 se initialize karo
          const dayCounts = {
            'Sun': 0, 'Mon': 0, 'Tue': 0,
            'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0
          };

          // Real data count karo
          lineChartRaw.forEach(curr => {
            const date = new Date(curr.created_at);
            const dayName = weekDays[date.getDay()];
            dayCounts[dayName] += 1;
          });

          // Chart ke liye format karo — week order mein
          const formattedLineData = weekDays.map(day => ({
            name: day,
            value: dayCounts[day]
          }));

          setLineData(formattedLineData);
        }
        setDashboardStats(prev => ({
          ...prev,
          totalPredictions: predictionCount || 0,
          accuracy: 91.9 
        }));
        
        const { data: fbData } = await supabase
          .from('feedbacks')
          .select('rating, comment')
          .order('created_at', { ascending: false });

        if (fbData && fbData.length > 0) {
          const totalRating = fbData.reduce((acc, curr) => acc + curr.rating, 0);
          const avgRating = totalRating / fbData.length;
          const percentage = Math.round(avgRating * 20);
          setSatisfaction(percentage);

          // ✅ Filter out empty, null, or "EMPTY" comments before displaying
          const validComments = fbData.filter(fb => 
            fb.comment && 
            fb.comment.trim() !== "" && 
            fb.comment.trim().toUpperCase() !== "EMPTY"
          );
          setRecentComments(validComments.slice(0, 2));
        }
      } catch (error) {
        console.error("Data fetch error:", error.message);
      }
    };
    fetchRealData();
  }, []);
  
  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setModalLoading(true);
    setSelectedPrediction(0); // Reset to first prediction when opening modal

    const { data: allPredictions } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', student.id)
      .order('created_at', { ascending: false });

    // 2705 Fetch ALL inputs -- matched via input_id foreign key (with timestamp fallback)
    const { data: inputData } = await supabase
      .from('user_inputs')
      .select('*')
      .eq('user_id', student.id)
      .order('created_at', { ascending: true });

    const inputs = inputData || [];
    const predictions = allPredictions || [];

    // Check if all predictions share the same input (student filled form once)
    const uniqueInputIds = [...new Set(predictions.map(p => p.input_id).filter(Boolean))];
    const allSameInput = uniqueInputIds.length <= 1;

    setModalData({ 
      predictions,
      allInputs: inputs,
      allSameInput,
      inputs: inputs[inputs.length - 1] || null,
    });
    setModalLoading(false);
  };

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

   const handleEdit = (e, student) => {
    e.stopPropagation();
    setEditStudent(student);
    setEditName(student.name);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) { alert("Naam khali nahi ho sakta!"); return; }
    setEditLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: editName.trim() })
        .eq('id', editStudent.id);
      if (error) throw error;
      setStudents(students.map(s =>
        s.id === editStudent.id ? { ...s, name: editName.trim() } : s
      ));
      setEditStudent(null);
      alert("Student naam update ho gaya!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const exportToCSV = () => {
    if (students.length === 0) {
      alert("No data available to export!");
      return;
    }
    const headers = ["Name", "Email", "Stream", "Registration Date","AI Suggested Career"];
    const csvRows = students.map(student => {
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
    const csvContent = [
      headers.join(","), 
      ...csvRows.map(row => row.join(","))
    ].join("\n");
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

  // ✅ Get the input that corresponds to the currently selected prediction
  const currentPredictionInput = modalData 
    ? getInputForPrediction(modalData.allInputs, modalData.predictions[selectedPrediction])
    : null;

  // ✅ Reusable component to render input details (used in both tabs)
  const InputDetailsPanel = ({ inputData, compact = false }) => {
    if (!inputData) return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#718096', fontSize: '13px' }}>
        No input data found for this session.
      </div>
    );


   

  

    return (
      <>
        {/* Academic Marks */}
        <div style={{ marginBottom: compact ? '15px' : '25px' }}>
          <h3 style={{ color: '#2D3748', marginBottom: '12px', fontSize: compact ? '0.85rem' : '1rem', fontWeight: '700' }}>📚 Academic Marks</h3>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compact ? 3 : 4}, 1fr)`, gap: '8px' }}>
            {[
              { label: 'Physics', value: inputData.physics },
              { label: 'Chemistry', value: inputData.chemistry },
              { label: 'Biology', value: inputData.biology },
              { label: 'Maths', value: inputData.mathematics },
              { label: 'English', value: inputData.english },
              { label: 'Computer Sc.', value: inputData.computerscience },
              { label: 'Accountancy', value: inputData.accountancy },
              { label: 'Business St.', value: inputData.businessstudies },
              { label: 'Economics', value: inputData.economics },
              { label: 'History', value: inputData.history },
              { label: 'Geography', value: inputData.geography },
              { label: 'Pol. Science', value: inputData.politicalscience },
              { label: 'Sociology', value: inputData.sociology },
            ].filter(item => item.value > 0).map((item, i) => (
              <div key={i} style={{
                background: '#f0fff4', border: '1px solid #c6f6d5',
                borderRadius: '10px', padding: compact ? '8px' : '12px', textAlign: 'center'
              }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#718096' }}>{item.label}</p>
                <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: '#276749', fontSize: compact ? '1rem' : '1.2rem' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div style={{ marginBottom: compact ? '15px' : '25px' }}>
          <h3 style={{ color: '#2D3748', marginBottom: '12px', fontSize: compact ? '0.85rem' : '1rem', fontWeight: '700' }}>💡 Interests</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { label: 'Technology', value: inputData.interest_tech },
              { label: 'Entrepreneurship', value: inputData.interest_entrepreneurship },
              { label: 'Leadership', value: inputData.interest_leadership },
              { label: 'Innovation', value: inputData.interest_innovation },
              { label: 'Critical Thinking', value: inputData.interest_criticalthinking },
              { label: 'Research', value: inputData.interest_research },
              { label: 'Computer Skills', value: inputData.interest_computerskill },
              { label: 'Hardware Skills', value: inputData.interest_hardwareskill },
              { label: 'Food', value: inputData.interest_food },
              { label: 'Creativity', value: inputData.interest_creativity },
            ].filter(item => item.value === 1).map((item, i) => (
              <span key={i} style={{
                background: '#ebf8ff', color: '#2b6cb0',
                padding: compact ? '4px 10px' : '7px 16px', borderRadius: '20px',
                fontSize: '12px', fontWeight: '500', border: '1px solid #bee3f8'
              }}>✓ {item.label}</span>
            ))}
          </div>
        </div>

        {/* Personality Traits */}
        <div style={{ marginBottom: compact ? '15px' : '25px' }}>
          <h3 style={{ color: '#2D3748', marginBottom: '12px', fontSize: compact ? '0.85rem' : '1rem', fontWeight: '700' }}>🧠 Personality Traits</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {[
              { label: 'Openness', value: inputData.oppenness },
              { label: 'Conscientious', value: inputData.conscientiousness },
              { label: 'Extraversion', value: inputData.extraversion },
              { label: 'Agreeableness', value: inputData.agreeableness },
              { label: 'Neuroticism', value: inputData.neuroticism },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#faf5ff', border: '1px solid #e9d8fd',
                borderRadius: '10px', padding: compact ? '8px' : '12px', textAlign: 'center'
              }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#718096' }}>{item.label}</p>
                <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: '#553c9a', fontSize: compact ? '1rem' : '1.3rem' }}>{item.value}/5</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div>
          <h3 style={{ color: '#2D3748', marginBottom: '12px', fontSize: compact ? '0.85rem' : '1rem', fontWeight: '700' }}>🏆 Participated Activities</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { label: 'Hackathon', value: inputData.participated_hackathon },
              { label: 'Olympiad', value: inputData.participated_olympiad },
              { label: 'Kabaddi', value: inputData.participated_kabaddi },
              { label: 'Kho-Kho', value: inputData.participated_khokho },
              { label: 'Cricket', value: inputData.participated_cricket },
            ].filter(item => item.value === 1).map((item, i) => (
              <span key={i} style={{
                background: '#fffaf0', color: '#c05621',
                padding: compact ? '4px 10px' : '7px 16px', borderRadius: '20px',
                fontSize: '12px', fontWeight: '500', border: '1px solid #fbd38d'
              }}>🏅 {item.label}</span>
            ))}
            {['participated_hackathon','participated_olympiad','participated_kabaddi','participated_khokho','participated_cricket']
              .every(k => !inputData[k]) && (
              <p style={{ color: '#718096', fontSize: '13px', margin: 0 }}>No activities participated</p>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="dashboard-body">
      
      {/* --- TOP SECTION --- */}
      <div className="dashboard-top-layout" style={{ display: (activeTab === 'students' || activeTab === 'predictions') ? 'block' : 'flex' }}>
        
        <div className="stats-column" style={{ width: (activeTab === 'students' || activeTab === 'predictions') ? '100%' : 'auto' }}>
          <div className="section-header" style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginBottom: '12px',
            paddingRight: '20px'
          }}>
            <h3 className="section-title" style={{ margin: 0 }}>
              {activeTab === 'students' ? 'Student Statistics' : activeTab === 'predictions' ? 'AI Analytics' : 'Top Statistics Cards'}
            </h3>
          </div>

          <div className="stats-grid-vertical" style={{ display: (activeTab === 'students' || activeTab === 'predictions') ? 'block' : 'grid' }}>
            {(activeTab === 'dashboard' || activeTab === 'students') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <div className="stat-card" style={{ width: activeTab === 'students' ? '150%' : 'auto' }}>
                  <p>Total Registered Students</p>
                  <h2>{dashboardStats.totalStudents.toLocaleString()}</h2>
                  <div className="card-icon">👤</div>
                </div>
                {activeTab === 'students' && (
                  <button className="btn-export" onClick={exportToCSV} style={{ 
                    padding: '10px 20px',
                    whiteSpace: 'nowrap'
                  }}>
                    📗 Export CSV List
                  </button>
                )}
              </div>
            )}
            {(activeTab === 'dashboard' || activeTab === 'predictions') && (
              <div className="stat-card" style={{ width: activeTab === 'predictions' ? '200%' : 'auto', marginBottom: '20px' }}>
                <p>AI Predictions Made</p>
                <h2>{dashboardStats.totalPredictions.toLocaleString()}</h2>
                <div className="card-icon">🧠</div>
              </div>
            )}
            {activeTab === 'dashboard' && (
              <div className="stat-card">
                <p>System Accuracy</p>
                <h2>{dashboardStats.accuracy}%</h2>
                <div className="card-icon">📈</div>
              </div>
            )}
          </div>
        </div>
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
                        <PieChart width={180} height={220}>
                          <Pie data={pieData} innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={(value, name, props) => [
                            `${props.payload.count} predictions (${value}%)`,
                            props.payload.name
                          ]}
                          />
                          {/* Center mein total dikhao */}
                        <text x={90} y={100} textAnchor="middle" 
                          style={{fontSize:'15px', fill:'#718096', fontWeight:'600'}}>
                          Total
                        </text>
                        <text x={90} y={120} textAnchor="middle"
                          style={{fontSize:'18px', fill:'#718096', fontWeight:'800'}}>
                          {pieData.reduce((sum, item) => sum + (item.count || 0), 0)}
                        </text>
                        </PieChart>
                        
                        <div className="custom-legend" style={{ minWidth: '185px' }}>
                          {pieData.map((item, index) => (
                            <div className="legend-item" key={index}>
                              <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                              <span className="legend-text" style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>{item.name} ({item.value}%)</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : <div>Loading...</div>}
                  </div>
                </div>
                {/* <div className="chart-divider"></div> */}
                <div className="chart-container area-container">
                  <h4 className="chart-title">Prediction Volume</h4>
                  <AreaChart width={activeTab === 'predictions' ? 470 : 390} height={220} data={lineData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38b2ac" stopOpacity={0.3}/><stop offset="95%" stopColor="#38b2ac" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value}`}
                      label={{ 
                        value: 'Predictions', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontSize: '11px', fill: '#718096' }
                      }} />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <h3 className="section-title" style={{ margin: 0 }}>
                {activeTab === 'students' ? 'All Registered Students' : 'Student Registrations list'}
              </h3>
              <div className="table-search-box" style={{
                position: 'relative', display: 'flex', alignItems: 'center',
                background: '#F7FAFC', border: '1px solid #E2E8F0',
                borderRadius: '10px', padding: '8px 15px', width: '300px'
              }}>
                <span style={{ marginRight: '10px', color: '#A0AEC0' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: '#2D3748' }}
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
                  .slice(0, showAll ? students.length : 5).map((student, idx) => (
                  <tr key={idx} 
                    onClick={() => activeTab === 'dashboard' ? handleViewStudent(student) : null}
                    style={{ cursor: activeTab === 'dashboard' ? 'pointer' : 'default' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = activeTab === 'dashboard' ? '#fff5f5' : 'transparent'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px' }}>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.stream}</td>  
                    <td>{new Date(student.created_at).toLocaleDateString()}</td>
                    <td style={{ 
                      color: student.ai_career === 'Pending...' ? '#A0AEC0' : '#38b2ac',
                      fontWeight: student.ai_career === 'Pending...' ? 'normal' : '600' 
                    }}>
                      {student.ai_career}
                    </td>
                    {activeTab === 'students' && (
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          <button onClick={(e) => { e.stopPropagation(); handleViewStudent(student); }} 
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#38b2ac' }}>
                            <Eye size={20} />
                          </button>
                         <button  onClick={(e) => handleEdit(e, student)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'green' }}>
                          <Edit2 size={20} />
                        </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e53e3e' }}>
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
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
            
            {students.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                {showAll ? (
                  <button onClick={() => setShowAll(false)} style={{ background: '#FF8787', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    View Less Records
                  </button>
                ) : (
                  <button onClick={() => setShowAll(true)} style={{ background: '#FF8787', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    View All Records
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="feedback-corner" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h3 className="section-title">User Satisfaction</h3>
           
            {/* <div className="feedback-comments" style={{ fontSize: '13px', color: '#718096' }}>
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
            </div> */}
            <div className="feedback-comments" style={{ fontSize: '13px', color: '#718096' }}>
          
            {/* Rating breakdown */}
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', 
              alignItems: 'center', marginBottom: '12px' 
            }}>
            <p style={{ margin: 0, fontWeight: '600' }}>Recent Reviews</p>
            <span style={{ 
              background: satisfaction > 70 ? '#f0fff4' : '#fff5f5',
              color: satisfaction > 70 ? '#276749' : '#e53e3e',
              padding: '2px 10px', borderRadius: '20px',
              fontSize: '11px', fontWeight: '700',
              border: `1px solid ${satisfaction > 70 ? '#c6f6d5' : '#fed7d7'}`
            }}>
              {satisfaction > 80 ? '😊 Excellent' : 
              satisfaction > 60 ? '🙂 Good' : 
              satisfaction > 40 ? '😐 Average' : '😟 Poor'}
            </span>
            </div>

          {/* Comments list */}
          {recentComments.length > 0 ? (
            recentComments.map((fb, index) => (
              <div key={index} style={{ 
                marginTop: '10px', 
                padding: '10px 12px',
                background: '#f8f9fa',
                borderRadius: '10px',
                borderLeft: '3px solid #FF8787'
              }}>
                {/* Stars */}
                <div style={{ marginBottom: '5px' }}>
                  {[1,2,3,4,5].map(star => (
                    <span key={star} style={{ 
                      fontSize: '12px',
                      color: star <= fb.rating ? '#f59e0b' : '#e2e8f0' 
                    }}>★</span>
                  ))}
                </div>
                {/* Comment text */}
                <strong style={{ color: '#2D3748', fontSize: '12px', lineHeight: '1.5' }}>
                  "{fb.comment}"
                </strong>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', padding: '20px', 
              background: '#f8f9fa', borderRadius: '10px',
              marginTop: '10px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>💬</div>
              <p style={{ margin: 0, fontSize: '12px', color: '#a0aec0' }}>
                No written reviews yet.<br/>
                <span style={{ fontSize: '11px' }}>
                  {satisfaction > 0 ? `${Math.round(satisfaction/20 * 10)/10}/5 avg rating` : 'No ratings yet'}
                </span>
              </p>
            </div>
          )}
        </div>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div onClick={() => setSelectedStudent(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'white', borderRadius: '24px', width: '100%',
            maxWidth: '850px', maxHeight: '88vh', overflowY: 'auto',
            boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
          }}>

            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
              padding: '28px 30px', borderRadius: '24px 24px 0 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                  width: '55px', height: '55px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: '700', color: 'white'
                }}>
                  {selectedStudent.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ color: 'white', margin: 0, fontSize: '1.6rem', fontWeight: '700' }}>
                    {selectedStudent.name}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0', fontSize: '14px' }}>
                    📧 {selectedStudent.email} &nbsp;|&nbsp; 🎓 {selectedStudent.stream || 'N/A'}
                  </p>
                </div>
              </div>
              <button onClick={() => { setSelectedStudent(null); setActiveModalTab('overview'); }} style={{
                background: 'rgba(255,255,255,0.2)', border: 'none',
                color: 'white', width: '38px', height: '38px',
                borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>✕</button>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', borderBottom: '2px solid #f0f0f0',
              padding: '0 30px', background: '#fafafa'
            }}>
              {[
                { id: 'overview', label: '📊 Overview' },
                { id: 'predictions', label: '🎯 Predictions History' },
                { id: 'inputs', label: '📋 Student Inputs' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveModalTab(tab.id)} style={{
                  padding: '14px 20px', border: 'none', background: 'none',
                  cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                  color: activeModalTab === tab.id ? '#FF6B6B' : '#718096',
                  borderBottom: activeModalTab === tab.id ? '3px solid #FF6B6B' : '3px solid transparent',
                  marginBottom: '-2px', transition: 'all 0.2s'
                }}>{tab.label}</button>
              ))}
            </div>

            <div style={{ padding: '28px 30px' }}>
              {modalLoading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#718096' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
                  Loading student details...
                </div>
              ) : (
                <>
                  {/* ===== OVERVIEW TAB ===== */}
                  {activeModalTab === 'overview' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '25px' }}>
                        {[
                          { label: 'Stream', value: selectedStudent.stream || 'N/A', icon: '🎓', color: '#ebf8ff' },
                          { label: 'Registered', value: new Date(selectedStudent.created_at).toLocaleDateString(), icon: '📅', color: '#f0fff4' },
                          { label: 'Total Predictions', value: modalData?.predictions?.length || 0, icon: '🧠', color: '#faf5ff' },
                          { label: 'Status', value: modalData?.predictions?.length > 0 ? 'Active ✅' : 'Pending ⏳', icon: '📌', color: '#fffaf0' },
                        ].map((item, i) => (
                          <div key={i} style={{ background: item.color, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem' }}>{item.icon}</div>
                            <p style={{ margin: '6px 0 2px 0', fontSize: '11px', color: '#718096', textTransform: 'uppercase', fontWeight: '600' }}>{item.label}</p>
                            <p style={{ margin: 0, fontWeight: '700', color: '#2D3748', fontSize: '14px' }}>{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {modalData?.predictions?.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                          <h3 style={{ color: '#2D3748', marginBottom: '15px', fontSize: '1rem', fontWeight: '700' }}>
                            🏆 Latest AI Prediction
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                              { career: modalData.predictions[0].career_1, confidence: modalData.predictions[0].confidence_1, rank: 1, color: '#FF6B6B' },
                              { career: modalData.predictions[0].career_2, confidence: modalData.predictions[0].confidence_2, rank: 2, color: '#38b2ac' },
                              { career: modalData.predictions[0].career_3, confidence: modalData.predictions[0].confidence_3, rank: 3, color: '#6b46c1' },
                            ].map((item, i) => (
                              <div key={i} style={{
                                border: `1px solid ${item.color}30`, borderLeft: `4px solid ${item.color}`,
                                borderRadius: '12px', padding: '14px', background: `${item.color}08`,
                                display: 'flex', alignItems: 'center', gap: '15px'
                              }}>
                                <span style={{ background: item.color, color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>#{item.rank}</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                    <strong style={{ color: '#2D3748' }}>{item.career}</strong>
                                    <span style={{ background: item.color, color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '12px' }}>{item.confidence}%</span>
                                  </div>
                                  <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '5px' }}>
                                    <div style={{ background: item.color, height: '5px', borderRadius: '10px', width: `${item.confidence}%` }}></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== PREDICTIONS HISTORY TAB ===== */}
                  {activeModalTab === 'predictions' && (
                    <div>
                      {modalData?.predictions?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                          No predictions yet for this student.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '20px' }}>
                          
                          {/* Left: Prediction List */}
                          <div style={{ width: '220px', flexShrink: 0 }}>
                            <p style={{ fontSize: '12px', color: '#718096', fontWeight: '600', textTransform: 'uppercase', marginBottom: '10px' }}>
                              All Sessions ({modalData.predictions.length})
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {modalData.predictions.map((pred, i) => (
                                <div key={i} onClick={() => setSelectedPrediction(i)} style={{
                                  padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                  background: selectedPrediction === i ? '#fff5f5' : '#f8f9fa',
                                  border: selectedPrediction === i ? '2px solid #FF6B6B' : '2px solid transparent',
                                  transition: 'all 0.2s'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                      background: selectedPrediction === i ? '#FF6B6B' : '#e2e8f0',
                                      color: selectedPrediction === i ? 'white' : '#718096',
                                      width: '24px', height: '24px', borderRadius: '50%',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '11px', fontWeight: '700', flexShrink: 0
                                    }}>{i + 1}</span>
                                    <div>
                                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#2D3748' }}>{pred.career_1}</p>
                                      <p style={{ margin: 0, fontSize: '11px', color: '#718096' }}>
                                        {new Date(pred.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right: Selected Prediction + Linked Inputs */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '12px', color: '#718096', fontWeight: '600', textTransform: 'uppercase', marginBottom: '10px' }}>
                              Session {selectedPrediction + 1} Details — {new Date(modalData.predictions[selectedPrediction]?.created_at).toLocaleString('en-IN')}
                            </p>
                            
                            {/* Top 3 Predictions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                              {[
                                { career: modalData.predictions[selectedPrediction]?.career_1, confidence: modalData.predictions[selectedPrediction]?.confidence_1, explanation: modalData.predictions[selectedPrediction]?.explanation_1, rank: 1, color: '#FF6B6B' },
                                { career: modalData.predictions[selectedPrediction]?.career_2, confidence: modalData.predictions[selectedPrediction]?.confidence_2, explanation: modalData.predictions[selectedPrediction]?.explanation_2, rank: 2, color: '#38b2ac' },
                                { career: modalData.predictions[selectedPrediction]?.career_3, confidence: modalData.predictions[selectedPrediction]?.confidence_3, explanation: modalData.predictions[selectedPrediction]?.explanation_3, rank: 3, color: '#6b46c1' },
                              ].map((item, i) => (
                                <div key={i} style={{
                                  border: `1px solid ${item.color}30`, borderLeft: `4px solid ${item.color}`,
                                  borderRadius: '12px', padding: '14px', background: `${item.color}08`
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ background: item.color, color: 'white', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>#{item.rank}</span>
                                      <strong style={{ color: '#2D3748' }}>{item.career}</strong>
                                    </div>
                                    <span style={{ background: item.color, color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{item.confidence}% match</span>
                                  </div>
                                  <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '5px', marginBottom: '8px' }}>
                                    <div style={{ background: item.color, height: '5px', borderRadius: '10px', width: `${item.confidence}%` }}></div>
                                  </div>
                                  <p style={{ margin: 0, fontSize: '12px', color: '#718096', lineHeight: '1.5' }}>{item.explanation}</p>
                                </div>
                              ))}
                            </div>

                            {/* Inputs section for this prediction */}
                            <div style={{ 
                              borderTop: '2px dashed #f0f0f0', 
                              paddingTop: '18px',
                              marginTop: '8px'
                            }}>
                              {/* Header row */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '1rem' }}>📋</span>
                                <h4 style={{ margin: 0, color: '#2D3748', fontSize: '0.9rem', fontWeight: '700' }}>
                                  Inputs used for this prediction
                                </h4>
                                {currentPredictionInput && (
                                  <span style={{ 
                                    marginLeft: 'auto', fontSize: '11px', color: '#718096',
                                    background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px'
                                  }}>
                                    Submitted: {new Date(currentPredictionInput.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                  </span>
                                )}
                              </div>

                              {/* If all sessions use the same input, show a notice */}
                              {modalData?.allSameInput && modalData?.predictions?.length > 1 && (
                                <div style={{
                                  background: '#fffbeb', border: '1px solid #fde68a',
                                  borderRadius: '10px', padding: '10px 14px',
                                  marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                  <span style={{ fontSize: '14px' }}>ℹ️</span>
                                  <p style={{ margin: 0, fontSize: '12px', color: '#92400e' }}>
                                    <strong>Same inputs across all {modalData.predictions.length} sessions</strong> — This student filled the form once and ran the prediction {modalData.predictions.length} times.
                                  </p>
                                </div>
                              )}

                              {/* Show inputs or empty state */}
                              {currentPredictionInput 
                                ? <InputDetailsPanel inputData={currentPredictionInput} compact={true} />
                                : (
                                  <div style={{ 
                                    textAlign: 'center', padding: '20px', color: '#718096',
                                    background: '#f8f9fa', borderRadius: '10px', fontSize: '13px'
                                  }}>
                                    No input data linked to this prediction.
                                  </div>
                                )
                              }
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== STUDENT INPUTS TAB ===== */}
                  {/* ✅ Now shows the LATEST inputs (most recent submission) */}
                  {activeModalTab === 'inputs' && (
                    <div>
                      {/* ✅ If multiple input sessions exist, show a switcher */}
                      {modalData?.allInputs?.length > 1 && (
                        <div style={{ 
                          display: 'flex', gap: '8px', marginBottom: '20px', 
                          flexWrap: 'wrap', alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '12px', color: '#718096', fontWeight: '600' }}>Input Session:</span>
                          {modalData.allInputs.map((inp, i) => (
                            <button
                              key={i}
                              onClick={() => setModalData(prev => ({ ...prev, inputs: inp }))}
                              style={{
                                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                                fontWeight: '600', border: '2px solid',
                                background: modalData.inputs?.created_at === inp.created_at ? '#FF6B6B' : 'transparent',
                                color: modalData.inputs?.created_at === inp.created_at ? 'white' : '#718096',
                                borderColor: modalData.inputs?.created_at === inp.created_at ? '#FF6B6B' : '#e2e8f0',
                                transition: 'all 0.2s'
                              }}
                            >
                              Session {i + 1} — {new Date(inp.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </button>
                          ))}
                        </div>
                      )}

                      {!modalData?.inputs ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                          No input data found for this student.
                        </div>
                      ) : (
                        <InputDetailsPanel inputData={modalData.inputs} compact={false} />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    {/* EDIT STUDENT MODAL */}
{editStudent && (
  <div onClick={() => setEditStudent(null)} style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)'
  }}>
    <div onClick={(e) => e.stopPropagation()} style={{
      background: 'white', borderRadius: '24px',
      width: '420px', overflow: 'hidden',
      boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
    }}>

      {/* Header — ProfilePage jaisa */}
      <div style={{ padding: '28px 28px 20px', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button onClick={() => setEditStudent(null)} style={{
              background: 'none', border: 'none', color: '#666',
              cursor: 'pointer', fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '4px', padding: 0
            }}>← Back</button>
            <button onClick={() => setEditStudent(null)} style={{
              background: '#f0f0f0', border: 'none', color: '#555',
              cursor: 'pointer', width: '32px', height: '32px',
              borderRadius: '50%', fontSize: '16px', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>✕</button>
          </div>
        {/* Avatar */}
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          overflow: 'hidden', margin: '0 auto 16px', background: '#5C6E8A',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {editStudent.avatar_url ? (
            <img src={editStudent.avatar_url} alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <svg viewBox="0 0 24 24" fill="white" style={{ width: '55%', height: '55%' }}>
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          )}
        </div>
        {/* Upload button — avatar ke neeche */}
        <div style={{ textAlign: 'center' }}>
      <label style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: '#2d3748', color: 'white',
        padding: '8px 18px', borderRadius: '8px',
        cursor: 'pointer', fontSize: '13px', fontWeight: '600',
        marginBottom: '16px'
      }}>
        📷 Upload Image
        <input type="file" accept="image/*" style={{ display: 'none' }}
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
              const fileExt = file.name.split('.').pop();
              const fileName = `${editStudent.email}_${Date.now()}.${fileExt}`;
              const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });
              if (uploadError) throw uploadError;
              const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
              await supabase.from('users').update({ avatar_url: urlData.publicUrl }).eq('id', editStudent.id);
              setEditStudent(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
              setStudents(students.map(s => s.id === editStudent.id ? { ...s, avatar_url: urlData.publicUrl } : s));
              alert('Image upload ho gayi!');
            } catch (err) {
              alert('Upload failed: ' + err.message);
            }
          }}
        />
      </label>
    </div>
        <h2 style={{ textAlign: 'center', margin: '0 0 4px', fontSize: '1.2rem', fontWeight: '700', color: '#1a202c' }}>
          Edit Student Profile
        </h2>
        <p style={{ textAlign: 'center', color: '#718096', fontSize: '13px', margin: 0 }}>
          Update student display name
        </p>
      </div>

      {/* Form */}
      <div style={{ padding: '8px 28px 28px', background: 'white' }}>
        <form onSubmit={handleSaveEdit}>

          {/* Name Input — ProfilePage jaisa */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: '700',
              color: '#718096', textTransform: 'uppercase',
              letterSpacing: '0.8px', marginBottom: '8px'
            }}>Full Name</label>
            <div style={{
              display: 'flex', alignItems: 'center',
              border: '1.5px solid #e2e8f0', borderRadius: '10px',
              padding: '0 14px', background: 'white'
            }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#FF6B6B'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <span style={{ marginRight: '10px', fontSize: '15px' }}>👤</span>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                onFocus={(e) => e.target.parentNode.style.borderColor = '#FF6B6B'}
                onBlur={(e) => e.target.parentNode.style.borderColor = '#e2e8f0'}
                style={{
                  border: 'none', outline: 'none', width: '100%',
                  fontSize: '15px', padding: '12px 0',
                  background: 'transparent', color: '#2D3748'
                }}
              />
            </div>
          </div>

          {/* Email — disabled */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: '700',
              color: '#718096', textTransform: 'uppercase',
              letterSpacing: '0.8px', marginBottom: '8px'
            }}>Email Address</label>
            <div style={{
              display: 'flex', alignItems: 'center',
                border: '1.5px solid #e2e8f0', borderRadius: '10px',
                padding: '0 14px', background: '#f7fafc',
                cursor: 'not-allowed'
              }}>
              <input
                type="email"
                value={editStudent.email}
                disabled
                style={{
                  border: 'none', outline: 'none', width: '100%',
                  fontSize: '15px', padding: '12px 0',
                  background: 'transparent', color: '#a0aec0',
                  cursor: 'not-allowed'
                }}
              />
            </div>
          </div>

          {/* Save Button */}
          <button type="submit" disabled={editLoading} style={{
            width: '100%', padding: '13px',
            borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
            color: 'white', fontWeight: '700', fontSize: '15px',
            cursor: editLoading ? 'not-allowed' : 'pointer',
            opacity: editLoading ? 0.8 : 1
          }}>
            {editLoading ? "Saving..." : "💾 Save Changes"}
          </button>
        </form>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default DashboardContent;



// import React, { useState, useEffect } from 'react';
// import { 
//    PieChart, Pie, Cell, Tooltip,
//   AreaChart, Area, XAxis, YAxis, CartesianGrid
// } from 'recharts';
// import { Edit2, Eye, Trash2 } from 'lucide-react'; 
// import { supabase } from '../../../backend/supabaseClient';
// import './DashboardContent.css';

// // ✅ Helper: Find the exact input for a prediction using input_id foreign key
// const getInputForPrediction = (allInputs, prediction) => {
//   if (!allInputs || allInputs.length === 0 || !prediction) return null;
  
//   // Direct match via input_id (most accurate)
//   if (prediction.input_id) {
//     const exactMatch = allInputs.find(input => input.id === prediction.input_id);
//     if (exactMatch) return exactMatch;
//   }
  
//   // Fallback: closest input by timestamp if input_id is NULL
//   const predTime = new Date(prediction.created_at).getTime();
//   const validInputs = allInputs.filter(input => 
//     new Date(input.created_at).getTime() <= predTime
//   );
//   if (validInputs.length === 0) return allInputs[0];
//   return validInputs.reduce((closest, curr) => 
//     new Date(curr.created_at) > new Date(closest.created_at) ? curr : closest
//   );
// };

// const DashboardContent = ({ activeTab, searchTerm, setSearchTerm }) => {
//   const [dashboardStats, setDashboardStats] = useState({
//     totalStudents: 0,
//     totalPredictions: 0,
//     accuracy: 91.9 
//   });

//   const [students, setStudents] = useState([]); 
//   const [showAll, setShowAll] = useState(false); 
//   const [pieData, setPieData] = useState([]);
//   const [lineData, setLineData] = useState([]);
//   const [satisfaction, setSatisfaction] = useState(0); 
//   const [recentComments, setRecentComments] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [modalData, setModalData] = useState(null);
//   const [modalLoading, setModalLoading] = useState(false);
//   const [activeModalTab, setActiveModalTab] = useState('overview');
//   const [selectedPrediction, setSelectedPrediction] = useState(0);

//   const [editStudent, setEditStudent] = useState(null);
//   const [editName, setEditName] = useState('');
//   const [editLoading, setEditLoading] = useState(false);

//   useEffect(() => {
//     const fetchRealData = async () => {
//       try {
//         const { data: allUsers, error: fetchError } = await supabase
//           .from('users')
//           .select(`
//             *,
//             user_inputs (stream),
//             predictions (career_1)
//           `)
//           .order('created_at', { ascending: false });

//         if (fetchError) {
//           console.error("Supabase Error:", fetchError.message);
//         }

//         if (allUsers) {
//           const filteredStudents = allUsers.filter(user => {
//             if (user.role && user.role === 'admin') return false;
//             if (user.name && user.name.toLowerCase() === 'admin') return false;
//             if (user.email && (
//               user.email.toLowerCase().includes('support') || 
//               user.email.toLowerCase().includes('admin')
//             )) return false;
//             return true;
//           });

//           const formattedStudents = filteredStudents.map(s => ({
//             ...s,
//             stream: s.user_inputs?.[0]?.stream || 'N/A',
//             ai_career: s.predictions?.[0]?.career_1 || 'Pending...'
//           }));
          
//           setStudents(formattedStudents);
//           setDashboardStats(prev => ({
//             ...prev,
//             totalStudents: formattedStudents.length
//           }));
//         }

//         const { count: predictionCount } = await supabase
//           .from('predictions')
//           .select('*', { count: 'exact', head: true });

//         const { data: predData } = await supabase.from('predictions').select('career_1');
//         if (predData && predData.length > 0) {
//           const counts = predData.reduce((acc, curr) => {
//             const career = curr.career_1 || 'Unknown';
//             acc[career] = (acc[career] || 0) + 1;
//             return acc;
//           }, {});

//           const colors = ['#ff857d', '#1a365d', '#6b46c1', '#38b2ac', '#fbbf24'];

//           // Pehle total predictions count rakh lo
//         const totalPredictions = predData.length; // already hai tumhare code mein
//           const formattedPie = Object.keys(counts).map((key, index) => ({
//             name: key,
//             value: Math.round((counts[key] / predData.length) * 100),
//              count: counts[key], // ← yeh add karo
//             color: colors[index % colors.length]
//           }));
//           setPieData(formattedPie);
//         }

//         // const { data: lineChartRaw } = await supabase.from('predictions').select('created_at');
//         // if (lineChartRaw && lineChartRaw.length > 0) {
//         //   const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//         //   const monthlyCounts = lineChartRaw.reduce((acc, curr) => {
//         //     const date = new Date(curr.created_at);
//         //     const monthName = months[date.getMonth()];
//         //     acc[monthName] = (acc[monthName] || 0) + 1;
//         //     return acc;
//         //   }, {});

//         //   const formattedLineData = Object.keys(monthlyCounts).map(month => ({
//         //     name: month,
//         //     value: monthlyCounts[month]
//         //   }));
//         //   setLineData(formattedLineData);
//         // }
//         const { data: lineChartRaw } = await supabase
//           .from('predictions')
//           .select('created_at');

//         if (lineChartRaw && lineChartRaw.length > 0) {

//           // Week wise count — Mon, Tue, Wed...
//           const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          
//           // Pehle sab 0 se initialize karo
//           const dayCounts = {
//             'Sun': 0, 'Mon': 0, 'Tue': 0,
//             'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0
//           };

//           // Real data count karo
//           lineChartRaw.forEach(curr => {
//             const date = new Date(curr.created_at);
//             const dayName = weekDays[date.getDay()];
//             dayCounts[dayName] += 1;
//           });

//           // Chart ke liye format karo — week order mein
//           const formattedLineData = weekDays.map(day => ({
//             name: day,
//             value: dayCounts[day]
//           }));

//           setLineData(formattedLineData);
//         }
//         setDashboardStats(prev => ({
//           ...prev,
//           totalPredictions: predictionCount || 0,
//           accuracy: 91.9 
//         }));
        
//         const { data: fbData } = await supabase
//           .from('feedbacks')
//           .select('rating, comment')
//           .order('created_at', { ascending: false });

//         if (fbData && fbData.length > 0) {
//           const totalRating = fbData.reduce((acc, curr) => acc + curr.rating, 0);
//           const avgRating = totalRating / fbData.length;
//           const percentage = Math.round(avgRating * 20); 
//           setSatisfaction(percentage);
//           setRecentComments(fbData.slice(0, 2));
//         }
//       } catch (error) {
//         console.error("Data fetch error:", error.message);
//       }
//     };
//     fetchRealData();
//   }, []);
  
//   const handleViewStudent = async (student) => {
//     setSelectedStudent(student);
//     setModalLoading(true);
//     setSelectedPrediction(0); // Reset to first prediction when opening modal

//     const { data: allPredictions } = await supabase
//       .from('predictions')
//       .select('*')
//       .eq('user_id', student.id)
//       .order('created_at', { ascending: false });

//     // 2705 Fetch ALL inputs -- matched via input_id foreign key (with timestamp fallback)
//     const { data: inputData } = await supabase
//       .from('user_inputs')
//       .select('*')
//       .eq('user_id', student.id)
//       .order('created_at', { ascending: true });

//     const inputs = inputData || [];
//     const predictions = allPredictions || [];

//     // Check if all predictions share the same input (student filled form once)
//     const uniqueInputIds = [...new Set(predictions.map(p => p.input_id).filter(Boolean))];
//     const allSameInput = uniqueInputIds.length <= 1;

//     setModalData({ 
//       predictions,
//       allInputs: inputs,
//       allSameInput,
//       inputs: inputs[inputs.length - 1] || null,
//     });
//     setModalLoading(false);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this student?")) {
//       const { error } = await supabase.from('users').delete().eq('id', id);
//       if (!error) {
//         setStudents(students.filter(student => student.id !== id));
//         alert("Student deleted successfully!");
//       } else {
//         alert("Error: " + error.message);
//       }
//     }
//   };

//    const handleEdit = (e, student) => {
//     e.stopPropagation();
//     setEditStudent(student);
//     setEditName(student.name);
//   };

//   const handleSaveEdit = async (e) => {
//     e.preventDefault();
//     if (!editName.trim()) { alert("Naam khali nahi ho sakta!"); return; }
//     setEditLoading(true);
//     try {
//       const { error } = await supabase
//         .from('users')
//         .update({ name: editName.trim() })
//         .eq('id', editStudent.id);
//       if (error) throw error;
//       setStudents(students.map(s =>
//         s.id === editStudent.id ? { ...s, name: editName.trim() } : s
//       ));
//       setEditStudent(null);
//       alert("Student naam update ho gaya!");
//     } catch (err) {
//       alert("Error: " + err.message);
//     } finally {
//       setEditLoading(false);
//     }
//   };

//   const exportToCSV = () => {
//     if (students.length === 0) {
//       alert("No data available to export!");
//       return;
//     }
//     const headers = ["Name", "Email", "Stream", "Registration Date","AI Suggested Career"];
//     const csvRows = students.map(student => {
//       const careerResult = (student.predictions && student.predictions.length > 0) 
//         ? student.predictions[0].career_1 
//         : "Pending...";
//       return [
//         student.name,
//         student.email,
//         student.stream || 'N/A',
//         new Date(student.created_at).toLocaleDateString(),
//         careerResult.replace(/,/g,"") 
//       ];
//     });
//     const csvContent = [
//       headers.join(","), 
//       ...csvRows.map(row => row.join(","))
//     ].join("\n");
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.setAttribute("href", url);
//     link.setAttribute("download", `Student_List_${new Date().toLocaleDateString()}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // ✅ Get the input that corresponds to the currently selected prediction
//   const currentPredictionInput = modalData 
//     ? getInputForPrediction(modalData.allInputs, modalData.predictions[selectedPrediction])
//     : null;

//   // ✅ Reusable component to render input details (used in both tabs)
//   const InputDetailsPanel = ({ inputData, compact = false }) => {
//     if (!inputData) return (
//       <div style={{ textAlign: 'center', padding: '20px', color: '#718096', fontSize: '13px' }}>
//         No input data found for this session.
//       </div>
//     );


   

  

//     return (
//       <>
//         {/* Academic Marks */}
//         <div style={{ marginBottom: compact ? '15px' : '25px' }}>
//           <h3 style={{ color: '#2D3748', marginBottom: '12px', fontSize: compact ? '0.85rem' : '1rem', fontWeight: '700' }}>📚 Academic Marks</h3>
//           <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compact ? 3 : 4}, 1fr)`, gap: '8px' }}>
//             {[
//               { label: 'Physics', value: inputData.physics },
//               { label: 'Chemistry', value: inputData.chemistry },
//               { label: 'Biology', value: inputData.biology },
//               { label: 'Maths', value: inputData.mathematics },
//               { label: 'English', value: inputData.english },
//               { label: 'Computer Sc.', value: inputData.computerscience },
//               { label: 'Accountancy', value: inputData.accountancy },
//               { label: 'Business St.', value: inputData.businessstudies },
//               { label: 'Economics', value: inputData.economics },
//               { label: 'History', value: inputData.history },
//               { label: 'Geography', value: inputData.geography },
//               { label: 'Pol. Science', value: inputData.politicalscience },
//               { label: 'Sociology', value: inputData.sociology },
//             ].filter(item => item.value > 0).map((item, i) => (
//               <div key={i} style={{
//                 background: '#f0fff4', border: '1px solid #c6f6d5',
//                 borderRadius: '10px', padding: compact ? '8px' : '12px', textAlign: 'center'
//               }}>
//                 <p style={{ margin: 0, fontSize: '11px', color: '#718096' }}>{item.label}</p>
//                 <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: '#276749', fontSize: compact ? '1rem' : '1.2rem' }}>{item.value}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Interests */}
//         <div style={{ marginBottom: compact ? '15px' : '25px' }}>
//           <h3 style={{ color: '#2D3748', marginBottom: '12px', fontSize: compact ? '0.85rem' : '1rem', fontWeight: '700' }}>💡 Interests</h3>
//           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
//             {[
//               { label: 'Technology', value: inputData.interest_tech },
//               { label: 'Entrepreneurship', value: inputData.interest_entrepreneurship },
//               { label: 'Leadership', value: inputData.interest_leadership },
//               { label: 'Innovation', value: inputData.interest_innovation },
//               { label: 'Critical Thinking', value: inputData.interest_criticalthinking },
//               { label: 'Research', value: inputData.interest_research },
//               { label: 'Computer Skills', value: inputData.interest_computerskill },
//               { label: 'Hardware Skills', value: inputData.interest_hardwareskill },
//               { label: 'Food', value: inputData.interest_food },
//               { label: 'Creativity', value: inputData.interest_creativity },
//             ].filter(item => item.value === 1).map((item, i) => (
//               <span key={i} style={{
//                 background: '#ebf8ff', color: '#2b6cb0',
//                 padding: compact ? '4px 10px' : '7px 16px', borderRadius: '20px',
//                 fontSize: '12px', fontWeight: '500', border: '1px solid #bee3f8'
//               }}>✓ {item.label}</span>
//             ))}
//           </div>
//         </div>

//         {/* Personality Traits */}
//         <div style={{ marginBottom: compact ? '15px' : '25px' }}>
//           <h3 style={{ color: '#2D3748', marginBottom: '12px', fontSize: compact ? '0.85rem' : '1rem', fontWeight: '700' }}>🧠 Personality Traits</h3>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
//             {[
//               { label: 'Openness', value: inputData.oppenness },
//               { label: 'Conscientious', value: inputData.conscientiousness },
//               { label: 'Extraversion', value: inputData.extraversion },
//               { label: 'Agreeableness', value: inputData.agreeableness },
//               { label: 'Neuroticism', value: inputData.neuroticism },
//             ].map((item, i) => (
//               <div key={i} style={{
//                 background: '#faf5ff', border: '1px solid #e9d8fd',
//                 borderRadius: '10px', padding: compact ? '8px' : '12px', textAlign: 'center'
//               }}>
//                 <p style={{ margin: 0, fontSize: '11px', color: '#718096' }}>{item.label}</p>
//                 <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: '#553c9a', fontSize: compact ? '1rem' : '1.3rem' }}>{item.value}/5</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Activities */}
//         <div>
//           <h3 style={{ color: '#2D3748', marginBottom: '12px', fontSize: compact ? '0.85rem' : '1rem', fontWeight: '700' }}>🏆 Participated Activities</h3>
//           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
//             {[
//               { label: 'Hackathon', value: inputData.participated_hackathon },
//               { label: 'Olympiad', value: inputData.participated_olympiad },
//               { label: 'Kabaddi', value: inputData.participated_kabaddi },
//               { label: 'Kho-Kho', value: inputData.participated_khokho },
//               { label: 'Cricket', value: inputData.participated_cricket },
//             ].filter(item => item.value === 1).map((item, i) => (
//               <span key={i} style={{
//                 background: '#fffaf0', color: '#c05621',
//                 padding: compact ? '4px 10px' : '7px 16px', borderRadius: '20px',
//                 fontSize: '12px', fontWeight: '500', border: '1px solid #fbd38d'
//               }}>🏅 {item.label}</span>
//             ))}
//             {['participated_hackathon','participated_olympiad','participated_kabaddi','participated_khokho','participated_cricket']
//               .every(k => !inputData[k]) && (
//               <p style={{ color: '#718096', fontSize: '13px', margin: 0 }}>No activities participated</p>
//             )}
//           </div>
//         </div>
//       </>
//     );
//   };

//   return (
//     <div className="dashboard-body">
      
//       {/* --- TOP SECTION --- */}
//       <div className="dashboard-top-layout" style={{ display: (activeTab === 'students' || activeTab === 'predictions') ? 'block' : 'flex' }}>
        
//         {/* DASHBOARD TAB */}
//       {activeTab === 'dashboard' && (
//         <div style={{ marginBottom: '30px' }}>

//           {/* Teen Cards ek line mein */}
//           <div className="cards-row">
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

//           {/* Dono Graphs neeche side by side */}
//           <p className="section-title">Key Insights</p>
//           <div className="graphs-row">
//             <div className="graph-box">
//               <p className="chart-title">Top Career Predictions</p>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
//                 {pieData.length > 0 ? (
//                   <>
//                     <PieChart width={200} height={250}>
//                       <Pie data={pieData} innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
//                         {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
//                       </Pie>
//                       <Tooltip formatter={(value, name, props) => [`${props.payload.count} predictions (${value}%)`, props.payload.name]}/>
//                       <text x={100} y={95} textAnchor="middle" style={{fontSize:'12px', fill:'#718096', fontWeight:'600'}}>Total</text>
//                       <text x={100} y={112} textAnchor="middle" style={{fontSize:'18px', fill:'#1a202c', fontWeight:'800'}}>
//                         {pieData.reduce((sum, item) => sum + (item.count || 0), 0)}
//                       </text>
//                     </PieChart>
//                     <div className="custom-legend">
//                       {pieData.map((item, index) => (
//                         <div className="legend-item" key={index}>
//                           <span className="legend-dot" style={{ background: item.color }}></span>
//                           <span className="legend-text">{item.name} ({item.value}%)</span>
//                         </div>
//                       ))}
//                     </div>
//                   </>
//                 ) : <div>Loading...</div>}
//               </div>
//             </div>

//             <div className="graph-divider"></div>

//             <div className="graph-box">
//               <p className="chart-title">Prediction Volume</p>
//               <AreaChart width={550} height={260} data={lineData}>
//                 {/* AreaChart width={activeTab === 'predictions' ? 380 : 380} height={220} data={lineData} */}
//                 <defs>
//                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#38b2ac" stopOpacity={0.3}/>
//                     <stop offset="95%" stopColor="#38b2ac" stopOpacity={0}/>
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f0f0f0" />
//                 <XAxis dataKey="name" />
//                 <YAxis tickFormatter={(value) => `${value}`}
//                       label={{ 
//                         value: 'Predictions', 
//                         angle: -90, 
//                         position: 'insideLeft',
//                         style: { fontSize: '11px', fill: '#718096' }
//                       }}
//                 />
//                 <Tooltip />
//                 <Area type="monotone" dataKey="value" stroke="#38b2ac" strokeWidth={3} fill="url(#colorValue)" />
//               </AreaChart>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* STUDENTS TAB */}
//       {activeTab === 'students' && (
//         <div style={{ marginBottom: '24px' }}>
//           <div className="cards-row">
//             <div className="stat-card">
//               <p>Total Registered Students</p>
//               <h2>{dashboardStats.totalStudents.toLocaleString()}</h2>
//               <div className="card-icon">👤</div>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//               <button className="btn-export" onClick={exportToCSV}>
//                 📗 Export CSV List
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* PREDICTIONS TAB */}
//       {activeTab === 'predictions' && (
//         <div style={{ marginBottom: '30px' }}>
//           <div className="cards-row">
//             <div className="stat-card" style={{ maxWidth: '33%' }}>
//               <p>AI Predictions Made</p>
//               <h2>{dashboardStats.totalPredictions.toLocaleString()}</h2>
//               <div className="card-icon">🧠</div>
//             </div>
//           </div>
//           <p className="section-title">Key Insights</p>
//           <div className="graphs-row">
//             <div className="graph-box">
//               <p className="chart-title">Top Career Predictions</p>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
//                 {pieData.length > 0 ? (
//                   <>
//                     <PieChart width={200} height={200}>
//                       <Pie data={pieData} innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
//                         {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
//                       </Pie>
//                       <Tooltip formatter={(value, name, props) => [`${props.payload.count} predictions (${value}%)`, props.payload.name]}/>
//                       <text x={100} y={95} textAnchor="middle" style={{fontSize:'12px', fill:'#718096', fontWeight:'600'}}>Total</text>
//                       <text x={100} y={112} textAnchor="middle" style={{fontSize:'18px', fill:'#1a202c', fontWeight:'800'}}>
//                         {pieData.reduce((sum, item) => sum + (item.count || 0), 0)}
//                       </text>
//                     </PieChart>
//                     <div className="custom-legend">
//                       {pieData.map((item, index) => (
//                         <div className="legend-item" key={index}>
//                           <span className="legend-dot" style={{ background: item.color }}></span>
//                           <span className="legend-text">{item.name} ({item.value}%)</span>
//                         </div>
//                       ))}
//                     </div>
//                   </>
//                 ) : <div>Loading...</div>}
//               </div>
//             </div>
//             <div className="graph-divider"></div>
//             <div className="graph-box">
//               <p className="chart-title">Prediction Volume</p>
//                 <AreaChart width={550} height={260} data={lineData} margin={{ top: 10, right: 20, left: 15, bottom: 5 }}>
//                 <defs>
//                   <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#38b2ac" stopOpacity={0.3}/>
//                     <stop offset="95%" stopColor="#38b2ac" stopOpacity={0}/>
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f0f0f0" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Area type="monotone" dataKey="value" stroke="#38b2ac" strokeWidth={3} fill="url(#colorValue2)" />
//               </AreaChart>
//             </div>
//           </div>
//         </div>
//       )}
//       </div>

//       {/* --- BOTTOM SECTION: Student Table --- */}
//       {(activeTab === 'dashboard' || activeTab === 'students') && (
//         <div className="dashboard-bottom-layout" style={{ display: 'flex', gap: '20px', marginTop: activeTab === 'students' ? '5px' : '30px' }}>
//           <div className="student-list-container" style={{ flex: 3, background: 'white', padding: '20px', borderRadius: '15px' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
//               <h3 className="section-title" style={{ margin: 0 }}>
//                 {activeTab === 'students' ? 'All Registered Students' : 'Student Registrations list'}
//               </h3>
//               <div className="table-search-box" style={{
//                 position: 'relative', display: 'flex', alignItems: 'center',
//                 background: '#F7FAFC', border: '1px solid #E2E8F0',
//                 borderRadius: '10px', padding: '8px 15px', width: '300px'
//               }}>
//                 <span style={{ marginRight: '10px', color: '#A0AEC0' }}>🔍</span>
//                 <input 
//                   type="text" 
//                   placeholder="Search by name or email..." 
//                   value={searchTerm} 
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: '#2D3748' }}
//                 />
//               </div>
//             </div>
//             <table className="student-table" style={{ width: '100%' }}>
//               <thead>
//                 <tr style={{ textAlign: 'left', borderBottom: '1px solid #f0f0f0', color: '#718096' }}>
//                   <th style={{ padding: '12px' }}>Name</th>
//                   <th>Email</th>
//                   <th>Stream</th>
//                   <th>Registered Date</th>
//                   <th>AI Suggested Career</th>
//                   {activeTab === 'students' && <th>Actions</th>}
//                 </tr>
//               </thead>
//               <tbody>
//                 {students
//                   .filter((student) => {
//                     if (!searchTerm) return true;
//                     const s = searchTerm.toLowerCase();
//                     return (
//                       student.name?.toLowerCase().includes(s) ||
//                       student.email?.toLowerCase().includes(s)
//                     );
//                   })
//                   .slice(0, showAll ? students.length : 5).map((student, idx) => (
//                   <tr key={idx} 
//                     onClick={() => activeTab === 'dashboard' ? handleViewStudent(student) : null}
//                     style={{ cursor: activeTab === 'dashboard' ? 'pointer' : 'default' }}
//                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = activeTab === 'dashboard' ? '#fff5f5' : 'transparent'}
//                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
//                   >
//                     <td style={{ padding: '12px' }}>{student.name}</td>
//                     <td>{student.email}</td>
//                     <td>{student.stream}</td>  
//                     <td>{new Date(student.created_at).toLocaleDateString()}</td>
//                     <td style={{ 
//                       color: student.ai_career === 'Pending...' ? '#A0AEC0' : '#38b2ac',
//                       fontWeight: student.ai_career === 'Pending...' ? 'normal' : '600' 
//                     }}>
//                       {student.ai_career}
//                     </td>
//                     {activeTab === 'students' && (
//                       <td style={{ textAlign: 'center' }}>
//                         <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
//                           <button onClick={(e) => { e.stopPropagation(); handleViewStudent(student); }} 
//                             style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#38b2ac' }}>
//                             <Eye size={20} />
//                           </button>
//                          <button  onClick={(e) => handleEdit(e, student)}
//                           style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'green' }}>
//                           <Edit2 size={20} />
//                         </button>
//                           <button onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e53e3e' }}>
//                             <Trash2 size={20} />
//                           </button>
//                         </div>
//                       </td>
//                     )}
//                   </tr>
//                 ))}
//                 {students.filter(s => 
//                   s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
//                   s.email?.toLowerCase().includes(searchTerm.toLowerCase())
//                 ).length === 0 && searchTerm !== "" && (
//                   <tr>
//                     <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#718096' }}>
//                       No student found matching "{searchTerm}"
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
            
//             {students.length > 5 && (
//               <div style={{ textAlign: 'center', marginTop: '20px' }}>
//                 {showAll ? (
//                   <button onClick={() => setShowAll(false)} style={{ background: '#FF8787', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
//                     View Less Records
//                   </button>
//                 ) : (
//                   <button onClick={() => setShowAll(true)} style={{ background: '#FF8787', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
//                     View All Records
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//           <div className="feedback-corner" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
//             <h3 className="section-title">User Satisfaction</h3>
//             <div className="satisfaction-gauge" style={{ textAlign: 'center', margin: '20px 0' }}>
//               <div style={{ position: 'relative', height: '100px', overflow: 'hidden' }}>
//                 <div style={{ 
//                   width: '150px', height: '150px', 
//                   border: '15px solid #EDF2F7', 
//                   borderTopColor: satisfaction > 70 ? '#48BB78' : '#FF8787',
//                   borderRadius: '50%', margin: '0 auto',
//                   transform: `rotate(${satisfaction * 1.8}deg)`,
//                   transition: 'all 1s ease-out'
//                 }}></div>
//                 <h2 style={{ marginTop: '-40px' }}>{satisfaction}%</h2>
//               </div>
//             </div>
//             <div className="feedback-comments" style={{ fontSize: '13px', color: '#718096' }}>
//               <p>Recent positive comments:</p>
//               {recentComments.length > 0 ? (
//                 recentComments.map((fb, index) => (
//                   <div key={index} style={{ marginTop: '10px' }}>
//                     <strong style={{ color: '#2D3748' }}>"{fb.comment}"</strong>
//                   </div>
//                 ))
//               ) : (
//                 <p>No feedbacks yet.</p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* STUDENT DETAIL MODAL */}
//       {selectedStudent && (
//         <div onClick={() => setSelectedStudent(null)} style={{
//           position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//           backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           padding: '20px', backdropFilter: 'blur(4px)'
//         }}>
//           <div onClick={(e) => e.stopPropagation()} style={{
//             background: 'white', borderRadius: '24px', width: '100%',
//             maxWidth: '850px', maxHeight: '88vh', overflowY: 'auto',
//             boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
//           }}>

//             {/* Header */}
//             <div style={{
//               background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
//               padding: '28px 30px', borderRadius: '24px 24px 0 0',
//               display: 'flex', justifyContent: 'space-between', alignItems: 'center'
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//                 <div style={{
//                   width: '55px', height: '55px', borderRadius: '50%',
//                   background: 'rgba(255,255,255,0.25)',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   fontSize: '1.5rem', fontWeight: '700', color: 'white'
//                 }}>
//                   {selectedStudent.name?.charAt(0).toUpperCase()}
//                 </div>
//                 <div>
//                   <h2 style={{ color: 'white', margin: 0, fontSize: '1.6rem', fontWeight: '700' }}>
//                     {selectedStudent.name}
//                   </h2>
//                   <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0', fontSize: '14px' }}>
//                     📧 {selectedStudent.email} &nbsp;|&nbsp; 🎓 {selectedStudent.stream || 'N/A'}
//                   </p>
//                 </div>
//               </div>
//               <button onClick={() => { setSelectedStudent(null); setActiveModalTab('overview'); }} style={{
//                 background: 'rgba(255,255,255,0.2)', border: 'none',
//                 color: 'white', width: '38px', height: '38px',
//                 borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center'
//               }}>✕</button>
//             </div>

//             {/* Tabs */}
//             <div style={{
//               display: 'flex', borderBottom: '2px solid #f0f0f0',
//               padding: '0 30px', background: '#fafafa'
//             }}>
//               {[
//                 { id: 'overview', label: '📊 Overview' },
//                 { id: 'predictions', label: '🎯 Predictions History' },
//                 { id: 'inputs', label: '📋 Student Inputs' },
//               ].map(tab => (
//                 <button key={tab.id} onClick={() => setActiveModalTab(tab.id)} style={{
//                   padding: '14px 20px', border: 'none', background: 'none',
//                   cursor: 'pointer', fontSize: '14px', fontWeight: '600',
//                   color: activeModalTab === tab.id ? '#FF6B6B' : '#718096',
//                   borderBottom: activeModalTab === tab.id ? '3px solid #FF6B6B' : '3px solid transparent',
//                   marginBottom: '-2px', transition: 'all 0.2s'
//                 }}>{tab.label}</button>
//               ))}
//             </div>

//             <div style={{ padding: '28px 30px' }}>
//               {modalLoading ? (
//                 <div style={{ textAlign: 'center', padding: '60px', color: '#718096' }}>
//                   <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
//                   Loading student details...
//                 </div>
//               ) : (
//                 <>
//                   {/* ===== OVERVIEW TAB ===== */}
//                   {activeModalTab === 'overview' && (
//                     <div>
//                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '25px' }}>
//                         {[
//                           { label: 'Stream', value: selectedStudent.stream || 'N/A', icon: '🎓', color: '#ebf8ff' },
//                           { label: 'Registered', value: new Date(selectedStudent.created_at).toLocaleDateString(), icon: '📅', color: '#f0fff4' },
//                           { label: 'Total Predictions', value: modalData?.predictions?.length || 0, icon: '🧠', color: '#faf5ff' },
//                           { label: 'Status', value: modalData?.predictions?.length > 0 ? 'Active ✅' : 'Pending ⏳', icon: '📌', color: '#fffaf0' },
//                         ].map((item, i) => (
//                           <div key={i} style={{ background: item.color, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
//                             <div style={{ fontSize: '1.5rem' }}>{item.icon}</div>
//                             <p style={{ margin: '6px 0 2px 0', fontSize: '11px', color: '#718096', textTransform: 'uppercase', fontWeight: '600' }}>{item.label}</p>
//                             <p style={{ margin: 0, fontWeight: '700', color: '#2D3748', fontSize: '14px' }}>{item.value}</p>
//                           </div>
//                         ))}
//                       </div>

//                       {modalData?.predictions?.length > 0 && (
//                         <div style={{ marginBottom: '20px' }}>
//                           <h3 style={{ color: '#2D3748', marginBottom: '15px', fontSize: '1rem', fontWeight: '700' }}>
//                             🏆 Latest AI Prediction
//                           </h3>
//                           <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//                             {[
//                               { career: modalData.predictions[0].career_1, confidence: modalData.predictions[0].confidence_1, rank: 1, color: '#FF6B6B' },
//                               { career: modalData.predictions[0].career_2, confidence: modalData.predictions[0].confidence_2, rank: 2, color: '#38b2ac' },
//                               { career: modalData.predictions[0].career_3, confidence: modalData.predictions[0].confidence_3, rank: 3, color: '#6b46c1' },
//                             ].map((item, i) => (
//                               <div key={i} style={{
//                                 border: `1px solid ${item.color}30`, borderLeft: `4px solid ${item.color}`,
//                                 borderRadius: '12px', padding: '14px', background: `${item.color}08`,
//                                 display: 'flex', alignItems: 'center', gap: '15px'
//                               }}>
//                                 <span style={{ background: item.color, color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>#{item.rank}</span>
//                                 <div style={{ flex: 1 }}>
//                                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
//                                     <strong style={{ color: '#2D3748' }}>{item.career}</strong>
//                                     <span style={{ background: item.color, color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '12px' }}>{item.confidence}%</span>
//                                   </div>
//                                   <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '5px' }}>
//                                     <div style={{ background: item.color, height: '5px', borderRadius: '10px', width: `${item.confidence}%` }}></div>
//                                   </div>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {/* ===== PREDICTIONS HISTORY TAB ===== */}
//                   {activeModalTab === 'predictions' && (
//                     <div>
//                       {modalData?.predictions?.length === 0 ? (
//                         <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
//                           No predictions yet for this student.
//                         </div>
//                       ) : (
//                         <div style={{ display: 'flex', gap: '20px' }}>
                          
//                           {/* Left: Prediction List */}
//                           <div style={{ width: '220px', flexShrink: 0 }}>
//                             <p style={{ fontSize: '12px', color: '#718096', fontWeight: '600', textTransform: 'uppercase', marginBottom: '10px' }}>
//                               All Sessions ({modalData.predictions.length})
//                             </p>
//                             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                               {modalData.predictions.map((pred, i) => (
//                                 <div key={i} onClick={() => setSelectedPrediction(i)} style={{
//                                   padding: '12px', borderRadius: '12px', cursor: 'pointer',
//                                   background: selectedPrediction === i ? '#fff5f5' : '#f8f9fa',
//                                   border: selectedPrediction === i ? '2px solid #FF6B6B' : '2px solid transparent',
//                                   transition: 'all 0.2s'
//                                 }}>
//                                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                     <span style={{
//                                       background: selectedPrediction === i ? '#FF6B6B' : '#e2e8f0',
//                                       color: selectedPrediction === i ? 'white' : '#718096',
//                                       width: '24px', height: '24px', borderRadius: '50%',
//                                       display: 'flex', alignItems: 'center', justifyContent: 'center',
//                                       fontSize: '11px', fontWeight: '700', flexShrink: 0
//                                     }}>{i + 1}</span>
//                                     <div>
//                                       <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#2D3748' }}>{pred.career_1}</p>
//                                       <p style={{ margin: 0, fontSize: '11px', color: '#718096' }}>
//                                         {new Date(pred.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>

//                           {/* Right: Selected Prediction + Linked Inputs */}
//                           <div style={{ flex: 1, minWidth: 0 }}>
//                             <p style={{ fontSize: '12px', color: '#718096', fontWeight: '600', textTransform: 'uppercase', marginBottom: '10px' }}>
//                               Session {selectedPrediction + 1} Details — {new Date(modalData.predictions[selectedPrediction]?.created_at).toLocaleString('en-IN')}
//                             </p>
                            
//                             {/* Top 3 Predictions */}
//                             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
//                               {[
//                                 { career: modalData.predictions[selectedPrediction]?.career_1, confidence: modalData.predictions[selectedPrediction]?.confidence_1, explanation: modalData.predictions[selectedPrediction]?.explanation_1, rank: 1, color: '#FF6B6B' },
//                                 { career: modalData.predictions[selectedPrediction]?.career_2, confidence: modalData.predictions[selectedPrediction]?.confidence_2, explanation: modalData.predictions[selectedPrediction]?.explanation_2, rank: 2, color: '#38b2ac' },
//                                 { career: modalData.predictions[selectedPrediction]?.career_3, confidence: modalData.predictions[selectedPrediction]?.confidence_3, explanation: modalData.predictions[selectedPrediction]?.explanation_3, rank: 3, color: '#6b46c1' },
//                               ].map((item, i) => (
//                                 <div key={i} style={{
//                                   border: `1px solid ${item.color}30`, borderLeft: `4px solid ${item.color}`,
//                                   borderRadius: '12px', padding: '14px', background: `${item.color}08`
//                                 }}>
//                                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
//                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                       <span style={{ background: item.color, color: 'white', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>#{item.rank}</span>
//                                       <strong style={{ color: '#2D3748' }}>{item.career}</strong>
//                                     </div>
//                                     <span style={{ background: item.color, color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{item.confidence}% match</span>
//                                   </div>
//                                   <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '5px', marginBottom: '8px' }}>
//                                     <div style={{ background: item.color, height: '5px', borderRadius: '10px', width: `${item.confidence}%` }}></div>
//                                   </div>
//                                   <p style={{ margin: 0, fontSize: '12px', color: '#718096', lineHeight: '1.5' }}>{item.explanation}</p>
//                                 </div>
//                               ))}
//                             </div>

//                             {/* Inputs section for this prediction */}
//                             <div style={{ 
//                               borderTop: '2px dashed #f0f0f0', 
//                               paddingTop: '18px',
//                               marginTop: '8px'
//                             }}>
//                               {/* Header row */}
//                               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
//                                 <span style={{ fontSize: '1rem' }}>📋</span>
//                                 <h4 style={{ margin: 0, color: '#2D3748', fontSize: '0.9rem', fontWeight: '700' }}>
//                                   Inputs used for this prediction
//                                 </h4>
//                                 {currentPredictionInput && (
//                                   <span style={{ 
//                                     marginLeft: 'auto', fontSize: '11px', color: '#718096',
//                                     background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px'
//                                   }}>
//                                     Submitted: {new Date(currentPredictionInput.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
//                                   </span>
//                                 )}
//                               </div>

//                               {/* If all sessions use the same input, show a notice */}
//                               {modalData?.allSameInput && modalData?.predictions?.length > 1 && (
//                                 <div style={{
//                                   background: '#fffbeb', border: '1px solid #fde68a',
//                                   borderRadius: '10px', padding: '10px 14px',
//                                   marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px'
//                                 }}>
//                                   <span style={{ fontSize: '14px' }}>ℹ️</span>
//                                   <p style={{ margin: 0, fontSize: '12px', color: '#92400e' }}>
//                                     <strong>Same inputs across all {modalData.predictions.length} sessions</strong> — This student filled the form once and ran the prediction {modalData.predictions.length} times.
//                                   </p>
//                                 </div>
//                               )}

//                               {/* Show inputs or empty state */}
//                               {currentPredictionInput 
//                                 ? <InputDetailsPanel inputData={currentPredictionInput} compact={true} />
//                                 : (
//                                   <div style={{ 
//                                     textAlign: 'center', padding: '20px', color: '#718096',
//                                     background: '#f8f9fa', borderRadius: '10px', fontSize: '13px'
//                                   }}>
//                                     No input data linked to this prediction.
//                                   </div>
//                                 )
//                               }
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {/* ===== STUDENT INPUTS TAB ===== */}
//                   {/* ✅ Now shows the LATEST inputs (most recent submission) */}
//                   {activeModalTab === 'inputs' && (
//                     <div>
//                       {/* ✅ If multiple input sessions exist, show a switcher */}
//                       {modalData?.allInputs?.length > 1 && (
//                         <div style={{ 
//                           display: 'flex', gap: '8px', marginBottom: '20px', 
//                           flexWrap: 'wrap', alignItems: 'center'
//                         }}>
//                           <span style={{ fontSize: '12px', color: '#718096', fontWeight: '600' }}>Input Session:</span>
//                           {modalData.allInputs.map((inp, i) => (
//                             <button
//                               key={i}
//                               onClick={() => setModalData(prev => ({ ...prev, inputs: inp }))}
//                               style={{
//                                 padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
//                                 fontWeight: '600', border: '2px solid',
//                                 background: modalData.inputs?.created_at === inp.created_at ? '#FF6B6B' : 'transparent',
//                                 color: modalData.inputs?.created_at === inp.created_at ? 'white' : '#718096',
//                                 borderColor: modalData.inputs?.created_at === inp.created_at ? '#FF6B6B' : '#e2e8f0',
//                                 transition: 'all 0.2s'
//                               }}
//                             >
//                               Session {i + 1} — {new Date(inp.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
//                             </button>
//                           ))}
//                         </div>
//                       )}

//                       {!modalData?.inputs ? (
//                         <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
//                           No input data found for this student.
//                         </div>
//                       ) : (
//                         <InputDetailsPanel inputData={modalData.inputs} compact={false} />
//                       )}
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     {/* EDIT STUDENT MODAL */}
// {editStudent && (
//   <div onClick={() => setEditStudent(null)} style={{
//     position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100,
//     display: 'flex', alignItems: 'center', justifyContent: 'center',
//     backdropFilter: 'blur(4px)'
//   }}>
//     <div onClick={(e) => e.stopPropagation()} style={{
//       background: 'white', borderRadius: '24px',
//       width: '420px', overflow: 'hidden',
//       boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
//     }}>

//       {/* Header — ProfilePage jaisa */}
//       <div style={{ padding: '28px 28px 20px', background: 'white' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
//             <button onClick={() => setEditStudent(null)} style={{
//               background: 'none', border: 'none', color: '#666',
//               cursor: 'pointer', fontSize: '14px',
//               display: 'flex', alignItems: 'center', gap: '4px', padding: 0
//             }}>← Back</button>
//             <button onClick={() => setEditStudent(null)} style={{
//               background: '#f0f0f0', border: 'none', color: '#555',
//               cursor: 'pointer', width: '32px', height: '32px',
//               borderRadius: '50%', fontSize: '16px', fontWeight: '700',
//               display: 'flex', alignItems: 'center', justifyContent: 'center'
//             }}>✕</button>
//           </div>
//         {/* Avatar */}
//         <div style={{
//           width: '90px', height: '90px', borderRadius: '50%',
//           overflow: 'hidden', margin: '0 auto 16px', background: '#5C6E8A',
//           display: 'flex', alignItems: 'center', justifyContent: 'center'
//         }}>
//           {editStudent.avatar_url ? (
//             <img src={editStudent.avatar_url} alt="avatar"
//               style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//           ) : (
//             <svg viewBox="0 0 24 24" fill="white" style={{ width: '55%', height: '55%' }}>
//               <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
//             </svg>
//           )}
//         </div>
//         {/* Upload button — avatar ke neeche */}
//         <div style={{ textAlign: 'center' }}>
//       <label style={{
//         display: 'inline-flex', alignItems: 'center', gap: '6px',
//         background: '#2d3748', color: 'white',
//         padding: '8px 18px', borderRadius: '8px',
//         cursor: 'pointer', fontSize: '13px', fontWeight: '600',
//         marginBottom: '16px'
//       }}>
//         📷 Upload Image
//         <input type="file" accept="image/*" style={{ display: 'none' }}
//           onChange={async (e) => {
//             const file = e.target.files[0];
//             if (!file) return;
//             try {
//               const fileExt = file.name.split('.').pop();
//               const fileName = `${editStudent.email}_${Date.now()}.${fileExt}`;
//               const { error: uploadError } = await supabase.storage
//                 .from('avatars')
//                 .upload(fileName, file, { upsert: true });
//               if (uploadError) throw uploadError;
//               const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
//               await supabase.from('users').update({ avatar_url: urlData.publicUrl }).eq('id', editStudent.id);
//               setEditStudent(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
//               setStudents(students.map(s => s.id === editStudent.id ? { ...s, avatar_url: urlData.publicUrl } : s));
//               alert('Image upload ho gayi!');
//             } catch (err) {
//               alert('Upload failed: ' + err.message);
//             }
//           }}
//         />
//       </label>
//     </div>
//         <h2 style={{ textAlign: 'center', margin: '0 0 4px', fontSize: '1.2rem', fontWeight: '700', color: '#1a202c' }}>
//           Edit Student Profile
//         </h2>
//         <p style={{ textAlign: 'center', color: '#718096', fontSize: '13px', margin: 0 }}>
//           Update student display name
//         </p>
//       </div>

//       {/* Form */}
//       <div style={{ padding: '8px 28px 28px', background: 'white' }}>
//         <form onSubmit={handleSaveEdit}>

//           {/* Name Input — ProfilePage jaisa */}
//           <div style={{ marginBottom: '16px' }}>
//             <label style={{
//               display: 'block', fontSize: '11px', fontWeight: '700',
//               color: '#718096', textTransform: 'uppercase',
//               letterSpacing: '0.8px', marginBottom: '8px'
//             }}>Full Name</label>
//             <div style={{
//               display: 'flex', alignItems: 'center',
//               border: '1.5px solid #e2e8f0', borderRadius: '10px',
//               padding: '0 14px', background: 'white'
//             }}
//               onFocus={(e) => e.currentTarget.style.borderColor = '#FF6B6B'}
//               onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
//             >
//               <span style={{ marginRight: '10px', fontSize: '15px' }}>👤</span>
//               <input
//                 type="text"
//                 value={editName}
//                 onChange={(e) => setEditName(e.target.value)}
//                 autoFocus
//                 onFocus={(e) => e.target.parentNode.style.borderColor = '#FF6B6B'}
//                 onBlur={(e) => e.target.parentNode.style.borderColor = '#e2e8f0'}
//                 style={{
//                   border: 'none', outline: 'none', width: '100%',
//                   fontSize: '15px', padding: '12px 0',
//                   background: 'transparent', color: '#2D3748'
//                 }}
//               />
//             </div>
//           </div>

//           {/* Email — disabled */}
//           <div style={{ marginBottom: '24px' }}>
//             <label style={{
//               display: 'block', fontSize: '11px', fontWeight: '700',
//               color: '#718096', textTransform: 'uppercase',
//               letterSpacing: '0.8px', marginBottom: '8px'
//             }}>Email Address</label>
//             <div style={{
//               display: 'flex', alignItems: 'center',
//                 border: '1.5px solid #e2e8f0', borderRadius: '10px',
//                 padding: '0 14px', background: '#f7fafc',
//                 cursor: 'not-allowed'
//               }}>
//               <input
//                 type="email"
//                 value={editStudent.email}
//                 disabled
//                 style={{
//                   border: 'none', outline: 'none', width: '100%',
//                   fontSize: '15px', padding: '12px 0',
//                   background: 'transparent', color: '#a0aec0',
//                   cursor: 'not-allowed'
//                 }}
//               />
//             </div>
//           </div>

//           {/* Save Button */}
//           <button type="submit" disabled={editLoading} style={{
//             width: '100%', padding: '13px',
//             borderRadius: '10px', border: 'none',
//             background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
//             color: 'white', fontWeight: '700', fontSize: '15px',
//             cursor: editLoading ? 'not-allowed' : 'pointer',
//             opacity: editLoading ? 0.8 : 1
//           }}>
//             {editLoading ? "Saving..." : "💾 Save Changes"}
//           </button>
//         </form>
//       </div>
//     </div>
//   </div>
// )}
//     </div>
//   );
// };

// export default DashboardContent;