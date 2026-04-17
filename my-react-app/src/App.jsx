import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../../backend/supabaseClient';
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
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? 'auth' : 'unauth');
    });
  }, []);

  if (status === 'checking') return null;
  return status === 'auth' ? children : <Navigate to="/login" replace />;
}


// ── Admin Route ─────────────────────────────────────────────────────────────
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
  if (status === 'forbidden') return <Navigate to="/dashboard" replace />; // ✅ fixed: was '/admin'
  return children;
}


// ── Auth Listener ───────────────────────────────────────────────────────────
function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    let isBoot = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isBoot) {
        // First two events on load are INITIAL_SESSION + SIGNED_IN (session restore)
        // Both are NOT real logins — skip them
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (event === 'SIGNED_IN') isBoot = false; // boot phase over after this
          return;
        }
        isBoot = false;
      }

      // Only real fresh logins reach here
      if (event === 'SIGNED_IN' && session) {
        const role = localStorage.getItem('userRole');
        navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        return;
      }

      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}
// function AuthListener() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     let initialEventHandled = false; // ✅ guard against first event

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {

//       // ✅ INITIAL_SESSION fires on page load/refresh — let AdminRoute/PrivateRoute handle it
//       if (event === 'INITIAL_SESSION') {
//         initialEventHandled = true;
//         return;
//       }

//       // ✅ Some Supabase versions fire SIGNED_IN right after INITIAL_SESSION on refresh
//       // We skip it if INITIAL_SESSION was already handled (page refresh case)
//       if (event === 'SIGNED_IN' && session) {
//         if (!initialEventHandled) {
//           initialEventHandled = true;
//           return;
//         }
//         // This is a real fresh login — navigate to correct route
//         const role = localStorage.getItem('userRole');
//         navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
//         return;
//       }

//       if (event === 'SIGNED_OUT') {
//         localStorage.removeItem('userRole');
//         navigate('/', { replace: true });
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, [navigate]);

//   return null;
// }


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
        <Route path="/"                element={<LandingPage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/signup"          element={<SignupPage />} />
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// import { BrowserRouter,Routes, Route, Navigate,useNavigate} from 'react-router-dom';
// import { supabase } from '../../backend/supabaseClient';
// import { useState, useEffect } from "react";
// import "./App.css";
// import { Toaster } from 'react-hot-toast';
// import LandingPage from "./pages/LandingPage";
// import LoginPage from "./pages/LoginPage";
// import SignupPage from "./pages/SignupPage";
// import DashboardPage from "./pages/DashboardPage";
// import ForgotPasswordPage from './pages/ForgotPasswordPage';
// import ProfilePage from './pages/ProfilePage';
// import AdminDashboard from './pages/AdminDash/AdminDashboard';


// // ── Protected Route: only for logged-in users ──────────────────────────────
// function PrivateRoute({ children }) {
//   const [status, setStatus] = useState('checking'); // 'checking' | 'auth' | 'unauth'

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setStatus(session ? 'auth' : 'unauth');
//     });
//   }, []);

//   if (status === 'checking') return null; // or a spinner
//   return status === 'auth' ? children : <Navigate to="/login" replace />;
// }

// function AdminRoute({ children }) {
//   const [status, setStatus] = useState('checking');

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       if (!session) { setStatus('unauth'); return; }
//       const role = localStorage.getItem('userRole');
//       setStatus(role === 'admin' ? 'auth' : 'forbidden');
//     });
//   }, []);

//   if (status === 'checking') return null;
//   if (status === 'unauth') return <Navigate to="/login" replace />;
//   if (status === 'forbidden') return <Navigate to="/admin" replace />;
//   return children;
// }

// // ── Auth Listener wrapper ───────────────────────────────────────────────────
// function AuthListener() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Get current session first to avoid acting on stale SIGNED_IN events
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       if (session) {
//         const role = localStorage.getItem('userRole');
//         navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
//       }
//     });

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {

//       if (event === 'INITIAL_SESSION') return;
//       if (event === 'SIGNED_IN' && session) {
//         const role = localStorage.getItem('userRole');
//         navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
//       }
//       if (event === 'SIGNED_OUT') {
//         localStorage.removeItem('userRole');
//         navigate('/', { replace: true });
//       }
//     });

//     return () => subscription.unsubscribe(); // ✅ now correctly in outer cleanup
//   }, [navigate]);

//   return null;
// }


// // ── App ─────────────────────────────────────────────────────────────────────
// function App() {
//   useEffect(() => {
//     document.title = "CareerAI | Career Prediction System";
//   }, []);

//   return (
//    <BrowserRouter>
//       <Toaster />
//       <AuthListener />
//       <Routes>
//         {/* Public routes */}
//         <Route path="/"               element={<LandingPage />} />
//         <Route path="/login"          element={<LoginPage />} />
//         <Route path="/signup"         element={<SignupPage />} />
//         <Route path="/forgot-password" element={<ForgotPasswordPage />} />

//         {/* Protected routes */}
//         <Route path="/dashboard" element={
//           <PrivateRoute><DashboardPage /></PrivateRoute>
//         } />
//         <Route path="/profile" element={
//           <PrivateRoute><ProfilePage /></PrivateRoute>
//         } />

//         {/* Admin-only route */}
//         <Route path="/admin" element={
//           <AdminRoute><AdminDashboard /></AdminRoute>
//         } />

//         {/* Fallback: unknown URLs → landing */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//       </BrowserRouter>
    
//   );
// }

// export default App;



