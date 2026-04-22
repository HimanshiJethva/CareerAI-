import { useState, useEffect } from "react";
import { supabase } from "../../../backend/supabaseClient"; // Path check kar lena apne folder ke hisaab se
import { useNavigate } from 'react-router-dom';

function DashboardNavbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState(""); // Nayi state naam save karne ke liye
  const [userRole, setUserRole] = useState('student');
  const [userAvatar, setUserAvatar] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const email = session.user.email;
        setUserEmail(email);

        // Naam fetch karne ka wahi solid logic jo humne ProfilePage mein lagaya tha
        let fetchedName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;

        const { data: roleData } = await supabase
          .from('users')
          .select('role, avatar_url')
          .eq('email', email)
          .single();
        if (roleData?.role) setUserRole(roleData.role);
        if (roleData?.avatar_url) setUserAvatar(roleData.avatar_url);

        if (!fetchedName) {
          try {
            const { data } = await supabase.from('users').select('name').eq('email', email).single();
            if (data && data.name) fetchedName = data.name;
          } catch (err) { /* ignore */ }
        }

        if (!fetchedName) {
          fetchedName = email.split('@')[0];
          fetchedName = fetchedName.charAt(0).toUpperCase() + fetchedName.slice(1);
        }
        
        setUserName(fetchedName);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/');
  };

  // Naam ya email ka pehla akshar nikalne ka function
  const getInitial = () => {
    if (userName) return userName.charAt(0).toUpperCase();
    if (userEmail) return userEmail.charAt(0).toUpperCase();
    return "U"; // Default agar dono na ho
  };

  return (
    <nav className="dash-top-navbar">
      {/* Left: Logo */}
      <div className="dash-nav-left">
        <span className="dash-logo" onClick={() => navigate('/')}>
          Career<span style={{fontWeight: 'normal'}}>AI</span>
        </span>
      </div>

      {/* Right: Profile Avatar */}
      <div className="dash-nav-right">
        <div className="profile-dropdown-container">
          
          <div className="profile-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            
            {/* SVG HATA KAR YAHAN PEHLA AKSHAR DAAL DIYA */}
            <div className="avatar-circle" style={{ backgroundColor: '#7B8B9E', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
               {userAvatar ? (
    <img src={userAvatar} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%'}} />
  ) : (
    getInitial()
  )}
            </div>

            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" className={`caret ${isDropdownOpen ? 'open' : ''}`}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                {/* Yahan bhi ab dynamic naam aayega 'Student' ki jagah */}
                <strong>{userName || "Student"}</strong>
                <span className="dropdown-email">{userEmail || "user@careerai.com"}</span>
              </div>
              <hr className="dropdown-divider" />
              
              <button className="dropdown-item" onClick={() => {
                  setIsDropdownOpen(false); 
                  navigate('/profile');
              }}>
                 <span className="item-icon">👤</span> My Profile
              </button>
              
              {userRole?.toLowerCase() !== 'admin' && (
              <button className="dropdown-item" onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/predictions');
              }}>
                 <span className="item-icon">📊</span> My Predictions
              </button>
              )}
              
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                 <span className="item-icon">🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default DashboardNavbar;