import { useNavigate } from "react-router-dom";

// Map footer link labels to their routes
const LINK_ROUTES = {
  // Product
  "Features":    "/#features",
  "Pricing":     "/",
  "API":         "/",
  "Case Studies":"/",
  // Company
  "About":       "/about",
  "Careers":     "/about",
  "Blog":        "/",
  "Contact":     "/contact",
  // Legal
  "Privacy":     "/privacy",
  "Terms":       "/terms",
  "Security":    "/privacy",
  "GDPR":        "/privacy",
};

function FooterSection({ title, links }) {
  const navigate = useNavigate();

  const handleClick = (link) => {
    const route = LINK_ROUTES[link] || "/";
    if (route.startsWith("/#")) {
      // anchor link — go home then scroll
      navigate("/");
      setTimeout(() => {
        const id = route.replace("/#", "");
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      navigate(route);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="footer-section">
      <h4 style={{
        color: "var(--coral)",
        fontSize: "1.1rem",
        fontWeight: "700",
        marginBottom: "1.5rem",
        letterSpacing: "0.5px",
      }}>
        {title}
      </h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {links.map((link) => (
          <li key={link} style={{ marginBottom: "0.875rem" }}>
            <span
              onClick={() => handleClick(link)}
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "color 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={e => e.target.style.color = "var(--coral)"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.7)"}
            >
              {link}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FooterSection;
// function FooterSection({ title, links }) {
//    return (
//      <div className="footer-section">
//        <h4>{title}</h4>
//        <ul className="footer-links">
//          {links.map((link) => (
//            <li key={link}><a href={`#${link.toLowerCase()}`}>{link}</a></li>
//          ))}
//        </ul>
//      </div>
//    )
//  }
//  export default FooterSection