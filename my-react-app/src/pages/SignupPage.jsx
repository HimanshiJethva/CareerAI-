import { useState } from "react"
import { supabase } from "../supabaseClient"
import toast from 'react-hot-toast';

function SignupPage({ setView }) {

    // States
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("") // <--- 1. Nayi State add ki
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({}) 

    const handleSignup = async (e) => {
      if (e) e.preventDefault();

      if (!validate()) return
      
      setLoading(true)

      // Supabase Auth Signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        setLoading(false)
        toast.error(error.message);
        return
      }

      if (data.user) {
        await supabase.from("users").insert([
          {
            id: data.user.id,
            name: name,
            email: email
          }
        ])
      }

      setLoading(false)
      toast.success("Signup successful! Welcome 🎉");

      setTimeout(() => {
        setView("login");
      }, 1000);
    }

    // Validation logic (Updated with Password Match Check)
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

        // <--- 2. Confirm Password Match Logic YAHAN HAI --->
        if (!confirmPassword) {
            newErrors.confirmPassword = "Confirm your password"
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match!"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    return (
      <div className="auth-container">
        <div className="auth-card">
          <span className="back-btn" onClick={() => setView('landing')}>← Back</span>
          
          <h2 style={{fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1.5rem'}}>
            Create Account
          </h2>

          <form onSubmit={handleSignup}>
            
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="auth-input" 
            />
            {errors.name && <p style={{color:"red", fontSize: '0.8rem', marginBottom: '0.5rem'}}>{errors.name}</p>}

            <input 
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="auth-input" 
            />
            {errors.email && <p style={{color:"red", fontSize: '0.8rem', marginBottom: '0.5rem'}}>{errors.email}</p>}

            {/* Password Input */}
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="auth-input" 
            />
            {errors.password && <p style={{color:"red", fontSize: '0.8rem', marginBottom: '0.5rem'}}>{errors.password}</p>}

            {/* <--- 3. NAYA Confirm Password Input Field ---> */}
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="auth-input" 
            />
            {errors.confirmPassword && <p style={{color:"red", fontSize: '0.8rem', marginBottom: '0.5rem'}}>{errors.confirmPassword}</p>}

            <button 
              type="submit" 
              className="btn-primary" 
              style={{width: '100%', marginTop: '1rem'}} 
              disabled={loading}
            >
              {loading ? "Please wait.." : "Signup"}
            </button>

          </form>

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