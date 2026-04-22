import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { id: "s1",  label: "1. Information We Collect"              },
  { id: "s2",  label: "2. How We Use Your Information"         },
  { id: "s3",  label: "3. AI Model Training Disclosure"        },
  { id: "s4",  label: "4. Data Storage & Security"            },
  { id: "s5",  label: "5. Cookies & Tracking"                 },
  { id: "s6",  label: "6. Data Sharing & Third Parties"       },
  { id: "s7",  label: "7. Your Rights"                        },
  { id: "s8",  label: "8. Children's Privacy"                 },
  { id: "s9",  label: "9. Data Retention"                     },
  { id: "s10", label: "10. Changes to This Policy"            },
  { id: "s11", label: "11. Contact Us"                        },
];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const SectionTitle = ({ id, children }) => (
  <h2 id={id} style={{
    fontFamily: "Playfair Display, serif", fontSize: "1.3rem", fontWeight: 800,
    color: "#1a1a1a", marginBottom: "1rem", paddingBottom: 10,
    borderBottom: "2px solid #f1f5f9", scrollMarginTop: 90,
  }}>{children}</h2>
);

const P = ({ children }) => (
  <p style={{ fontSize: "0.95rem", color: "#555", lineHeight: 1.8, marginBottom: "0.875rem" }}>{children}</p>
);

const Li = ({ children }) => (
  <li style={{ fontSize: "0.95rem", color: "#555", lineHeight: 1.8, marginBottom: 6 }}>{children}</li>
);

const Warn = ({ children }) => (
  <div style={{ background: "#fff5f3", border: "1px solid #fecaca", borderRadius: 12, padding: "1rem 1.25rem", margin: "1rem 0" }}>
    <p style={{ fontSize: "0.9rem", color: "#dc2626", fontWeight: 700, margin: 0, lineHeight: 1.7 }}>{children}</p>
  </div>
);

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

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); document.title = "Privacy Policy | CareerAI"; }, []);

  return (
    <div style={{ fontFamily: "inherit", background: "#fff", minHeight: "100vh" }}>
      <NavBar navigate={navigate} />

      {/* HERO */}
      <section style={{ background: "#fff5f3", borderBottom: "1px solid #fecaca", padding: "3rem 2rem", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#fff", border: "1px solid #fecaca", color: "#f97066", padding: "5px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, marginBottom: "1rem", letterSpacing: 0.5 }}>
          🔒 Legal Document
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, color: "#1a1a1a", marginBottom: "0.75rem" }}>Privacy Policy</h1>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>Last updated: <strong>19 April 2026</strong> · Effective immediately</p>
      </section>

      {/* TWO-COLUMN LAYOUT */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem", display: "grid", gridTemplateColumns: "220px 1fr", gap: "3rem", alignItems: "start" }}>

        {/* STICKY TOC */}
        <div style={{ position: "sticky", top: 90, background: "#f8fafc", borderRadius: 14, border: "1px solid #f1f5f9", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f97066", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Contents</div>
          {NAV_ITEMS.map(item => (
            <div key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                fontSize: "0.8rem", color: "#64748b", cursor: "pointer",
                padding: "7px 0", borderBottom: "1px solid #f1f5f9",
                transition: "color 0.15s", lineHeight: 1.5,
              }}
              onMouseEnter={e => e.target.style.color = "#f97066"}
              onMouseLeave={e => e.target.style.color = "#64748b"}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div>
          <P>Welcome to CareerAI. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our AI-powered career prediction platform. By using CareerAI, you agree to the practices described in this policy.</P>

          <div style={{ marginBottom: "2.5rem" }}>
            <SectionTitle id="s1">1. Information We Collect</SectionTitle>
            <P><strong>Account Information:</strong> When you create an account, we collect your full name, email address, and a hashed (encrypted) password.</P>
            <P><strong>Prediction Input Data:</strong> When you use the career prediction form, we collect your educational stream, subject-wise academic marks, Big Five personality trait scores, interests, and extracurricular participation.</P>
            <P><strong>Prediction Output Data:</strong> We store the AI-generated career predictions, confidence scores, and explanations returned by our model.</P>
            <P><strong>Feedback Data:</strong> Star ratings and optional text comments you provide about prediction accuracy.</P>
            <P><strong>Usage Data:</strong> Browser type, device type, IP address, pages visited, and session duration — collected automatically via cookies.</P>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <SectionTitle id="s2">2. How We Use Your Information</SectionTitle>
            <ul style={{ paddingLeft: "1.5rem" }}>
              <Li>To provide and improve the AI career prediction service</Li>
              <Li>To authenticate your identity and manage your account</Li>
              <Li>To generate personalised career predictions using our ML model</Li>
              <Li>To store and display your prediction history</Li>
              <Li>To respond to your support queries and feedback</Li>
              <Li>To analyse platform usage patterns and improve user experience</Li>
              <Li>To send you important service notifications (not marketing, unless you opt in)</Li>
            </ul>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <SectionTitle id="s3">3. AI Model Training — Important Disclosure</SectionTitle>
            <Warn>⚠️ IMPORTANT: We may use your anonymised prediction data (inputs and outputs) to train and improve our AI model. This data is fully anonymised — your name and email are removed before any training use. You may opt out of this at any time in Settings → Notifications.</Warn>
            <P>Specifically, for AI training purposes:</P>
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
              <Li><strong>What we use:</strong> Educational stream, subject marks, personality scores, interests, predicted careers and your feedback rating</Li>
              <Li><strong>What we NEVER use for training:</strong> Your name, email address, or any directly identifying information</Li>
              <Li><strong>How it's anonymised:</strong> A one-way hash replaces your user ID. The original ID cannot be recovered.</Li>
              <Li><strong>Your control:</strong> You can opt out of model training data use from your Settings page at any time.</Li>
            </ul>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                <thead>
                  <tr>
                    {["Data Type", "Used for Predictions", "Used for AI Training", "Shared with 3rd Parties"].map(h => (
                      <th key={h} style={{ background: "#fff5f3", color: "#1a1a1a", fontWeight: 700, padding: "10px 14px", textAlign: "left", border: "1px solid #fecaca" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Name & Email", "Yes (auth only)", "No", "No"],
                    ["Academic Marks", "Yes", "Yes (anonymised)", "No"],
                    ["Personality Scores", "Yes", "Yes (anonymised)", "No"],
                    ["Interests & Activities", "Yes", "Yes (anonymised)", "No"],
                    ["Feedback Ratings", "Yes", "Yes (anonymised)", "No"],
                    ["Browsing/Usage Data", "No", "No", "No"],
                  ].map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ padding: "10px 14px", border: "1px solid #f1f5f9", color: "#555", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          {j > 0 ? (
                            <span style={{
                              display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700,
                              background: cell.startsWith("Yes") ? "#ecfdf5" : "#fef2f2",
                              color: cell.startsWith("Yes") ? "#16a34a" : "#dc2626",
                              border: `1px solid ${cell.startsWith("Yes") ? "#bbf7d0" : "#fecaca"}`,
                            }}>{cell}</span>
                          ) : <strong>{cell}</strong>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <SectionTitle id="s4">4. Data Storage & Security</SectionTitle>
            <P>Your data is stored securely on Supabase (PostgreSQL) servers. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Passwords are never stored in plain text — we use bcrypt hashing via Supabase Auth.</P>
            <Warn>We take data security seriously, but no system is 100% secure. In the event of a data breach, we will notify affected users within 72 hours as required by applicable data protection laws.</Warn>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <SectionTitle id="s5">5. Cookies & Tracking</SectionTitle>
            <ul style={{ paddingLeft: "1.5rem" }}>
              <Li><strong>Essential Cookies:</strong> Required for authentication and session management. Cannot be disabled.</Li>
              <Li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform. Anonymised and aggregated.</Li>
              <Li><strong>Preference Cookies:</strong> Store your UI preferences such as cookie consent status.</Li>
            </ul>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <SectionTitle id="s6">6. Data Sharing & Third Parties</SectionTitle>
            <P><strong>We do not sell your personal data.</strong> We do not share your identifiable data with advertisers, data brokers, or marketing companies.</P>
            <P>We use the following trusted third-party services:</P>
            <ul style={{ paddingLeft: "1.5rem" }}>
              <Li><strong>Supabase</strong> — Database and authentication (GDPR compliant)</Li>
              <Li><strong>Vercel / hosting provider</strong> — Web hosting and CDN</Li>
            </ul>
            <P>We may disclose your data if required by law, court order, or to protect the safety of our users.</P>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <SectionTitle id="s7">7. Your Rights</SectionTitle>
            <ul style={{ paddingLeft: "1.5rem" }}>
              <Li><strong>Right to Access:</strong> Request a copy of all data we hold about you</Li>
              <Li><strong>Right to Rectification:</strong> Correct inaccurate personal data</Li>
              <Li><strong>Right to Erasure:</strong> Request deletion of your account and all associated data</Li>
              <Li><strong>Right to Portability:</strong> Receive your data in a machine-readable format</Li>
              <Li><strong>Right to Object to AI Training:</strong> Opt out of your anonymised data being used for model training</Li>
              <Li><strong>Right to Withdraw Consent:</strong> Withdraw consent for non-essential data processing at any time</Li>
            </ul>
            <P>To exercise any of these rights, email us at <strong>privacy@careerai.com</strong>. We will respond within 30 days.</P>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <SectionTitle id="s8">8. Children's Privacy</SectionTitle>
            <P>CareerAI is intended for students aged 13 and older. We do not knowingly collect personal information from children under 13. If a parent or guardian becomes aware that their child has provided data without consent, please contact us immediately and we will delete the information promptly.</P>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <SectionTitle id="s9">9. Data Retention</SectionTitle>
            <P>We retain your data for as long as your account is active. If you delete your account, we will delete all personally identifiable data within 30 days. Anonymised prediction data used for AI training may be retained indefinitely as it contains no personally identifying information. Backup copies may be retained for up to 90 days after deletion.</P>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <SectionTitle id="s10">10. Changes to This Policy</SectionTitle>
            <P>We may update this Privacy Policy periodically. When we make significant changes, we will notify you via email and display a notice on our platform. The "Last updated" date at the top of this page reflects the most recent revision.</P>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <SectionTitle id="s11">11. Contact Us</SectionTitle>
            <P>If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:</P>
            <div style={{ background: "#fff5f3", border: "1px solid #fecaca", borderRadius: 14, padding: "1.25rem 1.5rem" }}>
              <p style={{ fontSize: "1rem", color: "#1a1a1a", fontWeight: 700, margin: "0 0 6px" }}>CareerAI Privacy Team</p>
              <p style={{ fontSize: "0.9rem", color: "#666", margin: "0 0 4px" }}>📧 support.career.ai@gmail.com</p>
              <p style={{ fontSize: "0.9rem", color: "#666", margin: "0 0 4px" }}>📍 Ahmedabad, Gujarat, India</p>
              <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>🕐 Response time: Within 30 days</p>
            </div>
          </div>
        </div>
      </div>

      <Footer navigate={navigate} />
    </div>
  );
}
