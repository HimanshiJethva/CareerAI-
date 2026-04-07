// import { useState } from "react";
// import { supabase } from "../supabaseClient";
// import toast from "react-hot-toast";

// function LoginPage({ setView }) {
//   // states
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errors, setErrors] = useState({}); // error object
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     const isInvaild = validate();

//       if(!isInvaild) return;
//     setLoading(true);

//     try {
//       // 1. Pehle normal login karte hain
//       const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (authError) {
//         console.log("Error message : ",authError.message);
//         setLoading(false);
        
//         // CHECK: Agar email verify nahi hai
//         if (authError.message.includes("Email not confirmed")) {
//           toast.error("Aapka email verified nahi hai. Please apna mail check karein aur link par click karein!");
//         } else {
//           toast.error(authError.message || "Login Failed. Please check your details.");
//         }
//         return;
//       }

//       // 2. Login successful! Ab is user ka Role check karte hain
//       if (authData?.user) {
//         const { data: userData, error: dbError } = await supabase
//           .from("users")
//           .select("role")
//           .eq("email", email)
//           .single();

//         if (dbError) {
//           console.error("Role fetch error:", dbError);
//           // Agar database se role nahi milta, default student
//           localStorage.setItem("userRole", "student");
//           setView("dashboard");
//         } else if (userData && userData.role && userData.role.toLowerCase() === "admin") {
//           localStorage.setItem("userRole", "admin");
//           setView("admindashboard");
//         } else {
//           localStorage.setItem("userRole", "student");
//           setView("dashboard");
//         }
        
//         toast.success("Login Successful!");
//       }
//     } catch (err) {
//       console.error("Unexpected error:", err);
//       toast.error("Kuch galat hua. Phir se koshish karein.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validate = () => {
//     let newErrors = {};

//     // Email
//     if (!email) {
//       newErrors.email = "Email is required";
//     } else if (!email.includes("@")) {
//       newErrors.email = "Invalid email";
//     }

//     // Password
//     if (!password) {
//       newErrors.password = "Password is required";
//     } else if (password.length < 6) {
//       newErrors.password = "Min 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <span className="back-btn" onClick={() => setView("landing")}>
//           ← Back
//         </span>

//         <h2 style={{ fontFamily: "Playfair Display", fontSize: "2.5rem", marginBottom: "1rem" }}>
//           Welcome Back
//         </h2>

//         {/* Form Tag */}
//         <form onSubmit={handleLogin}>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Email Address"
//             className="auth-input"
//           />
//           {errors.email && (
//             <p style={{ color: "red", fontSize: "0.9rem", marginBottom: "1rem" }}>{errors.email}</p>
//           )}

//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Password"
//             className="auth-input"
//           />
//           {errors.password && (
//             <p style={{ color: "red", fontSize: "0.9rem", marginBottom: "1rem" }}>
//               {errors.password}
//             </p>
//           )}

//           <button
//             type="submit"
//             className="btn-primary"
//             style={{ width: "100%", marginTop: "1rem" }}
//             disabled={loading}
//           >
//             {loading ? "Logging you in..." : "Login"}
//           </button>

//           <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
//             <span className="forgot-password-link" onClick={() => setView("forgotpassword")}>
//               Forgot your password?
//             </span>
//           </div>
//         </form>

//         <p style={{ marginTop: "1.5rem" }}>
//           Don't have an account?{" "}
//           <span
//             className="auth-link"
//             style={{ cursor: "pointer", color: "var(--coral)" }}
//             onClick={() => setView("signup")}
//           >
//             Sign Up
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default LoginPage;





import {useState} from "react"
import {supabase} from "../supabaseClient"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom";

function LoginPage() {
    
    //states
    const navigate = useNavigate();
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [errors, setErrors] = useState({}) //error object
    const [loading,setLoading] = useState(false)

     const handleLogin = async (e) => {
    e.preventDefault();
    if(!validate()) return;
    setLoading(true);

    // 1. Pehle normal login karte hain
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if(authError){
      setLoading(false);
      toast.error(authError.message || "Login Failed. Please check your details.");
      return;
    }

    // 2. Login successful! Ab is user ka Role check karte hain
    try {
      // LoginPage.jsx ke andar handleLogin mein toast.success ke baad:

const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('email', email)
  .single();

if (userData && userData.role && userData.role.toLowerCase() === 'admin') {
  localStorage.setItem('userRole', 'admin');
  navigate('/admindashboard');
} else {
  localStorage.setItem('userRole', 'student');
  navigate('/dashboard');
}

    } catch (err) {
      setLoading(false);
      // Agar role nahi milta, toh normal dashboard par bhej do
      localStorage.setItem('userRole', 'student');
      navigate('/dashboard');
    }
  };

    const validate = () => {
        let newErrors = {}

        // Email
        if(!email){
          newErrors.email = "Email is required"
        } else if(!email.includes("@")){
          newErrors.email = "Invalid email"
        }

        // Password
        if(!password){
          newErrors.password = "Password is required"
        } else if(password.length < 6){
          newErrors.password = "Min 6 characters"
        }

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
      }

   return (
      <div className="auth-container">
        <div className="auth-card">
          <span className="back-btn" onClick={() => navigate('/')}>← Back</span>
          
          <h2 style={{fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1rem'}}>
            Welcome Back
          </h2>

          {errors.api && <p style={{color:"red", marginBottom: '1rem'}}>{errors.api}</p>}

          {/* CHANGES START HERE: Wrapper Form Tag */}
          <form onSubmit={handleLogin}>
            
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email Address" 
              className="auth-input" 
            />
            {errors.email && <p style={{color:"red", fontSize: '0.9rem', marginBottom: '1rem'}}>{errors.email}</p>}

            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              className="auth-input" 
            />
            {errors.password && <p style={{color:"red", fontSize: '0.9rem', marginBottom: '1rem'}}>{errors.password}</p>}
    
            {/* Change: onClick hata kar type="submit" kiya */}
            <button 
              type="submit" 
              className="btn-primary" 
              style={{width: '100%', marginTop: '1rem'}} 
              disabled={loading}
            >
              {loading ? "Logging you in..." : "Login"}
            </button>
              {/*NEW: Forgot Password Link*/}
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <span 
                className="forgot-password-link" 
                onClick={() => navigate('/forgotpassword')}
              >
                Forgot your password?
              </span>
            </div>

          </form>
          {/* CHANGES END HERE */}

          <p style={{marginTop: '1.5rem'}}>
            Don't have an account? 
            <span className="auth-link" style={{cursor: 'pointer', color: 'var(--coral)'}} onClick={() => navigate('/signup')}> 
              Sign Up
            </span>
          </p>
        </div>
      </div>
    );
}
export default LoginPage