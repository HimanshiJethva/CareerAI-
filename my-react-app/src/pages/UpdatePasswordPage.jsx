import { useState, useEffect } from "react";
import { supabase } from "../../../backend/supabaseClient";
import { useNavigate } from "react-router-dom";

function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);

  // useEffect(() => {
  //   // Check if user came from reset link
  //   supabase.auth.onAuthStateChange((event, session) => {
  //     if (event === "PASSWORD_RECOVERY") {
  //       setValidSession(true);
  //     }

        

  //   });
  // }, []);

  useEffect(() => {
  // URL se error check karo
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const error = hashParams.get('error');
  const errorCode = hashParams.get('error_code');
  
  if (error === 'access_denied' && errorCode === 'otp_expired') {
    setError('Reset link has expired. Please request a new one.');
    return;
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      setValidSession(true);
    }
  });
}, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Set New Password
        </h2>

        <p style={{ color: 'rgba(26, 26, 26, 0.7)', marginBottom: '2.5rem', fontSize: '1.05rem' }}>
          Enter your new password below.
        </p>

        {error && <p style={{ color: "red", marginBottom: '1rem', fontWeight: '500' }}>{error}</p>}
        {message && <p style={{ color: "green", marginBottom: '1rem', fontWeight: '500' }}>{message}</p>}

        <form onSubmit={handleUpdatePassword}>

          <div style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--charcoal)' }}>
              New Password
            </label>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="auth-input"
            style={{ marginBottom: '1.5rem' }}
          />

          <div style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--charcoal)' }}>
              Confirm Password
            </label>
          </div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="auth-input"
            style={{ marginBottom: '1.5rem' }}
          />

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default UpdatePasswordPage;