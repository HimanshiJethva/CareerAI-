import { useState } from "react";
import { supabase } from "../../../backend/supabaseClient";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const C = {
  primary: "#f97066",
  soft:    "#fff5f3",
  softB:   "#fecaca",
  text:    "#1e293b",
  muted:   "#64748b",
  border:  "#e2e8f0",
};

function EyeIcon({ show }) {
  return show
    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email,    setEmail   ] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd ] = useState(false);
  const [errors,   setErrors  ] = useState({});
  const [loading,  setLoading ] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(
    !localStorage.getItem("cookieAccepted")
  );

  const validate = () => {
    const e = {};
    if (!email)                             e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))  e.email = "Invalid email address";
    if (!password)                          e.password = "Password is required";
    else if (password.length < 6)          e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    // fetch role first
    const { data: userData } = await supabase
      .from("users").select("role").eq("email", email).single();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      toast.error(authError.message || "Login failed. Please check your details.");
      setLoading(false);
      return;
    }

    const role = userData?.role === "Admin" ? "admin" : "student";
    localStorage.setItem("userRole", role);
    if (remember) localStorage.setItem("rememberEmail", email);

    toast.success("Welcome back!");
    navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
    setLoading(false);
  };

  const acceptCookie = () => {
    localStorage.setItem("cookieAccepted", "true");
    setShowCookieBanner(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'DM Sans',sans-serif; background:${C.soft}; min-height:100vh; }
        @keyframes slideUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .page { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2rem 1rem 6rem; }
        .card { background:#fff; border-radius:24px; padding:2.5rem 2rem; width:100%; max-width:440px;
          box-shadow:0 8px 40px rgba(249,112,102,0.1); border:1px solid ${C.softB}; animation:slideUp 0.4s ease; }
        .back { display:flex; align-items:center; gap:6px; font-size:13px; color:${C.muted};
          cursor:pointer; font-weight:600; background:none; border:none; font-family:inherit;
          margin-bottom:1.5rem; padding:0; }
        .back:hover { color:${C.text}; }
        .logo { font-family:'Sora',sans-serif; font-size:20px; font-weight:800; color:${C.primary};
          text-align:center; margin-bottom:0.5rem; }
        h1 { font-family:'Sora',sans-serif; font-size:26px; font-weight:800; color:${C.text};
          text-align:center; margin-bottom:6px; }
        .subtitle { font-size:13px; color:${C.muted}; text-align:center; margin-bottom:1.75rem; }
        .field-label { font-size:13px; font-weight:600; color:#475569; display:block; margin-bottom:6px; }
        .field-input { width:100%; padding:13px 16px; border-radius:12px; border:1.5px solid ${C.border};
          background:#f8fafc; font-size:14px; color:${C.text}; outline:none;
          font-family:inherit; transition:border 0.2s; }
        .field-input:focus { border-color:${C.primary}; }
        .field-input.err { border-color:#ef4444; background:#fef2f2; }
        .field-err { font-size:11px; color:#ef4444; margin-top:4px; display:block; margin-bottom:8px; }
        .field-mb  { margin-bottom:16px; }
        .pwd-wrap   { position:relative; }
        .pwd-eye    { position:absolute; right:14px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; color:${C.muted}; display:flex; padding:0; }
        .row-btw    { display:flex; align-items:right;  margin:12px 0 20px; }
        .remember   { display:flex; align-items:center; gap:8px; font-size:13px; color:${C.muted}; }
        .checkbox   { width:16px; height:16px; accent-color:${C.primary}; cursor:pointer; }
        .forgot     { font-size:13px; color:${C.primary}; font-weight:600; cursor:pointer; background:none; border:none; font-family:inherit; }
        .forgot:hover { text-decoration:underline; }
        .btn-submit { width:100%; padding:14px; border-radius:12px; background:${C.primary}; color:#fff;
          border:none; font-size:15px; font-weight:700; cursor:pointer; font-family:inherit;
          box-shadow:0 4px 20px rgba(249,112,102,0.35); transition:all 0.2s; }
        .btn-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 26px rgba(249,112,102,0.45); }
        .btn-submit:disabled { opacity:0.55; cursor:not-allowed; transform:none; }
        .ai-notice  { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px;
          padding:11px 14px; margin-top:16px; display:flex; gap:10px; align-items:flex-start; }
        .ai-notice-text { font-size:12px; color:${C.muted}; line-height:1.5; }
        .signup-row { text-align:center; margin-top:1.25rem; font-size:13px; color:${C.muted}; }
        .signup-link { color:${C.primary}; font-weight:700; cursor:pointer; }
        .signup-link:hover { text-decoration:underline; }
        .cookie { position:fixed; bottom:0; left:0; right:0; background:#1e293b;
          padding:16px 24px; display:flex; align-items:center; justify-content:space-between;
          gap:16px; z-index:999; animation:slideDown 0.4s ease; flex-wrap:wrap; }
        .cookie-text { font-size:13px; color:rgba(255,255,255,0.8); line-height:1.5; flex:1; }
        .cookie-link { color:${C.primary}; font-weight:600; cursor:pointer; }
        .cookie-btns { display:flex; gap:8px; flex-shrink:0; }
        .cookie-accept  { padding:9px 20px; border-radius:8px; background:${C.primary}; color:#fff;
          border:none; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; }
        .cookie-decline { padding:9px 20px; border-radius:8px; background:rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.15);
          font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; }
      `}</style>

      {/* {showCookieBanner && (
        <div className="cookie">
          <div className="cookie-text">
            🍪 We use cookies to enhance your experience. We may use anonymised prediction data to improve our AI model.
            See our <span className="cookie-link" onClick={() => navigate("/privacy")}>Privacy Policy</span>.
          </div>
          <div className="cookie-btns">
            <button className="cookie-decline" onClick={() => setShowCookieBanner(false)}>Decline</button>
            <button className="cookie-accept" onClick={acceptCookie}>Accept All</button>
          </div>
        </div>
      )} */}

      <div className="page">
        <div className="card">
          <button className="back" onClick={() => navigate("/")}>← Back</button>
          <div className="logo">CareerAI</div>
          <h1>Welcome Back</h1>
          <p className="subtitle">Login to continue your career prediction journey</p>

          <form onSubmit={handleLogin}>
            <div className="field-mb">
              <label className="field-label">Email Address</label>
              <input className={`field-input ${errors.email ? "err" : ""}`}
                type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} />
              {errors.email && <span className="field-err">{errors.email}</span>}
            </div>

            <div className="field-mb">
              <label className="field-label">Password</label>
              <div className="pwd-wrap">
                <input
                  className={`field-input ${errors.password ? "err" : ""}`}
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: 46 }}
                />
                <button type="button" className="pwd-eye" onClick={() => setShowPwd(s => !s)}>
                  <EyeIcon show={showPwd} />
                </button>
              </div>
              {errors.password && <span className="field-err">{errors.password}</span>}
            </div>

            <div className="row-btw">
              {/* <label className="remember">
                <input type="checkbox" className="checkbox"
                  checked={remember} onChange={e => setRemember(e.target.checked)} />
                Remember me
              </label> */}
              <button type="button" className="forgot" onClick={() => navigate("/forgot-password")}>
                Forgot password?
              </button>
            </div>

            <button className="btn-submit" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login →"}
            </button>

            {/* AI disclaimer notice */}
            <div className="ai-notice">
              <span style={{ fontSize: 18 }}>⚠️</span>
              <p className="ai-notice-text">
                <strong>AI Disclaimer:</strong> CareerAI predictions are AI-generated suggestions and may not be 100% accurate.
                Always cross-check with a qualified career counsellor before making major decisions.
              </p>
            </div>
          </form>

          <p className="signup-row">
            Don't have an account?{" "}
            <span className="signup-link" onClick={() => navigate("/signup")}>Sign Up</span>
          </p>
        </div>
      </div>
    </>
  );
}


// import { useState } from "react"
// import { supabase } from "../../../backend/supabaseClient"
// import toast from "react-hot-toast"
// import { useNavigate } from "react-router-dom";

// function LoginPage() {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [errors, setErrors] = useState({})
//   const [loading, setLoading] = useState(false)

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;
//     setLoading(true); // ✅ button disabled from here onwards

//     try {
//       // Step 1: Sign in
//       const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

//       if (authError) {
//         toast.error(authError.message || "Login Failed.");
//         return; // finally() will setLoading(false)
//       }

//       // Step 2: Fetch role
//       const { data: userData } = await supabase
//         .from('users')
//         .select('role')
//         .eq('email', email)
//         .single();

//       const role = userData?.role === 'Admin' ? 'admin' : 'student';
//       localStorage.setItem('userRole', role);

//       toast.success("Login successfully!");

//       // Step 3: Navigate directly — no AuthListener involved
//       navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });

//     } catch (err) {
//       toast.error("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false); // ✅ always runs, button re-enables only after everything done
//     }
//   };

//   const validate = () => {
//     let newErrors = {}
//     if (!email) {
//       newErrors.email = "Email is required"
//     } else if (!email.includes("@")) {
//       newErrors.email = "Invalid email"
//     }
//     if (!password) {
//       newErrors.password = "Password is required"
//     } else if (password.length < 6) {
//       newErrors.password = "Min 6 characters"
//     }
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <span className="back-btn" onClick={() => navigate('/')}>← Back</span>

//         <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1rem' }}>
//           Welcome Back
//         </h2>

//         {errors.api && <p style={{ color: "red", marginBottom: '1rem' }}>{errors.api}</p>}

//         <form onSubmit={handleLogin}>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Email Address"
//             className="auth-input"
//           />
//           {errors.email && <p style={{ color: "red", fontSize: '0.9rem', marginBottom: '1rem' }}>{errors.email}</p>}

//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Password"
//             className="auth-input"
//           />
//           {errors.password && <p style={{ color: "red", fontSize: '0.9rem', marginBottom: '1rem' }}>{errors.password}</p>}

//            <div style={{ marginTop: '0rem', textAlign: 'right' }}>
//             <span className="forgot-password-link" onClick={() => navigate('/forgot-password')}>
//               Forgot your password?
//             </span>
//           </div>

//           {/* ✅ disabled={loading} prevents ANY second click while loading */}
//           <button
//             type="submit"
//             className="btn-primary"
//             style={{ width: '100%', marginTop: '1rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
//             disabled={loading}
//           >
//             {loading ? "Logging you in..." : "Login"}
//           </button>

//           {/* <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
//             <span className="forgot-password-link" onClick={() => navigate('/forgot-password')}>
//               Forgot your password?
//             </span>
//           </div> */}
//         </form>

//         <p style={{ marginTop: '1.5rem' }}>
//           Don't have an account?
//           <span className="auth-link" style={{ cursor: 'pointer', color: 'var(--coral)' }} onClick={() => navigate('/signup')}>
//             Sign Up
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default LoginPage

