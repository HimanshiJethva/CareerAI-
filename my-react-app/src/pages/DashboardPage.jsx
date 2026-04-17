import StatItem from "../components/StatItem"
import FeatureCard from "../components/FeatureCard"
import FooterSection from "../components/FooterSection"
import InputGroup from "../components/InputGroup"
import PillItem from "../components/PillItem"
import PredictionBox from "../components/PredictionBox"
import ProcessStep from "../components/ProcessStep"
import SliderGroup from "../components/SliderGroup"
import TestimonialCard from "../components/TestimonialCard"
import {useState, useEffect} from "react"
import axios from "axios"
import DashboardNavbar from "./DashboardNavbar"
import {supabase} from '../../../backend/supabaseClient'
import { Navigate, useNavigate } from "react-router"

const DashboardPage = () => {
    const navigate = useNavigate();
   //const [step, setStep] = useState(1);
   // 1. Step ko storage se uthayein taaki refresh par Step 1 na ho jaye
   const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
   const [step, setStep] = useState(() => {
     return parseInt(localStorage.getItem("formStep")) || 1;
   });
   const [isLoading, setIsLoading] = useState(false); // Ye line missing hai
   //const [predictions, setPredictions] = useState(null);
   // predictions ko storage se uthayein taaki refresh par blank na dikhe
      const [predictions, setPredictions] = useState(() => {
    const savedPredictions = localStorage.getItem("careerPredictions");
    return savedPredictions ? JSON.parse(savedPredictions) : null;
    });
    // 2. FormData ko bhi storage se uthayein taaki marks delete na hon
   const [formData, setFormData] = useState(() => {
     const savedData = localStorage.getItem("careerFormData");
     return savedData ? JSON.parse(savedData) : {
        Stream: '', Physics: '', Chemistry: '', Biology: '', English: '', ComputerScience: '',
        Mathematics: '', Accountancy: '', BusinessStudies: '', Economics: '', History: '',
        Geography: '', PoliticalScience: '', Sociology: '', Interest_Tech: false, 
        Interest_Entrepreneurship: false, Interest_Leadership: false, Interest_Innovation: false,
        Interest_CriticalThinking: false, Interest_Research: false, Interest_ComputerSkill: false,
        Interest_HardwareSkill:false, Interest_Food: false, Interest_Creativity: false,
        PositiveThinking: false, Participated_Hackathon: false, Participated_Olympiad: false,
        Participated_Kabaddi: false, Participated_KhoKho: false, Participated_Cricket: false,
        Oppenness: 3, Conscientiousness: 3, Extraversion: 3, Agreeableness: 3, Neuroticism: 3
     };
   });



   // 3. Ye NAYA HISSA hai: Isse data hamesha save hota rahega
   useEffect(() => {
     localStorage.setItem("view", "dashboard");
     localStorage.setItem("formStep", step);
     localStorage.setItem("careerFormData", JSON.stringify(formData));
     // Agar predictions hain, toh unhe bhi save karo
    if (predictions) {
        localStorage.setItem("careerPredictions", JSON.stringify(predictions));
    }
   }, [step, formData, predictions]);

const handlePredict = async () => {
    setIsLoading(true);
    try {
        // 1. Data ko clean karna
        const cleanedData = {};
        Object.keys(formData).forEach(key => {
            const value = formData[key];
            if (typeof value === 'boolean') {
                cleanedData[key] = value ? 1 : 0;
            } else if (value === '' || value === null) {
                cleanedData[key] = 0;
            } else if (!isNaN(value) && key !== 'Stream') {
                cleanedData[key] = parseFloat(value);
            } else {
                cleanedData[key] = value;
            }
        });

        // 2. SUPABASE MEIN INPUT STORE KARNA AUR ID NIKAALNA
        const { data: { user } } = await supabase.auth.getUser();
        let currentInputId = null; // Isme hum nayi input ID store karenge

        if (user) {
            // Humne .select('id').single() add kiya hai taaki insert hote hi ID mil jaye
            const { data: inputRow, error: dbError } = await supabase
                .from('user_inputs')
                .insert([{
                    user_id: user.id,
                    stream: cleanedData.Stream,
                    physics: cleanedData.Physics,
                    chemistry: cleanedData.Chemistry,
                    biology: cleanedData.Biology,
                    english: cleanedData.English,
                    computerscience: cleanedData.ComputerScience,
                    mathematics: cleanedData.Mathematics,
                    accountancy: cleanedData.Accountancy,
                    businessstudies: cleanedData.BusinessStudies,
                    economics: cleanedData.Economics,
                    history: cleanedData.History,
                    geography: cleanedData.Geography,
                    politicalscience: cleanedData.PoliticalScience,
                    sociology: cleanedData.Sociology,
                    oppenness: cleanedData.Oppenness,
                    conscientiousness: cleanedData.Conscientiousness,
                    extraversion: cleanedData.Extraversion,
                    agreeableness: cleanedData.Agreeableness,
                    neuroticism: cleanedData.Neuroticism,
                    interest_tech: cleanedData.Interest_Tech,
                    interest_entrepreneurship: cleanedData.Interest_Entrepreneurship,
                    interest_leadership: cleanedData.Interest_Leadership,
                    interest_innovation: cleanedData.Interest_Innovation,
                    interest_criticalthinking: cleanedData.Interest_CriticalThinking,
                    interest_research: cleanedData.Interest_Research,
                    interest_computerskill: cleanedData.Interest_ComputerSkill,
                    interest_hardwareskill: cleanedData.Interest_HardwareSkill,
                    interest_food: cleanedData.Interest_Food,
                    interest_creativity: cleanedData.Interest_Creativity,
                    positivethinking: cleanedData.PositiveThinking,
                    participated_hackathon: cleanedData.Participated_Hackathon,
                    participated_olympiad: cleanedData.Participated_Olympiad,
                    participated_kabaddi: cleanedData.Participated_Kabaddi,
                    participated_khokho: cleanedData.Participated_KhoKho,
                    participated_cricket: cleanedData.Participated_Cricket
                }])
                .select('id') 
                .single();

            if (dbError) {
                console.error("User Input Save Error:", dbError.message);
            } else {
                currentInputId = inputRow.id; // Nayi ID mil gayi
                console.log("Input saved with ID:", currentInputId);
            }
        }

        // 3. AI Prediction call
        const response = await axios.post("http://127.0.0.1:8000/predict", cleanedData);
        
        if (response.data && response.data.Top_Predictions) {
            const aiResults = response.data.Top_Predictions;

            if (user) {
                // 4. PREDICTIONS TABLE MEIN DATA INSERT (input_id ke saath)
                const { error: predError } = await supabase
                    .from('predictions')
                    .insert([{
                        user_id: user.id,
                        input_id: currentInputId, // 👈 Ab yahan sahi ID jayegi
                        career_1: aiResults[0]?.career,
                        confidence_1: aiResults[0]?.confidence,
                        explanation_1: aiResults[0]?.reason,
                        career_2: aiResults[1]?.career,
                        confidence_2: aiResults[1]?.confidence,
                        explanation_2: aiResults[1]?.reason,
                        career_3: aiResults[2]?.career,
                        confidence_3: aiResults[2]?.confidence,
                        explanation_3: aiResults[2]?.reason
                    }]);

                if (predError) {
                    console.error("Prediction Save Error:", predError.message);
                } else {
                    console.log("Predictions saved successfully with linked input!");
                }
            }

            setPredictions(response.data);
            setStep(5);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong!");
    } finally {
        setIsLoading(false);
    }
};

   const updateField = (name, value) => {
     setFormData(prev => ({ ...prev, [name]: value }));
   };
  const canGoNext = () => {
    if (step === 1) {
        return formData.Stream !== ""; // Stream select hona zaroori hai
    }
    
    if (step === 2) {
        // Stream ke according required subjects ki list
        let required = ['English'];
        if (formData.Stream.includes("Science")) required.push('Physics', 'Chemistry');
        if (formData.Stream === "Science_PCM") required.push('Mathematics', 'ComputerScience');
        if (formData.Stream === "Science_PCB") required.push('Biology');
        if (formData.Stream === "Commerce") required.push('Accountancy', 'BusinessStudies', 'Economics');
        if (formData.Stream === "Arts") required.push('History', 'Geography', 'Sociology');

        // Check karein ki saari required fields 0-100 ke beech hain
        return required.every(field => formData[field] !== "" && formData[field] >= 33 && formData[field] <= 100);
    }
    
    if (step === 3) {
        return true; // Personality by default 3 hai, toh ye hamesha valid rahega
    }
    
    if (step === 4) {
        // Kam se kam ek Interest aur ek Participation select hona chahiye
        const hasInterest = ['Tech', 'Entrepreneurship', 'Leadership', 'Innovation', 'CriticalThinking', 'Research', 'ComputerSkill', 'HardwareSkill', 'Food', 'Creativity'].some(i => formData[`Interest_${i}`]);
        const hasParticipation = ['Hackathon', 'Olympiad', 'Kabaddi', 'KhoKho', 'Cricket'].some(p => formData[`Participated_${p}`]);
        return hasInterest || hasParticipation || formData.PositiveThinking;
    }
    return false;
};
   const stepsInfo = [
     { n: 1, t: "Stream Selection", s: "Basic Info" },
     { n: 2, t: "Academic Marks", s: "Subject Scores" },
     { n: 3, t: "Personality Traits", s: "Big Five Scaling" },
     { n: 4, t: "Interests & Skills", s: "Final Assessment" },
     { n: 5, t: "AI Results", s: "Prediction" } // <-- YE LINE ADD KARIYE
   ];

  // 👇 2. YAHAN SUBMIT FUNCTION DAALEIN (handlePredict ke upar ya niche kahi bhi)
const submitFeedback = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("Please login first");
        return;
    }

    const { error } = await supabase
        .from('feedbacks') 
        .insert([{ 
            user_id: user.id, 
            rating: parseInt(feedback.rating), 
            comment: feedback.comment 
        }]);

    if (!error) {
        alert("Feedback submitted! Thank you.");
        // Clear data and go to first step
        localStorage.removeItem("careerPredictions");
        setStep(1); 
    } else {
        console.error("Feedback Error:", error.message);
        alert("Error saving feedback: " + error.message);
    }
   };

   
   return (
     <div className="dashboard-wrapper">
       
       {/* 1. NAYA NAVBAR */}
       <DashboardNavbar navigate={navigate} />

       {/* 2. SIDEBAR - Top exactly 75px (Navbar height) aur bacha hua height 100vh - 75px */}
       <aside className="dash-sidebar" style={{ top: '70px', height: 'calc(100vh - 60px)' }}>
         
         {/* NEW: margin-top add kiya taaki "Stream Selection" text kate nahi */}
         <div className="stepper-vertical" style={{ marginTop: '2.5rem' }}>
           {stepsInfo.map((item) => (
             <div key={item.n} className={`step-item ${step === item.n ? 'active' : ''} ${step > item.n ? 'completed' : ''}`}>
               <div className="step-num">{step > item.n ? "✓" : item.n}</div>
               <div className="step-txt">
                 <span>{item.t}</span>
                 <small>{item.s}</small>
               </div>
             </div>
           ))}
         </div>
         
         <div className="sidebar-footer">
           <p>Logged in </p>
           <button className="logout-btn" onClick={() => {
             localStorage.clear(); 
             navigate('landing');
           }}>Logout</button>
         </div>
       </aside>

       {/* 3. MAIN CONTENT AREA - Galti yahan thi! Ab tag proper open hai aur padding-top 110px hai */}
       <main className="dash-main" style={{ paddingTop: '110px' }}>
       {/* Main Content Area */}
        {/* <main className="dash-main"> */}
         <div className="form-header">
           <h1>{stepsInfo[step-1].t}</h1>
           <p>Please provide accurate details for a better prediction.</p>
         </div>

         <div className="wide-card animate-in">
           {/* STEP 1: STREAM */}
           {step === 1 && (
             <div className="step-view">
               {/* <h2>Select Your Educational Stream</h2> */}
               
               {/* ... (Aapka bacha hua Step 1 ka code waisa hi rahega) ... */}
               <div className="stream-grid">
                 {["Science_PCM", "Science_PCB", "Commerce", "Arts"].map(s => (
                   <button key={s} className={`stream-card ${formData.Stream === s ? 'selected' : ''}`} 
                     onClick={() => updateField('Stream', s)}>
                     <div className="stream-icon">{s[0]}</div>
                     {s.replace('_', ' ')}
                   </button>
                 ))}
               </div>
               <div className="footer-btns">
                 <div></div>
                 <button className="btn-main" disabled={!formData.Stream} onClick={() => setStep(2)}>Next Step</button>
               </div>
             </div>
           )}

           {/* ... (Aapka bacha hua Step 2, 3, 4, aur 5 ka code bhi yahan aayega, use mat hatana) ... */}
           {/* STEP 2: MARKS (Dynamic) */}
           {step === 2 && (
             <div className="step-view">
               <h2>Academic Performance (0-100)</h2>
               <div className="marks-grid">
                 <InputGroup label="English" name="English" val={formData.English} fn={updateField} />
                 {formData.Stream.includes("Science") && (
                   <><InputGroup label="Physics" name="Physics" val={formData.Physics} fn={updateField} />
                   <InputGroup label="Chemistry" name="Chemistry" val={formData.Chemistry} fn={updateField} /></>
                 )}
                 {formData.Stream === "Science_PCM" && <><InputGroup label="Mathematics" name="Mathematics" val={formData.Mathematics} fn={updateField} /><InputGroup label="Computer Science" name="ComputerScience" val={formData.ComputerScience} fn={updateField} /></>}
                 {formData.Stream === "Science_PCB" && <InputGroup label="Biology" name="Biology" val={formData.Biology} fn={updateField} />}
                 {formData.Stream === "Commerce" && <><InputGroup label="Accountancy" name="Accountancy" val={formData.Accountancy} fn={updateField} /><InputGroup label="Business Studies" name="BusinessStudies" val={formData.BusinessStudies} fn={updateField} /><InputGroup label="Economics" name="Economics" val={formData.Economics} fn={updateField} /></>}
                 {formData.Stream === "Arts" && <><InputGroup label="History" name="History" val={formData.History} fn={updateField} /><InputGroup label="Geography" name="Geography" val={formData.Geography} fn={updateField} /><InputGroup label="Sociology" name="Sociology" val={formData.Sociology} fn={updateField} /></>}
               </div>
               <div className="footer-btns">
                 <span className="btn-back" onClick={() => setStep(1)}>Back</span>
                 <button className="btn-main" disabled={!canGoNext()} onClick={() => setStep(3)}>Next: Personality</button>
               </div>
             </div>
           )}

           {/* STEP 3: PERSONALITY */}
           {step === 3 && (
              <div className="step-view">
                <h2 style={{ marginBottom: '1.5rem' }}>Personality Profile (Scale 1: Low, 5: High)</h2>
                
                <div className="slider-grid" style={{ gap: '1.5rem' }}>
                  {[
                    { 
                      id: 'Oppenness', 
                      label: 'Creativity & Learning New Things' 
                    },
                    { 
                      id: 'Conscientiousness', 
                      label: 'Discipline & Planning Skills' 
                    },
                    { 
                      id: 'Extraversion', 
                      label: 'Socializing & Communication' 
                    },
                    { 
                      id: 'Agreeableness', 
                      label: 'Friendliness & Teamwork' 
                    },
                    { 
                      id: 'Neuroticism', 
                      label: 'Stress Management Ability' 
                    }
                  ].map(trait => (
                    <div key={trait.id} style={{ marginBottom: '1.2rem' }}>
                      {/* Ab label ki jagah description upar dikhega */}
                      <SliderGroup 
                        label={trait.label} 
                        name={trait.id} 
                        val={formData[trait.id]} 
                        fn={updateField} 
                      />
                    </div>
                  ))}
                </div>

                <div className="footer-btns" style={{ marginTop: '2rem' }}>
                  <span className="btn-back" onClick={() => setStep(2)}>Back</span>
                  <button className="btn-main" disabled={!canGoNext()} onClick={() => setStep(4)}>
                    Next: Interests
                  </button>
                </div>
              </div>
            )}
           {/* STEP 4: INTERESTS & PARTICIPATION (Pills Layout) */}
           {step === 4 && (
             <div className="step-view animate-in">
               <h2 className="step-title">Interests & Extracurricular</h2>
               <p className="step-subtitle">Select your hobbies and skills as per yout interest</p>

               <div className="pills-container-scroll">
                 {/* 1. Core Interests Group */}
                 <div className="interest-section">
                   <h3 className="section-heading">Choose Your Interests:</h3>
                   <div className="pills-grid">
                     {[
                       'Tech', 'Entrepreneurship', 'Leadership', 'Innovation', 
                       'CriticalThinking', 'Research', 'ComputerSkill', 
                       'HardwareSkill', 'Food', 'Creativity'
                     ].map(item => (
                       <PillItem 
                         key={item} 
                         label={item.replace(/([A-Z])/g, ' $1').trim()} 
                         name={`Interest_${item}`} 
                         val={formData[`Interest_${item}`]} 
                         fn={updateField} 
                       />
                     ))}
                   </div>
                 </div>

                 {/* 2. Participation & Sports Group */}
                 <div className="participation-section">
                   <h3 className="section-heading">Participation & Sports:</h3>
                   <div className="pills-grid">
                     {[
                       'Hackathon', 'Olympiad', 'Kabaddi', 'KhoKho', 'Cricket'
                     ].map(item => (
                       <PillItem 
                         key={item} 
                         label={item} 
                         name={`Participated_${item}`} 
                         val={formData[`Participated_${item}`]} 
                         fn={updateField} 
                       />
                     ))}
                     {/* Positive Thinking as a specific trait button */}
                     <PillItem 
                       label="Positive Thinking" 
                       name="PositiveThinking" 
                       val={formData.PositiveThinking} 
                       fn={updateField} 
                     />
                   </div>
                 </div>
               </div>

               {/* Navigation Buttons */}
               <div className="footer-btns">
                 <span className="btn-back" onClick={() => setStep(3)}>Back</span>
                 <button className="btn-predict-gradient" disabled={!canGoNext()} onClick={handlePredict}>
                   Predict Career ✨
                 </button>
               </div>
             </div>
           )}

   {/* STEP 5: RESULT VIEW (AI Results dikhane ke liye) */}
          {/* STEP 5: RESULT VIEW (AI Results dikhane ke liye) */}
{step === 5 && predictions && (
  <div className="step-view result-view animate-in">
      <h2>AI Recommended Careers</h2>
      <div className="prediction-grid">
         {predictions.Top_Predictions.map((res, index) => (
           <div key={index} className="prediction-box">
               <h3>{res.career} ({res.confidence}%)</h3>
               <p>{res.reason}</p>
           </div>
         ))}
      </div>



      <div className="footer-btns" style={{marginTop: '2rem'}}>
          <span className="btn-back" onClick={() => setStep(4)}>Back</span>
          <button className="btn-main" onClick={() => setStep(1)}>Test Again</button>
      </div>

               {/* 👇 NAYA: Feedback Section yahan add kiya hai 👇 */}
      <div className="feedback-section" style={{ 
          marginTop: '2.5rem', 
          padding: '1.5rem', 
          background: '#fff5f5', // Light pinkish background match karne ke liye
          borderRadius: '15px', 
          border: '1px solid #feb2b2' 
      }}>
          <h4 style={{ marginBottom: '10px', color: '#c53030' }}>How accurate was this prediction?</h4>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <select 
                value={feedback.rating}
                onChange={(e) => setFeedback({...feedback, rating: e.target.value})} 
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #fc8181' }}
              >
                  <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                  <option value="4">⭐⭐⭐⭐ (Good)</option>
                  <option value="3">⭐⭐⭐ (Average)</option>
                  <option value="2">⭐⭐ (Poor)</option>
                  <option value="1">⭐ (Bad)</option>
              </select>
          </div>

          <textarea 
              placeholder="Tell us what you think..." 
              value={feedback.comment}
              onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
              style={{ 
                  width: '100%', 
                  minHeight: '80px', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  border: '1px solid #fc8181',
                  outline: 'none' 
              }}
          />

          <button 
  style={{ 
    marginTop: '15px', 
    width: 'auto',          // 👈 '200px' se hata kar 'auto' kar diya
    padding: '8px 20px',    // 👈 Padding kam kari taaki button sleek lage
    fontSize: '14px',       // 👈 Font thoda chota kiya
    height: 'auto',         // 👈 Height ko auto rakha
    minWidth: '140px',       // 👈 Ek minimum decent width di hai
    background: '#fc8181'
  }} 
  onClick={submitFeedback}
>
  Submit Feedback
</button>
      </div>

  </div>
)}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage



// {/* STEP 5: RESULT VIEW */}
// {step === 5 && predictions && (
//   <div className="step-view result-view animate-in">
    
//     {/* Header */}
//     <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
//       <div style={{
//         display: 'inline-block',
//         background: 'linear-gradient(135deg, #fff5f5, #ffe0e0)',
//         border: '1px solid #ffb3b3',
//         borderRadius: '20px',
//         padding: '6px 16px',
//         fontSize: '0.85rem',
//         color: '#e05555',
//         marginBottom: '0.8rem'
//       }}>
//         🤖 AI Analysis Complete
//       </div>
//       <h2 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>Your Career Predictions</h2>
//       <p style={{ color: '#888', fontSize: '0.95rem' }}>
//         Based on your academic profile, personality & interests
//       </p>
//     </div>

//     {/* Career Cards */}
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
//       {predictions.Top_Predictions.map((res, index) => {
//         const medals = ['🥇', '🥈', '🥉'];
//         const colors = ['#f59e0b', '#94a3b8', '#cd7f32'];
//         const bgColors = ['#fffbeb', '#f8fafc', '#fdf6ec'];
//         const barColors = ['#f59e0b', '#64748b', '#cd7f32'];
//         const medal = medals[index] || '🎯';
//         const barColor = barColors[index] || '#ff6b6b';
//         const bgColor = bgColors[index] || '#fff5f5';

//         return (
//           <div key={index} style={{
//             background: bgColor,
//             border: `1px solid ${index === 0 ? '#fde68a' : '#e2e8f0'}`,
//             borderRadius: '16px',
//             padding: '1.5rem',
//             boxShadow: index === 0 ? '0 4px 20px rgba(245,158,11,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
//             transition: 'transform 0.2s',
//           }}
//           onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
//           onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
//           >
//             {/* Top row: medal + career name + percentage */}
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
//                 <span style={{ fontSize: '1.8rem' }}>{medal}</span>
//                 <div>
//                   <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#1a1a2e' }}>
//                     {res.career}
//                   </h3>
//                   {index === 0 && (
//                     <span style={{
//                       fontSize: '0.72rem',
//                       background: '#fde68a',
//                       color: '#92400e',
//                       padding: '2px 8px',
//                       borderRadius: '10px',
//                       fontWeight: '600'
//                     }}>
//                       ⭐ Best Match
//                     </span>
//                   )}
//                 </div>
//               </div>
//               {/* Percentage badge */}
//               <div style={{
//                 background: barColor,
//                 color: 'white',
//                 borderRadius: '12px',
//                 padding: '4px 14px',
//                 fontWeight: '700',
//                 fontSize: '1rem',
//                 minWidth: '60px',
//                 textAlign: 'center'
//               }}>
//                 {res.confidence}%
//               </div>
//             </div>

//             {/* Progress Bar */}
//             <div style={{ marginBottom: '0.8rem' }}>
//               <div style={{
//                 background: '#e2e8f0',
//                 borderRadius: '10px',
//                 height: '10px',
//                 overflow: 'hidden'
//               }}>
//                 <div style={{
//                   width: `${res.confidence}%`,
//                   background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
//                   height: '100%',
//                   borderRadius: '10px',
//                   transition: 'width 1s ease',
//                 }} />
//               </div>
//               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px' }}>
//                 <span>0%</span>
//                 <span>50%</span>
//                 <span>100%</span>
//               </div>
//             </div>

//             {/* Reason */}
//             <p style={{ margin: 0, color: '#555', fontSize: '0.9rem', lineHeight: '1.5' }}>
//               💡 {res.reason}
//             </p>
//           </div>
//         );
//       })}
//     </div>

//     {/* Footer buttons */}
//     <div className="footer-btns" style={{ marginTop: '2rem' }}>
//       <span className="btn-back" onClick={() => setStep(4)}>Back</span>
//       <button className="btn-main" onClick={() => {
//         setPredictions(null);
//         localStorage.removeItem("careerPredictions");
//         localStorage.removeItem("careerFormData");
//         localStorage.setItem("formStep", 1);
//         setStep(1);
//       }}>
//         🔄 Test Again
//       </button>
//     </div>

//   </div>
// )}