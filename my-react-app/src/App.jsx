import { supabase } from './supabaseClient'; // Path check kar lena apne folder ke hisaab se
import { useState ,useEffect} from "react"
import "./App.css"
import { Toaster } from 'react-hot-toast'; // <--- PEHLA BADLAV: Import karein
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import DashboardPage from "./pages/DashboardPage"

function App() {

  const [view, setView] = useState(() => {
  return localStorage.getItem("view") || "landing"
})
  // const[view, setView] = useState("landing");

  useEffect(()=> {
    localStorage.setItem("view",view);
  },[view]);//refresh thi landing na jay ena mate

  useEffect(() => {
  const checkSession = async () => {
    // Supabase se current session mangwayein
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Agar user login hai, toh use dashboard par hi rakho
      setView('dashboard');
    } else if (localStorage.getItem("view") === 'dashboard') {
      // Agar login nahi hai par view dashboard tha, toh wapas landing bhej do
      setView('landing');
    }
  };
  
  checkSession();
}, []); // Ye sirf ek baar chalega jab app load hogi

  useEffect(()=>{
    document.title = "AI Powered Career Prediction";
  },  []);
 return (
    <>
      {/* Ye line sabse upar honi chahiye */}
      <Toaster position="top-center" reverseOrder={false} /> 

      {view === "login" && <LoginPage setView={setView}/>}
      {view === "signup" && <SignupPage setView={setView}/>}
      {view === "dashboard" && <DashboardPage setView={setView}/>}
      {view === "landing" && <LandingPage setView={setView}/>}
    </>
  )
  // if(view==="login"){
  //   return <LoginPage setView={setView}/>
  // }

  // if(view==="signup"){
  //   return <SignupPage setView={setView}/>
  // }

  // if(view==="dashboard"){
  //   return <DashboardPage setView={setView}/>
  // }

  // return <LandingPage setView={setView}/>
}

export default App



// // src/App.jsx
// import { useState } from 'react' // Sabse upar ye line add karein
// import './App.css'

// function App() {
//   // 'landing', 'login', ya 'signup' mein se ek state hogi
//   const [view, setView] = useState('landing'); 

//   // //Dashboard (form) view
//   if(view == 'dashboard'){
//     return <DashboardPage setView={setView} />;
//   }
//   // Agar view 'login' hai toh Login page dikhao
//   if (view === 'login') {
//     return <LoginPage setView={setView} />;
//   }

//   // Agar view 'signup' hai toh Signup page dikhao
//   if (view === 'signup') {
//     return <SignupPage setView={setView} />;
//   }
//   return (
//     <div className="app-container">
//       {/* HEADER */}
//       <header>
//         <nav>
//           <a href="#" className="logo">CareerAI</a>
//           <ul className="nav-links">
//             <li><a href="#features">Features</a></li>
//             <li><a href="#how-it-works">How It Works</a></li>
//             <li><a href="#testimonials">Stories</a></li>
//             <li><button className="nav-cta" onClick={()=>setView('login')}>Get Started</button></li>
//           </ul>
//         </nav>
//       </header>

//       {/* HERO SECTION */}
//       <section className="hero">
//         <div className="hero-content">
//           <div className="hero-text">
//             <h1>Predict Your <span className="accent">Perfect Career</span> With AI</h1>
//             <p>Harness the power of machine learning to discover career paths that truly align with your unique skills, experience, and aspirations.</p>
//             <div className="hero-buttons">
//               <button className="btn-primary">Start Free Prediction</button>
//             </div>
//           </div>
//           <div className="hero-visual">
//             <div className="visual-card">
//               <StatItem label="Match Confidence" value="94%" width="94%" />
//               <StatItem label="Career Paths Found" value="12" width="80%" />
//               <StatItem label="Skill Match Score" value="87%" width="87%" />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* FEATURES SECTION */}
//       <section id="features" className="features">
//         <div className="section-header">
//           <p style={{color: 'var(--coral)', fontWeight: 'bold', letterSpacing: '2px'}}>WHY CHOOSE US</p>
//           <h2 style={{fontFamily: 'Playfair Display', fontSize: '3.5rem', marginTop: '1rem'}}>Exceptional Features</h2>
//         </div>
//         <div className="features-grid">
//           <FeatureCard icon="🎯" title="Precision Matching" desc="Advanced algorithms analyze 100+ data points from your profile." />
//           <FeatureCard icon="📊" title="Beautiful Insights" desc="Interactive visualizations transform complex data into clear insights." />
//           <FeatureCard icon="🚀" title="Instant Results" desc="Receive comprehensive predictions in seconds, not days." />
//           <FeatureCard icon="🎓" title="Skill Roadmaps" desc="Get personalized learning paths showing exactly which skills to develop for your target career."/>
//           <FeatureCard icon="🔒" title="Complete Privacy" desc="Your data is encrypted and never shared. Your career journey remains completely confidential."/>
//           <FeatureCard icon="💡" title="Expert Guidance" desc="Benefit from insights derived from analyzing millions of successful career transitions worldwide."/>
//         </div>  
//       </section>

//       {/* SHOWCASE SECTION */}
//       <section className="showcase">
//         <div className="showcase-content">
//           <div className="showcase-text">
//             <h2 style={{fontFamily: 'Playfair Display', fontSize: '3.5rem', marginBottom: '2rem'}}>See Your Future Unfold</h2>
//             <p style={{fontFamily: 'Fraunces', fontSize: '1.3rem', color: 'rgba(255,255,255,0.8)'}}>
//               Experience how our AI technology transforms your profile into clear career predictions.
//             </p>
//           </div>
//           <div className="prediction-preview">
//             <PredictionBox name="🥇 Machine Learning Engineer" score="87%" />
//             <PredictionBox name="🥈 Data Scientist" score="82%" />
//             <PredictionBox name="🥉 Full Stack Developer" score="76%" />
//           </div>
//         </div>
//       </section>
//       {/* PROCESS SECTION */}
// <section className="process" id="how-it-works">
//   <div className="section-header" style={{textAlign: 'center', marginBottom: '4rem'}}>
//       <p style={{color: 'var(--coral)', fontWeight: 'bold', letterSpacing: '2px'}}>SIMPLE PROCESS</p>
//       <h2 style={{fontFamily: 'Playfair Display', fontSize: '3.5rem', marginTop: '1rem'}}>Four Steps to Your Dream Career</h2>
//       <p style={{fontFamily: 'Fraunces', fontSize: '1.3rem', color: 'rgba(26,26,26,0.6)'}}>A streamlined journey from curiosity to clarity in just minutes</p>
//   </div>

//   <div className="process-grid">
//       <ProcessStep 
//           num="1" 
//           title="Share Your Story" 
//           desc="Tell us about your skills, experience, education, and career goals" 
//       />
//       <ProcessStep 
//           num="2" 
//           title="AI Analysis" 
//           desc="Our algorithms process your profile against thousands of career patterns" 
//       />
//       <ProcessStep 
//           num="3" 
//           title="Review Results" 
//           desc="Explore predictions with confidence scores and detailed breakdowns" 
//       />
//       <ProcessStep 
//           num="4" 
//           title="Take Action" 
//           desc="Follow your personalized roadmap to achieve your career goals" 
//       />
//    </div>
//   </section>
//       {/* TESTIMONIALS SECTION */}
//   <section className="testimonials" id="testimonials">
//       <div style={{textAlign: 'center', marginBottom: '4rem'}}>
//           <p style={{color: 'var(--coral)', fontWeight: '700', letterSpacing: '2px'}}>SUCCESS STORIES</p>
//           <h2 style={{fontFamily: 'Playfair Display', fontSize: '3.5rem', marginTop: '1rem'}}>Loved By Thousands</h2>
//       </div>

//       <div className="testimonials-grid">
//           <TestimonialCard 
//               text="This tool completely changed my career trajectory. Now I'm thriving as an ML Engineer at Google." 
//               initials="PS" name="Priya Sharma" role="ML Engineer, Google" 
//           />
//           <TestimonialCard 
//               text="The personalized skill roadmap was incredible. Within 6 months I landed my dream role at Amazon." 
//               initials="AK" name="Amit Kumar" role="Data Scientist, Amazon" 
//           />
//           <TestimonialCard 
//               text="I was amazed by how accurate the predictions were. The visual analytics made everything crystal clear." 
//               initials="SK" name="Sneha Kapoor" role="Developer, Microsoft" 
//           />
//       </div>
//   </section>

//   {/* CTA SECTION */}
//   <section className="cta-section">
//       <div style={{maxWidth: '900px', margin: '0 auto'}}>
//           <h2 style={{fontFamily: 'Playfair Display', fontSize: '4rem', marginBottom: '1.5rem'}}>Your Dream Career Awaits</h2>
//           <p style={{fontSize: '1.4rem', opacity: '0.95'}}>Join 50,000+ professionals who discovered their perfect path. Start today—free, forever.</p>
//           <button className="cta-button">Get Your Free Prediction</button>
//       </div>
//   </section>
//       {/* FOOTER */}
//       {/* FOOTER */}
// <footer>
//     <div className="footer-content">
//         <div className="footer-brand">
//             <h3>CareerAI</h3>
//             <p>Empowering professionals worldwide to discover and pursue their ideal careers through cutting-edge AI technology.</p>
//             <div className="social-icons">
//                 <div className="social-icon">📘</div>
//                 <div className="social-icon">🐦</div>
//                 <div className="social-icon">💼</div>
//                 <div className="social-icon">📸</div>
//             </div>
//         </div>

//         <FooterSection title="Product" links={['Features', 'Pricing', 'API', 'Case Studies']} />
//         <FooterSection title="Company" links={['About', 'Careers', 'Blog', 'Contact']} />
//         <FooterSection title="Legal" links={['Privacy', 'Terms', 'Security', 'GDPR']} />
//     </div>

//     <div className="footer-bottom">
//         <p>© 2026 CareerAI. Crafted with care for Ankita's BCA Project.</p>
//     </div>
// </footer>
//     </div>
//   )
// }
// // // 1. LOGIN PAGE COMPONENT
// // function LoginPage({ setView }) {
// //   return (
// //     <div className="auth-container">
// //       <div className="auth-card">
// //         <button className="back-btn" onClick={() => setView('landing')}>← Back</button>
// //         <h2 style={{fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1rem'}}>Welcome Back</h2>
// //         <input type="email" placeholder="Email Address" className="auth-input" />
// //         <input type="password" placeholder="Password" className="auth-input" />
// //         <button className="btn-primary" style={{width: '100%'}}>Login</button>
// //         <p style={{marginTop: '1.5rem'}}>
// //           Don't have an account? 
// //           <span className="auth-link" onClick={() => setView('signup')}> Sign Up</span>
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }


// // //2. SIGNUP PAGE COMPONENT
// // function SignupPage({ setView }) {
// //   return (
// //     <div className="auth-container">
// //       <div className="auth-card">
// //         <button className="back-btn" onClick={() => setView('landing')}>← Back</button>
// //         <h2 style={{fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1rem'}}>Create Account</h2>
// //         <input type="text" placeholder="Full Name" className="auth-input" />
// //         <input type="email" placeholder="Email Address" className="auth-input" />
// //         <input type="password" placeholder="Password" className="auth-input" />
// //         <button className="btn-primary" style={{width: '100%'}}>Create Account</button>
// //         <p style={{marginTop: '1.5rem'}}>
// //           Already have an account? 
// //           <span className="auth-link" onClick={() => setView('login')}> Login</span>
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }

// // ==========================================
// // 2. LOGIN PAGE (Logic: Check & Redirect)
// // ==========================================
// function LoginPage({ setView }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleLogin = (e) => {
//     e.preventDefault();
//     const cleanEmail = email.trim().toLowerCase();
//     const savedUser = localStorage.getItem(cleanEmail);

//     if (!savedUser) {
//       alert("Your account not found please first create your account");
//       setView('signup'); // Account nahi hai to Signup par redirect
//     } else {
//       const userData = JSON.parse(savedUser);
//       if (userData.password === password) {
//         alert("Login Successful!");
//         setView('dashboard'); // Success par Dashboard par redirect
//       } else {
//         alert("Wrong password!");
//       }
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <button className="back-btn" onClick={() => setView('landing')}>← Back</button>
//         <h2>Welcome Back</h2>
//         <form onSubmit={handleLogin}>
//           <input type="email" placeholder="Email Address" className="auth-input" required 
//             onChange={(e) => setEmail(e.target.value)} />
//           <input type="password" placeholder="Password" className="auth-input" required 
//             onChange={(e) => setPassword(e.target.value)} />
//           <button type="submit" className="btn-primary" style={{width: '100%'}}>Login</button>
//         </form>
//         <p>Don't have an account? <span className="auth-link" onClick={() => setView('signup')}>Sign Up</span></p>
//       </div>
//     </div>
//   );
// }

// // ==========================================
// // 3. SIGNUP PAGE (Logic: Save Data)
// // ==========================================
// function SignupPage({ setView }) {
//   const [formData, setFormData] = useState({ name: '', email: '', password: '' });

//   const handleSignup = (e) => {
//     e.preventDefault();
//     const cleanEmail = formData.email.trim().toLowerCase();
    
//     // Data browser memory (localStorage) mein save karna
//     localStorage.setItem(cleanEmail, JSON.stringify(formData));
    
//     alert("Signup Successful! Now go to login page and login it");
//     setView('login'); // Signup ke baad Login page par redirect
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <button className="back-btn" onClick={() => setView('landing')}>← Back</button>
//         <h2>Create Account</h2>
//         <form onSubmit={handleSignup}>
//           <input type="text" placeholder="Full Name" className="auth-input" required 
//             onChange={(e) => setFormData({...formData, name: e.target.value})} />
//           <input type="email" placeholder="Email Address" className="auth-input" required 
//             onChange={(e) => setFormData({...formData, email: e.target.value})} />
//           <input type="password" placeholder="Password" className="auth-input" required 
//             onChange={(e) => setFormData({...formData, password: e.target.value})} />
//           <button type="submit" className="btn-primary" style={{width: '100%'}}>Sign Up</button>
//         </form>
//         <p>Already have an account? <span className="auth-link" onClick={() => setView('login')}>Login</span></p>
//       </div>
//     </div>
//   );
// }

// // ==========================================
// // 4. DASHBOARD (Your AI Form will go here)
// // ==========================================
// function DashboardPage({ setView }) {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     Stream: '', Physics: '', Chemistry: '', Biology: '', English: '', ComputerScience: '',
//     Mathematics: '', Accountancy: '', BusinessStudies: '', Economics: '', History: '',
//     Geography: '', PoliticalScience: '', Sociology: '', Interest_Tech: false, 
//     Interest_Entrepreneurship: false, Interest_Leadership: false, Interest_Innovation: false,
//     Interest_CriticalThinking: false, Interest_Research: false, Interest_ComputerSkill: false,
//     Interest_HardwareSkill:false, Interest_Food: false, Interest_Creativity: false,
//     PositiveThinking: false, Participated_Hackathon: false, Participated_Olympiad: false,
//     Participated_Kabaddi: false, Participated_KhoKho: false, Participated_Cricket: false,
//     Oppenness: 3, Conscientiousness: 3, Extraversion: 3, Agreeableness: 3, Neuroticism: 3
//   });

//   const updateField = (name, value) => {
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const stepsInfo = [
//     { n: 1, t: "Stream Selection", s: "Basic Info" },
//     { n: 2, t: "Academic Marks", s: "Subject Scores" },
//     { n: 3, t: "Personality Traits", s: "Big Five Scaling" },
//     { n: 4, t: "Interests & Skills", s: "Final Assessment" }
//   ];

//   return (
//     <div className="dashboard-wrapper">
//       {/* Sidebar Stepper */}
//       <aside className="dash-sidebar">
//         <div className="sidebar-logo">CareerAI</div>
//         <div className="stepper-vertical">
//           {stepsInfo.map((item) => (
//             <div key={item.n} className={`step-item ${step === item.n ? 'active' : ''} ${step > item.n ? 'completed' : ''}`}>
//               <div className="step-num">{step > item.n ? "✓" : item.n}</div>
//               <div className="step-txt">
//                 <span>{item.t}</span>
//                 <small>{item.s}</small>
//               </div>
//             </div>
//           ))}
//         </div>
//         <div className="sidebar-footer">
//           <p>Logged in </p>
//           <button className="logout-btn" onClick={() => setView('landing')}>Logout</button>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <main className="dash-main">
//         <div className="form-header">
//           <h1>{stepsInfo[step-1].t}</h1>
//           <p>Please provide accurate details for a better prediction.</p>
//         </div>

//         <div className="wide-card animate-in">
//           {/* STEP 1: STREAM */}
//           {step === 1 && (
//             <div className="step-view">
//               <h2>Select Your Educational Stream</h2>
//               <div className="stream-grid">
//                 {["Science_PCM", "Science_PCB", "Commerce", "Arts"].map(s => (
//                   <button key={s} className={`stream-card ${formData.Stream === s ? 'selected' : ''}`} 
//                     onClick={() => updateField('Stream', s)}>
//                     <div className="stream-icon">{s[0]}</div>
//                     {s.replace('_', ' ')}
//                   </button>
//                 ))}
//               </div>
//               <div className="footer-btns">
//                 <div></div>
//                 <button className="btn-main" disabled={!formData.Stream} onClick={() => setStep(2)}>Next Step</button>
//               </div>
//             </div>
//           )}

//           {/* STEP 2: MARKS (Dynamic) */}
//           {step === 2 && (
//             <div className="step-view">
//               <h2>Academic Performance (0-100)</h2>
//               <div className="marks-grid">
//                 <InputGroup label="English" name="English" val={formData.English} fn={updateField} />
//                 {formData.Stream.includes("Science") && (
//                   <><InputGroup label="Physics" name="Physics" val={formData.Physics} fn={updateField} />
//                   <InputGroup label="Chemistry" name="Chemistry" val={formData.Chemistry} fn={updateField} /></>
//                 )}
//                 {formData.Stream === "Science_PCM" && <><InputGroup label="Mathematics" name="Mathematics" val={formData.Mathematics} fn={updateField} /><InputGroup label="Computer Science" name="ComputerScience" val={formData.ComputerScience} fn={updateField} /></>}
//                 {formData.Stream === "Science_PCB" && <InputGroup label="Biology" name="Biology" val={formData.Biology} fn={updateField} />}
//                 {formData.Stream === "Commerce" && <><InputGroup label="Accountancy" name="Accountancy" val={formData.Accountancy} fn={updateField} /><InputGroup label="Business Studies" name="BusinessStudies" val={formData.BusinessStudies} fn={updateField} /><InputGroup label="Economics" name="Economics" val={formData.Economics} fn={updateField} /></>}
//                 {formData.Stream === "Arts" && <><InputGroup label="History" name="History" val={formData.History} fn={updateField} /><InputGroup label="Geography" name="Geography" val={formData.Geography} fn={updateField} /><InputGroup label="Sociology" name="Sociology" val={formData.Sociology} fn={updateField} /></>}
//               </div>
//               <div className="footer-btns">
//                 <button className="btn-back" onClick={() => setStep(1)}>Back</button>
//                 <button className="btn-main" onClick={() => setStep(3)}>Next: Personality</button>
//               </div>
//             </div>
//           )}

//           {/* STEP 3: PERSONALITY */}
//           {step === 3 && (
//             <div className="step-view">
//               <h2>Personality Scaling (1 - 5)</h2>
//               <div className="slider-grid">
//                 {['Oppenness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'].map(t => (
//                   <SliderGroup key={t} label={t} name={t} val={formData[t]} fn={updateField} />
//                 ))}
//               </div>
//               <div className="footer-btns">
//                 <button className="btn-back" onClick={() => setStep(2)}>Back</button>
//                 <button className="btn-main" onClick={() => setStep(4)}>Next: Interests</button>
//               </div>
//             </div>
//           )}

//           {/* STEP 4: INTERESTS & PARTICIPATION (Pills Layout) */}
//           {step === 4 && (
//             <div className="step-view animate-in">
//               <h2 className="step-title">Interests & Extracurricular</h2>
//               <p className="step-subtitle">Select your hobbies and skills as per yout interest</p>

//               <div className="pills-container-scroll">
//                 {/* 1. Core Interests Group */}
//                 <div className="interest-section">
//                   <h3 className="section-heading">Choose Your Interests:</h3>
//                   <div className="pills-grid">
//                     {[
//                       'Tech', 'Entrepreneurship', 'Leadership', 'Innovation', 
//                       'CriticalThinking', 'Research', 'ComputerSkill', 
//                       'HardwareSkill', 'Food', 'Creativity'
//                     ].map(item => (
//                       <PillItem 
//                         key={item} 
//                         label={item.replace(/([A-Z])/g, ' $1').trim()} 
//                         name={`Interest_${item}`} 
//                         val={formData[`Interest_${item}`]} 
//                         fn={updateField} 
//                       />
//                     ))}
//                   </div>
//                 </div>

//                 {/* 2. Participation & Sports Group */}
//                 <div className="participation-section">
//                   <h3 className="section-heading">Participation & Sports:</h3>
//                   <div className="pills-grid">
//                     {[
//                       'Hackathon', 'Olympiad', 'Kabaddi', 'KhoKho', 'Cricket'
//                     ].map(item => (
//                       <PillItem 
//                         key={item} 
//                         label={item} 
//                         name={`Participated_${item}`} 
//                         val={formData[`Participated_${item}`]} 
//                         fn={updateField} 
//                       />
//                     ))}
//                     {/* Positive Thinking as a specific trait button */}
//                     <PillItem 
//                       label="Positive Thinking" 
//                       name="PositiveThinking" 
//                       val={formData.PositiveThinking} 
//                       fn={updateField} 
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Navigation Buttons */}
//               <div className="footer-btns">
//                 <button className="btn-back" onClick={() => setStep(3)}>Back</button>
//                 <button className="btn-predict-gradient" onClick={() => alert("AI Prediction Starting...")}>
//                   Predict Career ✨
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// const PillItem = ({ label, name, val, fn }) => (
//   <div 
//     className={`pill ${val ? 'selected' : ''}`} 
//     onClick={() => fn(name, !val)}
//     style={{
//       padding: '10px 20px',
//       border: '2px solid' + (val ? '#FF758C' : '#eee'),
//       borderRadius: '50px',
//       cursor: 'pointer',
//       backgroundColor: val ? '#FF758C' : 'white',
//       color: val ? 'white' : '#444',
//       fontWeight: '600',
//       transition: '0.3s'
//     }}
//   >
//     {label} {val ? '✓' : '+'}
//   </div>
// );

// // Reusable Components
// const InputGroup = ({ label, name, val, fn }) => (
//   <div className="marks-input-group">
//     <label>{label}</label>
//     <input type="number" value={val} onChange={(e) => fn(name, e.target.value)} placeholder="0-100" />
//   </div>
// );

// const SliderGroup = ({ label, name, val, fn }) => (
//   <div className="slider-group">
//     <label>{label}: <span>{val}</span></label>
//     <input type="range" min="1" max="5" step="0.5" value={val} onChange={(e) => fn(name, e.target.value)} />
//   </div>
// );

// const CheckItem = ({ label, name, val, fn }) => (
//   <label className="check-item">
//     <input type="checkbox" checked={val} onChange={(e) => fn(name, e.target.checked)} />
//     {label}
//   </label>
// ); ????????


// // Components
// function StatItem({ label, value, width }) {
//   return (
//     <div className="stat-item">
//       <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
//         <span style={{color: 'rgba(26,26,26,0.5)', fontSize: '0.85rem'}}>{label}</span>
//         <span style={{fontFamily: 'Playfair Display', fontSize: '1.5rem'}}>{value}</span>
//       </div>
//       <div className="stat-bar"><div className="stat-fill" style={{ width: width }}></div></div>
//     </div>
//   )
// }

// function FeatureCard({ icon, title, desc }) {
//   return (
//     <div className="feature-card">
//       <span style={{fontSize: '3.5rem', display: 'block', marginBottom: '1.5rem'}}>{icon}</span>
//       <h3 style={{fontFamily: 'Playfair Display', fontSize: '1.6rem', marginBottom: '1rem'}}>{title}</h3>
//       <p style={{color: 'rgba(26,26,26,0.6)', fontSize: '1.05rem'}}>{desc}</p>
//     </div>
//   )
// }

// function PredictionBox({ name, score }) {
//   return (
//     <div className="prediction-item">
//       <span style={{ fontSize: '1.3rem', fontWeight: '700' }}>{name}</span>
//       <span style={{ fontSize: '2rem', color: '#FF6B6B', fontWeight: '900', fontFamily: 'Playfair Display' }}>{score}</span>
//     </div>
//   )
// }
// function ProcessStep({ num, title, desc }) {
//   return (
//     <div className="process-step">
//       <div className="step-number">{num}</div>
//       <h3 className="step-title">{title}</h3>
//       <p className="step-description">{desc}</p>
//     </div>
//   )
// }
// function TestimonialCard({ text, initials, name, role }) {
//   return (
//     <div className="testimonial-card">
//       <p style={{fontFamily: 'Fraunces', fontSize: '1.15rem', marginBottom: '2.5rem', color: '#444'}}>"{text}"</p>
//       <div style={{display: 'flex', alignItems: 'center'}}>
//         <div className="author-image">{initials}</div>
//         <div style={{textAlign: 'left'}}>
//           <div style={{fontWeight: '700'}}>{name}</div>
//           <div style={{color: 'rgba(26, 26, 26, 0.5)', fontSize: '0.9rem'}}>{role}</div>
//         </div>
//       </div>
//     </div>
//   )
// }
// function FooterSection({ title, links }) {
//   return (
//     <div className="footer-section">
//       <h4>{title}</h4>
//       <ul className="footer-links">
//         {links.map((link) => (
//           <li key={link}><a href={`#${link.toLowerCase()}`}>{link}</a></li>
//         ))}
//       </ul>
//     </div>
//   )
// }
// export default App