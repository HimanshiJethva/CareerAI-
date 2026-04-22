import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../backend/supabaseClient";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const formatName = (raw = "") => {
  if (!raw) return "Student";
  let name = raw.includes("@") ? raw.split("@")[0] : raw;
  return name.replace(/[._\-]/g, " ").replace(/\s+/g, " ").trim()
    .replace(/\b\w/g, c => c.toUpperCase());
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const CORAL = "#f97066";

const NAV_LINKS = [
  // { icon: "🏠", label: "Home",             path: "/dashboard"   },
  { icon: "🔮", label: "Start Prediction", path: "/predict"     },
  { icon: "📊", label: "My Predictions",   path: "/predictions" },
  { icon: "👤", label: "My Profile",       path: "/profile"     },
  // { icon: "⚙️", label: "Settings",         path: "/settings"    },
];

export default function DashboardHome() {
  const navigate  = useNavigate();
  const dropRef   = useRef(null);

  const [userName,  setUserName ] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [initials,  setInitials ] = useState("HJ");
  const [showDrop,  setShowDrop ] = useState(false);
  const [loading,   setLoading  ] = useState(true);
  const [stats,     setStats    ] = useState({ total: 0, lastCareer: null, lastConf: 0, lastDate: null });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const raw  = user.user_metadata?.full_name || user.email || "";
      const name = formatName(raw);
      setUserName(name);
      setUserEmail(user.email || "");
      setInitials(name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "HJ");

      const { data, count } = await supabase
        .from("predictions").select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setStats({
          total:      count || 1,
          lastCareer: data[0].career_1 || null,
          lastConf:   data[0].confidence_1 || 0,
          lastDate:   new Date(data[0].created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        });
      } else {
        setStats({ total: 0, lastCareer: null, lastConf: 0, lastDate: null });
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
    toast.success("Logged out!");
    navigate("/login");
  };

  const isFirst = !loading && stats.total === 0;

  return (
    <>
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>

      {/* ── whole page: column flex, full height ── */}
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden" }}>

        {/* ══ NAVBAR — full width, same as DashboardPage ══ */}
        <nav style={{
          height: 64, background: "#fff", flexShrink: 0, width: "100%",
          borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
        }}>
          {/* left — brand + greeting */}
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, fontSize: 30, color: "#1e293b", letterSpacing: -0.5 }}>
              CareerAI
            </div>
            {/* <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{getGreeting()},</span>
              <span style={{ fontFamily: "Playfair Display, serif", fontSize: 15, fontWeight: 800, color: "#1e293b" }}>
                {userName || "Student"} 👋
              </span>
            </div> */}
          </div>

          {/* right — nav links + badge + avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

            {/* inline nav links */}
            {NAV_LINKS.map(l => (
              <button
                key={l.path}
                onClick={() => navigate(l.path)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 10, border: "none",
                  background: l.path === "/dashboard" ? "#fff5f3" : "transparent",
                  color: l.path === "/dashboard" ? CORAL : "#64748b",
                  fontWeight: l.path === "/dashboard" ? 700 : 500,
                  fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.18s",
                  border: l.path === "/dashboard" ? "1px solid #fecaca" : "1px solid transparent",
                }}
                onMouseEnter={e => {
                  if (l.path !== "/dashboard") {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.color = "#1e293b";
                  }
                }}
                onMouseLeave={e => {
                  if (l.path !== "/dashboard") {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#64748b";
                  }
                }}
              >
                <span style={{ fontSize: 14 }}>{l.icon}</span>
                {l.label}
              </button>
            ))}

            {/* divider */}
            <div style={{ width: 1, height: 28, background: "#e2e8f0", margin: "0 6px" }} />

            {/* AI badge */}
            <span style={{
              background: "#fff5f3", border: "1px solid #fecaca",
              color: "#dc2626", padding: "5px 12px", borderRadius: 20,
              fontSize: 11.5, fontWeight: 600,
            }}>🤖 AI Powered</span>

            {/* avatar + dropdown */}
            <div style={{ position: "relative" }} ref={dropRef}>
              <button
                onClick={() => setShowDrop(v => !v)}
                style={{
                  width: 38, height: 38, borderRadius: "50%", background: CORAL,
                  color: "#fff", fontWeight: 700, fontSize: 13,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", border: "none", fontFamily: "inherit",
                  boxShadow: "0 2px 8px rgba(249,112,102,0.35)", marginLeft: 4,
                }}
              >
                {initials}
              </button>

              {showDrop && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14,
                  padding: 8, boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  minWidth: 210, zIndex: 200,
                }}>
                  <div style={{ padding: "10px 12px 12px", borderBottom: "1px solid #f1f5f9", marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>{userName}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{userEmail}</div>
                  </div>
                  {NAV_LINKS.map(l => (
                    <div key={l.path}
                      onClick={() => { navigate(l.path); setShowDrop(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#475569", fontWeight: 500 }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {l.icon} {l.label}
                    </div>
                  ))}
                  <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                  <div
                    onClick={handleLogout}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#ef4444", fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    🚪 Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* ══ SCROLLABLE PAGE CONTENT ══ */}
        <div style={{ flex: 1, overflowY: "auto", padding: "2rem", background: "#fdf6f4" }}>

          {/* ── HERO WELCOME CARD ── */}
          <div style={{
            borderRadius: 20, padding: "2.5rem",
            background: "linear-gradient(135deg,#0f172a 0%,#1a1035 100%)",
            position: "relative", overflow: "hidden", marginBottom: "1.5rem",
          }}>
            <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,112,102,0.2) 0%,transparent 65%)", top: -80, right: -60, pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500, marginBottom: 8 }}>
                  {getGreeting()}, welcome back 👋
                </div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, color: "#fff", marginBottom: 10 }}>
                  {userName || "Student"}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 440, marginBottom: "1.5rem" }}>
                  {isFirst
                    ? "You haven't run your first career prediction yet. It takes just 5 minutes — let's find your ideal career path!"
                    : `You've run ${stats.total} prediction${stats.total !== 1 ? "s" : ""}. Your top match was ${stats.lastCareer} with ${stats.lastConf}% confidence.`
                  }
                </div>
                <button
                  onClick={() => navigate("/predict")}
                  style={{
                    padding: "13px 28px", borderRadius: 12, background: CORAL, color: "#fff",
                    border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
                    fontFamily: "inherit", boxShadow: "0 4px 20px rgba(249,112,102,0.4)", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 26px rgba(249,112,102,0.5)"; }}
                  onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 20px rgba(249,112,102,0.4)"; }}
                >
                  {isFirst ? "🔮 Start My First Prediction" : "🔮 Predict Again"}
                </button>
              </div>
              <div style={{ fontSize: 80, flexShrink: 0, animation: "float 3s ease-in-out infinite" }}>🤖</div>
            </div>
          </div>

          {/* ── 3 STAT CARDS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: "1.5rem" }}>
            {loading
              ? [1,2,3].map(i => (
                  <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: "1.25rem" }}>
                    <div style={{ height: 44, width: 44, borderRadius: 12, background: "#f1f5f9", marginBottom: 12 }} />
                    <div style={{ height: 12, width: "60%", background: "#f1f5f9", borderRadius: 6, marginBottom: 10 }} />
                    <div style={{ height: 28, width: "40%", background: "#f1f5f9", borderRadius: 6 }} />
                  </div>
                ))
              : [
                  { icon:"🔮", label:"Total Predictions", value: stats.total,            sub: stats.total === 0 ? "Start your first one!" : "Career analyses done" },
                  { icon:"🏆", label:"Top Career Match",  value: stats.lastCareer || "—", sub: stats.lastCareer ? `${stats.lastConf}% confidence` : "No prediction yet", small: (stats.lastCareer||"").length > 12 },
                  { icon:"📅", label:"Last Prediction",   value: stats.lastDate || "Never", sub: stats.lastDate ? "Most recent result" : "Try now!", small: true },
                ].map((s, i) => (
                  <div key={i}
                    style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", padding:"1.25rem 1.5rem", boxShadow:"0 2px 12px rgba(0,0,0,0.04)", transition:"transform 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <div style={{ width:44, height:44, borderRadius:12, background:"#fff5f3", border:"1px solid #fecaca", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:12 }}>{s.icon}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>{s.label}</div>
                    <div style={{ fontFamily:"Playfair Display, serif", fontSize: s.small ? 17 : 26, fontWeight:800, color:"#1e293b" }}>{s.value}</div>
                    <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>{s.sub}</div>
                  </div>
                ))
            }
          </div>

          {/* ── 2 ACTION CARDS ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:"1.5rem" }}>
            <div
              onClick={() => navigate("/predict")}
              style={{ background:CORAL, borderRadius:16, padding:"1.5rem", cursor:"pointer", transition:"all 0.22s", boxShadow:"0 4px 20px rgba(249,112,102,0.25)" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(249,112,102,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(249,112,102,0.25)"; }}
            >
              <div style={{ fontSize:32, marginBottom:12 }}>🔮</div>
              <div style={{ fontFamily:"Playfair Display, serif", fontSize:18, fontWeight:800, color:"#fff", marginBottom:8 }}>Start AI Prediction</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.8)", lineHeight:1.6, marginBottom:14 }}>Answer 4 quick steps. Our AI analyses your marks, personality and interests to find your best career match.</div>
              <div style={{ fontSize:14, fontWeight:700, color:"rgba(255,255,255,0.85)" }}>→ Begin Now</div>
            </div>

            <div
              onClick={() => navigate("/predictions")}
              style={{ background:"#fff", borderRadius:16, padding:"1.5rem", cursor:"pointer", border:"1px solid #f1f5f9", boxShadow:"0 2px 12px rgba(0,0,0,0.04)", transition:"all 0.22s" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.09)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.04)"; }}
            >
              <div style={{ fontSize:32, marginBottom:12 }}>📊</div>
              <div style={{ fontFamily:"Playfair Display, serif", fontSize:18, fontWeight:800, color:"#1e293b", marginBottom:8 }}>View Past Predictions</div>
              <div style={{ fontSize:13, color:"#64748b", lineHeight:1.6, marginBottom:14 }}>Review all your previous career analyses and track how your results change over time.</div>
              <div style={{ fontSize:14, fontWeight:700, color:CORAL }}>→ View History</div>
            </div>
          </div>

          {/* ── HOW IT WORKS ── */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", padding:"1.5rem", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ fontFamily:"Playfair Display, serif", fontSize:16, fontWeight:800, color:"#1e293b", marginBottom:"1.25rem" }}>📋 How the Prediction Works</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
              {[
                { n:"1", icon:"🎓", title:"Select Stream", desc:"Science, Commerce or Arts" },
                { n:"2", icon:"📝", title:"Enter Marks",   desc:"Your subject-wise scores"  },
                { n:"3", icon:"🧠", title:"Personality",   desc:"Rate your Big Five traits"  },
                { n:"4", icon:"⭐", title:"Interests",     desc:"Hobbies, skills & activities"},
              ].map(s => (
                <div key={s.n} style={{ textAlign:"center", padding:"1rem 0.5rem" }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"#fff5f3", border:"2px solid #fecaca", color:CORAL, fontFamily:"Playfair Display, serif", fontWeight:800, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>{s.n}</div>
                  <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#1e293b", marginBottom:4 }}>{s.title}</div>
                  <div style={{ fontSize:11.5, color:"#64748b", lineHeight:1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign:"center", marginTop:"1.25rem" }}>
              <button onClick={() => navigate("/predict")} style={{ padding:"11px 28px", borderRadius:12, background:CORAL, color:"#fff", border:"none", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 16px rgba(249,112,102,0.3)" }}>
                ✨ Start Prediction Now
              </button>
            </div>
          </div>

        </div>{/* end scrollable content */}
      </div>{/* end column flex */}
    </>
  );
}


// import { useState, useEffect, useRef } from "react";
// import { supabase } from "../../../backend/supabaseClient";
// import { useNavigate } from "react-router";
// import toast from "react-hot-toast";

// const formatName = (raw = "") => {
//   if (!raw) return "Student";
//   let name = raw.includes("@") ? raw.split("@")[0] : raw;
//   return name.replace(/[._\-]/g, " ").replace(/\s+/g, " ").trim()
//     .replace(/\b\w/g, c => c.toUpperCase());
// };

// const getGreeting = () => {
//   const h = new Date().getHours();
//   if (h < 12) return "Good morning";
//   if (h < 17) return "Good afternoon";
//   return "Good evening";
// };

// const CORAL = "#f97066";

// const NAV_LINKS = [
//   { icon: "🏠", label: "Home",             path: "/dashboard",   active: true  },
//   { icon: "🔮", label: "Start Prediction", path: "/predict"                    },
//   { icon: "📊", label: "My Predictions",   path: "/predictions"                },
//   { icon: "👤", label: "My Profile",       path: "/profile"                    },
//   { icon: "⚙️", label: "Settings",         path: "/settings"                   },
// ];

// export default function DashboardHome() {
//   const navigate   = useNavigate();
//   const dropRef    = useRef(null);

//   const [userName,  setUserName ] = useState("");
//   const [userEmail, setUserEmail] = useState("");
//   const [initials,  setInitials ] = useState("HJ");
//   const [showDrop,  setShowDrop ] = useState(false);
//   const [loading,   setLoading  ] = useState(true);
//   const [stats,     setStats    ] = useState({ total: 0, lastCareer: null, lastConf: 0, lastDate: null });

//   useEffect(() => {
//     const init = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) { navigate("/login"); return; }

//       const raw  = user.user_metadata?.full_name || user.email || "";
//       const name = formatName(raw);
//       setUserName(name);
//       setUserEmail(user.email || "");
//       setInitials(name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "HJ");

//       const { data, count } = await supabase
//         .from("predictions").select("*", { count: "exact" })
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false })
//         .limit(1);

//       if (data && data.length > 0) {
//         setStats({
//           total:      count || 1,
//           lastCareer: data[0].career_1 || null,
//           lastConf:   data[0].confidence_1 || 0,
//           lastDate:   new Date(data[0].created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
//         });
//       } else {
//         setStats({ total: 0, lastCareer: null, lastConf: 0, lastDate: null });
//       }
//       setLoading(false);
//     };
//     init();
//   }, []);

//   useEffect(() => {
//     const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
//     document.addEventListener("mousedown", h);
//     return () => document.removeEventListener("mousedown", h);
//   }, []);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     localStorage.clear();
//     toast.success("Logged out!");
//     navigate("/login");
//   };

//   const isFirst = !loading && stats.total === 0;

//   // ── styles ──────────────────────────────────────────────────────────────
//   const shell   = { display: "flex", height: "100vh", width: "100vw", overflow: "hidden" };
//   const sidebar = {
//     width: 242, flexShrink: 0,
//     background: "linear-gradient(175deg,#0f172a 0%,#1a1035 60%,#0f172a 100%)",
//     display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
//     borderRight: "1px solid rgba(255,255,255,0.06)",
//   };
//   const navItem = (active) => ({
//     display: "flex", alignItems: "center", gap: 11, padding: "11px 13px",
//     borderRadius: 12, marginBottom: 3, cursor: "pointer", transition: "background 0.2s",
//     background: active ? "rgba(249,112,102,0.16)" : "transparent", flexShrink: 0,
//   });
//   const navIcon = (active) => ({
//     width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center",
//     justifyContent: "center", fontSize: 14, flexShrink: 0,
//     background: active ? CORAL : "rgba(255,255,255,0.07)",
//     border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.1)"}`,
//     boxShadow: active ? `0 4px 14px rgba(249,112,102,0.4)` : "none",
//   });
//   const navLabel = (active) => ({
//     fontSize: 13, fontWeight: 600,
//     color: active ? "#fff" : "rgba(255,255,255,0.4)",
//     transition: "color 0.2s", flexShrink: 0,
//   });

//   return (
//     <div style={shell}>

//       {/* ── SIDEBAR ── */}
//       <aside style={sidebar}>
//         {/* glow */}
//         <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,112,102,0.18) 0%,transparent 70%)", top: -60, left: -50, pointerEvents: "none" }} />

//         {/* brand */}
//         <div style={{ padding: "1.5rem 1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 1 }}>
//           <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, fontSize: 21, color: "#fff", letterSpacing: -0.5 }}>CareerAI</div>
//           <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1.2, marginTop: 3 }}>AI Career Prediction</div>
//         </div>

//         {/* nav */}
//         <nav style={{ flex: 1, padding: "1.25rem 0.875rem", overflowY: "auto", position: "relative", zIndex: 1, display: "flex", flexDirection: "column" }}>
//           {NAV_LINKS.map(l => (
//             <div key={l.path} style={navItem(l.active)} onClick={() => navigate(l.path)}
//               onMouseEnter={e => { if (!l.active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
//               onMouseLeave={e => { if (!l.active) e.currentTarget.style.background = "transparent"; }}>
//               <div style={navIcon(l.active)}>{l.icon}</div>
//               <span style={navLabel(l.active)}>{l.label}</span>
//             </div>
//           ))}
//         </nav>

//         {/* logout */}
//         <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 1 }}>
//           <button onClick={handleLogout} style={{
//             width: "100%", padding: 10, borderRadius: 10,
//             background: "rgba(239,68,68,0.12)", color: "#fca5a5",
//             border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, fontWeight: 600,
//             cursor: "pointer", fontFamily: "inherit",
//           }}>🚪 Logout</button>
//         </div>
//       </aside>

//       {/* ── MAIN ── */}
//       <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

//         {/* NAVBAR */}
//         <header style={{
//           height: 64, background: "#fff", flexShrink: 0, width: "100%",
//           borderBottom: "1px solid #f1f5f9",
//           display: "flex", alignItems: "center", justifyContent: "space-between",
//           padding: "0 2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
//         }}>
//           <div style={{ display: "flex", flexDirection: "column" }}>
//             <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{getGreeting()},</span>
//             <span style={{ fontFamily: "Playfair Display, serif", fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{userName || "Student"} 👋</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <span style={{ background: "#fff5f3", border: "1px solid #fecaca", color: "#dc2626", padding: "5px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>🤖 AI Powered</span>
//             <div style={{ position: "relative" }} ref={dropRef}>
//               <button onClick={() => setShowDrop(v => !v)} style={{
//                 width: 38, height: 38, borderRadius: "50%", background: CORAL,
//                 color: "#fff", fontWeight: 700, fontSize: 13, display: "flex",
//                 alignItems: "center", justifyContent: "center", cursor: "pointer",
//                 border: "none", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(249,112,102,0.35)",
//               }}>{initials}</button>

//               {showDrop && (
//                 <div style={{
//                   position: "absolute", top: "calc(100% + 8px)", right: 0,
//                   background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14,
//                   padding: 8, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", minWidth: 210, zIndex: 200,
//                 }}>
//                   <div style={{ padding: "10px 12px 12px", borderBottom: "1px solid #f1f5f9", marginBottom: 6 }}>
//                     <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>{userName}</div>
//                     <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{userEmail}</div>
//                   </div>
//                   {NAV_LINKS.map(l => (
//                     <div key={l.path} onClick={() => { navigate(l.path); setShowDrop(false); }}
//                       style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#475569", fontWeight: 500 }}
//                       onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
//                       onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
//                       {l.icon} {l.label}
//                     </div>
//                   ))}
//                   <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
//                   <div onClick={handleLogout}
//                     style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#ef4444", fontWeight: 500 }}
//                     onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
//                     onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
//                     🚪 Logout
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </header>

//         {/* SCROLLABLE CONTENT */}
//         <div style={{ flex: 1, overflowY: "auto", padding: "2rem", background: "#fdf6f4" }}>

//           {/* ── HERO WELCOME CARD ── */}
//           <div style={{
//             borderRadius: 20, padding: "2.5rem",
//             background: "linear-gradient(135deg,#0f172a 0%,#1a1035 100%)",
//             position: "relative", overflow: "hidden", marginBottom: "1.5rem",
//           }}>
//             <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,112,102,0.2) 0%,transparent 65%)", top: -80, right: -60, pointerEvents: "none" }} />
//             <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
//               <div style={{ flex: 1 }}>
//                 <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500, marginBottom: 8 }}>
//                   {getGreeting()}, welcome back 👋
//                 </div>
//                 <div style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, color: "#fff", marginBottom: 10 }}>
//                   {userName || "Student"}
//                 </div>
//                 <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 420, marginBottom: "1.5rem" }}>
//                   {isFirst
//                     ? "You haven't run your first career prediction yet. It takes just 5 minutes — let's find your ideal career path!"
//                     : `You've run ${stats.total} prediction${stats.total !== 1 ? "s" : ""}. Your top match was ${stats.lastCareer} with ${stats.lastConf}% confidence.`
//                   }
//                 </div>
//                 <button
//                   onClick={() => navigate("/predict")}
//                   style={{
//                     padding: "13px 28px", borderRadius: 12, background: CORAL, color: "#fff",
//                     border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
//                     fontFamily: "inherit", boxShadow: `0 4px 20px rgba(249,112,102,0.4)`,
//                     transition: "all 0.2s",
//                   }}
//                   onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 26px rgba(249,112,102,0.5)"; }}
//                   onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 20px rgba(249,112,102,0.4)"; }}
//                 >
//                   {isFirst ? "🔮 Start My First Prediction" : "🔮 Predict Again"}
//                 </button>
//               </div>
//               <div style={{ fontSize: 72, flexShrink: 0, animation: "float 3s ease-in-out infinite" }}>🤖</div>
//             </div>
//           </div>

//           {/* ── 3 STAT CARDS ── */}
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: "1.5rem" }}>
//             {loading ? (
//               [1, 2, 3].map(i => (
//                 <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: "1.25rem" }}>
//                   <div style={{ height: 44, width: 44, borderRadius: 12, background: "#f1f5f9", marginBottom: 12 }} />
//                   <div style={{ height: 12, width: "60%", background: "#f1f5f9", borderRadius: 6, marginBottom: 10 }} />
//                   <div style={{ height: 28, width: "40%", background: "#f1f5f9", borderRadius: 6 }} />
//                 </div>
//               ))
//             ) : (
//               <>
//                 {[
//                   { icon: "🔮", label: "Total Predictions", value: stats.total, sub: stats.total === 0 ? "Start your first one!" : "Career analyses done" },
//                   { icon: "🏆", label: "Top Career Match",  value: stats.lastCareer || "—", sub: stats.lastCareer ? `${stats.lastConf}% confidence` : "No prediction yet", small: (stats.lastCareer || "").length > 12 },
//                   { icon: "📅", label: "Last Prediction",   value: stats.lastDate || "Never", sub: stats.lastDate ? "Most recent result" : "Try now!", small: true },
//                 ].map((s, i) => (
//                   <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: "1.25rem 1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", transition: "transform 0.2s", cursor: "default" }}
//                     onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
//                     onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
//                     <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff5f3", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{s.icon}</div>
//                     <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
//                     <div style={{ fontFamily: "Playfair Display, serif", fontSize: s.small ? 17 : 26, fontWeight: 800, color: "#1e293b" }}>{s.value}</div>
//                     <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.sub}</div>
//                   </div>
//                 ))}
//               </>
//             )}
//           </div>

//           {/* ── 2 ACTION CARDS ── */}
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: "1.5rem" }}>
//             {/* Primary — predict */}
//             <div
//               onClick={() => navigate("/predict")}
//               style={{ background: CORAL, borderRadius: 16, padding: "1.5rem", cursor: "pointer", transition: "all 0.22s", boxShadow: `0 4px 20px rgba(249,112,102,0.25)` }}
//               onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(249,112,102,0.4)"; }}
//               onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(249,112,102,0.25)"; }}
//             >
//               <div style={{ fontSize: 32, marginBottom: 12 }}>🔮</div>
//               <div style={{ fontFamily: "Playfair Display, serif", fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Start AI Prediction</div>
//               <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: 14 }}>Answer 4 quick steps. Our AI analyses your marks, personality and interests to find your best career match.</div>
//               <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>→ Begin Now</div>
//             </div>

//             {/* Secondary — predictions history */}
//             <div
//               onClick={() => navigate("/predictions")}
//               style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", cursor: "pointer", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", transition: "all 0.22s" }}
//               onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)"; }}
//               onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}
//             >
//               <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
//               <div style={{ fontFamily: "Playfair Display, serif", fontSize: 18, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>View Past Predictions</div>
//               <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 14 }}>Review all your previous career analyses and track how your results change over time.</div>
//               <div style={{ fontSize: 14, fontWeight: 700, color: CORAL }}>→ View History</div>
//             </div>
//           </div>

//           {/* ── HOW IT WORKS (simple 4-step row) ── */}
//           <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
//             <div style={{ fontFamily: "Playfair Display, serif", fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: "1.25rem" }}>📋 How the Prediction Works</div>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
//               {[
//                 { n: "1", icon: "🎓", title: "Select Stream",    desc: "Science, Commerce or Arts" },
//                 { n: "2", icon: "📝", title: "Enter Marks",      desc: "Your subject-wise scores" },
//                 { n: "3", icon: "🧠", title: "Personality",      desc: "Rate your Big Five traits" },
//                 { n: "4", icon: "⭐", title: "Interests",        desc: "Hobbies, skills & activities" },
//               ].map((s) => (
//                 <div key={s.n} style={{ textAlign: "center", padding: "1rem 0.5rem" }}>
//                   <div style={{
//                     width: 36, height: 36, borderRadius: "50%",
//                     background: "#fff5f3", border: `2px solid #fecaca`,
//                     color: CORAL, fontFamily: "Playfair Display, serif",
//                     fontWeight: 800, fontSize: 15, display: "flex",
//                     alignItems: "center", justifyContent: "center", margin: "0 auto 10px",
//                   }}>{s.n}</div>
//                   <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
//                   <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{s.title}</div>
//                   <div style={{ fontSize: 11.5, color: "#64748b", lineHeight: 1.5 }}>{s.desc}</div>
//                 </div>
//               ))}
//             </div>
//             <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
//               <button onClick={() => navigate("/predict")} style={{
//                 padding: "11px 28px", borderRadius: 12, background: CORAL, color: "#fff",
//                 border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
//                 fontFamily: "inherit", boxShadow: `0 4px 16px rgba(249,112,102,0.3)`,
//               }}>
//                 ✨ Start Prediction Now
//               </button>
//             </div>
//           </div>

//         </div>
//       </div>

//       <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
//     </div>
//   );
// }
