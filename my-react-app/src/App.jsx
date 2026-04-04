import { supabase } from './supabaseClient'; // Path check kar lena apne folder ke hisaab se
import { useState ,useEffect} from "react"
import "./App.css"
import { Toaster } from 'react-hot-toast'; // <--- PEHLA BADLAV: Import karein
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import DashboardPage from "./pages/DashboardPage"
function App() {

  const [view, setView] = useState(() => {
  return localStorage.getItem("view") || "landing"
})
  // const[view, setView] = useState("landing");

  useEffect(()=> {
    localStorage.setItem("view",view);
  },[view]);//refresh thi landing na jay ena mate

  useEffect(() => {
  const checkSession = async () => {
    // Supabase se current session mangwayein
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Agar user login hai, toh use dashboard par hi rakho
      setView('dashboard');
    } else if (localStorage.getItem("view") === 'dashboard') {
      // Agar login nahi hai par view dashboard tha, toh wapas landing bhej do
      setView('landing');
    }
  };
  
  checkSession();
}, []); // Ye sirf ek baar chalega jab app load hogi

  useEffect(()=>{
    document.title = "AI Powered Career Prediction";
  },  []);
 return (
    <>
      {/* Ye line sabse upar honi chahiye */}
      <Toaster position="top-center" reverseOrder={false} /> 

      {view === "login" && <LoginPage setView={setView}/>}
      {view === "signup" && <SignupPage setView={setView}/>}
      {view === "dashboard" && <DashboardPage setView={setView}/>}
      {view === "landing" && <LandingPage setView={setView}/>}
    </>
  )
  // if(view==="login"){
  //   return <LoginPage setView={setView}/>
  // }

  // if(view==="signup"){
  //   return <SignupPage setView={setView}/>
  // }

  // if(view==="dashboard"){
  //   return <DashboardPage setView={setView}/>
  // }

  // return <LandingPage setView={setView}/>
}
export default App