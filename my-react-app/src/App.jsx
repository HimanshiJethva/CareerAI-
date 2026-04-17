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
      
      // ✅ Fetch role fresh from DB — no localStorage dependency
      supabase
        .from('users')
        .select('role')
        .eq('email', session.user.email)
        .single()
        .then(({ data }) => {
          setStatus(data?.role === 'Admin' ? 'auth' : 'forbidden');
        });
    });
  }, []);

  if (status === 'checking') return null;
  if (status === 'unauth') return <Navigate to="/login" replace />;
  if (status === 'forbidden') return <Navigate to="/dashboard" replace />;
  return children;
}



// ── Auth Listener ───────────────────────────────────────────────────────────

// Only handles SIGNED_OUT now — login navigation is done directly in LoginPage
function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
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
