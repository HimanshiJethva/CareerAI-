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

function PasswordField({ label, placeholder, value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "13px 46px 13px 16px",
            borderRadius: 12, fontSize: 14, fontFamily: "inherit",
            border: `1.5px solid ${error ? "#ef4444" : C.border}`,
            background: error ? "#fef2f2" : "#f8fafc",
            color: C.text, outline: "none", transition: "border 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = error ? "#ef4444" : C.primary}
          onBlur={e => e.target.style.borderColor = error ? "#ef4444" : C.border}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: C.muted, display: "flex", padding: 0,
          }}
        >
          <EyeIcon show={show} />
        </button>
      </div>
      {error && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function StrengthBar({ password }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 6)             score++;
  if (password.length >= 10)            score++;
  if (/[A-Z]/.test(password))           score++;
  if (/[0-9]/.test(password))           score++;
  if (/[^A-Za-z0-9]/.test(password))    score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#eab308", "#22c55e", "#16a34a"];
  return (
    <div style={{ margin: "8px 0 16px" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: i <= score ? colors[score] : "#e2e8f0",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color: colors[score], fontWeight: 600 }}>{labels[score]}</p>
    </div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(
    !localStorage.getItem("cookieAccepted")
  );

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())                     e.fullName = "Full name is required";
    if (!form.email)                               e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))    e.email = "Invalid email address";
    if (!form.password)                            e.password = "Password is required";
    else if (form.password.length < 6)             e.password = "Minimum 6 characters";
    if (!form.confirmPassword)                     e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!agreedTerms)                              e.terms = "You must agree to the Terms & Privacy Policy";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName } },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    // insert into users table
    await supabase.from("users").insert([{ email: form.email, role: "student" }]);
    toast.success("Account created! Please check your email to verify.");
    navigate("/login");
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
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .page { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2rem 1rem 6rem; }
        .card { background:#fff; border-radius:24px; padding:2.5rem 2rem; width:100%; max-width:460px;
          box-shadow:0 8px 40px rgba(249,112,102,0.1); border:1px solid ${C.softB};
          animation:slideUp 0.4s ease; }
        .back { display:flex; align-items:center; gap:6px; font-size:13px; color:${C.muted};
          cursor:pointer; font-weight:600; background:none; border:none; font-family:inherit;
          margin-bottom:1.5rem; padding:0; transition:color 0.2s; }
        .back:hover { color:${C.text}; }
        .logo { font-family:'Sora',sans-serif; font-size:20px; font-weight:800; color:${C.primary};
          text-align:center; margin-bottom:0.5rem; letter-spacing:-0.5px; }
        h1 { font-family:'Sora',sans-serif; font-size:26px; font-weight:800; color:${C.text};
          text-align:center; margin-bottom:6px; letter-spacing:-0.5px; }
        .subtitle { font-size:13px; color:${C.muted}; text-align:center; margin-bottom:1.75rem; }
        .field-label { font-size:13px; font-weight:600; color:#475569; display:block; margin-bottom:6px; }
        .field-input { width:100%; padding:13px 16px; border-radius:12px; border:1.5px solid ${C.border};
          background:#f8fafc; font-size:14px; color:${C.text}; outline:none;
          font-family:inherit; transition:border 0.2s; margin-bottom:4px; }
        .field-input:focus { border-color:${C.primary}; }
        .field-input.err { border-color:#ef4444; background:#fef2f2; }
        .field-err { font-size:11px; color:#ef4444; margin-bottom:12px; display:block; }
        .field-mb { margin-bottom:16px; }
        .terms-row { display:flex; align-items:flex-start; gap:10px; margin:16px 0; }
        .checkbox { width:18px; height:18px; accent-color:${C.primary}; cursor:pointer; flex-shrink:0; margin-top:2px; }
        .terms-text { font-size:13px; color:${C.muted}; line-height:1.5; }
        .terms-link { color:${C.primary}; font-weight:600; cursor:pointer; text-decoration:none; }
        .terms-link:hover { text-decoration:underline; }
        .terms-err { font-size:11px; color:#ef4444; margin-top:-10px; margin-bottom:12px; display:block; }
        .btn-submit { width:100%; padding:14px; border-radius:12px; background:${C.primary}; color:#fff;
          border:none; font-size:15px; font-weight:700; cursor:pointer; font-family:inherit;
          box-shadow:0 4px 20px rgba(249,112,102,0.35); transition:all 0.2s; margin-top:4px; }
        .btn-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 26px rgba(249,112,102,0.45); }
        .btn-submit:disabled { opacity:0.55; cursor:not-allowed; transform:none; }
        .login-row { text-align:center; margin-top:1.25rem; font-size:13px; color:${C.muted}; }
        .login-link { color:${C.primary}; font-weight:700; cursor:pointer; }
        .login-link:hover { text-decoration:underline; }
        .divider { display:flex; align-items:center; gap:10px; margin:20px 0; }
        .divider-line { flex:1; height:1px; background:${C.border}; }
        .divider-text { font-size:12px; color:#cbd5e1; font-weight:500; }

        /* cookie banner */
        .cookie { position:fixed; bottom:0; left:0; right:0; background:#1e293b; color:#fff;
          padding:16px 24px; display:flex; align-items:center; justify-content:space-between;
          gap:16px; z-index:999; animation:slideDown 0.4s ease; flex-wrap:wrap; }
        .cookie-text { font-size:13px; color:rgba(255,255,255,0.8); line-height:1.5; flex:1; }
        .cookie-link { color:${C.primary}; font-weight:600; cursor:pointer; }
        .cookie-btns { display:flex; gap:8px; flex-shrink:0; }
        .cookie-accept { padding:9px 20px; border-radius:8px; background:${C.primary}; color:#fff;
          border:none; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; }
        .cookie-decline { padding:9px 20px; border-radius:8px; background:rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.15);
          font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; }
      `}</style>

      {/* COOKIE BANNER */}
      {/* {showCookieBanner && (
        <div className="cookie">
          <div className="cookie-text">
            🍪 We use cookies to improve your experience and analyse usage data.
            We may use anonymised prediction data to improve our AI model.
            Read our <span className="cookie-link" onClick={() => navigate("/privacy")}>Privacy Policy</span> and{" "}
            <span className="cookie-link" onClick={() => navigate("/terms")}>Terms</span> for details.
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
          <h1>Create Account</h1>
          <p className="subtitle">Join thousands of students finding their perfect career path</p>

          <form onSubmit={handleSignup}>
            {/* Full Name */}
            <div className="field-mb">
              <label className="field-label">Full Name</label>
              <input className={`field-input ${errors.fullName ? "err" : ""}`}
                type="text" placeholder="Himanshi Jethva"
                value={form.fullName} onChange={set("fullName")} />
              {errors.fullName && <span className="field-err">{errors.fullName}</span>}
            </div>

            {/* Email */}
            <div className="field-mb">
              <label className="field-label">Email Address</label>
              <input className={`field-input ${errors.email ? "err" : ""}`}
                type="email" placeholder="you@example.com"
                value={form.email} onChange={set("email")} />
              {errors.email && <span className="field-err">{errors.email}</span>}
            </div>

            {/* Password */}
            <PasswordField
              label="Password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
            />
            <StrengthBar password={form.password} />

            {/* Confirm Password */}
            <div style={{ marginBottom: 8 }}>
              <PasswordField
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                error={errors.confirmPassword}
              />
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, marginTop: 4 }}>✓ Passwords match</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="terms-row">
              <input type="checkbox" className="checkbox" id="terms"
                checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} />
              <label htmlFor="terms" className="terms-text">
                I agree to the{" "}
                <span className="terms-link" onClick={() => window.open("/terms", "_blank")}>Terms of Service</span>
                {" "}and{" "}
                <span className="terms-link" onClick={() => window.open("/privacy", "_blank")}>Privacy Policy</span>.
                I understand CareerAI may use anonymised data to improve predictions.
              </label>
            </div>
            {errors.terms && <span className="terms-err">{errors.terms}</span>}

            <button className="btn-submit" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>

          <p className="login-row">
            Already have an account?{" "}
            <span className="login-link" onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>
      </div>
    </>
  );
}


// import { useState } from "react"
// import { supabase } from "../../../backend/supabaseClient"
// import toast from 'react-hot-toast';
// import { useNavigate } from "react-router-dom";

// function SignupPage() {

//     // States
//     const navigate = useNavigate();
//     const [name, setName] = useState("")
//     const [email, setEmail] = useState("")
//     const [password, setPassword] = useState("")
//     // const [confirmPassword, setConfirmPassword] = useState("") // <--- 1. Nayi State add ki
//     const [loading, setLoading] = useState(false)
//     const [errors, setErrors] = useState({}) 

//     const handleSignup = async (e) => {
//       e.preventDefault();
//       const isInvaild = validate();

//       if(!isInvaild) return;
//       setLoading(true);
//       setErrors({});
//       // STEP 1: Supabase Auth mein user banana
//       const { data, error } = await supabase.auth.signUp({
//         email,
//         password
//       });

//       if(error){
//         setErrors({ api: error.message });
//         setLoading(false);
//         return;
//       }

//       // STEP 2: Manual Insert (Aapka manga hua tarika)
//       // Hum 'users' table mein data tabhi dalenge jab user successfully auth ho jaye
//       if (data?.user) {
//         const { error: dbError } = await supabase
//           .from("users")
//           .upsert([
//             {
//               id: data.user.id, // Auth ki unique ID
//               name: name,
//               email: email,
//               avatar_url: "" 
//             }
//           ]);

//         if (dbError) {
//           setErrors({ api: "Database Error: " + dbError.message });
//         } else {
//           alert("Signup Success! Please check your inbox to verify.");
//           navigate('/login');
//         }
//       }
      
//       setLoading(false);
//     };
    
    
   
//     const validate = () => {
//         let newErrors = {}
//         if (!name) newErrors.name = "Name is required"
//         if (!email) {
//           newErrors.email = "Email is required"
//         } else if (!email.includes("@")) {
//           newErrors.email = "Invalid email"
//         }
        
//         // Password Checks
//         if (!password) {
//           newErrors.password = "Password is required"
//         } else if (password.length < 6) {
//           newErrors.password = "Min 6 characters"
//         }

//         // // <--- 2. Confirm Password Match Logic YAHAN HAI --->
//         // if (!confirmPassword) {
//         //     newErrors.confirmPassword = "Confirm your password"
//         // } else if (password !== confirmPassword) {
//         //     newErrors.confirmPassword = "Passwords do not match!"
//         // }

//         setErrors(newErrors)
//         return Object.keys(newErrors).length === 0
//     }

//     return (
//       <div className="auth-container">
       
//         <div className="auth-card">
          
//           <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
//           {errors.api && <p style={{color:"red"}}>{errors.api}</p>}
//           <h2 style={{fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1rem'}}>Create Account</h2>
//           <input 
//               type="text" 
//               placeholder="Full Name" 
//               value={name} 
//               onChange={(e)=>setName(e.target.value)} 
//               className="auth-input" />
//           {errors.name && <p style={{color:"red"}}>{errors.name}</p>}
//           <input type="email" placeholder="Email Address" value={email} onChange={(e)=>setEmail(e.target.value)} className="auth-input" />
//           {errors.email && <p style={{color:"red"}}>{errors.email}</p>}
//           <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="auth-input" />
//           {errors.password && <p style={{color:"red"}}>{errors.password}</p>}
//           <button  onClick={handleSignup} className="btn-primary" style={{width: '100%'}} disabled={loading}>{loading ? "Please wait.." : "Signup"}</button>
//           <p style={{marginTop: '1.5rem'}}>
//             Already have an account? 
//             <span className="auth-link" style={{cursor: 'pointer', color: 'var(--coral)'}} onClick={() => navigate('/login')}> 
//               Login
//             </span>
//           </p>
//         </div>
//       </div>
//     );
// }

// export default SignupPage;