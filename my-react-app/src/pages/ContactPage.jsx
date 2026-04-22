import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../backend/supabaseClient";
import toast from "react-hot-toast";

const NavBar = ({ navigate }) => (
  <header style={{ background: "var(--cream, #fdf6f4)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100 }}>
    <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span onClick={() => navigate("/")} style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, fontSize: "1.6rem", cursor: "pointer", color: "var(--charcoal, #1a1a1a)" }}>CareerAI</span>
      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        {[["Home", "/"], ["About", "/about"], ["Contact", "/contact"]].map(([l, p]) => (
          <span key={l} onClick={() => navigate(p)} style={{ fontSize: "0.95rem", cursor: "pointer", color: "#1a1a1a", fontWeight: l === "Contact" ? 700 : 500, opacity: l === "Contact" ? 1 : 0.7 }}>{l}</span>
        ))}
        <button onClick={() => navigate("/login")} style={{ background: "var(--coral, #f97066)", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 25, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>Get Started</button>
      </div>
    </nav>
  </header>
);

const Footer = ({ navigate }) => (
  <footer style={{ background: "#1a1a1a", padding: "2rem", textAlign: "center" }}>
    <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
      {[["Home", "/"], ["About", "/about"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"]].map(([l, p]) => (
        <span key={l} onClick={() => { navigate(p); window.scrollTo(0, 0); }}
          style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
          onMouseEnter={e => e.target.style.color = "#f97066"}
          onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
        >{l}</span>
      ))}
    </div>
    <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.35)" }}>©2026 CareerAI. Made with ❤️ in India.</p>
  </footer>
);

export default function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); document.title = "Contact | CareerAI"; }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Please fill all required fields"); return; }
    setLoading(true);
    const { error } = await supabase.from("contacts").insert([{ name: form.name, email: form.email, subject: form.subject, message: form.message }]);
    setLoading(false);
    if (!error) { setSent(true); toast.success("Message sent! We'll reply within 24 hours."); }
    else toast.error("Failed to send. Please email us directly at support@careerai.com");
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", background: "#f8fafc",
    fontSize: "0.95rem", color: "#1a1a1a", outline: "none",
    fontFamily: "inherit", transition: "border 0.2s", marginBottom: 16,
    boxSizing: "border-box",
  };

  return (
    <div style={{ fontFamily: "inherit", background: "#fff", minHeight: "100vh" }}>
      <NavBar navigate={navigate} />

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", padding: "4rem 2rem", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 800, color: "#fff", marginBottom: "0.875rem" }}>Get In Touch</h1>
        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.6)", maxWidth: 480, margin: "0 auto" }}>Have a question, suggestion or need help? We'd love to hear from you.</p>
      </section>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "4rem 2rem", display: "grid", gridTemplateColumns: "1fr 1.7fr", gap: "3rem", alignItems: "start" }}>

        {/* INFO COLUMN */}
        <div>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "1rem" }}>Contact Information</h2>
          <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.7, marginBottom: "1.5rem" }}>Reach out through any of the following channels. We respond to all queries within 24 hours.</p>
          {[
            { icon: "📧", label: "Email", value: "support@careerai.com" },
            { icon: "📍", label: "Location", value: "Ahmedabad, Gujarat, India" },
            { icon: "🕐", label: "Response Time", value: "Within 24 hours" },
            { icon: "💬", label: "Support Hours", value: "Mon–Sat, 9 AM – 6 PM IST" },
          ].map(c => (
            <div key={c.label} style={{ background: "#fff5f3", border: "1px solid #fecaca", borderRadius: 14, padding: "1rem 1.25rem", marginBottom: 12, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: 22 }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f97066", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: "0.95rem", color: "#1a1a1a", fontWeight: 500 }}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FORM COLUMN */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f1f5f9", padding: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: 64, marginBottom: "1rem" }}>✅</div>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 8 }}>Message Sent!</h3>
              <p style={{ color: "#666", fontSize: "0.95rem" }}>Thank you! We'll reply to {form.email} within 24 hours.</p>
            </div>
          ) : (
            <>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.5rem" }}>Send us a Message</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Full Name *</label>
                    <input type="text" placeholder="Your name" value={form.name} onChange={set("name")} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Email Address *</label>
                    <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required style={inputStyle} />
                  </div>
                </div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Subject</label>
                <select value={form.subject} onChange={set("subject")} style={inputStyle}>
                  <option value="">Select a topic</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Prediction Feedback">Prediction Feedback</option>
                  <option value="Privacy / Data">Privacy / Data Request</option>
                  <option value="Partnership">Partnership Inquiry</option>
                  <option value="Other">Other</option>
                </select>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Message *</label>
                <textarea placeholder="Describe your query in detail..." value={form.message} onChange={set("message")} required
                  style={{ ...inputStyle, minHeight: 130, resize: "vertical" }} />
                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: "13px", borderRadius: 12,
                  background: "var(--coral, #f97066)", color: "#fff", border: "none",
                  fontSize: "1rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1, fontFamily: "inherit",
                }}>
                  {loading ? "Sending..." : "Send Message →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <Footer navigate={navigate} />
    </div>
  );
}
