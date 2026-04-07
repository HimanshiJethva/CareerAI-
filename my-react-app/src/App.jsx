import { BrowserRouter,Routes, Route, Navigate,useNavigate} from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useState, useEffect } from "react";
import "./App.css";
import { Toaster } from 'react-hot-toast';
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDash/AdminDashboard';


// ── Protected Route: only for logged-in users ──────────────────────────────
function PrivateRoute({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'auth' | 'unauth'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? 'auth' : 'unauth');
    });
  }, []);

  if (status === 'checking') return null; // or a spinner
  return status === 'auth' ? children : <Navigate to="/login" replace />;
}

// ── Admin Route: only for admin role ───────────────────────────────────────
function AdminRoute({ children }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setStatus('unauth'); return; }
      const role = localStorage.getItem('userRole');
      setStatus(role === 'admin' ? 'auth' : 'forbidden');
    });
  }, []);

  if (status === 'checking') return null;
  if (status === 'unauth') return <Navigate to="/login" replace />;
  if (status === 'forbidden') return <Navigate to="/dashboard" replace />;
  return children;
}

// ── Auth Listener wrapper ───────────────────────────────────────────────────
function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    // Small delay to ensure router is fully mounted
    const timeout = setTimeout(() => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const role = localStorage.getItem('userRole');
          navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        }
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('userRole');
          navigate('/', { replace: true });
        }
      });

      // Store unsubscribe for cleanup
      return () => subscription.unsubscribe();
    }, 100);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return null;
}

// ── App ─────────────────────────────────────────────────────────────────────
function App() {
  useEffect(() => {
    document.title = "CareerAI | Career Prediction System";
  }, []);

  return (
   <BrowserRouter>
      <Toaster />
      <AuthListener />
      <Routes>
        {/* Public routes */}
        <Route path="/"               element={<LandingPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/signup"         element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <PrivateRoute><DashboardPage /></PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute><ProfilePage /></PrivateRoute>
        } />

        {/* Admin-only route */}
        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />

        {/* Fallback: unknown URLs → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrowserRouter>
    
  );
}

export default App;



// import { supabase } from './supabaseClient'; // Path check kar lena apne folder ke hisaab se
// import { useState ,useEffect} from "react";
// import "./App.css";
// import { Toaster } from 'react-hot-toast'; // <--- PEHLA BADLAV: Import karein
// import LandingPage from "./pages/LandingPage"
// import LoginPage from "./pages/LoginPage"
// import SignupPage from "./pages/SignupPage"
// import DashboardPage from "./pages/DashboardPage"
// import ForgotPasswordPage from './pages/ForgotPasswordPage';
// import ProfilePage from './pages/ProfilePage';
// import AdminDashboard from './pages/AdminDash/AdminDashboard';
// import toast from 'react-hot-toast/headless';
// function App() {
//   const [loading,setLoading] = useState(false)
//   const [view, setView] = useState(() => {
//   return localStorage.getItem("view") || "landing"
// }) 
// // const [view, setView] = useState("admin");
//   // const[view, setView] = useState("landing");



//   useEffect(()=> {
//     localStorage.setItem("view",view);
//   },[view]);//refresh thi landing na jay ena mate



//     useEffect(() => {
//     const initApp = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (session) {
//       // Check karo localStorage mein role kya hai
//       const role = localStorage.getItem('userRole');

     
//       if (role === 'admin') {
//         setView('admindashboard');
//       } else {
//         setView('dashboard');
//       }
//     } else {
//         const savedView = localStorage.getItem("view");
//         setView(savedView === 'dashboard' ? 'landing' : (savedView || 'landing'));
//       }
//       setLoading(false);
//     };

//     initApp();

//     // Ye listener email verification link click hote hi dashboard khol dega
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
//       if (event === 'SIGNED_IN' && session) {
//         setView('dashboard');
//       }
//       if (event === 'SIGNED_OUT') {
//         setView('landing');
//         localStorage.removeItem("view");
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   useEffect(() => {
//     const checkSession = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
      
//       if (session) {
//         // 👇 YAHAN BADLAV HAI: LocalStorage se role uthao
//         const savedRole = localStorage.getItem("userRole");
        
//         if (savedRole === 'admin') {
//           setView('admindashboard');
//         } else {
//           setView('dashboard');
//         }
//       } else {
//         // Agar session nahi hai aur purana view dashboard tha, toh landing bhej do
//         if (localStorage.getItem("view") === 'dashboard' || localStorage.getItem("view") === 'admindashboard') {
//           setView('landing');
//         }
//       }
//     };
    
//     checkSession();
//   }, []);

//   useEffect(()=>{
       
//     document.title = "CareerAI | Career Prediction System";
//   },  []);
//  return (
//     <>
//       {/* Ye line sabse upar honi chahiye */}
   
   
    
//       {view === "login" && <LoginPage setView={setView}/>}
//       {view === "signup" && <SignupPage setView={setView}/>}
//       {view === "dashboard" && <DashboardPage setView={setView}/>}
//       {view === "admindashboard" && <AdminDashboard setView={setView}/>}
//       {view === "landing" && <LandingPage setView={setView}/>}
//       {view === "forgotpassword" && <ForgotPasswordPage setView={setView}/>}
//       {view === "profile" && <ProfilePage setView={setView}/>}
//       {/* {view === "admin" && <AdminDashboard setView={setView}/>} */}
//     </>
      
//     // return <LandingPage setView={setView}/>
//   )

// }
// export default App