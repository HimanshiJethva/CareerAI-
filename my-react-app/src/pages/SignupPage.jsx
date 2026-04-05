import { useState } from "react"
import { supabase } from "../supabaseClient"
import toast from 'react-hot-toast';

function SignupPage({ setView }) {

    // States
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    // const [confirmPassword, setConfirmPassword] = useState("") // <--- 1. Nayi State add ki
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({}) 

    const handleSignup = async (e) => {
      e.preventDefault();
      const isInvaild = validate();

      if(!isInvaild) return;
      setLoading(true);
      setErrors({});
      // STEP 1: Supabase Auth mein user banana
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if(error){
        setErrors({ api: error.message });
        setLoading(false);
        return;
      }

      // STEP 2: Manual Insert (Aapka manga hua tarika)
      // Hum 'users' table mein data tabhi dalenge jab user successfully auth ho jaye
      if (data?.user) {
        const { error: dbError } = await supabase
          .from("users")
          .upsert([
            {
              id: data.user.id, // Auth ki unique ID
              name: name,
              email: email,
              avatar_url: "" 
            }
          ]);

        if (dbError) {
          setErrors({ api: "Database Error: " + dbError.message });
        } else {
          alert("Signup Success! Please check your inbox to verify.");
          setView('login');
        }
      }
      
      setLoading(false);
    };
    
    
   
    const validate = () => {
        let newErrors = {}
        if (!name) newErrors.name = "Name is required"
        if (!email) {
          newErrors.email = "Email is required"
        } else if (!email.includes("@")) {
          newErrors.email = "Invalid email"
        }
        
        // Password Checks
        if (!password) {
          newErrors.password = "Password is required"
        } else if (password.length < 6) {
          newErrors.password = "Min 6 characters"
        }

        // // <--- 2. Confirm Password Match Logic YAHAN HAI --->
        // if (!confirmPassword) {
        //     newErrors.confirmPassword = "Confirm your password"
        // } else if (password !== confirmPassword) {
        //     newErrors.confirmPassword = "Passwords do not match!"
        // }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    return (
      <div className="auth-container">
       
        <div className="auth-card">
          
          <button className="back-btn" onClick={() => setView('landing')}>← Back</button>
          {errors.api && <p style={{color:"red"}}>{errors.api}</p>}
          <h2 style={{fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1rem'}}>Create Account</h2>
          <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={(e)=>setName(e.target.value)} 
              className="auth-input" />
          {errors.name && <p style={{color:"red"}}>{errors.name}</p>}
          <input type="email" placeholder="Email Address" value={email} onChange={(e)=>setEmail(e.target.value)} className="auth-input" />
          {errors.email && <p style={{color:"red"}}>{errors.email}</p>}
          <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="auth-input" />
          {errors.password && <p style={{color:"red"}}>{errors.password}</p>}
          <button  onClick={handleSignup} className="btn-primary" style={{width: '100%'}} disabled={loading}>{loading ? "Please wait.." : "Signup"}</button>
          <p style={{marginTop: '1.5rem'}}>
            Already have an account? 
            <span className="auth-link" style={{cursor: 'pointer', color: 'var(--coral)'}} onClick={() => setView('login')}> 
              Login
            </span>
          </p>
        </div>
      </div>
    );
}

export default SignupPage;