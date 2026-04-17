import { useState } from "react"
import { supabase } from "../../../backend/supabaseClient"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); // ✅ button disabled from here onwards

    try {
      // Step 1: Sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        toast.error(authError.message || "Login Failed.");
        return; // finally() will setLoading(false)
      }

      // Step 2: Fetch role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .single();

      const role = userData?.role === 'Admin' ? 'admin' : 'student';
      localStorage.setItem('userRole', role);

      toast.success("Login successful!");

      // Step 3: Navigate directly — no AuthListener involved
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });

    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false); // ✅ always runs, button re-enables only after everything done
    }
  };

  const validate = () => {
    let newErrors = {}
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!email.includes("@")) {
      newErrors.email = "Invalid email"
    }
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Min 6 characters"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <span className="back-btn" onClick={() => navigate('/')}>← Back</span>

        <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1rem' }}>
          Welcome Back
        </h2>

        {errors.api && <p style={{ color: "red", marginBottom: '1rem' }}>{errors.api}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="auth-input"
          />
          {errors.email && <p style={{ color: "red", fontSize: '0.9rem', marginBottom: '1rem' }}>{errors.email}</p>}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="auth-input"
          />
          {errors.password && <p style={{ color: "red", fontSize: '0.9rem', marginBottom: '1rem' }}>{errors.password}</p>}

          {/* ✅ disabled={loading} prevents ANY second click while loading */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '1rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            disabled={loading}
          >
            {loading ? "Logging you in..." : "Login"}
          </button>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <span className="forgot-password-link" onClick={() => navigate('/forgot-password')}>
              Forgot your password?
            </span>
          </div>
        </form>

        <p style={{ marginTop: '1.5rem' }}>
          Don't have an account?
          <span className="auth-link" style={{ cursor: 'pointer', color: 'var(--coral)' }} onClick={() => navigate('/signup')}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage

