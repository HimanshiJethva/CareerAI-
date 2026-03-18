import StatItem from "../components/StatItem"
import FeatureCard from "../components/FeatureCard"
import FooterSection from "../components/FooterSection"
import InputGroup from "../components/InputGroup"
import PillItem from "../components/PillItem"
import PredictionBox from "../components/PredictionBox"
import ProcessStep from "../components/ProcessStep"
import SliderGroup from "../components/SliderGroup"
import TestimonialCard from "../components/TestimonialCard"
import {useState} from "react"
function DashboardPage({ setView }) {
   const [step, setStep] = useState(1);
   const [formData, setFormData] = useState({
     Stream: '', Physics: '', Chemistry: '', Biology: '', English: '', ComputerScience: '',
     Mathematics: '', Accountancy: '', BusinessStudies: '', Economics: '', History: '',
     Geography: '', PoliticalScience: '', Sociology: '', Interest_Tech: false, 
     Interest_Entrepreneurship: false, Interest_Leadership: false, Interest_Innovation: false,
     Interest_CriticalThinking: false, Interest_Research: false, Interest_ComputerSkill: false,
     Interest_HardwareSkill:false, Interest_Food: false, Interest_Creativity: false,
     PositiveThinking: false, Participated_Hackathon: false, Participated_Olympiad: false,
     Participated_Kabaddi: false, Participated_KhoKho: false, Participated_Cricket: false,
     Oppenness: 3, Conscientiousness: 3, Extraversion: 3, Agreeableness: 3, Neuroticism: 3
   });

   const updateField = (name, value) => {
     setFormData(prev => ({ ...prev, [name]: value }));
   };

   const stepsInfo = [
     { n: 1, t: "Stream Selection", s: "Basic Info" },
     { n: 2, t: "Academic Marks", s: "Subject Scores" },
     { n: 3, t: "Personality Traits", s: "Big Five Scaling" },
     { n: 4, t: "Interests & Skills", s: "Final Assessment" }
   ];

   return (
     <div className="dashboard-wrapper">
       {/* Sidebar Stepper */}
       <aside className="dash-sidebar">
         <div className="sidebar-logo">CareerAI</div>
         <div className="stepper-vertical">
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
           <button className="logout-btn" onClick={() => setView('landing')}>Logout</button>
         </div>
       </aside>

       {/* Main Content Area */}
       <main className="dash-main">
         <div className="form-header">
           <h1>{stepsInfo[step-1].t}</h1>
           <p>Please provide accurate details for a better prediction.</p>
         </div>

         <div className="wide-card animate-in">
           {/* STEP 1: STREAM */}
           {step === 1 && (
             <div className="step-view">
               <h2>Select Your Educational Stream</h2>
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
                 <button className="btn-back" onClick={() => setStep(1)}>Back</button>
                 <button className="btn-main" onClick={() => setStep(3)}>Next: Personality</button>
               </div>
             </div>
           )}

           {/* STEP 3: PERSONALITY */}
           {step === 3 && (
             <div className="step-view">
               <h2>Personality Scaling (1 - 5)</h2>
               <div className="slider-grid">
                 {['Oppenness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'].map(t => (
                   <SliderGroup key={t} label={t} name={t} val={formData[t]} fn={updateField} />
                 ))}
               </div>
               <div className="footer-btns">
                 <button className="btn-back" onClick={() => setStep(2)}>Back</button>
                 <button className="btn-main" onClick={() => setStep(4)}>Next: Interests</button>
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
                 <button className="btn-back" onClick={() => setStep(3)}>Back</button>
                 <button className="btn-predict-gradient" onClick={() => alert("AI Prediction Starting...")}>
                   Predict Career ✨
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