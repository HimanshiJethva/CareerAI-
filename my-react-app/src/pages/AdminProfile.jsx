import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import DashboardNavbar from "./DashboardNavbar";
import { ShieldCheck, Mail, User, Lock, ChevronRight, Camera } from "lucide-react"; // Icons ke liye
import './AdminProfile.css';

function AdminProfile({ setView }) {
  const [activeSubTab, setActiveSubTab] = useState("info"); // 'info' ya 'security'
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const userEmail = session.user.email;
      setEmail(userEmail);
      
      const { data, error } = await supabase
        .from('users') 
        .select('name')
        .eq('email', userEmail)
        .single();

      if (data) setFullName(data.name);
      else setFullName(session.user.user_metadata?.full_name || userEmail.split('@')[0]);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.auth.updateUser({ data: { full_name: fullName } });
      await supabase.from('users').update({ name: fullName }).eq('email', email);
      alert("Admin profile updated! 🎖️");
      setIsEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert(error.message);
    else {
      alert("Password updated securely! 🔐");
      setNewPassword("");
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-wrapper" style={{ backgroundColor: '#FCF8F8', minHeight: '100vh' }}>
      <DashboardNavbar setView={setView} />

      <main className="profile-main-container animate-in">
        
        {/* Header Section */}
        <div className="profile-card-ref">
          <div className="ref-header-left">
            <div className="ref-avatar" style={{ backgroundColor: '#FF8E9E' }}>
              <User size={50} color="white" />
            </div>
            <div className="ref-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2>{fullName}</h2>
                <span className="admin-badge">SUPER ADMIN</span>
              </div>
              <p><Mail size={14} style={{ marginRight: '5px' }} /> {email}</p>
            </div>
          </div>
          <button className="ref-edit-btn" onClick={() => setIsEditing(!isEditing)}>
             <Camera size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="admin-tabs">
          <button className={activeSubTab === 'info' ? 'active' : ''} onClick={() => setActiveSubTab('info')}>Account Info</button>
          <button className={activeSubTab === 'security' ? 'active' : ''} onClick={() => setActiveSubTab('security')}>Security & Password</button>
        </div>

        {activeSubTab === 'info' ? (
          <div className="profile-content">
             {/* Edit Mode Toggle */}
             {isEditing ? (
               <div className="profile-card-ref col-layout compact-edit-card">
                 <form onSubmit={handleUpdateProfile} className="edit-form">
                   <div className="input-group">
                     <label>FULL NAME</label>
                     <div className="input-wrapper">
                       <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                     </div>
                   </div>
                   <button type="submit" className="btn-modern-primary" style={{ width: '100%' }} disabled={loading}>
                     {loading ? "Updating..." : "Save Profile Details"}
                   </button>
                 </form>
               </div>
             ) : (
               <div className="profile-card-ref col-layout">
                 <div className="ref-row" onClick={() => setView('dashboard')}>
                    <div className="ref-row-left">
                      <div className="ref-icon-box blue-box"><ShieldCheck /></div>
                      <span className="ref-row-text">Admin Dashboard Settings</span>
                    </div>
                    <ChevronRight className="ref-arrow" />
                 </div>
                 <hr className="ref-divider" />
                 <div className="ref-row no-hover">
                    <div className="ref-row-left">
                      <div className="ref-icon-box green-box"><Lock /></div>
                      <div className="ref-status-text">
                        <span className="ref-row-text">System Permissions</span>
                        <span className="ref-badge">ALL ACCESS ENABLED</span>
                      </div>
                    </div>
                 </div>
               </div>
             )}
          </div>
        ) : (
          /* SECURITY TAB */
          <div className="profile-card-ref col-layout compact-edit-card">
             <h3 style={{ marginBottom: '15px' }}>Change Admin Password</h3>
             <form onSubmit={handleUpdatePassword} className="edit-form">
                <div className="input-group">
                  <label>NEW SECURE PASSWORD</label>
                  <div className="input-wrapper">
                    <input 
                      type="password" 
                      placeholder="Min 6 characters" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <button type="submit" className="btn-modern-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? "Securing..." : "Update Password"}
                </button>
             </form>
          </div>
        )}

        <p className="ref-joined-text">ADMINISTRATION PORTAL v2.0</p>
      </main>
    </div>
  );
}

export default AdminProfile;