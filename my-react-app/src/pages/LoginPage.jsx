import {useState} from "react"
import {supabase} from "../supabaseClient"
import toast from "react-hot-toast"

function LoginPage({ setView }) {
    
    //states
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [errors, setErrors] = useState({}) //error object
    const [loading,setLoading] = useState(false)

     const handleLogin = async (e) => {
      e.preventDefault()

      if(!validate()) return

      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      setLoading(false)

      if(error){
        toast.error(error.message || "Login Failed. Please check your details.");
        // setErrors({ api: error.message })
        return
      }
      // setErrors({api:"Login sccessfull🎉"})

      // setTimedout(() => {
      //   setView("dashboard")
      // },1000)
      // alert("Login successfull🎉")
      toast.success("Login successfully! 🎉");
      setView("dashboard")
      // setTimedout(() => {
      //    setView("dashboard")
      //  },800)
    }

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

  //   return (
  //     <div className="auth-container">
  //       <div className="auth-card">
  //         <button className="back-btn" onClick={() => setView('landing')}>← Back</button>
  //         {errors.api && <p style={{color:"red"}}>{errors.api}</p>}
  //         <h2 style={{fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1rem'}}>Welcome Back</h2>
  //         <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email Address" className="auth-input" />
  //         {errors.email && <p style={{color:"red"}}>{errors.email}</p>}
  //         <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="auth-input" />
  //         {errors.password && <p style={{color:"red"}}>{errors.password}</p>}
  //         <button onClick={handleLogin} className="btn-primary" style={{width: '100%'}} disabled={loading}>
  //           {loading ? "Logging you in..." : "Login"}</button>
  //         <p style={{marginTop: '1.5rem'}}>
  //           Don't have an account? 
  //           <span className="auth-link" onClick={() => setView('signup')}> Sign Up</span>
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }
   return (
      <div className="auth-container">
        <div className="auth-card">
          <span className="back-btn" onClick={() => setView('landing')}>← Back</span>
          
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
                onClick={() => setView('forgotpassword')}
              >
                Forgot your password?
              </span>
            </div>

          </form>
          {/* CHANGES END HERE */}

          <p style={{marginTop: '1.5rem'}}>
            Don't have an account? 
            <span className="auth-link" style={{cursor: 'pointer', color: 'var(--coral)'}} onClick={() => setView('signup')}> 
              Sign Up
            </span>
          </p>
        </div>
      </div>
    );
}
export default LoginPage