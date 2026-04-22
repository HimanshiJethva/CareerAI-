import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../backend/supabaseClient";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

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
  { icon:"🏠", label:"Dashboard",      path:"/dashboard"  },
  { icon:"📊", label:"My Predictions", path:"/predictions"},
  { icon:"👤", label:"My Profile",     path:"/profile"    },
  { icon:"⚙️", label:"Settings",       path:"/settings", active:true },
];

/* show/hide password eye button */
function PasswordInput({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ width:"100%", padding:"12px 44px 12px 14px", borderRadius:10,
          border:"1.5px solid #e2e8f0", background:"#f8fafc", fontSize:14,
          color:C.text, outline:"none", fontFamily:"inherit", transition:"border 0.2s" }}
        onFocus={e => e.target.style.borderColor = C.primary}
        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
          background:"none", border:"none", cursor:"pointer", fontSize:16, color:C.muted }}>
        {show ? "🙈" : "👁️"}
      </button>
    </div>
  );
}

/* strength bar */
function StrengthBar({ password }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["","Weak","Fair","Good","Strong","Very Strong"];
  const colors = ["","#ef4444","#f59e0b","#eab308","#22c55e","#16a34a"];
  return (
    <div style={{ marginTop:8, marginBottom:4 }}>
      <div style={{ display:"flex", gap:4, marginBottom:4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex:1, height:4, borderRadius:4,
            background: i<=score ? colors[score] : "#e2e8f0",
            transition:"background 0.3s" }} />
        ))}
      </div>
      {score > 0 && (
        <div style={{ fontSize:11, color:colors[score], fontWeight:600 }}>
          {labels[score]}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const navigate    = useNavigate();
  const dropRef     = useRef(null);
  const [userName,  setUserName ] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [initials,  setInitials ] = useState("HJ");
  const [showDrop,  setShowDrop ] = useState(false);
  const [fullName,  setFullName ] = useState("");
  const [newPwd,    setNewPwd   ] = useState("");
  const [confPwd,   setConfPwd  ] = useState("");
  const [pwdLoading,setPwdLoad  ] = useState(false);
  const [nameLoading,setNameLoad] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [notifications, setNotifications] = useState({
    emailUpdates: true, predictions: true, newsletter: false,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/login"); return; }
      const raw = user.user_metadata?.full_name || user.email || "";
      const name = formatName(raw);
      setUserName(name);
      setUserEmail(user.email || "");
      setFullName(name);
      setInitials(name.split(" ").filter(Boolean).map(w=>w[0]).join("").slice(0,2).toUpperCase()||"HJ");
    });
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

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error("Name cannot be empty"); return; }
    setNameLoad(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });
    if (!error) { setUserName(fullName.trim()); toast.success("Name updated successfully!"); }
    else toast.error(error.message);
    setNameLoad(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPwd.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPwd !== confPwd) { toast.error("Passwords do not match"); return; }
    setPwdLoad(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (!error) { toast.success("Password updated!"); setNewPwd(""); setConfPwd(""); }
    else toast.error(error.message);
    setPwdLoad(false);
  };

  const handleDeleteAccount = () => {
    toast.error("Contact support@careerai.com to delete your account.");
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html, body, #root { height:100%; }
    body { font-family:'DM Sans',sans-serif; background:${C.pageBg}; }

    @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes popIn   { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }

    .shell { display:flex; height:100vh; width:100vw; overflow:hidden; }

    /* SIDEBAR */
    .sb  { width:252px; flex-shrink:0;
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
      border-right:1px solid rgba(255,255,255,0.06); margin-bottom: 15px }
    .nav-item { display:flex; align-items:center; gap:11px; padding:11px 13px; border-radius:12px;
      margin-bottom:3px; cursor:pointer; transition:background 0.2s; flex-shrink:0;}
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
    .sb-bottom { margin-top:270px; padding:1rem 1.25rem; border-top:1px solid rgba(255,255,255,0.07); position:relative; z-index:1; }
    .sb-logout { width:100%; padding:10px; border-radius:10px; background:rgba(239,68,68,0.12);
      color:#fca5a5; border:1px solid rgba(239,68,68,0.2); font-size:13px; font-weight:600;
      cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
    .sb-logout:hover { background:rgba(239,68,68,0.22); }

    /* MAIN */
    .main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

    /* NAVBAR */
    .topnav  { height:64px; background:#fff; flex-shrink:0; width:100%;
      border-bottom:1px solid ${C.border};
      display:flex; align-items:center; justify-content:space-between;
      padding:0 2rem; box-shadow:0 1px 6px rgba(0,0,0,0.04); }
    .nav-left  { display:flex; flex-direction:column; }
    .nav-greet { font-size:11px; color:#94a3b8; font-weight:500; }
    .nav-title { font-family:'Sora',sans-serif; font-size:15px; font-weight:700; color:${C.text}; }
    .nav-right { display:flex; align-items:center; gap:10px; }
    .badge-pill { background:${C.soft}; border:1px solid ${C.softBorder}; color:${C.primaryDark};
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

    /* CONTENT */
    .content { flex:1; overflow-y:auto; padding:2rem; background:${C.pageBg}; }
    .page-hdr { margin-bottom:1.75rem; animation:slideUp 0.35s ease; }
    .page-hdr h1 { font-family:'Sora',sans-serif; font-size:26px; font-weight:800; color:${C.text}; letter-spacing:-0.5px; }
    .page-hdr p  { color:${C.muted}; font-size:13.5px; margin-top:4px; }

    /* two-column layout */
    .settings-grid { display:grid; grid-template-columns:220px 1fr; gap:1.5rem; align-items:start; }

    /* left tab nav */
    .tab-nav   { background:#fff; border-radius:16px; border:1px solid ${C.border};
      padding:8px; box-shadow:0 2px 12px rgba(0,0,0,0.04); position:sticky; top:0;
      animation:slideUp 0.4s ease; }
    .tab-item  { display:flex; align-items:center; gap:10px; padding:11px 13px;
      border-radius:10px; cursor:pointer; font-size:13px; font-weight:600;
      color:${C.muted}; transition:all 0.18s; margin-bottom:3px; }
    .tab-item:hover  { background:#f8fafc; color:${C.text}; }
    .tab-item.active { background:${C.soft}; color:${C.primary};
      border:1px solid ${C.softBorder}; }
    .tab-icon  { font-size:16px; }

    /* right panel */
    .panel-area { display:flex; flex-direction:column; gap:1rem; animation:slideUp 0.45s ease; }

    /* section cards */
    .section-card { background:#fff; border-radius:16px; border:1px solid ${C.border};
      box-shadow:0 2px 12px rgba(0,0,0,0.04); overflow:hidden; }
    .section-head { padding:1.25rem 1.5rem; border-bottom:1px solid ${C.border};
      display:flex; align-items:center; gap:12px; }
    .section-head-icon { width:38px; height:38px; border-radius:10px;
      background:${C.soft}; border:1px solid ${C.softBorder};
      display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
    .section-head-title { font-size:15px; font-weight:700; color:${C.text}; }
    .section-head-sub   { font-size:12px; color:${C.muted}; margin-top:2px; }
    .section-body { padding:1.5rem; }

    /* user avatar card */
    .profile-avatar-row { display:flex; align-items:center; gap:16px; margin-bottom:1.5rem;
      padding:1rem; background:${C.soft}; border-radius:12px; border:1px solid ${C.softBorder}; }
    .avatar-circle { width:60px; height:60px; border-radius:50%; background:${C.primary};
      color:#fff; font-family:'Sora',sans-serif; font-weight:800; font-size:22px;
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 4px 14px rgba(249,112,102,0.35); flex-shrink:0; }
    .avatar-info-name  { font-size:16px; font-weight:700; color:${C.text}; }
    .avatar-info-email { font-size:12px; color:${C.muted}; margin-top:3px; }

    /* form elements */
    .field-label { font-size:13px; font-weight:600; color:#475569; margin-bottom:6px; display:block; }
    .field-input { width:100%; padding:12px 14px; border-radius:10px;
      border:1.5px solid #e2e8f0; background:#f8fafc; font-size:14px;
      color:${C.text}; outline:none; font-family:inherit; transition:border 0.2s; margin-bottom:14px; }
    .field-input:focus { border-color:${C.primary}; }
    .field-input:disabled { opacity:0.6; cursor:not-allowed; background:#f1f5f9; }
    .field-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

    /* buttons */
    .btn-save { padding:12px 24px; border-radius:10px; background:${C.primary}; color:#fff;
      border:none; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit;
      transition:all 0.2s; box-shadow:0 4px 14px rgba(249,112,102,0.3); }
    .btn-save:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(249,112,102,0.4); }
    .btn-save:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

    /* notification toggle */
    .notif-row { display:flex; align-items:center; justify-content:space-between;
      padding:14px 0; border-bottom:1px solid #f8fafc; }
    .notif-row:last-child { border-bottom:none; }
    .notif-label { font-size:14px; font-weight:600; color:${C.text}; }
    .notif-sub   { font-size:12px; color:${C.muted}; margin-top:2px; }
    .toggle      { position:relative; width:44px; height:24px; flex-shrink:0; }
    .toggle input { opacity:0; width:0; height:0; }
    .slider-tog  { position:absolute; cursor:pointer; inset:0; background:#e2e8f0;
      border-radius:24px; transition:0.3s; }
    .slider-tog::before { position:absolute; content:""; height:18px; width:18px;
      left:3px; top:3px; background:#fff; border-radius:50%;
      transition:0.3s; box-shadow:0 1px 4px rgba(0,0,0,0.2); }
    .toggle input:checked + .slider-tog { background:${C.primary}; }
    .toggle input:checked + .slider-tog::before { transform:translateX(20px); }

    /* danger zone */
    .danger-card { background:#fff; border-radius:16px; border:1.5px solid #fecaca;
      box-shadow:0 2px 12px rgba(239,68,68,0.08); overflow:hidden; }
    .danger-head { padding:1.25rem 1.5rem; border-bottom:1px solid #fecaca;
      background:#fef2f2; display:flex; align-items:center; gap:12px; }
    .danger-head-icon { width:38px; height:38px; border-radius:10px;
      background:#fecaca; display:flex; align-items:center; justify-content:center; font-size:18px; }
    .danger-head-title { font-size:15px; font-weight:700; color:#dc2626; }
    .danger-head-sub   { font-size:12px; color:"#ef4444"; margin-top:2px; }
    .btn-danger { padding:11px 22px; border-radius:10px; background:#fff;
      color:#ef4444; border:1.5px solid #fecaca; font-size:14px; font-weight:700;
      cursor:pointer; font-family:inherit; transition:all 0.2s; }
    .btn-danger:hover { background:#fef2f2; border-color:#ef4444; }

    @media(max-width:900px)  { .settings-grid { grid-template-columns:1fr; } .tab-nav { position:static; } }
    @media(max-width:768px)  { .sb { display:none; } .field-row { grid-template-columns:1fr; } }
  `;

  const TABS = [
    { id:"account",      icon:"👤", label:"Account Info"      },
    { id:"password",     icon:"🔒", label:"Change Password"   },
    // { id:"notifications",icon:"🔔", label:"Notifications"     },
    { id:"danger",       icon:"⚠️",  label:"Danger Zone"       },
  ];

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
          {/* <header className="topnav"> */}
            {/* <div className="nav-left">
              <span className="nav-greet">Welcome back,</span>
              <span className="nav-title">{userName || "Student"} 👋</span>
            </div> */}
            {/* <div className="nav-right">
              <span className="badge-pill">⚙️ Settings</span>
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
            </div> */}
          {/* </header> */}

          {/* CONTENT */}
          <div className="content">
            <div className="page-hdr">
              <h1>⚙️ Settings</h1>
              <p>Manage your account, security and notification preferences.</p>
            </div>

            <div className="settings-grid">

              {/* LEFT — TAB NAV */}
              <div className="tab-nav">
                {TABS.map(t => (
                  <div key={t.id}
                    className={`tab-item ${activeTab === t.id ? "active" : ""}`}
                    onClick={() => setActiveTab(t.id)}>
                    <span className="tab-icon">{t.icon}</span>
                    {t.label}
                  </div>
                ))}
              </div>

              {/* RIGHT — PANELS */}
              <div className="panel-area">

                {/* ── ACCOUNT INFO ── */}
                {activeTab === "account" && (
                  <div className="section-card">
                    <div className="section-head">
                      <div className="section-head-icon">👤</div>
                      <div>
                        <div className="section-head-title">Account Information</div>
                        <div className="section-head-sub">Update your name and view account details</div>
                      </div>
                    </div>
                    <div className="section-body">
                      <div className="profile-avatar-row">
                        <div className="avatar-circle">{initials}</div>
                        <div>
                          <div className="avatar-info-name">{userName}</div>
                          <div className="avatar-info-email">{userEmail}</div>
                        </div>
                      </div>
                      <form onSubmit={handleUpdateName}>
                        <label className="field-label">Full Name</label>
                        <input className="field-input" value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="Enter your full name" />
                        <label className="field-label">Email Address</label>
                        <input className="field-input" value={userEmail} disabled
                          placeholder="Email cannot be changed here" />
                        <p style={{ fontSize:12, color:C.muted, marginBottom:14, marginTop:-8 }}>
                          Email address is managed through your auth provider.
                        </p>
                        <button className="btn-save" type="submit" disabled={nameLoading}>
                          {nameLoading ? "Saving..." : "Save Changes"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* ── CHANGE PASSWORD ── */}
                {activeTab === "password" && (
                  <div className="section-card">
                    <div className="section-head">
                      <div className="section-head-icon">🔒</div>
                      <div>
                        <div className="section-head-title">Change Password</div>
                        <div className="section-head-sub">Keep your account secure with a strong password</div>
                      </div>
                    </div>
                    <div className="section-body">
                      <form onSubmit={handleUpdatePassword}>
                        <label className="field-label">New Password</label>
                        <PasswordInput placeholder="Enter new password" value={newPwd}
                          onChange={e => setNewPwd(e.target.value)} />
                        <StrengthBar password={newPwd} />
                        <div style={{ marginBottom:14 }} />
                        <label className="field-label">Confirm New Password</label>
                        <PasswordInput placeholder="Confirm new password" value={confPwd}
                          onChange={e => setConfPwd(e.target.value)} /><br></br>
                        {confPwd && newPwd !== confPwd && (
                          <p style={{ fontSize:12, color:"#ef4444", marginTop:-10, marginBottom:12 }}>
                            ⚠️ Passwords do not match
                          </p>
                        )}
                        {confPwd && newPwd === confPwd && confPwd.length >= 6 && (
                          <p style={{ fontSize:12, color:"#22c55e", marginTop:-10, marginBottom:12 }}>
                            ✓ Passwords match
                          </p>
                        )}
                        <div style={{ background:C.soft, border:`1px solid ${C.softBorder}`,
                          borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:C.primaryDark }}>
                          🔐 Tips: Use 8+ characters, mix uppercase, numbers and symbols.
                        </div>
                        <button className="btn-save" type="submit"
                          disabled={pwdLoading || newPwd !== confPwd || newPwd.length < 6}>
                          {pwdLoading ? "Updating..." : "Update Password"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* ── NOTIFICATIONS ── */}
                {activeTab === "notifications" && (
                  <div className="section-card">
                    <div className="section-head">
                      <div className="section-head-icon">🔔</div>
                      <div>
                        <div className="section-head-title">Notification Preferences</div>
                        <div className="section-head-sub">Choose what updates you want to receive</div>
                      </div>
                    </div>
                    <div className="section-body">
                      {[
                        { key:"emailUpdates",  label:"Email Updates",       sub:"Important account and security alerts" },
                        { key:"predictions",   label:"Prediction Results",  sub:"Get notified when your AI analysis is ready" },
                        { key:"newsletter",    label:"Newsletter",          sub:"Weekly career tips and industry insights" },
                      ].map(n => (
                        <div key={n.key} className="notif-row">
                          <div>
                            <div className="notif-label">{n.label}</div>
                            <div className="notif-sub">{n.sub}</div>
                          </div>
                          <label className="toggle">
                            <input type="checkbox"
                              checked={notifications[n.key]}
                              onChange={e => setNotifications(prev => ({ ...prev, [n.key]:e.target.checked }))} />
                            <span className="slider-tog" />
                          </label>
                        </div>
                      ))}
                      <div style={{ marginTop:16 }}>
                        <button className="btn-save"
                          onClick={() => toast.success("Notification preferences saved!")}>
                          Save Preferences
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── DANGER ZONE ── */}
                {activeTab === "danger" && (
                  <div className="danger-card">
                    <div className="danger-head">
                      <div className="danger-head-icon">⚠️</div>
                      <div>
                        <div className="danger-head-title">Danger Zone</div>
                        <div className="danger-head-sub" style={{ color:"#ef4444", fontSize:12, marginTop:2 }}>
                          Irreversible actions — proceed with caution
                        </div>
                      </div>
                    </div>
                    <div className="section-body">
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                        padding:"16px", background:"#fef2f2", borderRadius:12, border:"1px solid #fecaca", marginBottom:12 }}>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Delete All Predictions</div>
                          <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>
                            Permanently remove all your career prediction history
                          </div>
                        </div>
                        <button className="btn-danger"
                          onClick={() => toast.error("Contact support to delete prediction data.")}>
                          Delete Data
                        </button>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                        padding:"16px", background:"#fef2f2", borderRadius:12, border:"1px solid #fecaca" }}>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:"#dc2626" }}>Delete My Account</div>
                          <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>
                            Permanently delete your account and all associated data. This cannot be undone.
                          </div>
                        </div>
                        <button className="btn-danger" onClick={handleDeleteAccount}
                          style={{ background:"#ef4444", color:"#fff", borderColor:"#ef4444" }}>
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


// import { useState, useEffect } from "react";
// import { supabase } from "../../../backend/supabaseClient";
// import { useNavigate } from "react-router";
// import toast from "react-hot-toast";

// const SettingsPage = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [email, setEmail] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   useEffect(() => {
//     supabase.auth.getUser().then(({ data: { user } }) => {
//       if (!user) { navigate("/login"); return; }
//       setEmail(user.email || "");
//     });
//   }, []);

//   const handleChangePassword = async (e) => {
//     e.preventDefault();
//     if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
//     if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
//     setLoading(true);
//     const { error } = await supabase.auth.updateUser({ password: newPassword });
//     if (!error) { toast.success("Password updated successfully!"); setNewPassword(""); setConfirmPassword(""); }
//     else toast.error(error.message);
//     setLoading(false);
//   };

//   const handleDeleteAccount = async () => {
//     if (!window.confirm("Are you absolutely sure? This will permanently delete your account and all data.")) return;
//     toast.error("Account deletion requires admin action. Please contact support.");
//   };

//   const css = `
//     @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
//     *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
//     body { font-family:'DM Sans',sans-serif; background:#fdf6f4; }
//     .page { max-width:640px; margin:0 auto; padding:2.5rem 1.5rem; }
//     .back-btn { background:none; border:none; color:#64748b; font-size:14px; font-weight:600;
//       cursor:pointer; font-family:inherit; margin-bottom:1.5rem; }
//     .back-btn:hover { color:#1e293b; }
//     h1 { font-family:'Sora',sans-serif; font-size:28px; font-weight:800; color:#1e293b; margin-bottom:4px; }
//     .sub { color:#64748b; font-size:14px; margin-bottom:2rem; }
//     .section { background:#fff; border-radius:16px; border:1px solid #f1f5f9;
//       padding:1.5rem; margin-bottom:1rem; }
//     .section-title { font-size:15px; font-weight:700; color:#1e293b; margin-bottom:4px; }
//     .section-sub { font-size:13px; color:#64748b; margin-bottom:1.25rem; }
//     label { font-size:13px; font-weight:600; color:#475569; display:block; margin-bottom:5px; }
//     input { width:100%; padding:11px 14px; border-radius:10px; border:1.5px solid #e2e8f0;
//       background:#f8fafc; font-size:14px; color:#1e293b; outline:none; margin-bottom:12px;
//       font-family:inherit; transition:border 0.2s; }
//     input:focus { border-color:#f97066; }
//     input:disabled { opacity:0.6; cursor:not-allowed; }
//     .btn { padding:11px 24px; border-radius:10px; font-size:14px; font-weight:700;
//       background:#f97066; color:#fff; border:none; cursor:pointer; font-family:inherit;
//       transition:all 0.2s; }
//     .btn:disabled { opacity:0.5; cursor:not-allowed; }
//     .btn-danger { background:#ef4444; }
//     .divider { height:1px; background:#f1f5f9; margin:12px 0; }
//   `;

//   return (
//     <>
//       <style>{css}</style>
//       <div className="page">
//         <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
//         <h1>Settings</h1>
//         <p className="sub">Manage your account preferences and security.</p>

//         <div className="section">
//           <div className="section-title">Account Info</div>
//           <div className="section-sub">Your registered email address.</div>
//           <label>Email Address</label>
//           <input value={email} disabled />
//         </div>

//         <div className="section">
//           <div className="section-title">Change Password</div>
//           <div className="section-sub">Update your login password. Minimum 6 characters.</div>
//           <form onSubmit={handleChangePassword}>
//             <label>New Password</label>
//             <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
//               placeholder="Enter new password" />
//             <label>Confirm Password</label>
//             <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
//               placeholder="Confirm new password" />
//             <button className="btn" type="submit" disabled={loading}>
//               {loading ? "Updating..." : "Update Password"}
//             </button>
//           </form>
//         </div>

//         <div className="section">
//           <div className="section-title" style={{ color:"#ef4444" }}>Danger Zone</div>
//           <div className="section-sub">Permanently delete your account and all associated data.</div>
//           <button className="btn btn-danger" onClick={handleDeleteAccount}>Delete My Account</button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default SettingsPage;
