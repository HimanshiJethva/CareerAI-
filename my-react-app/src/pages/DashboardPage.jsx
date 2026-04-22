import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { supabase } from "../../../backend/supabaseClient";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const slugLabel = (s) => s.replace(/([A-Z])/g, " $1").trim();

// Properly formats any name or email into "First Last" with spaces
const formatName = (raw = "") => {
  if (!raw) return "Student";
  let name = raw.includes("@") ? raw.split("@")[0] : raw;
  // replace dots, underscores, hyphens with spaces then capitalise each word
  return name
    .replace(/[._\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/* ─────────────────────────────────────────────
   YOUR EXACT WEBSITE COLORS (from screenshots)
   Coral/salmon = #f97066 / #ef4444 range
   Background   = #fdf0ee (light peach)
   Dark sidebar  = #0f172a navy
───────────────────────────────────────────── */
const C = {
  // exact coral from your "Start Free Prediction" button & CTA banner
  primary:    "#f97066",
  primary2:   "#ef4444",
  primaryDark:"#dc2626",
  // light coral tints for soft backgrounds
  soft:       "#fff5f3",
  softBorder: "#fecaca",
  softMid:    "#fed7aa",
  // page background – the peach/cream you see behind all forms
  pageBg:     "#fdf6f4",
  // sidebar dark navy (exactly as in your screenshot)
  dark:       "#0f172a",
  dark2:      "#1a1035",
  // text
  text:       "#1e293b",
  muted:      "#64748b",
  border:     "#f1f5f9",
  cardBg:     "#ffffff",
};

/* ─────────────────────────────────────────────
   DATA CONFIG
───────────────────────────────────────────── */
const STREAMS = [
  { id:"Science_PCM", label:"Science PCM", icon:"⚛️", color:"#3b82f6", bg:"#eff6ff", desc:"Physics · Chemistry · Mathematics" },
  { id:"Science_PCB", label:"Science PCB", icon:"🧬", color:"#10b981", bg:"#ecfdf5", desc:"Physics · Chemistry · Biology"    },
  { id:"Commerce",    label:"Commerce",    icon:"📈", color:"#f97066", bg:"#fff5f3", desc:"Accountancy · Business · Economics"},
  { id:"Arts",        label:"Arts",        icon:"🎨", color:"#8b5cf6", bg:"#faf5ff", desc:"History · Geography · Sociology"  },
];

const TRAITS = [
  { id:"Oppenness",        label:"Creativity & Learning",       icon:"💡" },
  { id:"Conscientiousness",label:"Discipline & Planning",       icon:"🎯" },
  { id:"Extraversion",     label:"Socializing & Communication", icon:"🗣️" },
  { id:"Agreeableness",    label:"Friendliness & Teamwork",     icon:"🤝" },
  { id:"Neuroticism",      label:"Stress Management",           icon:"🧘" },
];

const INTERESTS      = ["Tech","Entrepreneurship","Leadership","Innovation","CriticalThinking","Research","ComputerSkill","HardwareSkill","Food","Creativity"];
const PARTICIPATIONS = ["Hackathon","Olympiad","Kabaddi","KhoKho","Cricket"];

const STEPS = [
  { n:1, t:"Stream Selection",   s:"Basic Info",       icon:"🎓" },
  { n:2, t:"Academic Marks",     s:"Subject Scores",   icon:"📝" },
  { n:3, t:"Personality Traits", s:"Big Five Scaling", icon:"🧠" },
  { n:4, t:"Interests & Skills", s:"Final Assessment", icon:"⭐" },
  { n:5, t:"AI Results",         s:"Prediction",       icon:"🚀" },
];

const EMPTY_FORM = {
  Stream:"",Physics:"",Chemistry:"",Biology:"",English:"",
  ComputerScience:"",Mathematics:"",Accountancy:"",BusinessStudies:"",
  Economics:"",History:"",Geography:"",PoliticalScience:"",Sociology:"",
  Interest_Tech:false,Interest_Entrepreneurship:false,Interest_Leadership:false,
  Interest_Innovation:false,Interest_CriticalThinking:false,Interest_Research:false,
  Interest_ComputerSkill:false,Interest_HardwareSkill:false,
  Interest_Food:false,Interest_Creativity:false,PositiveThinking:false,
  Participated_Hackathon:false,Participated_Olympiad:false,
  Participated_Kabaddi:false,Participated_KhoKho:false,Participated_Cricket:false,
  Oppenness:3,Conscientiousness:3,Extraversion:3,Agreeableness:3,Neuroticism:3,
};

/* ─────────────────────────────────────────────
   CHART COMPONENT (Chart.js via CDN script)
───────────────────────────────────────────── */
function ResultsChart({ predictions }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    // dynamically load Chart.js if not already loaded
    const init = () => {
      if (!canvasRef.current) return;
      if (chartRef.current) { chartRef.current.destroy(); }
      const ctx = canvasRef.current.getContext("2d");
      const careers     = predictions.map(p => p.career);
      const confidences = predictions.map(p => p.confidence);
      chartRef.current = new window.Chart(ctx, {
        type: "bar",
        data: {
          labels: careers,
          datasets: [{
            label: "Match Confidence (%)",
            data: confidences,
            backgroundColor: [
              "rgba(249,112,102,0.85)",
              "rgba(239,68,68,0.7)",
              "rgba(252,165,165,0.7)",
            ],
            borderColor: ["#f97066","#ef4444","#fca5a5"],
            borderWidth: 2,
            borderRadius: 10,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y}% match confidence`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family:"DM Sans", size:13, weight:"600" }, color:"#374151" },
            },
            y: {
              beginAtZero: true, max: 100,
              grid: { color:"#f1f5f9" },
              ticks: {
                callback: (v) => v + "%",
                font: { family:"DM Sans", size:12 }, color:"#94a3b8",
              },
            },
          },
          animation: { duration: 1200, easing: "easeOutQuart" },
        },
      });
    };

    if (window.Chart) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
      script.onload = init;
      document.head.appendChild(script);
    }
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [predictions]);

  return (
    <div style={{ position:"relative", width:"100%", height:260, marginBottom:"1.5rem" }}>
      <canvas ref={canvasRef}
        role="img"
        aria-label={`Bar chart showing career match confidences: ${predictions.map(p=>`${p.career} ${p.confidence}%`).join(", ")}`}>
        {predictions.map(p=>`${p.career}: ${p.confidence}%`).join(", ")}
      </canvas>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RESULT BAR CARD
───────────────────────────────────────────── */
function ResultBar({ career, confidence, reason, index }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(confidence), 400 + index * 200);
    return () => clearTimeout(t);
  }, [confidence, index]);
  const colors  = [C.primary, C.primary2, "#fca5a5"];
  const textC   = [C.primary, C.primary2, "#ef4444"];
  const medals  = ["🥇","🥈","🥉"];
  const c = colors[index] || C.muted;
  const tc = textC[index] || C.muted;
  return (
    <div style={{ background:"#fff", borderRadius:14, padding:"1.25rem 1.5rem",
      border:`1px solid ${C.border}`, boxShadow:"0 2px 10px rgba(0,0,0,0.04)",
      marginBottom:"0.75rem", animation:`slideUp 0.5s ease ${index*0.15}s both` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>{medals[index]}</span>
          <span style={{ fontWeight:700, fontSize:15, color:C.text }}>{career}</span>
        </div>
        <span style={{ background:c+"18", color:tc, fontWeight:700, fontSize:13,
          padding:"3px 12px", borderRadius:20, border:`1px solid ${c}30` }}>
          {confidence}%
        </span>
      </div>
      <div style={{ background:"#f1f5f9", borderRadius:6, height:8, overflow:"hidden", marginBottom:8 }}>
        <div style={{ width:`${w}%`, height:"100%", borderRadius:6,
          background:`linear-gradient(90deg,${c},${c}cc)`,
          transition:"width 1.1s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
      <p style={{ color:C.muted, fontSize:13, lineHeight:1.6, margin:0 }}>{reason}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOADING OVERLAY
───────────────────────────────────────────── */
function PredictingOverlay() {
  const msgs = [
    "🔍 Analyzing your academic profile...",
    "🧠 Processing personality traits...",
    "⭐ Matching your interests & skills...",
    "🤖 AI is predicting your career...",
    "✨ Almost there, finalizing results...",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % msgs.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000,
      background:"rgba(15,23,42,0.9)", backdropFilter:"blur(8px)",
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", gap:24 }}>
      <div style={{ position:"relative", width:110, height:110 }}>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%",
          border:"3px solid transparent", borderTopColor:C.primary,
          animation:"spin 1s linear infinite" }} />
        <div style={{ position:"absolute", inset:10, borderRadius:"50%",
          border:"3px solid transparent", borderTopColor:C.primary2,
          animation:"spin 1.6s linear infinite reverse" }} />
        <div style={{ position:"absolute", inset:20, borderRadius:"50%",
          border:"2px solid transparent", borderTopColor:"#fca5a5",
          animation:"spin 2.2s linear infinite" }} />
        <div style={{ position:"absolute", inset:0, display:"flex",
          alignItems:"center", justifyContent:"center", fontSize:36 }}>🤖</div>
      </div>
      <div style={{ color:"#fff", fontSize:17, fontWeight:600, textAlign:"center",
        maxWidth:320, animation:"fadeInOut 1.8s ease infinite" }}>{msgs[idx]}</div>
      <div style={{ display:"flex", gap:8 }}>
        {msgs.map((_,i) => (
          <div key={i} style={{ width:8, height:8, borderRadius:"50%",
            background: i===idx ? C.primary : "rgba(255,255,255,0.25)",
            transition:"background 0.3s" }} />
        ))}
      </div>
      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>
        This may take a few seconds...
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONFIRM DIALOG
───────────────────────────────────────────── */
function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:999,
      background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)",
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:"2rem",
        maxWidth:380, width:"90%", textAlign:"center",
        boxShadow:"0 20px 60px rgba(0,0,0,0.25)",
        animation:"popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
        <h3 style={{ color:C.text, fontSize:20, fontWeight:700, marginBottom:8 }}>Start Over?</h3>
        <p style={{ color:C.muted, fontSize:14, lineHeight:1.7, marginBottom:24 }}>
          This will <strong>permanently clear</strong> all your entered data and prediction results. This cannot be undone.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button onClick={onCancel} style={{ padding:"10px 24px", borderRadius:10,
            border:"1.5px solid #e2e8f0", background:"#fff", color:C.muted,
            fontWeight:600, cursor:"pointer", fontSize:14, fontFamily:"inherit" }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ padding:"10px 24px", borderRadius:10,
            border:"none", background:"linear-gradient(135deg,#ef4444,#dc2626)",
            color:"#fff", fontWeight:600, cursor:"pointer", fontSize:14, fontFamily:"inherit" }}>
            Yes, Clear All
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MARK INPUT — validation note below
───────────────────────────────────────────── */
// VALIDATION DECISION:
// Min is 0 (not 33) — because students who failed still have a score.
// A student who scored 20% is still a real data point for career prediction.
// We only reject truly invalid inputs: empty, below 0, or above 100.
function MarkInput({ label, name, val, fn }) {
  const [err, setErr] = useState("");
  const onChange = (e) => {
    const v = e.target.value;
    fn(name, v);
    if (!v) { setErr(""); return; }
    const n = parseFloat(v);
    if (isNaN(n) || n < 0 || n > 100) setErr("Enter a value between 0 and 100");
    else setErr("");
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:13, fontWeight:600, color:"#475569" }}>{label}</label>
      <input
        type="number" min={0} max={100} value={val}
        onChange={onChange} placeholder="0 – 100"
        style={{ padding:"11px 14px", borderRadius:10, fontSize:14,
          border:`1.5px solid ${err ? "#ef4444" : "#e2e8f0"}`,
          background: err ? "#fef2f2" : "#f8fafc",
          outline:"none", color:C.text, width:"100%",
          fontFamily:"inherit", transition:"border 0.2s" }}
      />
      {err && <span style={{ fontSize:11, color:"#ef4444" }}>{err}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN DASHBOARD PAGE
───────────────────────────────────────────── */
const DashboardPage = () => {
  const navigate = useNavigate();
  const dropRef  = useRef(null);

  const [step,        setStep       ] = useState(() => parseInt(localStorage.getItem("formStep")) || 1);
  const [isLoading,   setIsLoading  ] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDrop,    setShowDrop   ] = useState(false);
  const [feedback,    setFeedback   ] = useState({ rating:5, comment:"" });
  const [userName,    setUserName   ] = useState("");
  const [userEmail,   setUserEmail  ] = useState("");

  const [predictions, setPredictions] = useState(() => {
    const s = localStorage.getItem("careerPredictions");
    return s ? JSON.parse(s) : null;
  });
  const [formData, setFormData] = useState(() => {
    const s = localStorage.getItem("careerFormData");
    return s ? JSON.parse(s) : EMPTY_FORM;
  });

  /* persist */
  useEffect(() => {
    localStorage.setItem("formStep", step);
    localStorage.setItem("careerFormData", JSON.stringify(formData));
    if (predictions) localStorage.setItem("careerPredictions", JSON.stringify(predictions));
  }, [step, formData, predictions]);

  /* fetch user */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const raw = user.user_metadata?.full_name || user.email || "";
      setUserName(formatName(raw));
      setUserEmail(user.email || "");
    });
  }, []);

  /* close dropdown outside click */
  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const updateField = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  /* validation — min 0 now, not 33 */
  const canGoNext = () => {
    if (step === 1) return formData.Stream !== "";
    if (step === 2) {
      let req = ["English"];
      if (formData.Stream.includes("Science")) req.push("Physics","Chemistry");
      if (formData.Stream === "Science_PCM")   req.push("Mathematics","ComputerScience");
      if (formData.Stream === "Science_PCB")   req.push("Biology");
      if (formData.Stream === "Commerce")      req.push("Accountancy","BusinessStudies","Economics");
      if (formData.Stream === "Arts")          req.push("History","Geography","Sociology");
      return req.every(f => {
        const v = parseFloat(formData[f]);
        return formData[f] !== "" && !isNaN(v) && v >= 0 && v <= 100;
      });
    }
    if (step === 3) return true;
    if (step === 4) {
      return INTERESTS.some(i => formData[`Interest_${i}`])
        || PARTICIPATIONS.some(p => formData[`Participated_${p}`])
        || formData.PositiveThinking;
    }
    return false;
  };

  const getSubjects = () => {
    const b = [{ label:"English", name:"English" }];
    if (formData.Stream.includes("Science")) b.push({ label:"Physics", name:"Physics" }, { label:"Chemistry", name:"Chemistry" });
    if (formData.Stream === "Science_PCM") b.push({ label:"Mathematics", name:"Mathematics" }, { label:"Computer Science", name:"ComputerScience" });
    if (formData.Stream === "Science_PCB") b.push({ label:"Biology", name:"Biology" });
    if (formData.Stream === "Commerce")    b.push({ label:"Accountancy", name:"Accountancy" }, { label:"Business Studies", name:"BusinessStudies" }, { label:"Economics", name:"Economics" });
    if (formData.Stream === "Arts")        b.push({ label:"History", name:"History" }, { label:"Geography", name:"Geography" }, { label:"Sociology", name:"Sociology" });
    return b;
  };

  /* predict */
  const handlePredict = async () => {
    setIsLoading(true);
    try {
      const cleaned = {};
      Object.keys(formData).forEach(k => {
        const v = formData[k];
        if (typeof v === "boolean") cleaned[k] = v ? 1 : 0;
        else if (v === "" || v === null) cleaned[k] = 0;
        else if (!isNaN(v) && k !== "Stream") cleaned[k] = parseFloat(v);
        else cleaned[k] = v;
      });
      const { data: { user } } = await supabase.auth.getUser();
      let inputId = null;
      if (user) {
        const { data: row, error } = await supabase.from("user_inputs").insert([{
          user_id:user.id, stream:cleaned.Stream,
          physics:cleaned.Physics, chemistry:cleaned.Chemistry, biology:cleaned.Biology,
          english:cleaned.English, computerscience:cleaned.ComputerScience,
          mathematics:cleaned.Mathematics, accountancy:cleaned.Accountancy,
          businessstudies:cleaned.BusinessStudies, economics:cleaned.Economics,
          history:cleaned.History, geography:cleaned.Geography,
          politicalscience:cleaned.PoliticalScience, sociology:cleaned.Sociology,
          oppenness:cleaned.Oppenness, conscientiousness:cleaned.Conscientiousness,
          extraversion:cleaned.Extraversion, agreeableness:cleaned.Agreeableness,
          neuroticism:cleaned.Neuroticism,
          interest_tech:cleaned.Interest_Tech, interest_entrepreneurship:cleaned.Interest_Entrepreneurship,
          interest_leadership:cleaned.Interest_Leadership, interest_innovation:cleaned.Interest_Innovation,
          interest_criticalthinking:cleaned.Interest_CriticalThinking, interest_research:cleaned.Interest_Research,
          interest_computerskill:cleaned.Interest_ComputerSkill, interest_hardwareskill:cleaned.Interest_HardwareSkill,
          interest_food:cleaned.Interest_Food, interest_creativity:cleaned.Interest_Creativity,
          positivethinking:cleaned.PositiveThinking,
          participated_hackathon:cleaned.Participated_Hackathon, participated_olympiad:cleaned.Participated_Olympiad,
          participated_kabaddi:cleaned.Participated_Kabaddi, participated_khokho:cleaned.Participated_KhoKho,
          participated_cricket:cleaned.Participated_Cricket,
        }]).select("id").single();
        if (!error) inputId = row.id;
      }
      const res = await axios.post("http://127.0.0.1:8000/predict", cleaned);
      if (res.data?.Top_Predictions) {
        const ai = res.data.Top_Predictions;
        if (user) {
          await supabase.from("predictions").insert([{
            user_id:user.id, input_id:inputId,
            career_1:ai[0]?.career, confidence_1:ai[0]?.confidence, explanation_1:ai[0]?.reason,
            career_2:ai[1]?.career, confidence_2:ai[1]?.confidence, explanation_2:ai[1]?.reason,
            career_3:ai[2]?.career, confidence_3:ai[2]?.confidence, explanation_3:ai[2]?.reason,
          }]);
        }
        setPredictions(res.data);
        setStep(5);
      }
    } catch(e) {
      console.error(e);
      toast.error("Something went wrong! Make sure the AI server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Please login first"); return; }
    const { error } = await supabase.from("feedbacks").insert([{
      user_id:user.id, rating:feedback.rating, comment:feedback.comment,
    }]);
    if (!error) {
      toast.success("Thank you for your feedback! 🎉");
      localStorage.removeItem("careerPredictions");
      setStep(1);
    } else {
      toast.error("Error saving feedback");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const confirmReset = () => {
    localStorage.removeItem("careerPredictions");
    localStorage.removeItem("careerFormData");
    localStorage.removeItem("formStep");
    setPredictions(null);
    setFormData(EMPTY_FORM);
    setShowConfirm(false);
    setStep(1);
  };

  /* PDF download — includes student name */
  const downloadResult = () => {
    if (!predictions) return;
    const date = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
    const html = `<!DOCTYPE html><html><head><title>CareerAI Report — ${userName}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:Arial,sans-serif;padding:48px;color:#1e293b;background:#fff}
      .header{margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #f97066}
      .logo{font-size:28px;font-weight:900;color:#f97066;letter-spacing:-1px}
      .tagline{font-size:13px;color:#64748b;margin-top:4px}
      .student-info{margin-top:14px;padding:12px 16px;background:#fff5f3;border-radius:10px;border:1px solid #fecaca}
      .student-name{font-size:16px;font-weight:700;color:#1e293b}
      .student-email{font-size:12px;color:#64748b;margin-top:3px}
      .date{font-size:12px;color:#94a3b8;margin-top:10px}
      .section-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin:24px 0 14px}
      .card{border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:14px;page-break-inside:avoid}
      .card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
      .career-name{font-size:18px;font-weight:700;color:#1e293b}
      .pct-badge{background:#fff5f3;color:#f97066;font-weight:700;padding:4px 14px;border-radius:20px;font-size:14px;border:1px solid #fecaca}
      .bar-wrap{background:#f1f5f9;border-radius:6px;height:10px;margin-bottom:12px}
      .bar{height:10px;border-radius:6px;background:linear-gradient(90deg,#f97066,#ef4444)}
      .reason{font-size:13px;color:#64748b;line-height:1.7}
      .footer{margin-top:48px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8}
      @media print{body{padding:28px}@page{margin:1.2cm}}
    </style></head><body>
    <div class="header">
      <div class="logo">CareerAI</div>
      <div class="tagline">AI-Powered Career Prediction System</div>
      <div class="student-info">
        <div class="student-name">👤 ${userName}</div>
        <div class="student-email">${userEmail}</div>
      </div>
      <div class="date">Report generated on ${date}</div>
    </div>
    <div class="section-title">Top Career Matches</div>
    ${predictions.Top_Predictions.map((r, i) => `
      <div class="card">
        <div class="card-top">
          <div class="career-name">${["🥇","🥈","🥉"][i]} ${r.career}</div>
          <div class="pct-badge">${r.confidence}% Match</div>
        </div>
        <div class="bar-wrap"><div class="bar" style="width:${r.confidence}%"></div></div>
        <div class="reason">${r.reason}</div>
      </div>`).join("")}
    <div class="footer">Powered by CareerAI &bull; AI Career Prediction System &bull; Confidential Report</div>
    </body></html>`;
    const w = window.open("","_blank");
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 600);
  };

  const initials = userName.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0,2).toUpperCase() || "HJ";

  /* ── CSS ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html, body, #root { height:100%; }
    body { font-family:'DM Sans',sans-serif; background:${C.pageBg}; }

    @keyframes spin      { to { transform:rotate(360deg); } }
    @keyframes slideUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes popIn     { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
    @keyframes pulse     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
    @keyframes fadeInOut { 0%,100%{opacity:0.6} 50%{opacity:1} }

    .dw { display:flex; height:100vh; width:100vw; overflow:hidden; }

    /* ── SIDEBAR ── */
    .dsb {
      width:252px; flex-shrink:0;
      background:linear-gradient(175deg,${C.dark} 0%,${C.dark2} 60%,${C.dark} 100%);
      display:flex; flex-direction:column; position:relative; overflow:hidden;
      border-right:1px solid rgba(255,255,255,0.06);
    }
    .dsb-glow  { position:absolute; width:200px; height:200px; border-radius:50%;
      background:radial-gradient(circle,rgba(249,112,102,0.2) 0%,transparent 70%);
      top:-60px; left:-50px; pointer-events:none; }
    .dsb-glow2 { position:absolute; width:150px; height:150px; border-radius:50%;
      background:radial-gradient(circle,rgba(249,112,102,0.1) 0%,transparent 70%);
      bottom:80px; right:-40px; pointer-events:none; }
    .dsb-brand { padding:1.5rem 1.25rem 1rem; border-bottom:1px solid rgba(255,255,255,0.07); position:relative; z-index:1; }
    .dsb-name  { font-family:'Sora',sans-serif; font-weight:800; font-size:21px; color:#fff; letter-spacing:-0.5px; }
    .dsb-tag   { font-size:10px; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:1.2px; margin-top:3px; }
    .dsb-steps { flex:1; padding:1.25rem 0.875rem; overflow-y:auto; position:relative; z-index:1; }

    .step-item { display:flex; align-items:center; gap:11px; padding:11px 13px; border-radius:12px; margin-bottom:3px; transition:background 0.2s; }
    .step-item.active    { background:rgba(249,112,102,0.16); }
    .step-item.completed { opacity:0.65; }
    .step-num  { width:32px; height:32px; border-radius:8px; flex-shrink:0; display:flex; align-items:center; justify-content:center;
      font-size:13px; font-weight:700; background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.35);
      border:1px solid rgba(255,255,255,0.1); transition:all 0.3s; }
    .step-item.active .step-num    { background:${C.primary}; color:#fff; border-color:transparent; box-shadow:0 4px 14px rgba(249,112,102,0.4); }
    .step-item.completed .step-num { background:rgba(16,185,129,0.2); color:#34d399; border-color:rgba(16,185,129,0.3); }
    .step-txt span { font-size:12.5px; font-weight:600; color:rgba(255,255,255,0.4); display:block; transition:color 0.2s; }
    .step-item.active .step-txt span { color:#fff; }
    .step-txt small { font-size:10.5px; color:rgba(255,255,255,0.25); }
    .dsb-bottom { padding:1rem 1.25rem; border-top:1px solid rgba(255,255,255,0.07); position:relative; z-index:1; }
    .logout-btn { width:100%; padding:10px; border-radius:10px; background:rgba(239,68,68,0.12); color:#fca5a5;
      border:1px solid rgba(239,68,68,0.2); font-size:13px; font-weight:600; cursor:pointer;
      font-family:'DM Sans',sans-serif; transition:all 0.2s; }
    .logout-btn:hover { background:rgba(239,68,68,0.22); }

    /* ── MAIN AREA ── */
    .dmain { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

    /* ── NAVBAR ── */
    .dnav {
      height:64px; background:#fff; flex-shrink:0; width:100%;
      border-bottom:1px solid ${C.border};
      display:flex; align-items:center; justify-content:space-between;
      padding:0 2rem; box-shadow:0 1px 6px rgba(0,0,0,0.04);
    }
    .dnav-left  { display:flex; flex-direction:column; }
    .dnav-greet { font-size:11px; color:#94a3b8; font-weight:500; }
    .dnav-title { font-family:'Sora',sans-serif; font-size:15px; font-weight:700; color:${C.text}; }
    .dnav-right { display:flex; align-items:center; gap:10px; }
    .nav-badge  { background:${C.soft}; border:1px solid ${C.softBorder}; color:${C.primaryDark};
      padding:5px 12px; border-radius:20px; font-size:11.5px; font-weight:600; }
    .nav-pill   { background:#f8fafc; border:1px solid #e2e8f0; padding:5px 14px;
      border-radius:20px; font-size:11.5px; color:${C.muted}; font-weight:500; }
    .nav-avatar { width:38px; height:38px; border-radius:50%; background:${C.primary};
      color:#fff; font-weight:700; font-size:13px; display:flex; align-items:center;
      justify-content:center; cursor:pointer; border:none; font-family:'DM Sans',sans-serif;
      box-shadow:0 2px 8px rgba(249,112,102,0.35); flex-shrink:0; }
    .nav-drop   { position:absolute; top:calc(100% + 8px); right:0; background:#fff;
      border:1px solid ${C.border}; border-radius:14px; padding:8px;
      box-shadow:0 8px 30px rgba(0,0,0,0.12); min-width:215px; z-index:200; animation:popIn 0.2s ease; }
    .nav-drop-hdr   { padding:10px 12px 12px; border-bottom:1px solid ${C.border}; margin-bottom:6px; }
    .nav-drop-name  { font-weight:700; color:${C.text}; font-size:14px; }
    .nav-drop-email { font-size:11px; color:#94a3b8; margin-top:2px; }
    .nav-drop-item  { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px;
      cursor:pointer; font-size:13px; color:#475569; font-weight:500; transition:background 0.15s; }
    .nav-drop-item:hover  { background:#f8fafc; }
    .nav-drop-item.danger { color:#ef4444; }
    .nav-drop-item.danger:hover { background:#fef2f2; }
    .nav-drop-div { height:1px; background:${C.border}; margin:4px 0; }

    /* ── CONTENT ── */
    .dcontent  { flex:1; overflow-y:auto; padding:1.75rem 2rem; background:${C.pageBg}; }
    .ph h1     { font-family:'Sora',sans-serif; font-size:26px; font-weight:800; color:${C.text}; letter-spacing:-0.5px; }
    .ph p      { color:${C.muted}; font-size:13.5px; margin-top:4px; }
    .wide-card { background:#fff; border-radius:20px; border:1px solid ${C.border};
      box-shadow:0 2px 20px rgba(0,0,0,0.04); padding:2rem; margin-top:1.25rem; animation:slideUp 0.38s ease; }

    /* STREAM */
    .stream-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:2rem; }
    .stream-card { border:2px solid #e2e8f0; border-radius:16px; padding:1.5rem 1.25rem; cursor:pointer;
      background:#fff; transition:all 0.22s; text-align:left; display:flex; flex-direction:column; gap:8px; }
    .stream-card:hover { transform:translateY(-3px); box-shadow:0 10px 28px rgba(0,0,0,0.09); }
    .stream-icon-wrap { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:26px; }
    .stream-label { font-size:16px; font-weight:700; color:${C.text}; }
    .stream-desc  { font-size:12px; color:#94a3b8; }

    /* MARKS */
    .marks-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:2rem; }
    .info-bar   { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:10px 14px;
      font-size:13px; color:#166534; margin-bottom:1.25rem; }

    /* SLIDERS — thumb always on track */
    .trait-row { display:flex; align-items:center; gap:14px; padding:14px 16px;
      background:#fafafa; border-radius:14px; margin-bottom:10px; border:1px solid ${C.border}; }
    .t-icon  { font-size:20px; flex-shrink:0; width:30px; text-align:center; }
    .t-info  { flex:1; }
    .t-lbl   { font-size:13px; font-weight:600; color:#374151; margin-bottom:8px; }
    .t-scale { display:flex; justify-content:space-between; font-size:10px; color:#9ca3af; margin-top:5px; }
    .t-val   { min-width:30px; height:30px; border-radius:8px; background:${C.primary};
      color:#fff; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

    input[type=range] {
      -webkit-appearance:none; appearance:none;
      width:100%; height:6px; border-radius:6px; cursor:pointer; outline:none;
      background:linear-gradient(to right,
        ${C.primary} 0%,
        ${C.primary} var(--pct,50%),
        #e2e8f0 var(--pct,50%),
        #e2e8f0 100%
      );
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance:none; appearance:none;
      width:20px; height:20px; border-radius:50%;
      background:#fff; border:3px solid ${C.primary};
      box-shadow:0 2px 8px rgba(249,112,102,0.4); cursor:pointer; transition:transform 0.15s;
    }
    input[type=range]::-webkit-slider-thumb:hover { transform:scale(1.2); }
    input[type=range]::-moz-range-thumb {
      width:20px; height:20px; border-radius:50%;
      background:#fff; border:3px solid ${C.primary};
      box-shadow:0 2px 8px rgba(249,112,102,0.4); cursor:pointer;
    }

    /* PILLS */
    .pills-section  { margin-bottom:1.5rem; }
    .pills-heading  { font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:10px; }
    .pills-wrap     { display:flex; flex-wrap:wrap; gap:8px; align-items:flex-start; }
    .pill { padding:8px 16px; border-radius:50px; font-size:13px; font-weight:600; cursor:pointer;
      border:1.5px solid #e2e8f0; background:#fff; color:${C.muted};
      transition:all 0.18s; white-space:nowrap; flex-shrink:0; }
    .pill:hover { border-color:${C.primary}; color:${C.primary}; }
    .pill.active { background:${C.primary}; border-color:transparent; color:#fff; box-shadow:0 4px 14px rgba(249,112,102,0.3); }

    /* FOOTER BUTTONS */
    .footer-btns    { display:flex; align-items:center; justify-content:space-between;
      margin-top:2rem; padding-top:1.5rem; border-top:1px solid ${C.border}; }
    .result-actions { display:flex; gap:10px; flex-wrap:wrap; }
    .btn-back    { font-size:14px; color:#94a3b8; cursor:pointer; font-weight:600;
      background:none; border:none; font-family:'DM Sans',sans-serif; transition:color 0.2s; }
    .btn-back:hover { color:${C.muted}; }
    .btn-next { padding:12px 28px; border-radius:12px; font-size:14px; font-weight:700;
      background:linear-gradient(135deg,#1e293b,#334155); color:#fff; border:none; cursor:pointer;
      font-family:'DM Sans',sans-serif; transition:all 0.2s; box-shadow:0 4px 14px rgba(30,41,59,0.28); }
    .btn-next:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(30,41,59,0.35); }
    .btn-next:disabled { opacity:0.38; cursor:not-allowed; }
    .btn-predict { padding:13px 30px; border-radius:12px; font-size:14px; font-weight:700;
      background:${C.primary}; color:#fff; border:none; cursor:pointer; font-family:'DM Sans',sans-serif;
      box-shadow:0 4px 20px rgba(249,112,102,0.35); animation:pulse 2s ease infinite; transition:all 0.22s; }
    .btn-predict:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(249,112,102,0.45); }
    .btn-predict:disabled { opacity:0.38; cursor:not-allowed; animation:none; }
    .btn-download { display:flex; align-items:center; gap:8px; padding:11px 22px; border-radius:12px;
      font-size:13px; font-weight:700; background:#fff; border:1.5px solid ${C.softBorder};
      color:${C.primary}; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
    .btn-download:hover { background:${C.soft}; }

    /* FEEDBACK */
    .fb-card { margin-top:2rem; padding:1.5rem; border-radius:16px;
      background:${C.soft}; border:1px solid ${C.softBorder}; }
    .fb-card h4 { font-size:14px; font-weight:700; color:${C.primaryDark}; margin-bottom:12px; }
    .stars-row  { display:flex; gap:6px; margin-bottom:12px; align-items:center; }
    .star       { font-size:26px; cursor:pointer; filter:grayscale(1) opacity(0.35); transition:all 0.15s; }
    .star.on    { filter:none; }
    .fb-textarea { width:100%; min-height:80px; padding:12px; border-radius:10px;
      border:1.5px solid ${C.softBorder}; background:#fff; font-size:13.5px;
      color:${C.text}; resize:vertical; outline:none; margin-bottom:12px; font-family:'DM Sans',sans-serif; }
    .fb-textarea:focus { border-color:${C.primary}; }
    .btn-fb { padding:10px 24px; border-radius:10px; font-size:13px; font-weight:700;
      background:${C.primary}; color:#fff; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; }

    /* RESULT section */
    .result-hero { text-align:center; margin-bottom:1.5rem; padding:1.5rem;
      background:${C.soft}; border-radius:16px; border:1px solid ${C.softBorder}; }

    /* Chart section */
    .chart-card { background:#fff; border-radius:14px; border:1px solid ${C.border};
      padding:1.25rem 1.5rem; margin-bottom:1.25rem;
      box-shadow:0 2px 10px rgba(0,0,0,0.04); }
    .chart-title { font-size:14px; font-weight:700; color:${C.text}; margin-bottom:1rem; }

    @media(max-width:768px) {
      .dsb { display:none; }
      .stream-grid, .marks-grid { grid-template-columns:1fr; }
    }
  `;

  /* ══ RENDER ══════════════════════════════════════════ */
  return (
    <>
      <style>{css}</style>
      {isLoading    && <PredictingOverlay />}
      {showConfirm  && <ConfirmDialog onConfirm={confirmReset} onCancel={() => setShowConfirm(false)} />}

      <div className="dw">

        {/* ─── SIDEBAR ─── */}
        <aside className="dsb">
          <div className="dsb-glow" /><div className="dsb-glow2" />
          <div className="dsb-brand">
            <div className="dsb-name">CareerAI</div>
            <div className="dsb-tag">AI Career Prediction</div>
          </div>
          <div className="dsb-steps">
            {STEPS.map(s => (
              <div key={s.n} className={`step-item ${step===s.n?"active":""} ${step>s.n?"completed":""}`}>
                <div className="step-num">{step > s.n ? "✓" : s.icon}</div>
                <div className="step-txt"><span>{s.t}</span><small>{s.s}</small></div>
              </div>
            ))}
          </div>
          <div className="dsb-bottom">
            <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </aside>

        {/* ─── MAIN ─── */}
        <div className="dmain">

          {/* NAVBAR */}
          <nav className="dnav">
            <div className="dnav-left">
              <span className="dnav-greet">Welcome back,</span>
              <span className="dnav-title">{userName || "Student"} 👋</span>
            </div>
            <div className="dnav-right">
              <span className="nav-badge">🤖 AI Powered</span>
              <span className="nav-pill">Step {step} of 5</span>
              <div style={{ position:"relative" }} ref={dropRef}>
                <button className="nav-avatar" onClick={() => setShowDrop(v => !v)}>{initials}</button>
                {showDrop && (
                  <div className="nav-drop">
                    <div className="nav-drop-hdr">
                      <div className="nav-drop-name">{userName}</div>
                      <div className="nav-drop-email">{userEmail}</div>
                    </div>
                    <div className="nav-drop-item" onClick={() => { navigate("/profile"); setShowDrop(false); }}>
                      👤 My Profile
                    </div>
                    <div className="nav-drop-item" onClick={() => { navigate("/predictions"); setShowDrop(false); }}>
                      📊 My Predictions
                    </div>
                    {/* <div className="nav-drop-item" onClick={() => { navigate("/settings"); setShowDrop(false); }}>
                      ⚙️ Settings
                    </div> */}
                    <div className="nav-drop-div" />
                    <div className="nav-drop-item danger" onClick={handleLogout}>
                      🚪 Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* CONTENT */}
          <div className="dcontent">
            <div className="ph">
              <h1>{STEPS[step-1].t}</h1>
              {/* <p>Please provide accurate details for a better AI prediction.</p> */}
            </div>

            <div className="wide-card">

              {/* ═══ STEP 1: STREAM ═══ */}
              {step === 1 && (
                <div>
                  <div className="stream-grid">
                    {STREAMS.map(s => (
                      <button key={s.id}
                        className={`stream-card ${formData.Stream === s.id ? "selected" : ""}`}
                        style={formData.Stream === s.id ? {
                          borderColor: s.color, background: s.bg,
                          boxShadow: `0 6px 22px ${s.color}22`, transform:"translateY(-3px)",
                        } : {}}
                        onClick={() => updateField("Stream", s.id)}>
                        <div className="stream-icon-wrap" style={{ background: s.bg }}>
                          <span style={{ fontSize:26 }}>{s.icon}</span>
                        </div>
                        <div className="stream-label" style={formData.Stream === s.id ? { color: s.color } : {}}>{s.label}</div>
                        <div className="stream-desc">{s.desc}</div>
                        {formData.Stream === s.id && (
                          <div style={{ fontSize:11, fontWeight:700, color: s.color, marginTop:4 }}>✓ Selected</div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="footer-btns">
                    <div />
                    <button className="btn-next" disabled={!formData.Stream} onClick={() => setStep(2)}>
                      Next Step →
                    </button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 2: MARKS ═══ */}
              {step === 2 && (
                <div>
                  <div className="info-bar">
                    ✅ Enter marks between <strong>0 and 100</strong>. Students who have failed can still enter their actual marks — the AI considers all scores.
                  </div>
                  <div className="marks-grid">
                    {getSubjects().map(sub => (
                      <MarkInput key={sub.name} label={sub.label} name={sub.name} val={formData[sub.name]} fn={updateField} />
                    ))}
                  </div>
                  <div className="footer-btns">
                    <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                    <button className="btn-next" disabled={!canGoNext()} onClick={() => setStep(3)}>
                      Next: Personality →
                    </button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 3: PERSONALITY ═══ */}
              {step === 3 && (
                <div>
                  <p style={{ color:C.muted, fontSize:13, marginBottom:"1.5rem",
                    background:C.soft, padding:"10px 14px", borderRadius:10, border:`1px solid ${C.softBorder}` }}>
                    🧠 Drag each slider to reflect how strongly you feel about each trait.&nbsp;
                    <strong>1 = Low &nbsp;|&nbsp; 5 = High</strong>
                  </p>
                  {TRAITS.map(trait => {
                    const val = formData[trait.id];
                    const pct = `${((val - 1) / 4 * 100).toFixed(1)}%`;
                    return (
                      <div key={trait.id} className="trait-row">
                        <div className="t-icon">{trait.icon}</div>
                        <div className="t-info">
                          <div className="t-lbl">{trait.label}</div>
                          <input type="range" min={1} max={5} step={1} value={val}
                            style={{ "--pct": pct }}
                            onChange={e => updateField(trait.id, parseInt(e.target.value))} />
                          <div className="t-scale">
                            <span>1 — Low</span><span>2</span><span>3 — Medium</span><span>4</span><span>5 — High</span>
                          </div>
                        </div>
                        <div className="t-val">{val}</div>
                      </div>
                    );
                  })}
                  <div className="footer-btns">
                    <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
                    <button className="btn-next" onClick={() => setStep(4)}>Next: Interests →</button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 4: INTERESTS ═══ */}
              {step === 4 && (
                <div>
                  <div className="pills-section">
                    <div className="pills-heading">🎯 Your Interests</div>
                    <div className="pills-wrap">
                      {INTERESTS.map(item => (
                        <div key={item}
                          className={`pill ${formData[`Interest_${item}`] ? "active" : ""}`}
                          onClick={() => updateField(`Interest_${item}`, !formData[`Interest_${item}`])}>
                          {formData[`Interest_${item}`] ? "✓ " : ""}{slugLabel(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pills-section">
                    <div className="pills-heading">🏆 Sports & Participation</div>
                    <div className="pills-wrap">
                      {PARTICIPATIONS.map(item => (
                        <div key={item}
                          className={`pill ${formData[`Participated_${item}`] ? "active" : ""}`}
                          onClick={() => updateField(`Participated_${item}`, !formData[`Participated_${item}`])}>
                          {formData[`Participated_${item}`] ? "✓ " : ""}{item}
                        </div>
                      ))}
                      <div className={`pill ${formData.PositiveThinking ? "active" : ""}`}
                        onClick={() => updateField("PositiveThinking", !formData.PositiveThinking)}>
                        {formData.PositiveThinking ? "✓ " : ""}Positive Thinking
                      </div>
                    </div>
                  </div>
                  <div className="footer-btns">
                    <button className="btn-back" onClick={() => setStep(3)}>← Back</button>
                    <button className="btn-predict" disabled={!canGoNext()} onClick={handlePredict}>
                      ✨ Predict My Career
                    </button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 5: RESULTS ═══ */}
              {step === 5 && predictions && (
                <div style={{ animation:"slideUp 0.5s ease" }}>

                  {/* Hero */}
                  <div className="result-hero">
                    <div style={{ fontSize:40, marginBottom:8 }}>🎉</div>
                    <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:C.text, marginBottom:6 }}>
                      Your AI Career Report
                    </h2>
                    <p style={{ color:C.primaryDark, fontSize:14 }}>
                      Based on your complete profile — here are your top career matches
                    </p>
                  </div>

                  {/* CHART */}
                  {/* <div className="chart-card">
                    <div className="chart-title">📊 Career Match Confidence Chart</div>
                    <ResultsChart predictions={predictions.Top_Predictions} />
                    <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:8 }}>
                      {predictions.Top_Predictions.map((p, i) => {
                        const cols = [C.primary, C.primary2, "#fca5a5"];
                        return (
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.muted }}>
                            <div style={{ width:10, height:10, borderRadius:2, background:cols[i] }} />
                            {p.career} {p.confidence}%
                          </div>
                        );
                      })}
                    </div>
                  </div> */}

                  {/* Bars */}
                  {predictions.Top_Predictions.map((r, i) => (
                    <ResultBar key={i} career={r.career} confidence={r.confidence} reason={r.reason} index={i} />
                  ))}

                  {/* Actions */}
                  <div className="footer-btns">
                    <button className="btn-back" onClick={() => setStep(4)}>← Back</button>
                    <div className="result-actions">
                      <button className="btn-download" onClick={downloadResult}>
                        ⬇ Download PDF Report
                      </button>
                      <button className="btn-next" onClick={() => setShowConfirm(true)}>
                        🔄 Test Again
                      </button>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="fb-card">
                    <h4>⭐ How accurate was this prediction?</h4>
                    <div className="stars-row">
                      {[1,2,3,4,5].map(n => (
                        <span key={n} className={`star ${feedback.rating >= n ? "on" : ""}`}
                          onClick={() => setFeedback(f => ({ ...f, rating:n }))}>⭐</span>
                      ))}
                      <span style={{ fontSize:13, color:C.primaryDark, fontWeight:600, marginLeft:8 }}>
                        {["","Bad","Poor","Average","Good","Excellent"][feedback.rating]}
                      </span>
                    </div>
                    <textarea className="fb-textarea"
                      placeholder="Tell us what you think about this prediction..."
                      value={feedback.comment}
                      onChange={e => setFeedback(f => ({ ...f, comment:e.target.value }))} />
                    <button className="btn-fb" onClick={submitFeedback}>Submit Feedback →</button>
                  </div>
                </div>
              )}

            </div>{/* wide-card */}
          </div>{/* dcontent */}
        </div>{/* dmain */}
      </div>{/* dw */}
    </>
  );
};

export default DashboardPage;



//Purple and rose pink color
// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { supabase } from "../../../backend/supabaseClient";
// import { useNavigate } from "react-router";
// import toast from "react-hot-toast";

// /* ── helpers ── */
// const slugLabel = (s) => s.replace(/([A-Z])/g, " $1").trim();
// const formatName = (raw = "") =>
//   raw.includes("@")
//     ? raw.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
//     : raw.replace(/\b\w/g, (c) => c.toUpperCase());

// /* ── brand colours — pink/purple AI palette matching the site ── */
// const C = {
//   primary:   "#f43f5e",
//   primary2:  "#e11d48",
//   soft:      "#fff1f2",
//   softBorder:"#fecdd3",
//   accent:    "#a855f7",
//   grad:      "linear-gradient(135deg,#f43f5e,#a855f7)",
//   gradLight: "linear-gradient(135deg,#fff1f2,#faf5ff)",
//   dark:      "#0f172a",
//   dark2:     "#1e1b4b",
//   text:      "#1e293b",
//   muted:     "#64748b",
//   border:    "#f1f5f9",
//   bg:        "#f8fafc",
// };

// const STREAMS = [
//   { id:"Science_PCM", label:"Science PCM", icon:"⚛️", color:"#3b82f6", bg:"#eff6ff", desc:"Physics · Chemistry · Mathematics" },
//   { id:"Science_PCB", label:"Science PCB", icon:"🧬", color:"#10b981", bg:"#ecfdf5", desc:"Physics · Chemistry · Biology"    },
//   { id:"Commerce",    label:"Commerce",    icon:"📈", color:"#f59e0b", bg:"#fffbeb", desc:"Accountancy · Business · Economics"},
//   { id:"Arts",        label:"Arts",        icon:"🎨", color:"#a855f7", bg:"#faf5ff", desc:"History · Geography · Sociology"  },
// ];

// const TRAITS = [
//   { id:"Oppenness",        label:"Creativity & Learning",      icon:"💡" },
//   { id:"Conscientiousness",label:"Discipline & Planning",      icon:"🎯" },
//   { id:"Extraversion",     label:"Socializing & Communication",icon:"🗣️" },
//   { id:"Agreeableness",    label:"Friendliness & Teamwork",    icon:"🤝" },
//   { id:"Neuroticism",      label:"Stress Management",          icon:"🧘" },
// ];

// const INTERESTS     = ["Tech","Entrepreneurship","Leadership","Innovation","CriticalThinking","Research","ComputerSkill","HardwareSkill","Food","Creativity"];
// const PARTICIPATIONS = ["Hackathon","Olympiad","Kabaddi","KhoKho","Cricket"];

// const STEPS = [
//   { n:1, t:"Stream Selection",  s:"Basic Info",       icon:"🎓" },
//   { n:2, t:"Academic Marks",    s:"Subject Scores",   icon:"📝" },
//   { n:3, t:"Personality Traits",s:"Big Five Scaling", icon:"🧠" },
//   { n:4, t:"Interests & Skills",s:"Final Assessment", icon:"⭐" },
//   { n:5, t:"AI Results",        s:"Prediction",       icon:"🚀" },
// ];

// const EMPTY_FORM = {
//   Stream:"",Physics:"",Chemistry:"",Biology:"",English:"",
//   ComputerScience:"",Mathematics:"",Accountancy:"",BusinessStudies:"",
//   Economics:"",History:"",Geography:"",PoliticalScience:"",Sociology:"",
//   Interest_Tech:false,Interest_Entrepreneurship:false,Interest_Leadership:false,
//   Interest_Innovation:false,Interest_CriticalThinking:false,Interest_Research:false,
//   Interest_ComputerSkill:false,Interest_HardwareSkill:false,
//   Interest_Food:false,Interest_Creativity:false,PositiveThinking:false,
//   Participated_Hackathon:false,Participated_Olympiad:false,
//   Participated_Kabaddi:false,Participated_KhoKho:false,Participated_Cricket:false,
//   Oppenness:3,Conscientiousness:3,Extraversion:3,Agreeableness:3,Neuroticism:3,
// };

// /* ══════════════ SUB-COMPONENTS ══════════════ */

// function ResultBar({ career, confidence, reason, index }) {
//   const [w, setW] = useState(0);
//   useEffect(() => { const t = setTimeout(() => setW(confidence), 400+index*200); return ()=>clearTimeout(t); }, []);
//   const colors = [C.primary, C.accent, "#0ea5e9"];
//   const c = colors[index] || C.muted;
//   const medals = ["🥇","🥈","🥉"];
//   return (
//     <div style={{ background:"#fff", borderRadius:16, padding:"1.25rem 1.5rem",
//       border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
//       marginBottom:"0.875rem", animation:`slideUp 0.5s ease ${index*0.15}s both` }}>
//       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
//         <div style={{ display:"flex", alignItems:"center", gap:10 }}>
//           <div style={{ width:36,height:36,borderRadius:10,background:c+"18",
//             display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>
//             {medals[index]}
//           </div>
//           <span style={{ fontWeight:700, fontSize:16, color:C.text }}>{career}</span>
//         </div>
//         <span style={{ background:c+"15",color:c,fontWeight:700,fontSize:14,padding:"4px 14px",borderRadius:20 }}>
//           {confidence}%
//         </span>
//       </div>
//       <div style={{ background:"#f1f5f9",borderRadius:8,height:10,overflow:"hidden",marginBottom:10 }}>
//         <div style={{ width:`${w}%`,height:"100%",borderRadius:8,
//           background:`linear-gradient(90deg,${c},${c}99)`,
//           transition:"width 1.1s cubic-bezier(0.4,0,0.2,1)" }} />
//       </div>
//       <p style={{ color:C.muted,fontSize:13,lineHeight:1.6,margin:0 }}>{reason}</p>
//     </div>
//   );
// }

// function PredictingOverlay() {
//   const msgs = [
//     "🔍 Analyzing your academic profile...",
//     "🧠 Processing personality traits...",
//     "⭐ Matching your interests & skills...",
//     "🤖 AI is predicting your career...",
//     "✨ Finalizing your results...",
//   ];
//   const [idx,setIdx] = useState(0);
//   useEffect(()=>{ const t=setInterval(()=>setIdx(i=>(i+1)%msgs.length),1800); return()=>clearInterval(t); },[]);
//   return (
//     <div style={{ position:"fixed",inset:0,zIndex:1000,
//       background:"rgba(15,23,42,0.88)",backdropFilter:"blur(8px)",
//       display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24 }}>
//       <div style={{ position:"relative",width:110,height:110 }}>
//         <div style={{ position:"absolute",inset:0,borderRadius:"50%",
//           border:"3px solid transparent",borderTopColor:C.primary,animation:"spin 1s linear infinite" }} />
//         <div style={{ position:"absolute",inset:10,borderRadius:"50%",
//           border:"3px solid transparent",borderTopColor:C.accent,animation:"spin 1.5s linear infinite reverse" }} />
//         <div style={{ position:"absolute",inset:20,borderRadius:"50%",
//           border:"2px solid transparent",borderTopColor:"#0ea5e9",animation:"spin 2.2s linear infinite" }} />
//         <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36 }}>🤖</div>
//       </div>
//       <div style={{ color:"#fff",fontSize:17,fontWeight:600,textAlign:"center",maxWidth:320,animation:"fadeInOut 1.8s ease infinite" }}>
//         {msgs[idx]}
//       </div>
//       <div style={{ display:"flex",gap:8 }}>
//         {msgs.map((_,i)=>(
//           <div key={i} style={{ width:8,height:8,borderRadius:"50%",
//             background:i===idx?C.primary:"rgba(255,255,255,0.25)",transition:"background 0.3s" }} />
//         ))}
//       </div>
//       <div style={{ color:"rgba(255,255,255,0.4)",fontSize:12 }}>This may take a few seconds...</div>
//     </div>
//   );
// }

// function ConfirmDialog({ onConfirm, onCancel }) {
//   return (
//     <div style={{ position:"fixed",inset:0,zIndex:999,
//       background:"rgba(15,23,42,0.6)",backdropFilter:"blur(4px)",
//       display:"flex",alignItems:"center",justifyContent:"center" }}>
//       <div style={{ background:"#fff",borderRadius:20,padding:"2rem",maxWidth:380,width:"90%",
//         textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.25)",
//         animation:"popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
//         <div style={{ fontSize:48,marginBottom:12 }}>⚠️</div>
//         <h3 style={{ color:C.text,fontSize:20,fontWeight:700,marginBottom:8 }}>Start Over?</h3>
//         <p style={{ color:C.muted,fontSize:14,lineHeight:1.6,marginBottom:24 }}>
//           This will clear <strong>all your entered data</strong> and prediction results. Cannot be undone.
//         </p>
//         <div style={{ display:"flex",gap:12,justifyContent:"center" }}>
//           <button onClick={onCancel} style={{ padding:"10px 24px",borderRadius:10,
//             border:"1.5px solid #e2e8f0",background:"#fff",color:C.muted,fontWeight:600,cursor:"pointer",fontSize:14 }}>Cancel</button>
//           <button onClick={onConfirm} style={{ padding:"10px 24px",borderRadius:10,border:"none",
//             background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"#fff",fontWeight:600,cursor:"pointer",fontSize:14 }}>
//             Yes, Clear All
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function MarkInput({ label, name, val, fn }) {
//   const [err,setErr] = useState("");
//   const onChange = (e) => {
//     const v = e.target.value; fn(name,v);
//     if (!v){setErr("");return;}
//     const n = parseFloat(v);
//     if (isNaN(n)||n<1||n>100) setErr("Must be 1–100");
//     else if (n<33) setErr("Min passing: 33");
//     else setErr("");
//   };
//   return (
//     <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
//       <label style={{ fontSize:13,fontWeight:600,color:"#475569" }}>{label}</label>
//       <input type="number" min={1} max={100} value={val} onChange={onChange}
//         placeholder="Enter marks (33–100)"
//         style={{ padding:"11px 14px",borderRadius:10,fontSize:14,
//           border:`1.5px solid ${err?"#ef4444":"#e2e8f0"}`,
//           background:err?"#fef2f2":"#f8fafc",
//           outline:"none",color:C.text,width:"100%",fontFamily:"inherit",transition:"border 0.2s" }} />
//       {err && <span style={{ fontSize:11,color:"#ef4444" }}>{err}</span>}
//     </div>
//   );
// }

// /* ══════════════ MAIN PAGE ══════════════ */
// const DashboardPage = () => {
//   const navigate = useNavigate();
//   const dropRef  = useRef(null);

//   const [step,        setStep       ] = useState(()=>parseInt(localStorage.getItem("formStep"))||1);
//   const [isLoading,   setIsLoading  ] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [showDrop,    setShowDrop   ] = useState(false);
//   const [feedback,    setFeedback   ] = useState({ rating:5, comment:"" });
//   const [userName,    setUserName   ] = useState("");
//   const [userEmail,   setUserEmail  ] = useState("");

//   const [predictions,setPredictions] = useState(()=>{
//     const s=localStorage.getItem("careerPredictions"); return s?JSON.parse(s):null;
//   });
//   const [formData,setFormData] = useState(()=>{
//     const s=localStorage.getItem("careerFormData"); return s?JSON.parse(s):EMPTY_FORM;
//   });

//   useEffect(()=>{
//     localStorage.setItem("formStep",step);
//     localStorage.setItem("careerFormData",JSON.stringify(formData));
//     if(predictions) localStorage.setItem("careerPredictions",JSON.stringify(predictions));
//   },[step,formData,predictions]);

//   useEffect(()=>{
//     supabase.auth.getUser().then(({data:{user}})=>{
//       if(!user)return;
//       const raw=user.user_metadata?.full_name||user.email||"";
//       setUserName(formatName(raw));
//       setUserEmail(user.email||"");
//     });
//   },[]);

//   useEffect(()=>{
//     const h=(e)=>{ if(dropRef.current&&!dropRef.current.contains(e.target)) setShowDrop(false); };
//     document.addEventListener("mousedown",h);
//     return()=>document.removeEventListener("mousedown",h);
//   },[]);

//   const updateField=(name,value)=>setFormData(prev=>({...prev,[name]:value}));

//   const canGoNext=()=>{
//     if(step===1) return formData.Stream!=="";
//     if(step===2){
//       let req=["English"];
//       if(formData.Stream.includes("Science")) req.push("Physics","Chemistry");
//       if(formData.Stream==="Science_PCM")     req.push("Mathematics","ComputerScience");
//       if(formData.Stream==="Science_PCB")     req.push("Biology");
//       if(formData.Stream==="Commerce")        req.push("Accountancy","BusinessStudies","Economics");
//       if(formData.Stream==="Arts")            req.push("History","Geography","Sociology");
//       return req.every(f=>{const v=parseFloat(formData[f]);return formData[f]!==""&&!isNaN(v)&&v>=33&&v<=100;});
//     }
//     if(step===3) return true;
//     if(step===4){
//       return INTERESTS.some(i=>formData[`Interest_${i}`])
//         ||PARTICIPATIONS.some(p=>formData[`Participated_${p}`])
//         ||formData.PositiveThinking;
//     }
//     return false;
//   };

//   const getSubjects=()=>{
//     const b=[{label:"English",name:"English"}];
//     if(formData.Stream.includes("Science")) b.push({label:"Physics",name:"Physics"},{label:"Chemistry",name:"Chemistry"});
//     if(formData.Stream==="Science_PCM") b.push({label:"Mathematics",name:"Mathematics"},{label:"Computer Science",name:"ComputerScience"});
//     if(formData.Stream==="Science_PCB") b.push({label:"Biology",name:"Biology"});
//     if(formData.Stream==="Commerce")    b.push({label:"Accountancy",name:"Accountancy"},{label:"Business Studies",name:"BusinessStudies"},{label:"Economics",name:"Economics"});
//     if(formData.Stream==="Arts")        b.push({label:"History",name:"History"},{label:"Geography",name:"Geography"},{label:"Sociology",name:"Sociology"});
//     return b;
//   };

//   const handlePredict=async()=>{
//     setIsLoading(true);
//     try{
//       const cleaned={};
//       Object.keys(formData).forEach(k=>{
//         const v=formData[k];
//         if(typeof v==="boolean") cleaned[k]=v?1:0;
//         else if(v===""||v===null) cleaned[k]=0;
//         else if(!isNaN(v)&&k!=="Stream") cleaned[k]=parseFloat(v);
//         else cleaned[k]=v;
//       });
//       const {data:{user}}=await supabase.auth.getUser();
//       let inputId=null;
//       if(user){
//         const{data:row,error}=await supabase.from("user_inputs").insert([{
//           user_id:user.id,stream:cleaned.Stream,
//           physics:cleaned.Physics,chemistry:cleaned.Chemistry,biology:cleaned.Biology,
//           english:cleaned.English,computerscience:cleaned.ComputerScience,
//           mathematics:cleaned.Mathematics,accountancy:cleaned.Accountancy,
//           businessstudies:cleaned.BusinessStudies,economics:cleaned.Economics,
//           history:cleaned.History,geography:cleaned.Geography,
//           politicalscience:cleaned.PoliticalScience,sociology:cleaned.Sociology,
//           oppenness:cleaned.Oppenness,conscientiousness:cleaned.Conscientiousness,
//           extraversion:cleaned.Extraversion,agreeableness:cleaned.Agreeableness,
//           neuroticism:cleaned.Neuroticism,
//           interest_tech:cleaned.Interest_Tech,interest_entrepreneurship:cleaned.Interest_Entrepreneurship,
//           interest_leadership:cleaned.Interest_Leadership,interest_innovation:cleaned.Interest_Innovation,
//           interest_criticalthinking:cleaned.Interest_CriticalThinking,interest_research:cleaned.Interest_Research,
//           interest_computerskill:cleaned.Interest_ComputerSkill,interest_hardwareskill:cleaned.Interest_HardwareSkill,
//           interest_food:cleaned.Interest_Food,interest_creativity:cleaned.Interest_Creativity,
//           positivethinking:cleaned.PositiveThinking,
//           participated_hackathon:cleaned.Participated_Hackathon,participated_olympiad:cleaned.Participated_Olympiad,
//           participated_kabaddi:cleaned.Participated_Kabaddi,participated_khokho:cleaned.Participated_KhoKho,
//           participated_cricket:cleaned.Participated_Cricket,
//         }]).select("id").single();
//         if(!error) inputId=row.id;
//       }
//       const res=await axios.post("http://127.0.0.1:8000/predict",cleaned);
//       if(res.data?.Top_Predictions){
//         const ai=res.data.Top_Predictions;
//         if(user){
//           await supabase.from("predictions").insert([{
//             user_id:user.id,input_id:inputId,
//             career_1:ai[0]?.career,confidence_1:ai[0]?.confidence,explanation_1:ai[0]?.reason,
//             career_2:ai[1]?.career,confidence_2:ai[1]?.confidence,explanation_2:ai[1]?.reason,
//             career_3:ai[2]?.career,confidence_3:ai[2]?.confidence,explanation_3:ai[2]?.reason,
//           }]);
//         }
//         setPredictions(res.data);
//         setStep(5);
//       }
//     }catch(e){
//       console.error(e);
//       toast.error("Something went wrong! Make sure the AI server is running.");
//     }finally{
//       setIsLoading(false);
//     }
//   };

//   const submitFeedback=async()=>{
//     const{data:{user}}=await supabase.auth.getUser();
//     if(!user){toast.error("Please login first");return;}
//     const{error}=await supabase.from("feedbacks").insert([{user_id:user.id,rating:feedback.rating,comment:feedback.comment}]);
//     if(!error){toast.success("Thank you for your feedback! 🎉");localStorage.removeItem("careerPredictions");setStep(1);}
//     else toast.error("Error saving feedback");
//   };

//   const handleLogout=async()=>{
//     await supabase.auth.signOut();
//     localStorage.clear();
//     toast.success("Logged out successfully!");
//     navigate("/login");
//   };

//   const confirmReset=()=>{
//     localStorage.removeItem("careerPredictions");
//     localStorage.removeItem("careerFormData");
//     localStorage.removeItem("formStep");
//     setPredictions(null);
//     setFormData(EMPTY_FORM);
//     setShowConfirm(false);
//     setStep(1);
//   };

//   /* PDF download via browser print dialog — industry standard approach */
//   const downloadResult=()=>{
//     if(!predictions)return;
//     const date=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
//     const html=`<!DOCTYPE html><html><head><title>CareerAI Report</title>
//     <style>
//       *{box-sizing:border-box;margin:0;padding:0}
//       body{font-family:Arial,sans-serif;padding:48px;color:#1e293b;background:#fff}
//       .header{margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #f43f5e}
//       .logo{font-size:28px;font-weight:900;color:#f43f5e;letter-spacing:-1px}
//       .tagline{font-size:13px;color:#64748b;margin-top:4px}
//       .date{font-size:12px;color:#94a3b8;margin-top:16px}
//       .section-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:16px}
//       .card{border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:14px;page-break-inside:avoid}
//       .card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
//       .career-name{font-size:18px;font-weight:700;color:#1e293b}
//       .pct-badge{background:#fdf2f8;color:#f43f5e;font-weight:700;padding:4px 14px;border-radius:20px;font-size:14px;border:1px solid #fecdd3}
//       .bar-wrap{background:#f1f5f9;border-radius:6px;height:10px;margin-bottom:12px}
//       .bar{height:10px;border-radius:6px;background:linear-gradient(90deg,#f43f5e,#a855f7)}
//       .reason{font-size:13px;color:#64748b;line-height:1.7}
//       .footer{margin-top:48px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8}
//       @media print{
//         body{padding:32px}
//         @page{margin:1cm}
//       }
//     </style></head><body>
//     <div class="header">
//       <div class="logo">CareerAI</div>
//       <div class="tagline">AI-Powered Career Prediction System</div>
//       <div class="date">Report generated on ${date}</div>
//     </div>
//     <div class="section-title">Your Top Career Matches</div>
//     ${predictions.Top_Predictions.map((r,i)=>`
//       <div class="card">
//         <div class="card-top">
//           <div class="career-name">${["🥇","🥈","🥉"][i]} ${r.career}</div>
//           <div class="pct-badge">${r.confidence}% Match</div>
//         </div>
//         <div class="bar-wrap"><div class="bar" style="width:${r.confidence}%"></div></div>
//         <div class="reason">${r.reason}</div>
//       </div>`).join("")}
//     <div class="footer">Powered by CareerAI &bull; AI Career Prediction System &bull; Confidential</div>
//     </body></html>`;
//     const w=window.open("","_blank");
//     w.document.write(html);
//     w.document.close();
//     w.focus();
//     setTimeout(()=>w.print(),600);
//   };

//   const initials=userName.split(" ").filter(Boolean).map(w=>w[0]).join("").slice(0,2).toUpperCase()||"HJ";

//   /* ══ CSS ══ */
//   const css=`
//     @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
//     *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
//     html,body,#root{height:100%}
//     body{font-family:'DM Sans',sans-serif;background:${C.bg}}

//     @keyframes spin      {to{transform:rotate(360deg)}}
//     @keyframes slideUp   {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
//     @keyframes popIn     {from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
//     @keyframes pulse     {0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
//     @keyframes fadeInOut {0%,100%{opacity:0.6}50%{opacity:1}}

//     /* ── wrapper ── */
//     .dw{display:flex;height:100vh;width:100vw;overflow:hidden}

//     /* ── SIDEBAR ── */
//     .dsb{
//       width:252px;flex-shrink:0;
//       background:linear-gradient(175deg,${C.dark} 0%,${C.dark2} 55%,${C.dark} 100%);
//       display:flex;flex-direction:column;position:relative;overflow:hidden;
//       border-right:1px solid rgba(255,255,255,0.06);
//     }
//     .dsb-glow{position:absolute;width:200px;height:200px;border-radius:50%;
//       background:radial-gradient(circle,rgba(244,63,94,0.18) 0%,transparent 70%);
//       top:-60px;left:-50px;pointer-events:none}
//     .dsb-glow2{position:absolute;width:150px;height:150px;border-radius:50%;
//       background:radial-gradient(circle,rgba(168,85,247,0.12) 0%,transparent 70%);
//       bottom:80px;right:-40px;pointer-events:none}
//     .dsb-brand{padding:1.5rem 1.25rem 1rem;border-bottom:1px solid rgba(255,255,255,0.07);position:relative;z-index:1}
//     .dsb-name{font-family:'Sora',sans-serif;font-weight:800;font-size:21px;color:#fff;letter-spacing:-0.5px}
//     .dsb-tag{font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1.2px;margin-top:3px}
//     .dsb-steps{flex:1;padding:1.25rem 0.875rem;overflow-y:auto;position:relative;z-index:1}
//     .step-item{display:flex;align-items:center;gap:11px;padding:11px 13px;border-radius:12px;margin-bottom:3px;transition:background 0.2s}
//     .step-item.active{background:rgba(244,63,94,0.15)}
//     .step-item.completed{opacity:0.65}
//     .step-num{width:32px;height:32px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
//       font-size:13px;font-weight:700;background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.35);
//       border:1px solid rgba(255,255,255,0.1);transition:all 0.3s}
//     .step-item.active .step-num{background:${C.grad};color:#fff;border-color:transparent;box-shadow:0 4px 14px rgba(244,63,94,0.35)}
//     .step-item.completed .step-num{background:rgba(16,185,129,0.2);color:#34d399;border-color:rgba(16,185,129,0.3)}
//     .step-txt span{font-size:12.5px;font-weight:600;color:rgba(255,255,255,0.4);display:block;transition:color 0.2s}
//     .step-item.active .step-txt span{color:#fff}
//     .step-txt small{font-size:10.5px;color:rgba(255,255,255,0.25)}
//     .dsb-bottom{padding:1rem 1.25rem;border-top:1px solid rgba(255,255,255,0.07);position:relative;z-index:1}
//     .logout-btn{width:100%;padding:10px;border-radius:10px;background:rgba(239,68,68,0.12);color:#fca5a5;
//       border:1px solid rgba(239,68,68,0.2);font-size:13px;font-weight:600;cursor:pointer;
//       font-family:'DM Sans',sans-serif;transition:all 0.2s}
//     .logout-btn:hover{background:rgba(239,68,68,0.22)}

//     /* ── MAIN AREA ── */
//     .dmain{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}

//     /* ── NAVBAR — full width across remaining space ── */
//     .dnav{
//       height:64px;background:#fff;flex-shrink:0;width:100%;
//       border-bottom:1px solid ${C.border};
//       display:flex;align-items:center;justify-content:space-between;
//       padding:0 2rem;box-shadow:0 1px 6px rgba(0,0,0,0.04);
//     }
//     .dnav-left{display:flex;flex-direction:column}
//     .dnav-greet{font-size:11px;color:#94a3b8;font-weight:500}
//     .dnav-title{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:${C.text}}
//     .dnav-right{display:flex;align-items:center;gap:10px}
//     .nav-badge{background:${C.soft};border:1px solid ${C.softBorder};color:${C.primary2};
//       padding:5px 12px;border-radius:20px;font-size:11.5px;font-weight:600}
//     .nav-pill{background:#f8fafc;border:1px solid #e2e8f0;padding:5px 14px;
//       border-radius:20px;font-size:11.5px;color:${C.muted};font-weight:500}

//     /* ROUND avatar */
//     .nav-avatar{width:38px;height:38px;border-radius:50%;background:${C.grad};
//       color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;
//       justify-content:center;cursor:pointer;border:none;font-family:'DM Sans',sans-serif;
//       box-shadow:0 2px 8px rgba(244,63,94,0.3);flex-shrink:0}

//     /* dropdown */
//     .nav-drop{position:absolute;top:calc(100% + 8px);right:0;background:#fff;
//       border:1px solid ${C.border};border-radius:14px;padding:8px;
//       box-shadow:0 8px 30px rgba(0,0,0,0.12);min-width:210px;z-index:200;
//       animation:popIn 0.2s ease}
//     .nav-drop-hdr{padding:10px 12px 12px;border-bottom:1px solid ${C.border};margin-bottom:6px}
//     .nav-drop-name{font-weight:700;color:${C.text};font-size:14px}
//     .nav-drop-email{font-size:11px;color:#94a3b8;margin-top:2px}
//     .nav-drop-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;
//       cursor:pointer;font-size:13px;color:#475569;font-weight:500;transition:background 0.15s}
//     .nav-drop-item:hover{background:#f8fafc}
//     .nav-drop-item.danger{color:#ef4444}
//     .nav-drop-item.danger:hover{background:#fef2f2}
//     .nav-drop-div{height:1px;background:${C.border};margin:4px 0}

//     /* ── SCROLLABLE CONTENT ── */
//     .dcontent{flex:1;overflow-y:auto;padding:1.75rem 2rem;background:${C.bg}}
//     .ph h1{font-family:'Sora',sans-serif;font-size:26px;font-weight:800;color:${C.text};letter-spacing:-0.5px}
//     .ph p{color:${C.muted};font-size:13.5px;margin-top:4px}
//     .wide-card{background:#fff;border-radius:20px;border:1px solid ${C.border};
//       box-shadow:0 2px 20px rgba(0,0,0,0.04);padding:2rem;margin-top:1.25rem;
//       animation:slideUp 0.38s ease}

//     /* STREAM GRID */
//     .stream-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:2rem}
//     .stream-card{border:2px solid #e2e8f0;border-radius:16px;padding:1.5rem 1.25rem;cursor:pointer;
//       background:#fff;transition:all 0.22s;text-align:left;display:flex;flex-direction:column;gap:8px}
//     .stream-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,0.09)}
//     .stream-icon-wrap{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px}
//     .stream-label{font-size:16px;font-weight:700;color:${C.text}}
//     .stream-desc{font-size:12px;color:#94a3b8}

//     /* MARKS */
//     .marks-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:2rem}
//     .info-bar{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 14px;font-size:13px;color:#166534;margin-bottom:1.25rem}

//     /* PERSONALITY SLIDERS — thumb perfectly on track */
//     .trait-row{display:flex;align-items:center;gap:14px;padding:14px 16px;
//       background:#fafafa;border-radius:14px;margin-bottom:10px;border:1px solid ${C.border}}
//     .t-icon{font-size:20px;flex-shrink:0;width:30px;text-align:center}
//     .t-info{flex:1}
//     .t-lbl{font-size:13px;font-weight:600;color:#374151;margin-bottom:8px}
//     .t-scale{display:flex;justify-content:space-between;font-size:10px;color:#9ca3af;margin-top:5px}
//     .t-val{min-width:30px;height:30px;border-radius:8px;background:${C.grad};
//       color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}

//     /* The key fix: use CSS custom property --pct for accurate gradient & thumb alignment */
//     input[type=range]{
//       -webkit-appearance:none;appearance:none;
//       width:100%;height:6px;border-radius:6px;cursor:pointer;outline:none;
//       background:linear-gradient(
//         to right,
//         ${C.primary} 0%,
//         ${C.primary} calc(var(--pct,50%) ),
//         #e2e8f0 calc(var(--pct,50%) ),
//         #e2e8f0 100%
//       );
//     }
//     input[type=range]::-webkit-slider-thumb{
//       -webkit-appearance:none;appearance:none;
//       width:20px;height:20px;border-radius:50%;
//       background:#fff;border:3px solid ${C.primary};
//       box-shadow:0 2px 8px rgba(244,63,94,0.35);
//       cursor:pointer;transition:transform 0.15s;margin-top:0;
//     }
//     input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.2)}
//     input[type=range]::-moz-range-thumb{
//       width:20px;height:20px;border-radius:50%;
//       background:#fff;border:3px solid ${C.primary};
//       box-shadow:0 2px 8px rgba(244,63,94,0.35);cursor:pointer;
//     }
//     input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:6px}
//     input[type=range]::-moz-range-track{height:6px;border-radius:6px;background:#e2e8f0}

//     /* PILLS — nowrap to prevent last item dropping alone */
//     .pills-section{margin-bottom:1.5rem}
//     .pills-heading{font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:10px}
//     .pills-wrap{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}
//     .pill{padding:8px 16px;border-radius:50px;font-size:13px;font-weight:600;cursor:pointer;
//       border:1.5px solid #e2e8f0;background:#fff;color:${C.muted};
//       transition:all 0.18s;white-space:nowrap;flex-shrink:0}
//     .pill:hover{border-color:${C.primary};color:${C.primary}}
//     .pill.active{background:${C.grad};border-color:transparent;color:#fff;box-shadow:0 4px 14px rgba(244,63,94,0.28)}

//     /* FOOTER BUTTONS */
//     .footer-btns{display:flex;align-items:center;justify-content:space-between;
//       margin-top:2rem;padding-top:1.5rem;border-top:1px solid ${C.border}}
//     .result-actions{display:flex;gap:10px;flex-wrap:wrap}
//     .btn-back{font-size:14px;color:#94a3b8;cursor:pointer;font-weight:600;
//       background:none;border:none;font-family:'DM Sans',sans-serif;transition:color 0.2s}
//     .btn-back:hover{color:${C.muted}}
//     .btn-next{padding:12px 28px;border-radius:12px;font-size:14px;font-weight:700;
//       background:linear-gradient(135deg,#1e293b,#334155);color:#fff;border:none;cursor:pointer;
//       font-family:'DM Sans',sans-serif;transition:all 0.2s;box-shadow:0 4px 14px rgba(30,41,59,0.28)}
//     .btn-next:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(30,41,59,0.35)}
//     .btn-next:disabled{opacity:0.38;cursor:not-allowed}
//     .btn-predict{padding:13px 30px;border-radius:12px;font-size:14px;font-weight:700;
//       background:${C.grad};color:#fff;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;
//       box-shadow:0 4px 20px rgba(244,63,94,0.32);animation:pulse 2s ease infinite;transition:all 0.22s}
//     .btn-predict:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(244,63,94,0.42)}
//     .btn-predict:disabled{opacity:0.38;cursor:not-allowed;animation:none}
//     .btn-download{display:flex;align-items:center;gap:8px;padding:11px 22px;border-radius:12px;
//       font-size:13px;font-weight:700;background:#fff;border:1.5px solid ${C.softBorder};
//       color:${C.primary};cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s}
//     .btn-download:hover{background:${C.soft}}

//     /* FEEDBACK */
//     .fb-card{margin-top:2rem;padding:1.5rem;border-radius:16px;background:${C.soft};border:1px solid ${C.softBorder}}
//     .fb-card h4{font-size:14px;font-weight:700;color:${C.primary2};margin-bottom:12px}
//     .stars-row{display:flex;gap:6px;margin-bottom:12px;align-items:center}
//     .star{font-size:26px;cursor:pointer;filter:grayscale(1) opacity(0.35);transition:all 0.15s}
//     .star.on{filter:none}
//     .fb-textarea{width:100%;min-height:80px;padding:12px;border-radius:10px;
//       border:1.5px solid ${C.softBorder};background:#fff;font-size:13.5px;
//       color:${C.text};resize:vertical;outline:none;margin-bottom:12px;font-family:'DM Sans',sans-serif}
//     .fb-textarea:focus{border-color:${C.primary}}
//     .btn-fb{padding:10px 24px;border-radius:10px;font-size:13px;font-weight:700;
//       background:${C.grad};color:#fff;border:none;cursor:pointer;font-family:'DM Sans',sans-serif}

//     @media(max-width:768px){.dsb{display:none}.stream-grid,.marks-grid{grid-template-columns:1fr}}
//   `;

//   /* ══ RENDER ══ */
//   return (
//     <>
//       <style>{css}</style>
//       {isLoading    && <PredictingOverlay />}
//       {showConfirm  && <ConfirmDialog onConfirm={confirmReset} onCancel={()=>setShowConfirm(false)} />}

//       <div className="dw">

//         {/* SIDEBAR */}
//         <aside className="dsb">
//           <div className="dsb-glow"/><div className="dsb-glow2"/>
//           <div className="dsb-brand">
//             <div className="dsb-name">CareerAI</div>
//             <div className="dsb-tag">AI Career Prediction</div>
//           </div>
//           <div className="dsb-steps">
//             {STEPS.map(s=>(
//               <div key={s.n} className={`step-item ${step===s.n?"active":""} ${step>s.n?"completed":""}`}>
//                 <div className="step-num">{step>s.n?"✓":s.icon}</div>
//                 <div className="step-txt"><span>{s.t}</span><small>{s.s}</small></div>
//               </div>
//             ))}
//           </div>
//           <div className="dsb-bottom">
//             <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
//           </div>
//         </aside>

//         {/* MAIN */}
//         <div className="dmain">

//           {/* NAVBAR */}
//           <nav className="dnav">
//             <div className="dnav-left">
//               <span className="dnav-greet">Welcome back,</span>
//               <span className="dnav-title">{userName||"Student"} 👋</span>
//             </div>
//             <div className="dnav-right">
//               <span className="nav-badge">🤖 AI Powered</span>
//               <span className="nav-pill">Step {step} of 5</span>
//               <div style={{position:"relative"}} ref={dropRef}>
//                 <button className="nav-avatar" onClick={()=>setShowDrop(v=>!v)}>{initials}</button>
//                 {showDrop&&(
//                   <div className="nav-drop">
//                     <div className="nav-drop-hdr">
//                       <div className="nav-drop-name">{userName}</div>
//                       <div className="nav-drop-email">{userEmail}</div>
//                     </div>
//                     <div className="nav-drop-item" onClick={()=>{navigate("/profile");setShowDrop(false)}}>👤 My Profile</div>
//                     <div className="nav-drop-item" onClick={()=>{navigate("/predictions");setShowDrop(false)}}>📊 My Predictions</div>
//                     <div className="nav-drop-item" onClick={()=>{navigate("/settings");setShowDrop(false)}}>⚙️ Settings</div>
//                     <div className="nav-drop-item" onClick={()=>{navigate("/");setShowDrop(false)}}>🏠 Go to Home</div>
//                     <div className="nav-drop-div"/>
//                     <div className="nav-drop-item danger" onClick={handleLogout}>🚪 Logout</div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </nav>

//           {/* CONTENT */}
//           <div className="dcontent">
//             <div className="ph">
//               <h1>{STEPS[step-1].t}</h1>
//               <p>Please provide accurate details for a better AI prediction.</p>
//             </div>

//             <div className="wide-card">

//               {/* STEP 1 */}
//               {step===1&&(
//                 <div>
//                   <div className="stream-grid">
//                     {STREAMS.map(s=>(
//                       <button key={s.id}
//                         className={`stream-card ${formData.Stream===s.id?"selected":""}`}
//                         style={formData.Stream===s.id?{borderColor:s.color,background:s.bg,
//                           boxShadow:`0 6px 22px ${s.color}22`,transform:"translateY(-3px)"}:{}}
//                         onClick={()=>updateField("Stream",s.id)}>
//                         <div className="stream-icon-wrap" style={{background:s.bg}}>
//                           <span style={{fontSize:26}}>{s.icon}</span>
//                         </div>
//                         <div className="stream-label" style={formData.Stream===s.id?{color:s.color}:{}}>{s.label}</div>
//                         <div className="stream-desc">{s.desc}</div>
//                         {formData.Stream===s.id&&<div style={{fontSize:11,fontWeight:700,color:s.color,marginTop:4}}>✓ Selected</div>}
//                       </button>
//                     ))}
//                   </div>
//                   <div className="footer-btns">
//                     <div/>
//                     <button className="btn-next" disabled={!formData.Stream} onClick={()=>setStep(2)}>Next Step →</button>
//                   </div>
//                 </div>
//               )}

//               {/* STEP 2 */}
//               {step===2&&(
//                 <div>
//                   <div className="info-bar">✅ Enter marks between <strong>33–100</strong>. Below 33 or above 100 will show an error.</div>
//                   <div className="marks-grid">
//                     {getSubjects().map(sub=>(
//                       <MarkInput key={sub.name} label={sub.label} name={sub.name} val={formData[sub.name]} fn={updateField}/>
//                     ))}
//                   </div>
//                   <div className="footer-btns">
//                     <button className="btn-back" onClick={()=>setStep(1)}>← Back</button>
//                     <button className="btn-next" disabled={!canGoNext()} onClick={()=>setStep(3)}>Next: Personality →</button>
//                   </div>
//                 </div>
//               )}

//               {/* STEP 3 — slider thumb fix */}
//               {step===3&&(
//                 <div>
//                   <p style={{color:C.muted,fontSize:13,marginBottom:"1.5rem",
//                     background:C.soft,padding:"10px 14px",borderRadius:10,border:`1px solid ${C.softBorder}`}}>
//                     🧠 Drag each slider to reflect your personality. <strong>1 = Low &nbsp;|&nbsp; 5 = High</strong>
//                   </p>
//                   {TRAITS.map(trait=>{
//                     const val=formData[trait.id];
//                     // pct string like "50%" — drives both gradient fill AND thumb position accurately
//                     const pct=`${((val-1)/4*100).toFixed(1)}%`;
//                     return(
//                       <div key={trait.id} className="trait-row">
//                         <div className="t-icon">{trait.icon}</div>
//                         <div className="t-info">
//                           <div className="t-lbl">{trait.label}</div>
//                           <input type="range" min={1} max={5} step={1} value={val}
//                             style={{"--pct":pct}}
//                             onChange={e=>updateField(trait.id,parseInt(e.target.value))}/>
//                           <div className="t-scale">
//                             <span>1 — Low</span><span>2</span><span>3 — Medium</span><span>4</span><span>5 — High</span>
//                           </div>
//                         </div>
//                         <div className="t-val">{val}</div>
//                       </div>
//                     );
//                   })}
//                   <div className="footer-btns">
//                     <button className="btn-back" onClick={()=>setStep(2)}>← Back</button>
//                     <button className="btn-next" onClick={()=>setStep(4)}>Next: Interests →</button>
//                   </div>
//                 </div>
//               )}

//               {/* STEP 4 */}
//               {step===4&&(
//                 <div>
//                   <div className="pills-section">
//                     <div className="pills-heading">🎯 Your Interests</div>
//                     <div className="pills-wrap">
//                       {INTERESTS.map(item=>(
//                         <div key={item}
//                           className={`pill ${formData[`Interest_${item}`]?"active":""}`}
//                           onClick={()=>updateField(`Interest_${item}`,!formData[`Interest_${item}`])}>
//                           {formData[`Interest_${item}`]?"✓ ":""}{slugLabel(item)}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                   <div className="pills-section">
//                     <div className="pills-heading">🏆 Sports & Participation</div>
//                     <div className="pills-wrap">
//                       {PARTICIPATIONS.map(item=>(
//                         <div key={item}
//                           className={`pill ${formData[`Participated_${item}`]?"active":""}`}
//                           onClick={()=>updateField(`Participated_${item}`,!formData[`Participated_${item}`])}>
//                           {formData[`Participated_${item}`]?"✓ ":""}{item}
//                         </div>
//                       ))}
//                       <div className={`pill ${formData.PositiveThinking?"active":""}`}
//                         onClick={()=>updateField("PositiveThinking",!formData.PositiveThinking)}>
//                         {formData.PositiveThinking?"✓ ":""}Positive Thinking
//                       </div>
//                     </div>
//                   </div>
//                   <div className="footer-btns">
//                     <button className="btn-back" onClick={()=>setStep(3)}>← Back</button>
//                     <button className="btn-predict" disabled={!canGoNext()} onClick={handlePredict}>✨ Predict My Career</button>
//                   </div>
//                 </div>
//               )}

//               {/* STEP 5 */}
//               {step===5&&predictions&&(
//                 <div style={{animation:"slideUp 0.5s ease"}}>
//                   <div style={{textAlign:"center",marginBottom:"1.75rem",padding:"1.5rem",
//                     background:C.gradLight,borderRadius:16,border:`1px solid ${C.softBorder}`}}>
//                     <div style={{fontSize:42,marginBottom:8}}>🎉</div>
//                     <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:C.text,marginBottom:6}}>
//                       Your AI Career Report
//                     </h2>
//                     <p style={{color:C.primary2,fontSize:14}}>Based on your complete profile — here are your top career matches</p>
//                   </div>

//                   {predictions.Top_Predictions.map((r,i)=>(
//                     <ResultBar key={i} career={r.career} confidence={r.confidence} reason={r.reason} index={i}/>
//                   ))}

//                   <div className="footer-btns">
//                     <button className="btn-back" onClick={()=>setStep(4)}>← Back</button>
//                     <div className="result-actions">
//                       <button className="btn-download" onClick={downloadResult}>
//                         ⬇ Download PDF Report
//                       </button>
//                       <button className="btn-next" onClick={()=>setShowConfirm(true)}>🔄 Test Again</button>
//                     </div>
//                   </div>

//                   <div className="fb-card">
//                     <h4>⭐ How accurate was this prediction?</h4>
//                     <div className="stars-row">
//                       {[1,2,3,4,5].map(n=>(
//                         <span key={n} className={`star ${feedback.rating>=n?"on":""}`}
//                           onClick={()=>setFeedback(f=>({...f,rating:n}))}>⭐</span>
//                       ))}
//                       <span style={{fontSize:13,color:C.primary2,fontWeight:600,marginLeft:8}}>
//                         {["","Bad","Poor","Average","Good","Excellent"][feedback.rating]}
//                       </span>
//                     </div>
//                     <textarea className="fb-textarea"
//                       placeholder="Tell us what you think about this prediction..."
//                       value={feedback.comment}
//                       onChange={e=>setFeedback(f=>({...f,comment:e.target.value}))}/>
//                     <button className="btn-fb" onClick={submitFeedback}>Submit Feedback →</button>
//                   </div>
//                 </div>
//               )}

//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default DashboardPage;




//Created but small
// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { supabase } from "../../../backend/supabaseClient";
// import { useNavigate } from "react-router";
// import toast from "react-hot-toast";

// // ── tiny helpers ────────────────────────────────────────────────────────────
// const slugLabel = (s) => s.replace(/([A-Z])/g, " $1").trim();

// // ── Stream config ────────────────────────────────────────────────────────────
// const STREAMS = [
//   {
//     id: "Science_PCM",
//     label: "Science PCM",
//     icon: "⚛️",
//     color: "#3b82f6",
//     bg: "#eff6ff",
//     border: "#bfdbfe",
//     desc: "Physics · Chemistry · Mathematics",
//   },
//   {
//     id: "Science_PCB",
//     label: "Science PCB",
//     icon: "🧬",
//     color: "#10b981",
//     bg: "#ecfdf5",
//     border: "#a7f3d0",
//     desc: "Physics · Chemistry · Biology",
//   },
//   {
//     id: "Commerce",
//     label: "Commerce",
//     icon: "📈",
//     color: "#f59e0b",
//     bg: "#fffbeb",
//     border: "#fde68a",
//     desc: "Accountancy · Business · Economics",
//   },
//   {
//     id: "Arts",
//     label: "Arts",
//     icon: "🎨",
//     color: "#8b5cf6",
//     bg: "#f5f3ff",
//     border: "#ddd6fe",
//     desc: "History · Geography · Sociology",
//   },
// ];

// // ── Personality traits ───────────────────────────────────────────────────────
// const TRAITS = [
//   { id: "Oppenness", label: "Creativity & Learning", icon: "💡" },
//   { id: "Conscientiousness", label: "Discipline & Planning", icon: "🎯" },
//   { id: "Extraversion", label: "Socializing & Communication", icon: "🗣️" },
//   { id: "Agreeableness", label: "Friendliness & Teamwork", icon: "🤝" },
//   { id: "Neuroticism", label: "Stress Management", icon: "🧘" },
// ];

// const INTERESTS = [
//   "Tech","Entrepreneurship","Leadership","Innovation",
//   "CriticalThinking","Research","ComputerSkill","HardwareSkill","Food","Creativity",
// ];
// const PARTICIPATIONS = ["Hackathon","Olympiad","Kabaddi","KhoKho","Cricket"];

// const STEPS = [
//   { n: 1, t: "Stream Selection", s: "Basic Info", icon: "🎓" },
//   { n: 2, t: "Academic Marks", s: "Subject Scores", icon: "📝" },
//   { n: 3, t: "Personality Traits", s: "Big Five Scaling", icon: "🧠" },
//   { n: 4, t: "Interests & Skills", s: "Final Assessment", icon: "⭐" },
//   { n: 5, t: "AI Results", s: "Prediction", icon: "🚀" },
// ];

// const EMPTY_FORM = {
//   Stream: "", Physics: "", Chemistry: "", Biology: "", English: "",
//   ComputerScience: "", Mathematics: "", Accountancy: "", BusinessStudies: "",
//   Economics: "", History: "", Geography: "", PoliticalScience: "",
//   Sociology: "", Interest_Tech: false, Interest_Entrepreneurship: false,
//   Interest_Leadership: false, Interest_Innovation: false,
//   Interest_CriticalThinking: false, Interest_Research: false,
//   Interest_ComputerSkill: false, Interest_HardwareSkill: false,
//   Interest_Food: false, Interest_Creativity: false, PositiveThinking: false,
//   Participated_Hackathon: false, Participated_Olympiad: false,
//   Participated_Kabaddi: false, Participated_KhoKho: false,
//   Participated_Cricket: false, Oppenness: 3, Conscientiousness: 3,
//   Extraversion: 3, Agreeableness: 3, Neuroticism: 3,
// };

// // ── Result bar chart component ───────────────────────────────────────────────
// function ResultBar({ career, confidence, reason, index, color }) {
//   const [width, setWidth] = useState(0);
//   useEffect(() => {
//     const t = setTimeout(() => setWidth(confidence), 300 + index * 200);
//     return () => clearTimeout(t);
//   }, [confidence, index]);

//   const colors = ["#f97316", "#3b82f6", "#8b5cf6"];
//   const c = colors[index] || "#6b7280";

//   return (
//     <div style={{
//       background: "#fff",
//       borderRadius: 16,
//       padding: "1.5rem",
//       border: "1px solid #f1f5f9",
//       boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
//       marginBottom: "1rem",
//       animation: `slideUp 0.5s ease ${index * 0.15}s both`,
//     }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           <div style={{
//             width: 32, height: 32, borderRadius: 8,
//             background: c + "20", display: "flex", alignItems: "center",
//             justifyContent: "center", fontSize: 16,
//           }}>
//             {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
//           </div>
//           <span style={{ fontWeight: 700, fontSize: 17, color: "#1e293b" }}>{career}</span>
//         </div>
//         <span style={{
//           background: c + "15", color: c, fontWeight: 700,
//           fontSize: 15, padding: "4px 14px", borderRadius: 20,
//         }}>{confidence}%</span>
//       </div>
//       <div style={{ background: "#f1f5f9", borderRadius: 8, height: 10, overflow: "hidden", marginBottom: 10 }}>
//         <div style={{
//           width: `${width}%`, height: "100%", borderRadius: 8,
//           background: `linear-gradient(90deg, ${c}, ${c}99)`,
//           transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
//         }} />
//       </div>
//       <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{reason}</p>
//     </div>
//   );
// }

// // ── Loading overlay ──────────────────────────────────────────────────────────
// function PredictingOverlay() {
//   const [msgIdx, setMsgIdx] = useState(0);
//   const msgs = [
//     "🔍 Analyzing your academic profile...",
//     "🧠 Processing personality traits...",
//     "⭐ Matching your interests...",
//     "🤖 AI is predicting your career...",
//     "✨ Almost there, finalizing results...",
//   ];
//   useEffect(() => {
//     const t = setInterval(() => setMsgIdx(i => (i + 1) % msgs.length), 1800);
//     return () => clearInterval(t);
//   }, []);

//   return (
//     <div style={{
//       position: "fixed", inset: 0, zIndex: 1000,
//       background: "rgba(15,23,42,0.85)",
//       backdropFilter: "blur(8px)",
//       display: "flex", flexDirection: "column",
//       alignItems: "center", justifyContent: "center", gap: 24,
//     }}>
//       {/* Orbit spinner */}
//       <div style={{ position: "relative", width: 100, height: 100 }}>
//         <div style={{
//           position: "absolute", inset: 0, borderRadius: "50%",
//           border: "3px solid transparent",
//           borderTopColor: "#f97316",
//           animation: "spin 1s linear infinite",
//         }} />
//         <div style={{
//           position: "absolute", inset: 8, borderRadius: "50%",
//           border: "3px solid transparent",
//           borderTopColor: "#3b82f6",
//           animation: "spin 1.4s linear infinite reverse",
//         }} />
//         <div style={{
//           position: "absolute", inset: 0, display: "flex",
//           alignItems: "center", justifyContent: "center",
//           fontSize: 32,
//         }}>🤖</div>
//       </div>
//       <div style={{
//         color: "#fff", fontSize: 18, fontWeight: 600,
//         animation: "fadeInOut 1.8s ease infinite",
//         textAlign: "center", maxWidth: 300,
//       }}>{msgs[msgIdx]}</div>
//       <div style={{ display: "flex", gap: 8 }}>
//         {[0,1,2,3,4].map(i => (
//           <div key={i} style={{
//             width: 8, height: 8, borderRadius: "50%",
//             background: i === msgIdx % 5 ? "#f97316" : "rgba(255,255,255,0.3)",
//             transition: "background 0.3s",
//           }} />
//         ))}
//       </div>
//     </div>
//   );
// }

// // ── Confirm Dialog ───────────────────────────────────────────────────────────
// function ConfirmDialog({ onConfirm, onCancel }) {
//   return (
//     <div style={{
//       position: "fixed", inset: 0, zIndex: 999,
//       background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
//       display: "flex", alignItems: "center", justifyContent: "center",
//     }}>
//       <div style={{
//         background: "#fff", borderRadius: 20, padding: "2rem",
//         maxWidth: 380, width: "90%", textAlign: "center",
//         boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
//         animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
//       }}>
//         <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
//         <h3 style={{ color: "#1e293b", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
//           Start Over?
//         </h3>
//         <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
//           This will clear <strong>all your entered data</strong> and previous prediction results. This action cannot be undone.
//         </p>
//         <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
//           <button onClick={onCancel} style={{
//             padding: "10px 24px", borderRadius: 10, border: "1.5px solid #e2e8f0",
//             background: "#fff", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: 14,
//           }}>Cancel</button>
//           <button onClick={onConfirm} style={{
//             padding: "10px 24px", borderRadius: 10, border: "none",
//             background: "linear-gradient(135deg, #ef4444, #dc2626)",
//             color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14,
//           }}>Yes, Clear All</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Mark input with validation ────────────────────────────────────────────────
// function MarkInput({ label, name, val, fn }) {
//   const [err, setErr] = useState("");
//   const handleChange = (e) => {
//     const v = e.target.value;
//     fn(name, v);
//     if (v === "") { setErr(""); return; }
//     const n = parseFloat(v);
//     if (isNaN(n) || n < 1 || n > 100) setErr("Must be between 1–100");
//     else if (n < 33) setErr("Minimum passing marks is 33");
//     else setErr("");
//   };
//   const hasErr = !!err;
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//       <label style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{label}</label>
//       <input
//         type="number" min={1} max={100} value={val}
//         onChange={handleChange}
//         placeholder="Enter marks"
//         style={{
//           padding: "10px 14px", borderRadius: 10, fontSize: 15,
//           border: `1.5px solid ${hasErr ? "#ef4444" : "#e2e8f0"}`,
//           background: hasErr ? "#fef2f2" : "#f8fafc",
//           outline: "none", transition: "border 0.2s",
//           color: "#1e293b",
//         }}
//       />
//       {hasErr && <span style={{ fontSize: 11, color: "#ef4444", marginTop: 2 }}>{err}</span>}
//     </div>
//   );
// }

// // ── Main DashboardPage ───────────────────────────────────────────────────────
// const DashboardPage = () => {
//   const navigate = useNavigate();
//   const [step, setStep] = useState(() => parseInt(localStorage.getItem("formStep")) || 1);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [feedback, setFeedback] = useState({ rating: 5, comment: "" });
//   const [userName, setUserName] = useState("");
//   const [showDropdown, setShowDropdown] = useState(false);
//   const dropRef = useRef(null);

//   const [predictions, setPredictions] = useState(() => {
//     const s = localStorage.getItem("careerPredictions");
//     return s ? JSON.parse(s) : null;
//   });
//   const [formData, setFormData] = useState(() => {
//     const s = localStorage.getItem("careerFormData");
//     return s ? JSON.parse(s) : EMPTY_FORM;
//   });

//   useEffect(() => {
//     localStorage.setItem("formStep", step);
//     localStorage.setItem("careerFormData", JSON.stringify(formData));
//     if (predictions) localStorage.setItem("careerPredictions", JSON.stringify(predictions));
//   }, [step, formData, predictions]);

//   useEffect(() => {
//     supabase.auth.getUser().then(({ data: { user } }) => {
//       if (user) {
//         const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
//         setUserName(name);
//       }
//     });
//   }, []);

//   useEffect(() => {
//     const handler = (e) => {
//       if (dropRef.current && !dropRef.current.contains(e.target)) setShowDropdown(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const updateField = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

//   const canGoNext = () => {
//     if (step === 1) return formData.Stream !== "";
//     if (step === 2) {
//       let required = ["English"];
//       if (formData.Stream.includes("Science")) required.push("Physics", "Chemistry");
//       if (formData.Stream === "Science_PCM") required.push("Mathematics", "ComputerScience");
//       if (formData.Stream === "Science_PCB") required.push("Biology");
//       if (formData.Stream === "Commerce") required.push("Accountancy", "BusinessStudies", "Economics");
//       if (formData.Stream === "Arts") required.push("History", "Geography", "Sociology");
//       return required.every(f => {
//         const v = parseFloat(formData[f]);
//         return formData[f] !== "" && !isNaN(v) && v >= 33 && v <= 100;
//       });
//     }
//     if (step === 3) return true;
//     if (step === 4) {
//       const hasInterest = INTERESTS.some(i => formData[`Interest_${i}`]);
//       const hasPart = PARTICIPATIONS.some(p => formData[`Participated_${p}`]);
//       return hasInterest || hasPart || formData.PositiveThinking;
//     }
//     return false;
//   };

//   const handlePredict = async () => {
//     setIsLoading(true);
//     try {
//       const cleanedData = {};
//       Object.keys(formData).forEach(key => {
//         const value = formData[key];
//         if (typeof value === "boolean") cleanedData[key] = value ? 1 : 0;
//         else if (value === "" || value === null) cleanedData[key] = 0;
//         else if (!isNaN(value) && key !== "Stream") cleanedData[key] = parseFloat(value);
//         else cleanedData[key] = value;
//       });

//       const { data: { user } } = await supabase.auth.getUser();
//       let currentInputId = null;
//       if (user) {
//         const { data: inputRow, error: dbError } = await supabase
//           .from("user_inputs").insert([{
//             user_id: user.id, stream: cleanedData.Stream,
//             physics: cleanedData.Physics, chemistry: cleanedData.Chemistry,
//             biology: cleanedData.Biology, english: cleanedData.English,
//             computerscience: cleanedData.ComputerScience, mathematics: cleanedData.Mathematics,
//             accountancy: cleanedData.Accountancy, businessstudies: cleanedData.BusinessStudies,
//             economics: cleanedData.Economics, history: cleanedData.History,
//             geography: cleanedData.Geography, politicalscience: cleanedData.PoliticalScience,
//             sociology: cleanedData.Sociology, oppenness: cleanedData.Oppenness,
//             conscientiousness: cleanedData.Conscientiousness, extraversion: cleanedData.Extraversion,
//             agreeableness: cleanedData.Agreeableness, neuroticism: cleanedData.Neuroticism,
//             interest_tech: cleanedData.Interest_Tech,
//             interest_entrepreneurship: cleanedData.Interest_Entrepreneurship,
//             interest_leadership: cleanedData.Interest_Leadership,
//             interest_innovation: cleanedData.Interest_Innovation,
//             interest_criticalthinking: cleanedData.Interest_CriticalThinking,
//             interest_research: cleanedData.Interest_Research,
//             interest_computerskill: cleanedData.Interest_ComputerSkill,
//             interest_hardwareskill: cleanedData.Interest_HardwareSkill,
//             interest_food: cleanedData.Interest_Food, interest_creativity: cleanedData.Interest_Creativity,
//             positivethinking: cleanedData.PositiveThinking,
//             participated_hackathon: cleanedData.Participated_Hackathon,
//             participated_olympiad: cleanedData.Participated_Olympiad,
//             participated_kabaddi: cleanedData.Participated_Kabaddi,
//             participated_khokho: cleanedData.Participated_KhoKho,
//             participated_cricket: cleanedData.Participated_Cricket,
//           }]).select("id").single();
//         if (!dbError) currentInputId = inputRow.id;
//       }

//       const response = await axios.post("http://127.0.0.1:8000/predict", cleanedData);
//       if (response.data?.Top_Predictions) {
//         const aiResults = response.data.Top_Predictions;
//         if (user) {
//           await supabase.from("predictions").insert([{
//             user_id: user.id, input_id: currentInputId,
//             career_1: aiResults[0]?.career, confidence_1: aiResults[0]?.confidence, explanation_1: aiResults[0]?.reason,
//             career_2: aiResults[1]?.career, confidence_2: aiResults[1]?.confidence, explanation_2: aiResults[1]?.reason,
//             career_3: aiResults[2]?.career, confidence_3: aiResults[2]?.confidence, explanation_3: aiResults[2]?.reason,
//           }]);
//         }
//         setPredictions(response.data);
//         setStep(5);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Something went wrong! Check if the AI server is running.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const submitFeedback = async () => {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) { toast.error("Please login first"); return; }
//     const { error } = await supabase.from("feedbacks").insert([{
//       user_id: user.id, rating: parseInt(feedback.rating), comment: feedback.comment,
//     }]);
//     if (!error) {
//       toast.success("Thank you for your feedback! 🎉");
//       localStorage.removeItem("careerPredictions");
//       setStep(1);
//     } else toast.error("Error saving feedback");
//   };

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     localStorage.clear();
//     toast.success("Logged out successfully!");
//     navigate("/login");
//   };

//   const handleTestAgain = () => setShowConfirm(true);
//   const confirmReset = () => {
//     localStorage.removeItem("careerPredictions");
//     localStorage.removeItem("careerFormData");
//     localStorage.removeItem("formStep");
//     setPredictions(null);
//     setFormData(EMPTY_FORM);
//     setShowConfirm(false);
//     setStep(1);
//   };

//   const initials = userName.slice(0, 2).toUpperCase();

//   // ── subjects per stream
//   const getSubjects = () => {
//     const base = [{ label: "English", name: "English" }];
//     if (formData.Stream.includes("Science"))
//       base.push({ label: "Physics", name: "Physics" }, { label: "Chemistry", name: "Chemistry" });
//     if (formData.Stream === "Science_PCM")
//       base.push({ label: "Mathematics", name: "Mathematics" }, { label: "Computer Science", name: "ComputerScience" });
//     if (formData.Stream === "Science_PCB")
//       base.push({ label: "Biology", name: "Biology" });
//     if (formData.Stream === "Commerce")
//       base.push({ label: "Accountancy", name: "Accountancy" }, { label: "Business Studies", name: "BusinessStudies" }, { label: "Economics", name: "Economics" });
//     if (formData.Stream === "Arts")
//       base.push({ label: "History", name: "History" }, { label: "Geography", name: "Geography" }, { label: "Sociology", name: "Sociology" });
//     return base;
//   };

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//         body { font-family: 'DM Sans', sans-serif; background: #f8fafc; }
        
//         @keyframes spin { to { transform: rotate(360deg); } }
//         @keyframes fadeInOut { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
//         @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
//         @keyframes popIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
//         @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
//         @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
//         @keyframes orbFloat { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-8px) rotate(180deg); } }

//         .dash-wrapper { display: flex; height: 100vh; overflow: hidden; }

//         /* ── SIDEBAR ── */
//         .dash-sidebar {
//           width: 260px; flex-shrink: 0;
//           background: linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
//           display: flex; flex-direction: column;
//           padding: 0; position: relative; overflow: hidden;
//           border-right: 1px solid rgba(255,255,255,0.06);
//         }
//         .sidebar-glow {
//           position: absolute; width: 200px; height: 200px; border-radius: 50%;
//           background: radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%);
//           top: -60px; left: -60px; pointer-events: none;
//         }
//         .sidebar-glow2 {
//           position: absolute; width: 160px; height: 160px; border-radius: 50%;
//           background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%);
//           bottom: 100px; right: -40px; pointer-events: none;
//         }
//         .sidebar-brand {
//           padding: 1.5rem 1.5rem 1rem;
//           border-bottom: 1px solid rgba(255,255,255,0.07);
//           position: relative; z-index: 1;
//         }
//         .brand-name {
//           font-family: 'Sora', sans-serif; font-weight: 800;
//           font-size: 20px; color: #fff; letter-spacing: -0.5px;
//         }
//         .brand-tag {
//           font-size: 10px; color: rgba(255,255,255,0.4);
//           text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;
//         }
//         .sidebar-steps { flex: 1; padding: 1.5rem 1rem; position: relative; z-index: 1; overflow-y: auto; }
//         .step-item {
//           display: flex; align-items: center; gap: 12px;
//           padding: 12px 14px; border-radius: 12px;
//           margin-bottom: 4px; cursor: default;
//           transition: background 0.2s;
//         }
//         .step-item.active { background: rgba(249,115,22,0.15); }
//         .step-item.completed { opacity: 0.7; }
//         .step-num {
//           width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
//           display: flex; align-items: center; justify-content: center;
//           font-size: 13px; font-weight: 700;
//           background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.4);
//           border: 1px solid rgba(255,255,255,0.1);
//           transition: all 0.3s;
//         }
//         .step-item.active .step-num {
//           background: linear-gradient(135deg, #f97316, #ea580c);
//           color: #fff; border-color: transparent;
//           box-shadow: 0 4px 12px rgba(249,115,22,0.4);
//         }
//         .step-item.completed .step-num {
//           background: rgba(16,185,129,0.2); color: #34d399;
//           border-color: rgba(16,185,129,0.3);
//         }
//         .step-txt span {
//           font-size: 13px; font-weight: 600;
//           color: rgba(255,255,255,0.5); display: block;
//           transition: color 0.2s;
//         }
//         .step-item.active .step-txt span { color: #fff; }
//         .step-txt small { font-size: 11px; color: rgba(255,255,255,0.3); }
//         .sidebar-bottom {
//           padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.07);
//           position: relative; z-index: 1;
//         }
//         .logout-btn {
//           width: 100%; padding: 10px; border-radius: 10px;
//           background: rgba(239,68,68,0.12); color: #fca5a5;
//           border: 1px solid rgba(239,68,68,0.2); font-size: 13px;
//           font-weight: 600; cursor: pointer; transition: all 0.2s;
//           font-family: 'DM Sans', sans-serif;
//         }
//         .logout-btn:hover { background: rgba(239,68,68,0.2); color: #f87171; }

//         /* ── MAIN AREA ── */
//         .dash-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

//         /* ── NAVBAR ── */
//         .dash-navbar {
        
//           height: 64px; background: #fff; flex-shrink: 0;
//           border-bottom: 1px solid #f1f5f9;
//           display: flex; align-items: center; justify-content: space-between;
//           padding: 0 2rem;
//           box-shadow: 0 1px 8px rgba(0,0,0,0.04);
//         }
//         .navbar-left { display: flex; flex-direction: column; }
//         .navbar-greeting { font-size: 11px; color: #94a3b8; font-weight: 500; }
//         .navbar-title {
//           font-family: 'Sora', sans-serif; font-size: 16px;
//           font-weight: 700; color: #1e293b;
//         }
//         .navbar-right { display: flex; align-items: center; gap: 12px; }
//         .nav-badge {
//           background: linear-gradient(135deg, #fff7ed, #fed7aa);
//           border: 1px solid #fdba74; color: #c2410c;
//           padding: 5px 12px; border-radius: 20px;
//           font-size: 12px; font-weight: 600;
//         }
//         .nav-step-pill {
//           background: #f8fafc; border: 1px solid #e2e8f0;
//           padding: 5px 14px; border-radius: 20px;
//           font-size: 12px; color: #64748b; font-weight: 500;
//         }
//         .avatar-btn {
//           width: 38px; height: 38px; border-radius: 10px;
//           background: linear-gradient(135deg, #f97316, #8b5cf6);
//           color: #fff; font-weight: 700; font-size: 14px;
//           display: flex; align-items: center; justify-content: center;
//           cursor: pointer; border: none; position: relative;
//           font-family: 'DM Sans', sans-serif;
//         }
//         .dropdown-menu {
//           position: absolute; top: calc(100% + 8px); right: 0;
//           background: #fff; border: 1px solid #f1f5f9;
//           border-radius: 14px; padding: 8px;
//           box-shadow: 0 8px 30px rgba(0,0,0,0.12);
//           min-width: 200px; z-index: 100;
//           animation: popIn 0.2s ease;
//         }
//         .dropdown-header {
//           padding: 10px 12px 12px; border-bottom: 1px solid #f1f5f9; margin-bottom: 6px;
//         }
//         .dropdown-name { font-weight: 700; color: #1e293b; font-size: 14px; }
//         .dropdown-email { font-size: 12px; color: #94a3b8; margin-top: 2px; }
//         .dropdown-item {
//           display: flex; align-items: center; gap: 10px;
//           padding: 9px 12px; border-radius: 8px; cursor: pointer;
//           font-size: 13px; color: #475569; font-weight: 500;
//           transition: background 0.15s; text-decoration: none;
//         }
//         .dropdown-item:hover { background: #f8fafc; }
//         .dropdown-item.danger { color: #ef4444; }
//         .dropdown-item.danger:hover { background: #fef2f2; }

//         /* ── CONTENT ── */
//         .dash-content { flex: 1; overflow-y: auto; padding: 2rem; background: #f8fafc; }
//         .page-header { margin-bottom: 1.5rem; }
//         .page-header h1 {
//           font-family: 'Sora', sans-serif; font-size: 28px;
//           font-weight: 800; color: #1e293b; letter-spacing: -0.5px;
//         }
//         .page-header p { color: #64748b; font-size: 14px; margin-top: 4px; }
//         .wide-card {
//           background: #fff; border-radius: 20px;
//           border: 1px solid #f1f5f9;
//           box-shadow: 0 2px 20px rgba(0,0,0,0.05);
//           padding: 2rem; animation: slideUp 0.4s ease;
//         }

//         /* ── STREAM GRID ── */
//         .stream-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 2rem; }
//         .stream-card {
//           border: 2px solid #e2e8f0; border-radius: 16px;
//           padding: 1.5rem; cursor: pointer; background: #fff;
//           transition: all 0.25s; text-align: left;
//           display: flex; flex-direction: column; gap: 8px;
//         }
//         .stream-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
//         .stream-icon-wrap {
//           width: 48px; height: 48px; border-radius: 12px;
//           display: flex; align-items: center; justify-content: center;
//           font-size: 22px; margin-bottom: 4px;
//         }
//         .stream-label { font-size: 16px; font-weight: 700; color: #1e293b; }
//         .stream-desc { font-size: 12px; color: #94a3b8; }

//         /* ── MARKS GRID ── */
//         .marks-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 2rem; }

//         /* ── SLIDER ── */
//         .trait-row {
//           display: flex; align-items: center; gap: 16px;
//           padding: 14px 16px; background: #f8fafc; border-radius: 14px;
//           margin-bottom: 10px; border: 1px solid #f1f5f9;
//         }
//         .trait-icon { font-size: 20px; flex-shrink: 0; width: 32px; text-align: center; }
//         .trait-info { flex: 1; }
//         .trait-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; display: flex; justify-content: space-between; }
//         .trait-scale { display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; margin-top: 4px; }
//         input[type=range] {
//           width: 100%; height: 4px; border-radius: 4px;
//           background: linear-gradient(90deg, #f97316 calc(var(--val)*20%), #e2e8f0 calc(var(--val)*20%));
//           appearance: none; cursor: pointer; outline: none;
//         }
//         input[type=range]::-webkit-slider-thumb {
//           appearance: none; width: 18px; height: 18px;
//           border-radius: 50%; background: #f97316;
//           border: 2px solid #fff; box-shadow: 0 2px 6px rgba(249,115,22,0.4);
//           cursor: pointer; transition: transform 0.15s;
//         }
//         input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
//         .val-badge {
//           min-width: 28px; height: 28px; border-radius: 8px;
//           background: linear-gradient(135deg, #f97316, #ea580c);
//           color: #fff; font-size: 13px; font-weight: 700;
//           display: flex; align-items: center; justify-content: center;
//           flex-shrink: 0;
//         }

//         /* ── PILLS ── */
//         .pills-section { margin-bottom: 1.5rem; }
//         .pills-heading { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
//         .pills-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
//         .pill {
//           padding: 8px 16px; border-radius: 50px; font-size: 13px;
//           font-weight: 600; cursor: pointer; border: 1.5px solid #e2e8f0;
//           background: #fff; color: #64748b; transition: all 0.2s;
//           display: flex; align-items: center; gap: 6px;
//         }
//         .pill:hover { border-color: #f97316; color: #f97316; }
//         .pill.active {
//           background: linear-gradient(135deg, #f97316, #ea580c);
//           border-color: transparent; color: #fff;
//           box-shadow: 0 4px 12px rgba(249,115,22,0.3);
//         }

//         /* ── FOOTER BTNS ── */
//         .footer-btns {
//           display: flex; align-items: center; justify-content: space-between;
//           margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9;
//         }
//         .btn-back {
//           font-size: 14px; color: #94a3b8; cursor: pointer;
//           font-weight: 600; transition: color 0.2s; background: none; border: none;
//           font-family: 'DM Sans', sans-serif;
//         }
//         .btn-back:hover { color: #64748b; }
//         .btn-next {
//           padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 700;
//           background: linear-gradient(135deg, #1e293b, #334155);
//           color: #fff; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
//           transition: all 0.2s; box-shadow: 0 4px 14px rgba(30,41,59,0.3);
//         }
//         .btn-next:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,41,59,0.35); }
//         .btn-next:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
//         .btn-predict {
//           padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 700;
//           background: linear-gradient(135deg, #f97316, #8b5cf6);
//           color: #fff; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
//           transition: all 0.25s; box-shadow: 0 4px 20px rgba(249,115,22,0.35);
//           animation: pulse 2s ease infinite;
//         }
//         .btn-predict:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(249,115,22,0.45); }
//         .btn-predict:disabled { opacity: 0.4; cursor: not-allowed; animation: none; }

//         /* ── FEEDBACK ── */
//         .feedback-card {
//           margin-top: 2rem; padding: 1.5rem; background: #fffbeb;
//           border-radius: 16px; border: 1px solid #fde68a;
//         }
//         .feedback-card h4 { font-size: 15px; font-weight: 700; color: #92400e; margin-bottom: 12px; }
//         .star-select { display: flex; gap: 6px; margin-bottom: 12px; }
//         .star { font-size: 28px; cursor: pointer; transition: transform 0.15s; filter: grayscale(1) opacity(0.4); }
//         .star.active { filter: none; transform: scale(1.1); }
//         .feedback-textarea {
//           width: 100%; min-height: 80px; padding: 12px; border-radius: 10px;
//           border: 1.5px solid #fde68a; background: #fff; font-size: 14px;
//           color: #1e293b; resize: vertical; outline: none; margin-bottom: 12px;
//           font-family: 'DM Sans', sans-serif;
//         }
//         .feedback-textarea:focus { border-color: #f59e0b; }
//         .btn-feedback {
//           padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: 700;
//           background: linear-gradient(135deg, #f59e0b, #d97706);
//           color: #fff; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
//         }

//         @media (max-width: 768px) {
//           .dash-sidebar { display: none; }
//           .stream-grid, .marks-grid { grid-template-columns: 1fr; }
//         }
//       `}</style>

//       {isLoading && <PredictingOverlay />}
//       {showConfirm && <ConfirmDialog onConfirm={confirmReset} onCancel={() => setShowConfirm(false)} />}

//       <div className="dash-wrapper">
//         {/* ── SIDEBAR ── */}
//         <aside className="dash-sidebar">
//           <div className="sidebar-glow" />
//           <div className="sidebar-glow2" />

//           <div className="sidebar-brand">
//             <div className="brand-name">CareerAI</div>
//             <div className="brand-tag">AI Career Prediction</div>
//           </div>

//           <div className="sidebar-steps">
//             {STEPS.map(item => (
//               <div key={item.n} className={`step-item ${step === item.n ? "active" : ""} ${step > item.n ? "completed" : ""}`}>
//                 <div className="step-num">
//                   {step > item.n ? "✓" : item.icon}
//                 </div>
//                 <div className="step-txt">
//                   <span>{item.t}</span>
//                   <small>{item.s}</small>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="sidebar-bottom">
//             <button className="logout-btn" onClick={handleLogout}>
//               🚪 Logout
//             </button>
//           </div>
//         </aside>

//         {/* ── MAIN ── */}
//         <div className="dash-main">
//           {/* NAVBAR */}
//           <nav className="dash-navbar">
//             <div className="navbar-left">
//               <span className="navbar-greeting">Welcome back,</span>
//               <span className="navbar-title">{userName || "Student"} 👋</span>
//             </div>
//             <div className="navbar-right">
//               <span className="nav-badge">🤖 AI Powered</span>
//               <span className="nav-step-pill">Step {step} of 5</span>

//               <div style={{ position: "relative" }} ref={dropRef}>
//                 <button className="avatar-btn" onClick={() => setShowDropdown(v => !v)}>
//                   {initials}
//                 </button>
//                 {showDropdown && (
//                   <div className="dropdown-menu">
//                     <div className="dropdown-header">
//                       <div className="dropdown-name">{userName}</div>
//                     </div>
//                     <div className="dropdown-item" onClick={() => { navigate("/profile"); setShowDropdown(false); }}>
//                       👤 My Profile
//                     </div>
//                     <div className="dropdown-item" onClick={() => { navigate("/predictions"); setShowDropdown(false); }}>
//                       📊 My Predictions
//                     </div>
//                     <div className="dropdown-item danger" onClick={handleLogout}>
//                       🚪 Logout
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </nav>

//           {/* CONTENT */}
//           <div className="dash-content">
//             <div className="page-header">
//               <h1>{STEPS[step - 1].t}</h1>
//               <p>Please provide accurate details for a better AI prediction.</p>
//             </div>

//             <div className="wide-card">

//               {/* ── STEP 1: STREAM ── */}
//               {step === 1 && (
//                 <div>
//                   <div className="stream-grid">
//                     {STREAMS.map(s => (
//                       <button key={s.id}
//                         className={`stream-card ${formData.Stream === s.id ? "selected" : ""}`}
//                         style={formData.Stream === s.id ? {
//                           borderColor: s.color,
//                           background: s.bg,
//                           boxShadow: `0 6px 20px ${s.color}25`,
//                           transform: "translateY(-2px)",
//                         } : {}}
//                         onClick={() => updateField("Stream", s.id)}
//                       >
//                         <div className="stream-icon-wrap" style={{ background: s.bg }}>
//                           <span style={{ fontSize: 24 }}>{s.icon}</span>
//                         </div>
//                         <div className="stream-label" style={formData.Stream === s.id ? { color: s.color } : {}}>
//                           {s.label}
//                         </div>
//                         <div className="stream-desc">{s.desc}</div>
//                         {formData.Stream === s.id && (
//                           <div style={{
//                             marginTop: 4, fontSize: 11, fontWeight: 700,
//                             color: s.color, display: "flex", alignItems: "center", gap: 4,
//                           }}>✓ Selected</div>
//                         )}
//                       </button>
//                     ))}
//                   </div>
//                   <div className="footer-btns">
//                     <div />
//                     <button className="btn-next" disabled={!formData.Stream} onClick={() => setStep(2)}>
//                       Next Step →
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* ── STEP 2: MARKS ── */}
//               {step === 2 && (
//                 <div>
//                   <p style={{ color: "#64748b", fontSize: 13, marginBottom: "1.5rem", background: "#f0fdf4", padding: "10px 14px", borderRadius: 10, border: "1px solid #bbf7d0" }}>
//                     ✅ Enter marks between <strong>33–100</strong>. Minimum passing marks is 33.
//                   </p>
//                   <div className="marks-grid">
//                     {getSubjects().map(sub => (
//                       <MarkInput key={sub.name} label={sub.label} name={sub.name} val={formData[sub.name]} fn={updateField} />
//                     ))}
//                   </div>
//                   <div className="footer-btns">
//                     <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
//                     <button className="btn-next" disabled={!canGoNext()} onClick={() => setStep(3)}>
//                       Next: Personality →
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* ── STEP 3: PERSONALITY ── */}
//               {step === 3 && (
//                 <div>
//                   <p style={{ color: "#64748b", fontSize: 13, marginBottom: "1.5rem" }}>
//                     Drag each slider to reflect your personality. <strong>1 = Low, 5 = High.</strong>
//                   </p>
//                   {TRAITS.map(trait => (
//                     <div key={trait.id} className="trait-row">
//                       <div className="trait-icon">{trait.icon}</div>
//                       <div className="trait-info">
//                         <div className="trait-label">
//                           <span>{trait.label}</span>
//                         </div>
//                         <input
//                           type="range" min={1} max={5} step={1}
//                           value={formData[trait.id]}
//                           style={{ "--val": formData[trait.id] }}
//                           onChange={e => updateField(trait.id, parseInt(e.target.value))}
//                         />
//                         <div className="trait-scale">
//                           <span>1 — Low</span>
//                           <span>3 — Medium</span>
//                           <span>5 — High</span>
//                         </div>
//                       </div>
//                       <div className="val-badge">{formData[trait.id]}</div>
//                     </div>
//                   ))}
//                   <div className="footer-btns">
//                     <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
//                     <button className="btn-next" onClick={() => setStep(4)}>
//                       Next: Interests →
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* ── STEP 4: INTERESTS ── */}
//               {step === 4 && (
//                 <div>
//                   <div className="pills-section">
//                     <div className="pills-heading">🎯 Choose Your Interests</div>
//                     <div className="pills-wrap">
//                       {INTERESTS.map(item => (
//                         <div key={item}
//                           className={`pill ${formData[`Interest_${item}`] ? "active" : ""}`}
//                           onClick={() => updateField(`Interest_${item}`, !formData[`Interest_${item}`])}
//                         >
//                           {formData[`Interest_${item}`] ? "✓ " : ""}{slugLabel(item)}
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="pills-section">
//                     <div className="pills-heading">🏆 Participation & Sports</div>
//                     <div className="pills-wrap">
//                       {PARTICIPATIONS.map(item => (
//                         <div key={item}
//                           className={`pill ${formData[`Participated_${item}`] ? "active" : ""}`}
//                           onClick={() => updateField(`Participated_${item}`, !formData[`Participated_${item}`])}
//                         >
//                           {formData[`Participated_${item}`] ? "✓ " : ""}{item}
//                         </div>
//                       ))}
//                       <div
//                         className={`pill ${formData.PositiveThinking ? "active" : ""}`}
//                         onClick={() => updateField("PositiveThinking", !formData.PositiveThinking)}
//                       >
//                         {formData.PositiveThinking ? "✓ " : ""}Positive Thinking
//                       </div>
//                     </div>
//                   </div>

//                   <div className="footer-btns">
//                     <button className="btn-back" onClick={() => setStep(3)}>← Back</button>
//                     <button className="btn-predict" disabled={!canGoNext()} onClick={handlePredict}>
//                       ✨ Predict My Career
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* ── STEP 5: RESULTS ── */}
//               {step === 5 && predictions && (
//                 <div style={{ animation: "slideUp 0.5s ease" }}>
//                   <div style={{
//                     textAlign: "center", marginBottom: "2rem",
//                     padding: "1.5rem", background: "linear-gradient(135deg, #fff7ed, #fef3c7)",
//                     borderRadius: 16, border: "1px solid #fde68a",
//                   }}>
//                     <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
//                     <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#1e293b", marginBottom: 6 }}>
//                       Your AI Career Report
//                     </h2>
//                     <p style={{ color: "#92400e", fontSize: 14 }}>
//                       Based on your profile, here are your top career matches
//                     </p>
//                   </div>

//                   {predictions.Top_Predictions.map((res, i) => (
//                     <ResultBar key={i} career={res.career} confidence={res.confidence} reason={res.reason} index={i} />
//                   ))}

//                   <div className="footer-btns">
//                     <button className="btn-back" onClick={() => setStep(4)}>← Back</button>
//                     <button className="btn-next" onClick={handleTestAgain}>
//                       🔄 Test Again
//                     </button>
//                   </div>

//                   {/* FEEDBACK */}
//                   <div className="feedback-card">
//                     <h4>⭐ How accurate was this prediction?</h4>
//                     <div className="star-select">
//                       {[1, 2, 3, 4, 5].map(n => (
//                         <span key={n} className={`star ${feedback.rating >= n ? "active" : ""}`}
//                           onClick={() => setFeedback(f => ({ ...f, rating: n }))}>⭐</span>
//                       ))}
//                       <span style={{ fontSize: 13, color: "#92400e", fontWeight: 600, marginLeft: 8, alignSelf: "center" }}>
//                         {["", "Bad", "Poor", "Average", "Good", "Excellent"][feedback.rating]}
//                       </span>
//                     </div>
//                     <textarea
//                       className="feedback-textarea"
//                       placeholder="Tell us what you think about this prediction..."
//                       value={feedback.comment}
//                       onChange={e => setFeedback(f => ({ ...f, comment: e.target.value }))}
//                     />
//                     <button className="btn-feedback" onClick={submitFeedback}>
//                       Submit Feedback →
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default DashboardPage;


//Created by Muskan
// import StatItem from "../components/StatItem"
// import FeatureCard from "../components/FeatureCard"
// import FooterSection from "../components/FooterSection"
// import InputGroup from "../components/InputGroup"
// import PillItem from "../components/PillItem"
// import PredictionBox from "../components/PredictionBox"
// import ProcessStep from "../components/ProcessStep"
// import SliderGroup from "../components/SliderGroup"
// import TestimonialCard from "../components/TestimonialCard"
// import {useState, useEffect} from "react"
// import axios from "axios"
// import DashboardNavbar from "./DashboardNavbar"
// import {supabase} from '../../../backend/supabaseClient'
// import { Navigate, useNavigate } from "react-router"
// import toast from "react-hot-toast"

// const DashboardPage = () => {
//     const navigate = useNavigate();
//    //const [step, setStep] = useState(1);
//    // 1. Step ko storage se uthayein taaki refresh par Step 1 na ho jaye
//    const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
//    const [step, setStep] = useState(() => {
//      return parseInt(localStorage.getItem("formStep")) || 1;
//    });
//    const [isLoading, setIsLoading] = useState(false); // Ye line missing hai
//    //const [predictions, setPredictions] = useState(null);
//    // predictions ko storage se uthayein taaki refresh par blank na dikhe
//       const [predictions, setPredictions] = useState(() => {
//     const savedPredictions = localStorage.getItem("careerPredictions");
//     return savedPredictions ? JSON.parse(savedPredictions) : null;
//     });
//     // 2. FormData ko bhi storage se uthayein taaki marks delete na hon
//    const [formData, setFormData] = useState(() => {
//      const savedData = localStorage.getItem("careerFormData");
//      return savedData ? JSON.parse(savedData) : {
//         Stream: '', Physics: '', Chemistry: '', Biology: '', English: '', ComputerScience: '',
//         Mathematics: '', Accountancy: '', BusinessStudies: '', Economics: '', History: '',
//         Geography: '', PoliticalScience: '', Sociology: '', Interest_Tech: false, 
//         Interest_Entrepreneurship: false, Interest_Leadership: false, Interest_Innovation: false,
//         Interest_CriticalThinking: false, Interest_Research: false, Interest_ComputerSkill: false,
//         Interest_HardwareSkill:false, Interest_Food: false, Interest_Creativity: false,
//         PositiveThinking: false, Participated_Hackathon: false, Participated_Olympiad: false,
//         Participated_Kabaddi: false, Participated_KhoKho: false, Participated_Cricket: false,
//         Oppenness: 3, Conscientiousness: 3, Extraversion: 3, Agreeableness: 3, Neuroticism: 3
//      };
//    });



//    // 3. Ye NAYA HISSA hai: Isse data hamesha save hota rahega
//    useEffect(() => {
//      localStorage.setItem("view", "dashboard");
//      localStorage.setItem("formStep", step);
//      localStorage.setItem("careerFormData", JSON.stringify(formData));
//      // Agar predictions hain, toh unhe bhi save karo
//     if (predictions) {
//         localStorage.setItem("careerPredictions", JSON.stringify(predictions));
//     }
//    }, [step, formData, predictions]);

// const handlePredict = async () => {
//     setIsLoading(true);
//     try {
//         // 1. Data ko clean karna
//         const cleanedData = {};
//         Object.keys(formData).forEach(key => {
//             const value = formData[key];
//             if (typeof value === 'boolean') {
//                 cleanedData[key] = value ? 1 : 0;
//             } else if (value === '' || value === null) {
//                 cleanedData[key] = 0;
//             } else if (!isNaN(value) && key !== 'Stream') {
//                 cleanedData[key] = parseFloat(value);
//             } else {
//                 cleanedData[key] = value;
//             }
//         });

//         // 2. SUPABASE MEIN INPUT STORE KARNA AUR ID NIKAALNA
//         const { data: { user } } = await supabase.auth.getUser();
//         let currentInputId = null; // Isme hum nayi input ID store karenge

//         if (user) {
//             // Humne .select('id').single() add kiya hai taaki insert hote hi ID mil jaye
//             const { data: inputRow, error: dbError } = await supabase
//                 .from('user_inputs')
//                 .insert([{
//                     user_id: user.id,
//                     stream: cleanedData.Stream,
//                     physics: cleanedData.Physics,
//                     chemistry: cleanedData.Chemistry,
//                     biology: cleanedData.Biology,
//                     english: cleanedData.English,
//                     computerscience: cleanedData.ComputerScience,
//                     mathematics: cleanedData.Mathematics,
//                     accountancy: cleanedData.Accountancy,
//                     businessstudies: cleanedData.BusinessStudies,
//                     economics: cleanedData.Economics,
//                     history: cleanedData.History,
//                     geography: cleanedData.Geography,
//                     politicalscience: cleanedData.PoliticalScience,
//                     sociology: cleanedData.Sociology,
//                     oppenness: cleanedData.Oppenness,
//                     conscientiousness: cleanedData.Conscientiousness,
//                     extraversion: cleanedData.Extraversion,
//                     agreeableness: cleanedData.Agreeableness,
//                     neuroticism: cleanedData.Neuroticism,
//                     interest_tech: cleanedData.Interest_Tech,
//                     interest_entrepreneurship: cleanedData.Interest_Entrepreneurship,
//                     interest_leadership: cleanedData.Interest_Leadership,
//                     interest_innovation: cleanedData.Interest_Innovation,
//                     interest_criticalthinking: cleanedData.Interest_CriticalThinking,
//                     interest_research: cleanedData.Interest_Research,
//                     interest_computerskill: cleanedData.Interest_ComputerSkill,
//                     interest_hardwareskill: cleanedData.Interest_HardwareSkill,
//                     interest_food: cleanedData.Interest_Food,
//                     interest_creativity: cleanedData.Interest_Creativity,
//                     positivethinking: cleanedData.PositiveThinking,
//                     participated_hackathon: cleanedData.Participated_Hackathon,
//                     participated_olympiad: cleanedData.Participated_Olympiad,
//                     participated_kabaddi: cleanedData.Participated_Kabaddi,
//                     participated_khokho: cleanedData.Participated_KhoKho,
//                     participated_cricket: cleanedData.Participated_Cricket
//                 }])
//                 .select('id') 
//                 .single();

//             if (dbError) {
//                 console.error("User Input Save Error:", dbError.message);
//             } else {
//                 currentInputId = inputRow.id; // Nayi ID mil gayi
//                 console.log("Input saved with ID:", currentInputId);
//             }
//         }

//         // 3. AI Prediction call
//         const response = await axios.post("http://127.0.0.1:8000/predict", cleanedData);
        
//         if (response.data && response.data.Top_Predictions) {
//             const aiResults = response.data.Top_Predictions;

//             if (user) {
//                 // 4. PREDICTIONS TABLE MEIN DATA INSERT (input_id ke saath)
//                 const { error: predError } = await supabase
//                     .from('predictions')
//                     .insert([{
//                         user_id: user.id,
//                         input_id: currentInputId, // 👈 Ab yahan sahi ID jayegi
//                         career_1: aiResults[0]?.career,
//                         confidence_1: aiResults[0]?.confidence,
//                         explanation_1: aiResults[0]?.reason,
//                         career_2: aiResults[1]?.career,
//                         confidence_2: aiResults[1]?.confidence,
//                         explanation_2: aiResults[1]?.reason,
//                         career_3: aiResults[2]?.career,
//                         confidence_3: aiResults[2]?.confidence,
//                         explanation_3: aiResults[2]?.reason
//                     }]);

//                 if (predError) {
//                     console.error("Prediction Save Error:", predError.message);
//                 } else {
//                     console.log("Predictions saved successfully with linked input!");
//                 }
//             }

//             setPredictions(response.data);
//             setStep(5);
//         }

//     } catch (error) {
//         console.error("Error:", error);
//         alert("Something went wrong!");
//     } finally {
//         setIsLoading(false);
//     }
// };

//    const updateField = (name, value) => {
//      setFormData(prev => ({ ...prev, [name]: value }));
//    };
//   const canGoNext = () => {
//     if (step === 1) {
//         return formData.Stream !== ""; // Stream select hona zaroori hai
//     }
    
//     if (step === 2) {
//         // Stream ke according required subjects ki list
//         let required = ['English'];
//         if (formData.Stream.includes("Science")) required.push('Physics', 'Chemistry');
//         if (formData.Stream === "Science_PCM") required.push('Mathematics', 'ComputerScience');
//         if (formData.Stream === "Science_PCB") required.push('Biology');
//         if (formData.Stream === "Commerce") required.push('Accountancy', 'BusinessStudies', 'Economics');
//         if (formData.Stream === "Arts") required.push('History', 'Geography', 'Sociology');

//         // Check karein ki saari required fields 0-100 ke beech hain
//         return required.every(field => formData[field] !== "" && formData[field] >= 33 && formData[field] <= 100);
//     }
    
//     if (step === 3) {
//         return true; // Personality by default 3 hai, toh ye hamesha valid rahega
//     }
    
//     if (step === 4) {
//         // Kam se kam ek Interest aur ek Participation select hona chahiye
//         const hasInterest = ['Tech', 'Entrepreneurship', 'Leadership', 'Innovation', 'CriticalThinking', 'Research', 'ComputerSkill', 'HardwareSkill', 'Food', 'Creativity'].some(i => formData[`Interest_${i}`]);
//         const hasParticipation = ['Hackathon', 'Olympiad', 'Kabaddi', 'KhoKho', 'Cricket'].some(p => formData[`Participated_${p}`]);
//         return hasInterest || hasParticipation || formData.PositiveThinking;
//     }
//     return false;
// };
//    const stepsInfo = [
//      { n: 1, t: "Stream Selection", s: "Basic Info" },
//      { n: 2, t: "Academic Marks", s: "Subject Scores" },
//      { n: 3, t: "Personality Traits", s: "Big Five Scaling" },
//      { n: 4, t: "Interests & Skills", s: "Final Assessment" },
//      { n: 5, t: "AI Results", s: "Prediction" } // <-- YE LINE ADD KARIYE
//    ];

//   // 👇 2. YAHAN SUBMIT FUNCTION DAALEIN (handlePredict ke upar ya niche kahi bhi)
// const submitFeedback = async () => {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) {
//         alert("Please login first");
//         return;
//     }

//     const { error } = await supabase
//         .from('feedbacks') 
//         .insert([{ 
//             user_id: user.id, 
//             rating: parseInt(feedback.rating), 
//             comment: feedback.comment 
//         }]);

//     if (!error) {
//         alert("Feedback submitted! Thank you.");
//         // Clear data and go to first step
//         localStorage.removeItem("careerPredictions");
//         setStep(1); 
//     } else {
//         console.error("Feedback Error:", error.message);
//         alert("Error saving feedback: " + error.message);
//     }
//    };

   
//    return (
//      <div className="dashboard-wrapper">
       
//        {/* 1. NAYA NAVBAR */}
//        <DashboardNavbar navigate={navigate} />

//        {/* 2. SIDEBAR - Top exactly 75px (Navbar height) aur bacha hua height 100vh - 75px */}
//        <aside className="dash-sidebar" style={{ top: '70px', height: 'calc(100vh - 60px)' }}>
         
//          {/* NEW: margin-top add kiya taaki "Stream Selection" text kate nahi */}
//          <div className="stepper-vertical" style={{ marginTop: '2.5rem' }}>
//            {stepsInfo.map((item) => (
//              <div key={item.n} className={`step-item ${step === item.n ? 'active' : ''} ${step > item.n ? 'completed' : ''}`}>
//                <div className="step-num">{step > item.n ? "✓" : item.n}</div>
//                <div className="step-txt">
//                  <span>{item.t}</span>
//                  <small>{item.s}</small>
//                </div>
//              </div>
//            ))}
//          </div>
         
//          <div className="sidebar-footer">
//            <p>Logged in </p>
//            <button className="logout-btn" onClick={() => {
//              localStorage.clear(); 
//              navigate('/login');
//               toast.success("Logout successfully!");
//            }}>Logout</button>
//          </div>
//        </aside>

//        {/* 3. MAIN CONTENT AREA - Galti yahan thi! Ab tag proper open hai aur padding-top 110px hai */}
//        <main className="dash-main" style={{ paddingTop: '110px' }}>
//        {/* Main Content Area */}
//         {/* <main className="dash-main"> */}
//          <div className="form-header">
//            <h1>{stepsInfo[step-1].t}</h1>
//            <p>Please provide accurate details for a better prediction.</p>
//          </div>

//          <div className="wide-card animate-in">
//            {/* STEP 1: STREAM */}
//            {step === 1 && (
//              <div className="step-view">
//                {/* <h2>Select Your Educational Stream</h2> */}
               
//                {/* ... (Aapka bacha hua Step 1 ka code waisa hi rahega) ... */}
//                <div className="stream-grid">
//                  {["Science_PCM", "Science_PCB", "Commerce", "Arts"].map(s => (
//                    <button key={s} className={`stream-card ${formData.Stream === s ? 'selected' : ''}`} 
//                      onClick={() => updateField('Stream', s)}>
//                      <div className="stream-icon">{s[0]}</div>
//                      {s.replace('_', ' ')}
//                    </button>
//                  ))}
//                </div>
//                <div className="footer-btns">
//                  <div></div>
//                  <button className="btn-main" disabled={!formData.Stream} onClick={() => setStep(2)}>Next Step</button>
//                </div>
//              </div>
//            )}

//            {/* ... (Aapka bacha hua Step 2, 3, 4, aur 5 ka code bhi yahan aayega, use mat hatana) ... */}
//            {/* STEP 2: MARKS (Dynamic) */}
//            {step === 2 && (
//              <div className="step-view">
//                <h2>Academic Performance (0-100)</h2>
//                <div className="marks-grid">
//                  <InputGroup label="English" name="English" val={formData.English} fn={updateField} />
//                  {formData.Stream.includes("Science") && (
//                    <><InputGroup label="Physics" name="Physics" val={formData.Physics} fn={updateField} />
//                    <InputGroup label="Chemistry" name="Chemistry" val={formData.Chemistry} fn={updateField} /></>
//                  )}
//                  {formData.Stream === "Science_PCM" && <><InputGroup label="Mathematics" name="Mathematics" val={formData.Mathematics} fn={updateField} /><InputGroup label="Computer Science" name="ComputerScience" val={formData.ComputerScience} fn={updateField} /></>}
//                  {formData.Stream === "Science_PCB" && <InputGroup label="Biology" name="Biology" val={formData.Biology} fn={updateField} />}
//                  {formData.Stream === "Commerce" && <><InputGroup label="Accountancy" name="Accountancy" val={formData.Accountancy} fn={updateField} /><InputGroup label="Business Studies" name="BusinessStudies" val={formData.BusinessStudies} fn={updateField} /><InputGroup label="Economics" name="Economics" val={formData.Economics} fn={updateField} /></>}
//                  {formData.Stream === "Arts" && <><InputGroup label="History" name="History" val={formData.History} fn={updateField} /><InputGroup label="Geography" name="Geography" val={formData.Geography} fn={updateField} /><InputGroup label="Sociology" name="Sociology" val={formData.Sociology} fn={updateField} /></>}
//                </div>
//                <div className="footer-btns">
//                  <span className="btn-back" onClick={() => setStep(1)}>Back</span>
//                  <button className="btn-main" disabled={!canGoNext()} onClick={() => setStep(3)}>Next: Personality</button>
//                </div>
//              </div>
//            )}

//            {/* STEP 3: PERSONALITY */}
//            {step === 3 && (
//               <div className="step-view">
//                 <h2 style={{ marginBottom: '1.5rem' }}>Personality Profile (Scale 1: Low, 5: High)</h2>
                
//                 <div className="slider-grid" style={{ gap: '1.5rem' }}>
//                   {[
//                     { 
//                       id: 'Oppenness', 
//                       label: 'Creativity & Learning New Things' 
//                     },
//                     { 
//                       id: 'Conscientiousness', 
//                       label: 'Discipline & Planning Skills' 
//                     },
//                     { 
//                       id: 'Extraversion', 
//                       label: 'Socializing & Communication' 
//                     },
//                     { 
//                       id: 'Agreeableness', 
//                       label: 'Friendliness & Teamwork' 
//                     },
//                     { 
//                       id: 'Neuroticism', 
//                       label: 'Stress Management Ability' 
//                     }
//                   ].map(trait => (
//                     <div key={trait.id} style={{ marginBottom: '1.2rem' }}>
//                       {/* Ab label ki jagah description upar dikhega */}
//                       <SliderGroup 
//                         label={trait.label} 
//                         name={trait.id} 
//                         val={formData[trait.id]} 
//                         fn={updateField} 
//                       />
//                     </div>
//                   ))}
//                 </div>

//                 <div className="footer-btns" style={{ marginTop: '2rem' }}>
//                   <span className="btn-back" onClick={() => setStep(2)}>Back</span>
//                   <button className="btn-main" disabled={!canGoNext()} onClick={() => setStep(4)}>
//                     Next: Interests
//                   </button>
//                 </div>
//               </div>
//             )}
//            {/* STEP 4: INTERESTS & PARTICIPATION (Pills Layout) */}
//            {step === 4 && (
//              <div className="step-view animate-in">
//                <h2 className="step-title">Interests & Extracurricular</h2>
//                <p className="step-subtitle">Select your hobbies and skills as per your interest</p>

//                <div className="pills-container-scroll">
//                  {/* 1. Core Interests Group */}
//                  <div className="interest-section">
//                    <h3 className="section-heading">Choose Your Interests:</h3>
//                    <div className="pills-grid">
//                      {[
//                        'Tech', 'Entrepreneurship', 'Leadership', 'Innovation', 
//                        'CriticalThinking', 'Research', 'ComputerSkill', 
//                        'HardwareSkill', 'Food', 'Creativity'
//                      ].map(item => (
//                        <PillItem 
//                          key={item} 
//                          label={item.replace(/([A-Z])/g, ' $1').trim()} 
//                          name={`Interest_${item}`} 
//                          val={formData[`Interest_${item}`]} 
//                          fn={updateField} 
//                        />
//                      ))}
//                    </div>
//                  </div>

//                  {/* 2. Participation & Sports Group */}
//                  <div className="participation-section">
//                    <h3 className="section-heading">Participation & Sports:</h3>
//                    <div className="pills-grid">
//                      {[
//                       'Hackathon', 'Olympiad', 'Kabaddi', 'KhoKho', 'Cricket'
//                      ].map(item => (
//                        <PillItem 
//                          key={item} 
//                          label={item} 
//                          name={`Participated_${item}`} 
//                          val={formData[`Participated_${item}`]} 
//                          fn={updateField} 
//                        />
//                      ))}
//                      {/* Positive Thinking as a specific trait button */}
//                      <PillItem 
//                        label="Positive Thinking" 
//                        name="PositiveThinking" 
//                        val={formData.PositiveThinking} 
//                        fn={updateField} 
//                      />
//                    </div>
//                  </div>
//                </div>

//                {/* Navigation Buttons */}
//                <div className="footer-btns">
//                  <span className="btn-back" onClick={() => setStep(3)}>Back</span>
//                  <button className="btn-predict-gradient" disabled={!canGoNext()} onClick={handlePredict}>
//                    Predict Career ✨
//                  </button>
//                </div>
//              </div>
//            )}

//    {/* STEP 5: RESULT VIEW (AI Results dikhane ke liye) */}
//           {/* STEP 5: RESULT VIEW (AI Results dikhane ke liye) */}
// {step === 5 && predictions && (
//   <div className="step-view result-view animate-in">
//       <h2>AI Recommended Careers</h2>
//       <div className="prediction-grid">
//          {predictions.Top_Predictions.map((res, index) => (
//            <div key={index} className="prediction-box">
//                <h3>{res.career} ({res.confidence}%)</h3>
//                <p>{res.reason}</p>
//            </div>
//          ))}
//       </div>



//       <div className="footer-btns" style={{marginTop: '2rem'}}>
//           <span className="btn-back" onClick={() => setStep(4)}>Back</span>
//           <button className="btn-main" onClick={() => setStep(1)}>Test Again</button>
//       </div>

//                {/* 👇 NAYA: Feedback Section yahan add kiya hai 👇 */}
//       <div className="feedback-section" style={{ 
//           marginTop: '2.5rem', 
//           padding: '1.5rem', 
//           background: '#fff5f5', // Light pinkish background match karne ke liye
//           borderRadius: '15px', 
//           border: '1px solid #feb2b2' 
//       }}>
//           <h4 style={{ marginBottom: '10px', color: '#c53030' }}>How accurate was this prediction?</h4>
          
//           <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
//               <select 
//                 value={feedback.rating}
//                 onChange={(e) => setFeedback({...feedback, rating: e.target.value})} 
//                 style={{ padding: '10px', borderRadius: '8px', border: '1px solid #fc8181' }}
//               >
//                   <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
//                   <option value="4">⭐⭐⭐⭐ (Good)</option>
//                   <option value="3">⭐⭐⭐ (Average)</option>
//                   <option value="2">⭐⭐ (Poor)</option>
//                   <option value="1">⭐ (Bad)</option>
//               </select>
//           </div>

//           <textarea 
//               placeholder="Tell us what you think..." 
//               value={feedback.comment}
//               onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
//               style={{ 
//                   width: '100%', 
//                   minHeight: '80px', 
//                   padding: '12px', 
//                   borderRadius: '10px', 
//                   border: '1px solid #fc8181',
//                   outline: 'none' 
//               }}
//           />

//           <button 
//   style={{ 
//     marginTop: '15px', 
//     width: 'auto',          // 👈 '200px' se hata kar 'auto' kar diya
//     padding: '8px 20px',    // 👈 Padding kam kari taaki button sleek lage
//     fontSize: '14px',       // 👈 Font thoda chota kiya
//     height: 'auto',         // 👈 Height ko auto rakha
//     minWidth: '140px',       // 👈 Ek minimum decent width di hai
//     background: '#fc8181'
//   }} 
//   onClick={submitFeedback}
// >
//   Submit Feedback
// </button>
//       </div>

//   </div>
// )}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default DashboardPage



