import { supabase } from './supabaseClient'; // Path check kar lena apne folder ke hisaab se
import { useState ,useEffect} from "react"
import "./App.css"
import { Toaster } from 'react-hot-toast'; // <--- PEHLA BADLAV: Import karein
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import DashboardPage from "./pages/DashboardPage"
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDash/AdminDashboard';
function App() {
  const [loading,setLoading] = useState(false)
  const [view, setView] = useState(() => {
  return localStorage.getItem("view") || "landing"
})
  // const[view, setView] = useState("landing");

  useEffect(()=> {
    localStorage.setItem("view",view);
  },[view]);//refresh thi landing na jay ena mate



    useEffect(() => {
    const initApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
      // Check karo localStorage mein role kya hai
      const role = localStorage.getItem('userRole');
      if (role === 'admin') {
        setView('admindashboard');
      } else {
        setView('dashboard');
      }
    } else {
        const savedView = localStorage.getItem("view");
        setView(savedView === 'dashboard' ? 'landing' : (savedView || 'landing'));
      }
      setLoading(false);
    };

    initApp();

    // Ye listener email verification link click hote hi dashboard khol dega
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setView('dashboard');
      }
      if (event === 'SIGNED_OUT') {
        setView('landing');
        localStorage.removeItem("view");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 👇 YAHAN BADLAV HAI: LocalStorage se role uthao
        const savedRole = localStorage.getItem("userRole");
        
        if (savedRole === 'admin') {
          setView('admindashboard');
        } else {
          setView('dashboard');
        }
      } else {
        // Agar session nahi hai aur purana view dashboard tha, toh landing bhej do
        if (localStorage.getItem("view") === 'dashboard' || localStorage.getItem("view") === 'admindashboard') {
          setView('landing');
        }
      }
    };
    
    checkSession();
  }, []);

  useEffect(()=>{
    document.title = "CareerAI | Career Prediction System";
  },  []);
 return (
    <>
      {/* Ye line sabse upar honi chahiye */}
      <Toaster position="top-center" reverseOrder={false} /> 

      {view === "login" && <LoginPage setView={setView}/>}
      {view === "signup" && <SignupPage setView={setView}/>}
      {view === "dashboard" && <DashboardPage setView={setView}/>}
      {view === "admindashboard" && <AdminDashboard setView={setView}/>}
      {view === "landing" && <LandingPage setView={setView}/>}
      {view === "forgotpassword" && <ForgotPasswordPage setView={setView}/>}
      {view === "profile" && <ProfilePage setView={setView}/>}
    </>
      
    // return <LandingPage setView={setView}/>
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