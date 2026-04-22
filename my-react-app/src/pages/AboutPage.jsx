import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AboutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "About | CareerAI";
  }, []);

  return (
    <div style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)", background: "#fff", minHeight: "100vh" }}>

      {/* ── NAVBAR — matches landing page style ── */}
      <header style={{
        background: "var(--cream, #fdf6f4)", borderBottom: "1px solid rgba(0,0,0,0.06)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <nav style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 2rem",
          height: 72, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span
            onClick={() => navigate("/")}
            style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, fontSize: "1.6rem", cursor: "pointer", color: "var(--charcoal, #1a1a1a)" }}
          >
            CareerAI
          </span>
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            {[["Home", "/"], ["About", "/about"], ["Contact", "/contact"]].map(([l, p]) => (
              <span key={l} onClick={() => navigate(p)} style={{
                fontSize: "0.95rem", fontWeight: 500, color: "var(--charcoal, #1a1a1a)",
                cursor: "pointer", opacity: l === "About" ? 1 : 0.7,
                fontWeight: l === "About" ? 700 : 500,
              }}>{l}</span>
            ))}
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "var(--coral, #f97066)", color: "#fff", border: "none",
                padding: "10px 22px", borderRadius: 25, fontWeight: 700, fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        padding: "5rem 2rem", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* glow */}
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,112,102,0.2) 0%, transparent 65%)",
          top: -100, right: -80, pointerEvents: "none",
        }} />
        <div style={{
          display: "inline-block", background: "rgba(249,112,102,0.15)",
          border: "1px solid rgba(249,112,102,0.4)", color: "var(--coral, #f97066)",
          padding: "6px 18px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 700,
          marginBottom: "1.25rem", letterSpacing: 1,
        }}>
          🤖 AI-POWERED CAREER GUIDANCE
        </div>
        <h1 style={{
          fontFamily: "Playfair Display, serif", fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 800, color: "#fff", marginBottom: "1rem",
        }}>
          About CareerAI
        </h1>
        <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", maxWidth: 560, margin: "0 auto" }}>
          We believe every student deserves clarity about their future. CareerAI uses machine learning to match your unique profile with the right career path.
        </p>
      </section>

      {/* ── MISSION ── */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "4rem 2rem" }}>
        <p style={{ color: "var(--coral, #f97066)", fontWeight: 700, letterSpacing: 2, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          OUR MISSION
        </p>
        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.6rem, 3vw, 2.5rem)", fontWeight: 800, color: "#1a1a1a", marginBottom: "1.25rem" }}>
          Empowering students with data-driven career clarity
        </h2>
        <p style={{ fontSize: "1rem", color: "#555", lineHeight: 1.8, marginBottom: "1rem" }}>
          Career confusion is one of the biggest challenges students face after Class 12. With hundreds of options, choosing the right path without guidance often leads to regret. CareerAI was built to solve this — combining academic performance, personality science, and interest mapping into a single AI-powered prediction engine.
        </p>
        <p style={{ fontSize: "1rem", color: "#555", lineHeight: 1.8 }}>
          We believe career guidance shouldn't be limited to students who can afford private counsellors. CareerAI is free, accessible, and scientifically grounded.
        </p>

        {/* 3 feature cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: "2rem" }}>
          {[
            { icon: "🎯", title: "Precision Matching", desc: "Our AI analyses 100+ data points from your academic and personality profile to deliver accurate career predictions." },
            { icon: "🔒", title: "Privacy First", desc: "Your data is encrypted and never sold. Prediction data is used only to improve our model, with your consent." },
            { icon: "📊", title: "Evidence-Based", desc: "Built on Big Five personality science and academic performance research from thousands of successful professionals." },
          ].map((c) => (
            <div key={c.title} style={{
              background: "#fff5f3", border: "1px solid #fecaca", borderRadius: 16, padding: "1.5rem",
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</div>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>{c.title}</h3>
              <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* divider */}
      <div style={{ height: 1, background: "#f1f5f9", maxWidth: 960, margin: "0 auto" }} />

      {/* ── STATS ── */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "4rem 2rem" }}>
        <p style={{ color: "var(--coral, #f97066)", fontWeight: 700, letterSpacing: 2, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>BY THE NUMBERS</p>
        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.6rem, 3vw, 2.5rem)", fontWeight: 800, color: "#1a1a1a", marginBottom: "2rem" }}>Trusted by students across India</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
          {[
            { num: "50,000+", label: "Career Predictions Made" },
            { num: "91.9%",   label: "Model Accuracy Rate"    },
            { num: "4",       label: "Stream Specialisations" },
            { num: "100+",    label: "Data Points Analysed"   },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center", padding: "1.5rem", background: "#fff5f3", borderRadius: 14, border: "1px solid #fecaca" }}>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: "2.2rem", fontWeight: 800, color: "var(--coral, #f97066)" }}>{s.num}</div>
              <div style={{ fontSize: "0.85rem", color: "#666", marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: 1, background: "#f1f5f9", maxWidth: 960, margin: "0 auto" }} />

      {/* ── TECHNOLOGY ── */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "4rem 2rem" }}>
        <p style={{ color: "var(--coral, #f97066)", fontWeight: 700, letterSpacing: 2, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>TECHNOLOGY</p>
        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.6rem, 3vw, 2.5rem)", fontWeight: 800, color: "#1a1a1a", marginBottom: "1.25rem" }}>How CareerAI works under the hood</h2>
        <p style={{ fontSize: "1rem", color: "#555", lineHeight: 1.8, marginBottom: "1rem" }}>
          CareerAI is built on a supervised machine learning model trained on thousands of student-career outcome datasets. The model uses the Big Five personality framework (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism), academic marks, stream selection, and extracurricular interests as input features.
        </p>
        <p style={{ fontSize: "1rem", color: "#555", lineHeight: 1.8 }}>
          The prediction engine returns the top 3 career matches with confidence scores and reasoning. Our backend is powered by FastAPI (Python) and our frontend is React with Supabase for authentication and data storage.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: "1.5rem" }}>
          {["React", "Python FastAPI", "Supabase", "Machine Learning", "Big Five Personality Model", "Scikit-Learn", "PostgreSQL"].map(t => (
            <span key={t} style={{ padding: "8px 16px", borderRadius: 20, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "0.85rem", fontWeight: 600, color: "#1a1a1a" }}>{t}</span>
          ))}
        </div>
      </section>

      <div style={{ height: 1, background: "#f1f5f9", maxWidth: 960, margin: "0 auto" }} />

      {/* ── AI DISCLAIMER ── */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "4rem 2rem" }}>
        <p style={{ color: "var(--coral, #f97066)", fontWeight: 700, letterSpacing: 2, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>IMPORTANT NOTE</p>
        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.6rem, 3vw, 2.5rem)", fontWeight: 800, color: "#1a1a1a", marginBottom: "1.25rem" }}>AI can make mistakes — always double-check</h2>
        <p style={{ fontSize: "1rem", color: "#555", lineHeight: 1.8, marginBottom: "1rem" }}>
          CareerAI predictions are AI-generated suggestions based on patterns in training data. While our model achieves high accuracy, <strong>no AI system is 100% correct</strong>. Predictions should be used as a starting point for exploration, not a definitive answer.
        </p>
        <div style={{ background: "#fff5f3", border: "1px solid #fecaca", borderRadius: 14, padding: "1rem 1.5rem", marginTop: "1rem" }}>
          <p style={{ color: "#dc2626", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
            ⚠️ Disclaimer: CareerAI predictions are AI-generated suggestions for informational purposes only. Always consult a qualified professional for important life decisions.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: "var(--coral, #f97066)", padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "#fff", marginBottom: "1rem" }}>Ready to discover your career path?</h2>
        <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.85)", marginBottom: "2rem" }}>It takes just 5 minutes. Answer a few questions and let our AI do the rest.</p>
        <button
          onClick={() => navigate("/signup")}
          style={{ padding: "14px 36px", borderRadius: 30, background: "#fff", color: "var(--coral, #f97066)", border: "none", fontSize: "1rem", fontWeight: 800, cursor: "pointer" }}
        >
          Start Free Prediction →
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#1a1a1a", padding: "2rem", textAlign: "center" }}>
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
          {[["Home", "/"], ["About", "/about"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"]].map(([l, p]) => (
            <span key={l} onClick={() => { navigate(p); window.scrollTo(0,0); }}
              style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
              onMouseEnter={e => e.target.style.color = "var(--coral, #f97066)"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
            >{l}</span>
          ))}
        </div>
        <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.35)" }}>©2026 CareerAI. Made with ❤️ in India.</p>
      </footer>
    </div>
  );
}
