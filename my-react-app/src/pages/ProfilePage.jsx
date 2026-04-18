import { useState, useEffect } from "react";
import { supabase } from "../../../backend/supabaseClient";
import DashboardNavbar from "./DashboardNavbar";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(""); // Purana password
  const [newPassword, setNewPassword] = useState("");     // Naya password
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirmation
  // Pehle se 'isEditing' state hai, uske niche ye add karein:
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const userEmail = session.user.email;
        setEmail(userEmail);

        // 1. Pehle Auth metadata check karte hain
        let fetchedName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;

        // 2. Agar metadata mein nahi hai, toh seedha aapki 'users' table se fetch karenge
        if (!fetchedName) {
          try {
            // YAHAN MAINE TABLE KA NAAM 'users' KAR DIYA HAI
            const { data, error } = await supabase
              .from('users') 
              .select('name') // Yahan check kar lena ki Supabase me aapke column ka naam 'name' hi hai na
              .eq('email', userEmail)
              .single();

            if (error) {
              console.error("Database fetch error:", error.message);
            }

            if (data && data.name) {
              fetchedName = data.name;
            }
          } catch (err) {
            console.error("Try-catch error:", err);
          }
        }

        // 3. Agar table mein sach mein koi naam save nahi hai, tabhi email wala dikhayega
        if (!fetchedName) {
          fetchedName = userEmail.split('@')[0];
          fetchedName = fetchedName.charAt(0).toUpperCase() + fetchedName.slice(1);
        }
        
        setFullName(fetchedName);
      }
    };
    
    fetchUserProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Auth update
      await supabase.auth.updateUser({ data: { full_name: fullName } });
      
    // 2. Aapki 'users' table me update
      const { error } = await supabase
        .from('users') // YAHAN BHI 'users' KAR DIYA HAI
        .update({ name: fullName }) 
        .eq('email', email);

      if (error) throw error;

      alert("Profile updated successfully! 🎉");
      setIsEditing(false); 
    } catch (error) {
      alert("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
  e.preventDefault();

  // 1. Basic Checks
  if (newPassword !== confirmPassword) {
    alert("New passwords do not match! ❌");
    return;
  }
  if (newPassword.length < 6) {
    alert("New password must be at least 6 characters.");
    return;
  }

  setPasswordLoading(true);

  try {
    // 2. Re-authenticate: Ye verify karega ki Current Password sahi hai ya nahi
    const { data: { user } } = await supabase.auth.getUser();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      alert("Current password is incorrect! 🔐");
      setPasswordLoading(false);
      return;
    }

    // 3. Agar sign-in successful hai, tabhi password update hoga
    const { error: updateError } = await supabase.auth.updateUser({ 
      password: newPassword 
    });

    if (updateError) throw updateError;

    alert("Password updated successfully! 🎉");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    setPasswordLoading(false);
  }
};

  return (
    <div className="dashboard-wrapper" style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
      <DashboardNavbar navigate={navigate} />

<main className="profile-main-container">
  
  {/* 1. VIEW: CHANGE PASSWORD PAGE (Jab Change Password row click ho) */}
  {isChangingPassword ? (
    <div className="profile-content animate-in">
      <button className="back-text-btn" onClick={() => setIsChangingPassword(false)} style={{marginBottom: '1rem', cursor: 'pointer', background: 'none', border: 'none', color: '#666'}}>
        ← Back to Profile
      </button>

      <div className="profile-card-ref col-layout edit-card">
        <center>
          <h2 className="edit-title">Change Password</h2>
          <p className="edit-subtitle">Update your account security settings.</p>
        </center>

        <form onSubmit={handleChangePassword} className="edit-form">
          <div className="input-group">
            <label>CURRENT PASSWORD</label>
            <div className="input-wrapper">
              <span className="input-icon">🔑</span>
              <input type="password" placeholder="Verify old password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
          </div>

          <div className="input-group">
            <label>NEW PASSWORD</label>
            <div className="input-wrapper">
              <span className="input-icon">🆕</span>
              <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
          </div>

          <div className="input-group">
            <label>CONFIRM NEW PASSWORD</label>
            <div className="input-wrapper">
              <span className="input-icon">✅</span>
              <input type="password" placeholder="Re-type new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn-update" style={{width: '100%', marginTop: '1rem', background: '#333', color: 'white', padding: '12px', borderRadius: '8px', cursor: 'pointer'}} disabled={passwordLoading}>
            {passwordLoading ? "Verifying & Updating..." : "🔐 Update Security Settings"}
          </button>
        </form>
      </div>
    </div>
  ) 
  
  /* 2. VIEW: EDIT PROFILE PAGE (Jab pencil icon click ho) */
  : isEditing ? (
    <div className="profile-content animate-in">
      <button className="back-text-btn" onClick={() => setIsEditing(false)} style={{marginBottom: '1rem', cursor: 'pointer', background: 'none', border: 'none'}}>
        ← Back to Profile
      </button>

      <div className="profile-card-ref col-layout edit-card compact-edit-card">
        <center>
          <div className="ref-avatar edit-mode-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <h2 className="edit-title">Edit Your Profile</h2>
          <p className="edit-subtitle">Update your display name.</p>
        </center>

        <form onSubmit={handleSaveProfile} className="edit-form">
          <div className="input-group">
            <label>FULL NAME</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          </div>

          <div className="input-group">
            <label>EMAIL ADDRESS</label>
            <div className="input-wrapper disabled">
              <input type="email" value={email} disabled />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '0.5rem', padding: '12px', borderRadius: '8px', cursor: 'pointer'}} disabled={loading}>
            {loading ? "Saving..." : "💾 Save Changes"}
          </button>
        </form>
      </div>
    </div>
  ) 
  
  /* 3. VIEW: MAIN PROFILE DASHBOARD (Default View) */
  : (
    <div className="profile-content animate-in">
      {/* CARD 1: HEADER */}
      <div className="profile-card-ref">
        <div className="ref-header-left">
          <div className="ref-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <div className="ref-info">
            <h2>{fullName}</h2>
            <p>✉ {email}</p>
          </div>
        </div>
        <button className="ref-edit-btn" onClick={() => setIsEditing(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475467" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
        </button>
      </div>

      {/* CARD 2: ACTION ROWS (Yahan humne naya option dala hai) */}
      <div className="profile-card-ref col-layout">
        <div className="ref-row" onClick={() => setView('dashboard')}>
          <div className="ref-row-left">
            <div className="ref-icon-box blue-box">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <span className="ref-row-text">My Predictions</span>
          </div>
          <span className="ref-arrow">›</span>
        </div>

        <hr className="ref-divider" />

        <div className="ref-row" onClick={() => setIsChangingPassword(true)}>
          <div className="ref-row-left">
            <div className="ref-icon-box orange-box" style={{ background: '#fff7ed', color: '#f97316' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <span className="ref-row-text">Change Password</span>
          </div>
          <span className="ref-arrow">›</span>
        </div>

        <hr className="ref-divider" />

        <div className="ref-row no-hover">
          <div className="ref-row-left">
            <div className="ref-icon-box green-box">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div className="ref-status-text">
              <span className="ref-row-text">Account Status</span>
              <span className="ref-badge">VERIFIED MEMBER</span>
            </div>
          </div>
        </div>
      </div>

      <p className="ref-joined-text">JOINED CAREERAI IN 2026</p>
    </div>
  )}
</main>
    </div>
  );
}

export default ProfilePage;