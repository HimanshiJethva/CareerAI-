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



function DashboardPage({ setView }) {
   //const [step, setStep] = useState(1);
   // 1. Step ko storage se uthayein taaki refresh par Step 1 na ho jaye
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

  // STEP 2: Prediction Function yahan likhein (Line 30-60 ke aas pass)
 const handlePredict = async () => {
    setIsLoading(true);
    try {
        // 1. Data ko clean karna: Har khali string ko 0 banao
        const cleanedData = {};
        Object.keys(formData).forEach(key => {
            const value = formData[key];
            
            if (typeof value === 'boolean') {
                cleanedData[key] = value ? 1 : 0; // Booleans to 1/0
            } else if (value === '' || value === null) {
                cleanedData[key] = 0; // Khali marks ko 0 banao
            } else if (!isNaN(value) && key !== 'Stream') {
                cleanedData[key] = parseFloat(value); // Strings to Numbers
            } else {
                cleanedData[key] = value; // Stream selection as it is
            }
        });

        console.log("Sending Cleaned Data:", cleanedData);

        const response = await axios.post("http://127.0.0.1:8000/predict", cleanedData);
        
        if (response.data) {
            setPredictions(response.data);
            setStep(5);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Server Error! Check if uvicorn terminal shows any value errors.");
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
           { <button className="logout-btn" onClick={() => {
             localStorage.clear(); // Saara data ek saath saaf taaki next time refresh par landing page aaye
                 setView('landing');
                 }}>Logout</button>/* <button className="logout-btn" onClick={() => {
             localStorage.removeItem("view");
            setView('landing');
           }}>Logout</button> */}
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
                  <button className="btn-back" onClick={() => setStep(2)}>Back</button>
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
                 <button className="btn-back" onClick={() => setStep(3)}>Back</button>
                 <button className="btn-predict-gradient" disabled={!canGoNext()} onClick={handlePredict}>
                   Predict Career ✨
                 </button>
               </div>
             </div>
           )}

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
               {/* <div className="footer-btns" style={{marginTop: '2rem'}}>
                  <button className="btn-main" onClick={() => setStep(1)}>Test Again</button>
              
               </div> */}
               <div className="footer-btns" style={{marginTop: '2rem'}}>
                  {/* <button className="btn-main" onClick={() => setStep(1)}>Test Again</button> */}
                  <button className="btn-back" onClick={() => setStep(3)}>Back</button>
                  <button className="btn-main" onClick={() => setStep(1)}>Test Again</button>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage