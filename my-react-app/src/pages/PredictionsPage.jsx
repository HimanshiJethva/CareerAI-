import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../backend/supabaseClient";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

/* ── same colour palette as DashboardPage ── */
const C = {
  primary:    "#f97066",
  primary2:   "#ef4444",
  primaryDark:"#dc2626",
  soft:       "#fff5f3",
  softBorder: "#fecaca",
  pageBg:     "#fdf6f4",
  dark:       "#0f172a",
  dark2:      "#1a1035",
  text:       "#1e293b",
  muted:      "#64748b",
  border:     "#f1f5f9",
};

const formatName = (raw = "") => {
  if (!raw) return "Student";
  let name = raw.includes("@") ? raw.split("@")[0] : raw;
  return name.replace(/[._\-]/g, " ").replace(/\s+/g, " ").trim()
    .replace(/\b\w/g, c => c.toUpperCase());
};

const NAV_LINKS = [
  { icon: "🏠", label: "Dashboard",      path: "/dashboard "   },
  { icon: "📊", label: "My Predictions", path: "/predictions", active: true },
  { icon: "👤", label: "My Profile",     path: "/profile"     },
  // { icon: "⚙️", label: "Settings",       path: "/settings"    },
];

/* animated bar that grows on mount */
function AnimBar({ pct, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 200 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ flex:1, height:8, background:"#f1f5f9", borderRadius:6, overflow:"hidden" }}>
      <div style={{
        height:"100%", borderRadius:6, background:color,
        width:`${w}%`, transition:"width 0.9s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}

export default function PredictionsPage() {
  const navigate   = useNavigate();
  const dropRef    = useRef(null);
  const [preds,    setPreds   ] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail,setUserEmail] = useState("");
  const [initials, setInitials] = useState("HJ");
  const [showDrop, setShowDrop] = useState(false);
  const [stats,    setStats   ] = useState({ total:0, topCareer:"—", avgConf:0 });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      const raw = user.user_metadata?.full_name || user.email || "";
      const name = formatName(raw);
      setUserName(name);
      setUserEmail(user.email || "");
      setInitials(name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0,2).toUpperCase() || "HJ");

      const { data, error } = await supabase
        .from("predictions").select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setPreds(data);
        /* compute stats */
        const careers = data.map(p => p.career_1).filter(Boolean);
        const freq = {};
        careers.forEach(c => { freq[c] = (freq[c] || 0) + 1; });
        const top = Object.entries(freq).sort((a,b) => b[1]-a[1])[0]?.[0] || "—";
        const avg = data.length
          ? Math.round(data.reduce((s,p) => s+(p.confidence_1||0), 0) / data.length)
          : 0;
        setStats({ total: data.length, topCareer: top, avgConf: avg });
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    toast.success("Logged out Successfully!");
    navigate("/login");
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html, body, #root { height:100%; }
    body { font-family:'DM Sans',sans-serif; background:${C.pageBg}; }

    @keyframes slideUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes popIn    { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
    @keyframes fadeIn   { from{opacity:0} to{opacity:1} }

    .shell   { display:flex; height:100vh; width:100vw; overflow:hidden; }

    /* ── SIDEBAR ── */
    .sb { width:252px; flex-shrink:0;
      background:linear-gradient(175deg,${C.dark} 0%,${C.dark2} 60%,${C.dark} 100%);
      display:flex; flex-direction:column; position:relative; overflow:hidden;
      border-right:1px solid rgba(255,255,255,0.06); }
    .sb-glow  { position:absolute; width:200px; height:200px; border-radius:50%;
      background:radial-gradient(circle,rgba(249,112,102,0.18) 0%,transparent 70%);
      top:-60px; left:-50px; pointer-events:none; }
    .sb-brand { padding:1.5rem 1.25rem 1rem; border-bottom:1px solid rgba(255,255,255,0.07); position:relative; z-index:1; }
    .sb-name  { font-family:'Sora',sans-serif; font-weight:800; font-size:21px; color:#fff; letter-spacing:-0.5px; }
    .sb-tag   { font-size:10px; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:1.2px; margin-top:3px; }
     .sb-nav   { width:252px; flex-shrink:0;
      background:linear-gradient(175deg,${C.dark} 0%,${C.dark2} 60%,${C.dark} 100%);
      display:flex; flex-direction:column; position:relative; overflow:hidden;
      border-right:1px solid rgba(255,255,255,0.06); margin-bottom: 50px }
    .nav-item { display:flex; align-items:center; gap:11px; padding:11px 13px; border-radius:12px;
      margin-bottom:3px; cursor:pointer; transition:background 0.2s; text-decoration:none;  flex-shrink:0;}
    .nav-item:hover  { background:rgba(255,255,255,0.06); }
    .nav-item.active { background:rgba(249,112,102,0.16); }
    .nav-icon  { width:32px; height:32px; border-radius:8px; display:flex; align-items:center;
      justify-content:center; font-size:14px; background:rgba(255,255,255,0.07);
      border:1px solid rgba(255,255,255,0.1); flex-shrink:0; }
    .nav-item.active .nav-icon { background:${C.primary}; border-color:transparent;
      box-shadow:0 4px 14px rgba(249,112,102,0.4); }
    .nav-label { font-size:13px; font-weight:600; color:rgba(255,255,255,0.4); transition:color 0.2s; }
    .nav-item.active .nav-label,
    .nav-item:hover  .nav-label { color:#fff; }
    .sb-bottom { margin-top:300px; padding:1rem 1.25rem; border-top:1px solid rgba(255,255,255,0.07); position:relative; z-index:1; }
    .sb-logout  { width:100%; padding:10px; border-radius:10px; background:rgba(239,68,68,0.12);
      color:#fca5a5; border:1px solid rgba(239,68,68,0.2); font-size:13px; font-weight:600;
      cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
    .sb-logout:hover { background:rgba(239,68,68,0.22); }

    /* ── MAIN ── */
    .main  { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

    /* ── NAVBAR ── */
    .nav   { height:64px; background:#fff; flex-shrink:0; width:100%;
      border-bottom:1px solid ${C.border};
      display:flex; align-items:center; justify-content:space-between;
      padding:0 2rem; box-shadow:0 1px 6px rgba(0,0,0,0.04); }
    .nav-left  { display:flex; flex-direction:column; }
    .nav-greet { font-size:11px; color:#94a3b8; font-weight:500; }
    .nav-title { font-family:'Sora',sans-serif; font-size:15px; font-weight:700; color:${C.text}; }
    .nav-right { display:flex; align-items:center; gap:10px; }
    .badge     { background:${C.soft}; border:1px solid ${C.softBorder}; color:${C.primaryDark};
      padding:5px 12px; border-radius:20px; font-size:11.5px; font-weight:600; }
    .avatar    { width:38px; height:38px; border-radius:50%; background:${C.primary};
      color:#fff; font-weight:700; font-size:13px; display:flex; align-items:center;
      justify-content:center; cursor:pointer; border:none; font-family:'DM Sans',sans-serif;
      box-shadow:0 2px 8px rgba(249,112,102,0.35); flex-shrink:0; }
    .drop      { position:absolute; top:calc(100%+8px); right:0; background:#fff;
      border:1px solid ${C.border}; border-radius:14px; padding:8px;
      box-shadow:0 8px 30px rgba(0,0,0,0.12); min-width:215px; z-index:200; animation:popIn 0.2s ease; }
    .drop-hdr  { padding:10px 12px 12px; border-bottom:1px solid ${C.border}; margin-bottom:6px; }
    .drop-name { font-weight:700; color:${C.text}; font-size:14px; }
    .drop-mail { font-size:11px; color:#94a3b8; margin-top:2px; }
    .drop-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px;
      cursor:pointer; font-size:13px; color:#475569; font-weight:500; transition:background 0.15s; }
    .drop-item:hover { background:#f8fafc; }
    .drop-item.danger { color:#ef4444; }
    .drop-item.danger:hover { background:#fef2f2; }
    .drop-div  { height:1px; background:${C.border}; margin:4px 0; }

    /* ── CONTENT ── */
    .content { flex:1; overflow-y:auto; padding:2rem; background:${C.pageBg}; }

    /* page header */
    .page-hdr  { margin-bottom:1.75rem; animation:slideUp 0.35s ease; }
    .page-hdr h1 { font-family:'Sora',sans-serif; font-size:26px; font-weight:800; color:${C.text}; letter-spacing:-0.5px; }
    .page-hdr p  { color:${C.muted}; font-size:13.5px; margin-top:4px; }

    /* stat cards */
    .stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:1.75rem; }
    .stat-card { background:#fff; border-radius:16px; border:1px solid ${C.border};
      padding:1.25rem 1.5rem; box-shadow:0 2px 12px rgba(0,0,0,0.04);
      animation:slideUp 0.4s ease; }
    .stat-label { font-size:12px; font-weight:600; color:${C.muted}; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; }
    .stat-value { font-family:'Sora',sans-serif; font-size:28px; font-weight:800; color:${C.text}; }
    .stat-sub   { font-size:12px; color:${C.muted}; margin-top:4px; }
    .stat-icon  { float:right; font-size:28px; }

    /* prediction cards */
    .pred-card { background:#fff; border-radius:16px; border:1px solid ${C.border};
      box-shadow:0 2px 12px rgba(0,0,0,0.04); padding:1.5rem;
      margin-bottom:1rem; animation:slideUp 0.4s ease; }
    .pred-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; }
    .pred-num  { font-family:'Sora',sans-serif; font-size:15px; font-weight:700; color:${C.text}; }
    .pred-date { font-size:12px; color:#94a3b8; background:#f8fafc; padding:4px 10px; border-radius:20px; border:1px solid #e2e8f0; }
    .career-row { display:flex; align-items:center; gap:12px; padding:10px 0;
      border-bottom:1px solid #f8fafc; }
    .career-row:last-child { border-bottom:none; }
    .medal     { font-size:18px; flex-shrink:0; }
    .cname     { font-size:14px; font-weight:600; color:${C.text}; min-width:130px; }
    .pct-badge { font-size:12px; font-weight:700; color:${C.primary};
      background:${C.soft}; border:1px solid ${C.softBorder};
      padding:3px 10px; border-radius:20px; flex-shrink:0; min-width:46px; text-align:center; }

    /* empty state */
    .empty { text-align:center; padding:5rem 2rem; animation:fadeIn 0.5s ease; }
    .empty-icon { font-size:56px; margin-bottom:1rem; }
    .empty h3   { font-family:'Sora',sans-serif; font-size:20px; font-weight:700; color:${C.text}; margin-bottom:8px; }
    .empty p    { color:${C.muted}; font-size:14px; margin-bottom:1.5rem; }
    .btn-start  { padding:12px 28px; border-radius:12px; background:${C.primary}; color:#fff;
      border:none; font-size:14px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; }

    /* loading skeleton */
    .skeleton { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
      background-size:200% 100%; animation:shimmer 1.4s ease infinite;
      border-radius:10px; height:20px; }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

    @media(max-width:768px) { .sb{display:none} .stats-row{grid-template-columns:1fr 1fr} }
  `;

  const colors = [C.primary, "#ef4444", "#fca5a5"];
  const medals = ["🥇","🥈","🥉"];

  return (
    <>
      <style>{css}</style>
      <div className="shell">

        {/* SIDEBAR */}
        <aside className="sb">
          <div className="sb-glow" />
          <div className="sb-brand">
            <div className="sb-name">CareerAI</div>
            <div className="sb-tag">AI Career Prediction</div>
          </div>
          <nav className="sb-nav">
            {NAV_LINKS.map(l => (
              <div key={l.path}
                className={`nav-item ${l.active ? "active" : ""}`}
                onClick={() => navigate(l.path)}>
                <div className="nav-icon">{l.icon}</div>
                <span className="nav-label">{l.label}</span>
              </div>
            ))}
          </nav>
          <div className="sb-bottom">
            <button className="sb-logout" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">

          {/* NAVBAR */}
          {/* <header className="nav">
            <div className="nav-left">
              <span className="nav-greet">Welcome back,</span>
              <span className="nav-title">{userName || "Student"} 👋</span>
            </div>
            <div className="nav-right">
              <span className="badge">📊 Predictions History</span>
              <div style={{ position:"relative" }} ref={dropRef}>
                <button className="avatar" onClick={() => setShowDrop(v => !v)}>{initials}</button>
                {showDrop && (
                  <div className="drop">
                    <div className="drop-hdr">
                      <div className="drop-name">{userName}</div>
                      <div className="drop-mail">{userEmail}</div>
                    </div>
                    {NAV_LINKS.map(l => (
                      <div key={l.path} className="drop-item"
                        onClick={() => { navigate(l.path); setShowDrop(false); }}>
                        {l.icon} {l.label}
                      </div>
                    ))}
                    <div className="drop-div" />
                    <div className="drop-item danger" onClick={handleLogout}>🚪 Logout</div>
                  </div>
                )}
              </div>
            </div>
          </header> */}

          {/* CONTENT */}
          <div className="content">

            <div className="page-hdr">
              <h1>📊 My Predictions</h1>
              <p>All your AI career predictions — most recent first.</p>
            </div>

            {/* STAT CARDS */}
            {!loading && preds.length > 0 && (
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-icon">🔮</div>
                  <div className="stat-label">Total Predictions</div>
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-sub">Career analyses done</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-label">Most Suggested Career</div>
                  <div className="stat-value" style={{ fontSize:20, marginTop:4 }}>{stats.topCareer}</div>
                  <div className="stat-sub">Appears most frequently</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-label">Avg Top Confidence</div>
                  <div className="stat-value">{stats.avgConf}%</div>
                  <div className="stat-sub">Across all predictions</div>
                </div>
              </div>
            )}

            {/* LOADING SKELETONS */}
            {loading && [1,2,3].map(i => (
              <div key={i} className="pred-card" style={{ opacity: 1-i*0.2 }}>
                <div className="skeleton" style={{ width:"40%", marginBottom:16 }} />
                {[1,2,3].map(j => (
                  <div key={j} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 0" }}>
                    <div className="skeleton" style={{ width:24, height:24, borderRadius:"50%", flexShrink:0 }} />
                    <div className="skeleton" style={{ width:100, height:16 }} />
                    <div className="skeleton" style={{ flex:1, height:8 }} />
                    <div className="skeleton" style={{ width:40, height:24, borderRadius:20 }} />
                  </div>
                ))}
              </div>
            ))}

            {/* EMPTY STATE */}
            {!loading && preds.length === 0 && (
              <div className="empty">
                <div className="empty-icon">🔮</div>
                <h3>No predictions yet</h3>
                <p>Complete the career prediction form to get your first AI-powered career analysis.</p>
                <button className="btn-start" onClick={() => navigate("/dashboard")}>
                  Start My First Prediction →
                </button>
              </div>
            )}

            {/* PREDICTION CARDS */}
            {!loading && preds.map((pred, idx) => {
              const rows = [
                { name: pred.career_1, conf: pred.confidence_1 },
                { name: pred.career_2, conf: pred.confidence_2 },
                { name: pred.career_3, conf: pred.confidence_3 },
              ].filter(r => r.name);

              return (
                <div key={pred.id || idx} className="pred-card"
                  style={{ animationDelay:`${idx * 0.06}s` }}>
                  <div className="pred-head">
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{
                        width:36, height:36, borderRadius:10,
                        background: idx === 0 ? C.soft : "#f8fafc",
                        border:`1px solid ${idx === 0 ? C.softBorder : "#e2e8f0"}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:16, fontWeight:700, color: idx === 0 ? C.primary : C.muted,
                        fontFamily:"'Sora',sans-serif",
                      }}>#{preds.length - idx}</div>
                      <div>
                        <div className="pred-num">Prediction #{preds.length - idx}</div>
                        <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>
                          {rows.length} career matches found
                        </div>
                      </div>
                    </div>
                    <span className="pred-date">
                      {new Date(pred.created_at).toLocaleDateString("en-IN", {
                        day:"numeric", month:"short", year:"numeric",
                      })}
                    </span>
                  </div>

                  {rows.map((r, j) => (
                    <div key={j} className="career-row">
                      <span className="medal">{medals[j]}</span>
                      <span className="cname">{r.name}</span>
                      <AnimBar pct={r.conf} color={colors[j]} delay={idx*60 + j*100} />
                      <span className="pct-badge">{r.conf}%</span>
                    </div>
                  ))}
                </div>
              );
            })}

          </div>
        </div>
      </div>
    </>
  );
}



// import { useState, useEffect } from "react";
// import { supabase } from "../../../backend/supabaseClient";
// import { useNavigate } from "react-router";

// const PredictionsPage = () => {
//   const navigate = useNavigate();
//   const [predictions, setPredictions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPredictions = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) { navigate("/login"); return; }
//       const { data, error } = await supabase
//         .from("predictions")
//         .select("*")
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });
//       if (!error) setPredictions(data || []);
//       setLoading(false);
//     };
//     fetchPredictions();
//   }, []);

//   const css = `
//     @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
//     *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
//     body { font-family:'DM Sans',sans-serif; background:#fdf6f4; }
//     .page { max-width:860px; margin:0 auto; padding:2.5rem 1.5rem; }
//     .back-btn { background:none; border:none; color:#64748b; font-size:14px; font-weight:600;
//       cursor:pointer; font-family:inherit; margin-bottom:1.5rem; display:flex; align-items:center; gap:6px; }
//     .back-btn:hover { color:#1e293b; }
//     h1 { font-family:'Sora',sans-serif; font-size:28px; font-weight:800; color:#1e293b; margin-bottom:4px; }
//     .sub { color:#64748b; font-size:14px; margin-bottom:2rem; }
//     .card { background:#fff; border-radius:16px; border:1px solid #f1f5f9;
//       box-shadow:0 2px 12px rgba(0,0,0,0.05); padding:1.5rem; margin-bottom:1rem; }
//     .card-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
//     .card-date { font-size:12px; color:#94a3b8; }
//     .career-row { display:flex; align-items:center; justify-content:space-between;
//       padding:10px 0; border-bottom:1px solid #f1f5f9; }
//     .career-row:last-child { border-bottom:none; }
//     .career-name { font-weight:600; color:#1e293b; font-size:14px; }
//     .pct { background:#fff5f3; color:#f97066; font-weight:700; font-size:12px;
//       padding:3px 10px; border-radius:20px; border:1px solid #fecaca; }
//     .bar-wrap { flex:1; margin:0 12px; height:6px; background:#f1f5f9; border-radius:4px; overflow:hidden; }
//     .bar-fill { height:100%; border-radius:4px; background:#f97066; }
//     .empty { text-align:center; padding:4rem; color:#94a3b8; }
//     .empty-icon { font-size:48px; margin-bottom:1rem; }
//   `;

//   return (
//     <>
//       <style>{css}</style>
//       <div className="page">
//         <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
//         <h1>My Predictions</h1>
//         <p className="sub">All your past AI career predictions, most recent first.</p>

//         {loading && <p style={{ color:"#64748b" }}>Loading...</p>}

//         {!loading && predictions.length === 0 && (
//           <div className="empty">
//             <div className="empty-icon">📊</div>
//             <p>No predictions yet. Complete the career form to get your first AI prediction!</p>
//           </div>
//         )}

//         {predictions.map((pred, i) => (
//           <div key={i} className="card">
//             <div className="card-top">
//               <span style={{ fontWeight:700, color:"#1e293b", fontSize:15 }}>Prediction #{predictions.length - i}</span>
//               <span className="card-date">
//                 {new Date(pred.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
//               </span>
//             </div>
//             {[
//               { name:pred.career_1, conf:pred.confidence_1 },
//               { name:pred.career_2, conf:pred.confidence_2 },
//               { name:pred.career_3, conf:pred.confidence_3 },
//             ].filter(r => r.name).map((r, j) => (
//               <div key={j} className="career-row">
//                 <span className="career-name">{["🥇","🥈","🥉"][j]} {r.name}</span>
//                 <div className="bar-wrap">
//                   <div className="bar-fill" style={{ width:`${r.conf}%` }} />
//                 </div>
//                 <span className="pct">{r.conf}%</span>
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>
//     </>
//   );
// };

// export default PredictionsPage;
