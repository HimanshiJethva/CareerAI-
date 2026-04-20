import { useState } from "react";
import { supabase } from "../../../backend/supabaseClient";
import { useNavigate } from "react-router-dom";

function ForgotPasswordPage() {
  // States
  const navigate = useNavigate();
  const [email, setEmail] = useState("");   
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    // Supabase logic to send reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/update-password', // Aapke app ka URL jahan user redirect hoga
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password reset link sent! Please check your email.");
      setEmail(""); // Input clear karne ke liye
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        {/* Heading */}
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Forgot Password?
        </h2>
        
        {/* Subtitle */}
        <p style={{ color: 'rgba(26, 26, 26, 0.7)', marginBottom: '2.5rem', fontSize: '1.05rem' }}>
          Enter your email and we'll send you a reset link.
        </p>

        {/* Success and Error Messages */}
        {error && <p style={{ color: "red", marginBottom: '1rem', fontWeight: '500' }}>{error}</p>}
        {message && <p style={{ color: "green", marginBottom: '1rem', fontWeight: '500' }}>{message}</p>}

        {/* Form */}
        <form onSubmit={handleReset}>
          
          {/* Email Label & Input */}
          <div style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--charcoal)' }}>
              Email Address
            </label>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="auth-input"
            style={{ marginBottom: '1.5rem' }}
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>

        {/* Back to Login Link */}
        <div style={{ marginTop: '2rem' }}>
          <span
            className="auth-link"
            style={{ 
              cursor: 'pointer', 
              color: 'var(--charcoal)', 
              fontWeight: '600', 
              fontSize: '1rem',
              transition: 'color 0.3s ease'
            }}
            onClick={() =>navigate('/login')}
            onMouseEnter={(e) => e.target.style.color = 'var(--coral)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--charcoal)'}
          >
            ← Back to Login
          </span>
        </div>

      </div>
    </div>
  );
}

export default ForgotPasswordPage;