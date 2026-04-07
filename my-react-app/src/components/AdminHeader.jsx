import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './AdminHeader.css';

function AdminHeader({ setView }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: 'User', // Initial fallback
    email: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      // 1. Pehle logged-in user ki ID nikaalte hain
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 2. Ab 'users' table (ya aapka jo bhi table name hai) se naam fetch karte hain
        // 'id' column ko user.id se match karenge
        const { data: profile, error } = await supabase
          .from('users') // 👈 AGAR AAPKE TABLE KA NAAM 'profiles' HAI TO WOH LIKHEIN
          .select('name') // 👈 COLUMN KA NAAM (e.g., 'full_name' ya 'username')
          .eq('id', user.id)
          .single();

        if (profile && !error) {
          setUserData({
            name: profile.name, // Database wala asli naam
            email: user.email
          });
        } else {
          // Agar database table mein naam nahi mila, toh email ka pehla part dikhayenge
          setUserData({
            name: user.user_metadata?.full_name || user.email.split('@')[0],
            email: user.email
          });
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setView('landing'); 
  };

  return (
    <header className="custom-admin-header">
      <div className="header-left">
        <h2>Career AI - Command Center</h2>
      </div>

      <div className="header-right">
        <div className="header-search">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search" />
        </div>

        <div className="header-notification">🔔</div>

        <div className="header-profile-container">
          <div className="profile-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <div className="avatar-circle">
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <span className="profile-name">{userData.name}</span>
            <span className="profile-arrow">{isDropdownOpen ? '▴' : '▾'}</span>
          </div>

          {isDropdownOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-header">
                {/* 👇 DATABASE SE AAYA ASLI NAAM 👇 */}
                <p className="dropdown-user-role">{userData.name}</p>
                <p className="dropdown-user-email">{userData.email}</p>
              </div>
              
              <div className="dropdown-divider"></div>

              <div className="dropdown-items">
                <button className="dropdown-item active-pink">
                  👤 <span className="item-text">My Profile</span>
                </button>
                <button className="dropdown-item">
                  📊 <span className="item-text">My Predictions</span>
                </button>
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  🚪 <span className="item-text">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;