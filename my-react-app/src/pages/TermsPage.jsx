import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SectionTitle = ({ id, children }) => (
  <h2 id={id} style={{
    fontFamily: "Playfair Display, serif", fontSize: "1.3rem", fontWeight: 800,
    color: "#1a1a1a", marginBottom: "1rem", paddingBottom: 10,
    borderBottom: "2px solid #f1f5f9", scrollMarginTop: 90,
  }}>{children}</h2>
);
const P = ({ children }) => <p style={{ fontSize: "0.95rem", color: "#555", lineHeight: 1.8, marginBottom: "0.875rem" }}>{children}</p>;
const Li = ({ children }) => <li style={{ fontSize: "0.95rem", color: "#555", lineHeight: 1.8, marginBottom: 6 }}>{children}</li>;

const NavBar = ({ navigate }) => (
  <header style={{ background: "var(--cream, #fdf6f4)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100 }}>
    <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span onClick={() => navigate("/")} style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, fontSize: "1.6rem", cursor: "pointer", color: "#1a1a1a" }}>CareerAI</span>
      <button onClick={() => navigate("/login")} style={{ background: "#f97066", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 25, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>Get Started</button>
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

export default function TermsPage() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); document.title = "Terms of Service | CareerAI"; }, []);

  return (
    <div style={{ fontFamily: "inherit", background: "#fff", minHeight: "100vh" }}>
      <NavBar navigate={navigate} />

      {/* HERO */}
      <section style={{ background: "#fff5f3", borderBottom: "1px solid #fecaca", padding: "3rem 2rem", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#fff", border: "1px solid #fecaca", color: "#f97066", padding: "5px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, marginBottom: "1rem" }}>
          📋 Legal Document
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, color: "#1a1a1a", marginBottom: "0.75rem" }}>Terms of Service</h1>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>Last updated: <strong>19 April 2026</strong> · Please read carefully before using CareerAI</p>
      </section>

      {/* CONTENT */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 2rem" }}>

        <P>These Terms of Service ("Terms") govern your access to and use of CareerAI ("Service"). By creating an account or using our Service, you agree to be bound by these Terms. If you do not agree, please do not use our Service.</P>

        <div style={{ marginBottom: "2.5rem" }}>
          <SectionTitle id="t1">1. Acceptance of Terms</SectionTitle>
          <P>By accessing or using CareerAI, you confirm that you are at least 13 years of age, have read and understood these Terms, and agree to be bound by them. If you are under 18, you should use CareerAI with parental awareness.</P>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          <SectionTitle id="t2">2. Description of Service</SectionTitle>
          <P>CareerAI is an AI-powered career prediction platform that analyses a student's academic performance, personality traits, and interests to suggest suitable career paths. The service is provided free of charge for individual student use.</P>
          <P>We reserve the right to modify, suspend, or discontinue the Service at any time with reasonable notice.</P>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          <SectionTitle id="t3">3. AI Disclaimer — Critical</SectionTitle>
          <div style={{ background: "#fff5f3", border: "1px solid #fecaca", borderRadius: 12, padding: "1rem 1.25rem" }}>
            <p style={{ color: "#dc2626", fontWeight: 700, fontSize: "0.9rem", margin: "0 0 8px" }}>⚠️ IMPORTANT — Please Read</p>
            <p style={{ color: "#555", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>
              CareerAI predictions are generated by a machine learning model and are provided <strong>for informational and exploratory purposes only</strong>. They do not constitute professional career counselling, educational advice, or any form of guaranteed outcome.
              AI models can and do make mistakes. <strong>Always verify predictions with a qualified career counsellor, teacher, or trusted mentor before making major life decisions.</strong>
            </p>
          </div>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          <SectionTitle id="t4">4. User Accounts</SectionTitle>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <Li>You are responsible for maintaining the confidentiality of your account credentials</Li>
            <Li>You must provide accurate and truthful information when creating your account</Li>
            <Li>You are responsible for all activity that occurs under your account</Li>
            <Li>You must notify us immediately of any unauthorised access to your account</Li>
            <Li>We reserve the right to suspend accounts that violate these Terms</Li>
          </ul>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          <SectionTitle id="t5">5. Acceptable Use</SectionTitle>
          <P>You agree not to:</P>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <Li>Use the Service for any unlawful purpose or in violation of these Terms</Li>
            <Li>Attempt to reverse-engineer, scrape, or extract our AI model or training data</Li>
            <Li>Submit false or misleading information to manipulate prediction results</Li>
            <Li>Use the Service to harass, harm, or impersonate others</Li>
            <Li>Use automated bots or scripts to access the Service</Li>
          </ul>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          <SectionTitle id="t6">6. Intellectual Property</SectionTitle>
          <P>All content, code, design, AI models, and materials on CareerAI are the property of CareerAI and are protected by applicable intellectual property laws. You may not copy, reproduce, distribute, or create derivative works from our content without written permission.</P>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          <SectionTitle id="t7">7. Data & Privacy</SectionTitle>
          <P>Your use of CareerAI is governed by our{" "}
            <span onClick={() => { navigate("/privacy"); window.scrollTo(0,0); }} style={{ color: "#f97066", cursor: "pointer", fontWeight: 600 }}>Privacy Policy</span>,
            which is incorporated into these Terms by reference. By using our Service, you consent to the data practices described therein, including anonymised use of prediction data for AI model improvement.
          </P>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          <SectionTitle id="t8">8. Limitation of Liability</SectionTitle>
          <P>To the fullest extent permitted by law, CareerAI and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to:</P>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <Li>Career decisions made based on AI predictions</Li>
            <Li>Loss of data or account access</Li>
            <Li>Inaccuracy of AI-generated career suggestions</Li>
            <Li>Service interruptions or downtime</Li>
          </ul>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          <SectionTitle id="t9">9. Termination</SectionTitle>
          <P>You may delete your account at any time by contacting us at support@careerai.com. We may terminate or suspend your account if you breach these Terms, without prior notice. Upon termination, your right to use the Service ceases immediately.</P>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          <SectionTitle id="t10">10. Governing Law</SectionTitle>
          <P>These Terms are governed by the laws of India. Any disputes arising from your use of CareerAI shall be subject to the exclusive jurisdiction of the courts in Ahmedabad, Gujarat, India.</P>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          <SectionTitle id="t11">11. Changes to Terms</SectionTitle>
          <P>We may update these Terms periodically. We will notify you of significant changes via email. Continued use of the Service after changes constitutes acceptance of the updated Terms.</P>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          <SectionTitle id="t12">12. Contact</SectionTitle>
          <P>For questions about these Terms, contact us at <strong>support.career.ai@gmail.com</strong> or visit our{" "}
            <span onClick={() => { navigate("/contact"); window.scrollTo(0,0); }} style={{ color: "#f97066", cursor: "pointer", fontWeight: 600 }}>Contact page</span>.
          </P>
        </div>
      </div>

      <Footer navigate={navigate} />
    </div>
  );
}
