import React, { useState, useEffect } from 'react';
import { supabase } from '../../../backend/supabaseClient';

const SettingsPage = () => {
  // ── States ──
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Admin Profile
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Website Info
  const [siteTitle, setSiteTitle] = useState('CareerAI');
  const [siteTagline, setSiteTagline] = useState('Predict Your Perfect Career With AI');
  const [contactEmail, setContactEmail] = useState('support.career.ai@gmail.com');

  // Notifications
  const [notifyNewStudent, setNotifyNewStudent] = useState(true);
  const [notifyPrediction, setNotifyPrediction] = useState(true);
  const [notifyFeedback, setNotifyFeedback] = useState(false);

 
// Yeh ADD karo:
const [careers, setCareers] = useState([]);
const [careersLoading, setCareersLoading] = useState(true);

  // ── Fetch admin info ──
 useEffect(() => {
  const fetchAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setAdminEmail(user.email || '');
      
      // ✅ email se fetch karo
      const { data } = await supabase
        .from('users')
        .select('name')
        .eq('email', user.email)  // ← yeh fix hai
        .single();
      
      if (data) setAdminName(data.name || '');
    }
  };
  fetchAdmin();
}, []);

useEffect(() => {
  const fetchCareers = async () => {
    setCareersLoading(true);
    
    const { data } = await supabase
      .from('predictions')
      .select('career_1, career_2, career_3');
    
    if (data && data.length > 0) {
      // Teeno columns se unique careers nikalo
      const allCareers = data.flatMap(d => [
        d.career_1, d.career_2, d.career_3
      ]).filter(Boolean);
      
      const uniqueCareers = [...new Set(allCareers)];
      
      // Model ke known careers bhi add karo agar missing hain
      const knownCareers = [
        'Doctor',
        'Software Developer',
        'Politician',
        'Athlete',
        'Teacher',
        'Artist',
        'Entrepreneur',
        'Scientist',
        'Engineer',
        'Chartered Accountant'
        ];
      const finalCareers = [
        ...new Set([...uniqueCareers, ...knownCareers])
      ];
      
      setCareers(finalCareers);
    } else {
      // Agar koi data nahi toh directly known careers dikhao
      setCareers([
         'Doctor',
        'Software Developer',
        'Politician',
        'Athlete',
        'Teacher',
        'Artist',
        'Entrepreneur',
        'Scientist',
        'Engineer',
        'Chartered Accountant'  
      ]);
    }
    setCareersLoading(false);
  };
  fetchCareers();
}, []);


  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ── Save Profile ──
 const handleSaveProfile = async () => {
  if (!adminName.trim()) { alert('Name khali nahi ho sakta!'); return; }
  setSaving(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // ✅ email se update karo — id se nahi
    const { error } = await supabase
      .from('users')
      .update({ name: adminName.trim() })
      .eq('email', user.email);  // ← yeh fix hai
    
    if (error) throw error;
    showSuccess('✅ Profile updated successfully!');
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    setSaving(false);
  }
};

  // ── Change Password ──
 const handleChangePassword = async () => {
  if (!oldPassword || !newPassword || !confirmPassword) { 
    alert('Saare fields bharo!'); return; 
  }
  if (newPassword !== confirmPassword) { 
    alert('Passwords match nahi kar rahe!'); return; 
  }
  if (newPassword.length < 6) { 
    alert('Password kam se kam 6 characters ka hona chahiye!'); return; 
  }
  
  setSaving(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // ✅ Pehle current password verify karo
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });
    
    if (signInError) {
      alert('Current password galat hai! 🔐');
      setSaving(false);
      return;
    }
    
    // ✅ Tab naya password update karo
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    
    setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    showSuccess('✅ Password changed successfully!');
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    setSaving(false);
  }
};

  // ── Save Website Info ──
  const handleSaveWebsite = () => {
    showSuccess('✅ Website info saved! (Frontend mein reflect hoga)');
  };

  // ── Save Notifications ──
  const handleSaveNotifications = () => {
    showSuccess('✅ Notification preferences saved!');
  };

  // ── Sidebar sections ──
  const sections = [
    { id: 'profile',       icon: '👤', label: 'Admin Profile'      },
    // { id: 'website',       icon: '🌐', label: 'Website Info'        },
    // { id: 'notifications', icon: '🔔', label: 'Notifications'       },
    { id: 'careers',       icon: '🎓', label: 'Career Management'   },
  ];

  // ── Shared input style ──
  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', fontSize: '14px',
    outline: 'none', color: '#2D3748', background: '#f8fafc',
    fontFamily: 'inherit', boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: '700',
    color: '#718096', textTransform: 'uppercase',
    letterSpacing: '0.8px', marginBottom: '7px'
  };

  const sectionCardStyle = {
    background: 'white', borderRadius: '16px',
    padding: '28px', border: '1px solid #f0f0f0',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: '20px'
  };

  const saveBtnStyle = {
    padding: '11px 28px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
    color: 'white', fontWeight: '700', fontSize: '14px',
    cursor: saving ? 'not-allowed' : 'pointer',
    opacity: saving ? 0.7 : 1, fontFamily: 'inherit',
    marginTop: '20px'
  };

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '10px', minHeight: '80vh' }}>

      {/* ── Left: Section Tabs ── */}
      <div style={{
        width: '220px', flexShrink: 0,
        background: 'white', borderRadius: '16px',
        padding: '16px', border: '1px solid #f0f0f0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        height: 'fit-content'
      }}>
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#a0aec0',
          textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          Settings Menu
        </p>
        {sections.map(sec => (
          <div key={sec.id} onClick={() => setActiveSection(sec.id)} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '11px 14px', borderRadius: '10px', cursor: 'pointer',
            marginBottom: '4px', transition: 'all 0.2s',
            background: activeSection === sec.id ? '#fff5f5' : 'transparent',
            border: activeSection === sec.id ? '1.5px solid #FF8787' : '1.5px solid transparent',
            color: activeSection === sec.id ? '#FF6B6B' : '#4a5568',
            fontWeight: activeSection === sec.id ? '700' : '500',
            fontSize: '14px'
          }}>
            <span style={{ fontSize: '18px' }}>{sec.icon}</span>
            {sec.label}
          </div>
        ))}
      </div>

      {/* ── Right: Content ── */}
      <div style={{ flex: 1 }}>

        {/* Success Message */}
        {successMsg && (
          <div style={{
            background: '#f0fff4', border: '1px solid #9ae6b4',
            borderRadius: '10px', padding: '12px 18px',
            color: '#276749', fontWeight: '600', fontSize: '14px',
            marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            {successMsg}
          </div>
        )}

        {/* ══ SECTION 1: Admin Profile ══ */}
        {activeSection === 'profile' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1a202c', marginBottom: '20px' }}>
              👤 Admin Profile
            </h2>

            {/* Profile Info */}
            <div style={sectionCardStyle}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2D3748', marginBottom: '20px' }}>
                Personal Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} value={adminName}
                    onChange={e => setAdminName(e.target.value)} placeholder="Admin Name" />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input style={{ ...inputStyle, background: '#edf2f7', cursor: 'not-allowed', color: '#a0aec0' }}
                    value={adminEmail} disabled />
                  <p style={{ fontSize: '11px', color: '#a0aec0', marginTop: '4px' }}>
                    Email cannot be changed
                  </p>
                </div>
              </div>
              <button style={saveBtnStyle} onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Profile'}
              </button>
            </div>

            {/* Change Password */}
            <div style={sectionCardStyle}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2D3748', marginBottom: '20px' }}>
                🔐 Change Password
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* ✅ Current Password field add kiya */}
                <div>
                    <label style={labelStyle}>Current Password</label>
                    <input style={inputStyle} type="password" value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)} 
                    placeholder="Apna purana password daalo" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                    <label style={labelStyle}>New Password</label>
                    <input style={inputStyle} type="password" value={newPassword}
                        onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
                    </div>
                    <div>
                    <label style={labelStyle}>Confirm New Password</label>
                    <input style={inputStyle} type="password" value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
                    </div>
                </div>
                </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p style={{ color: '#e53e3e', fontSize: '12px', marginTop: '8px' }}>
                  ⚠️ Mismatch Password!
                </p>
              )}
              {newPassword && confirmPassword && newPassword === confirmPassword && (
                <p style={{ color: '#38a169', fontSize: '12px', marginTop: '8px' }}>
                  ✅ Passwords Matched!
                </p>
              )}
              <button style={saveBtnStyle} onClick={handleChangePassword} disabled={saving}>
                {saving ? 'Saving...' : '🔐 Update Password'}
              </button>
            </div>
          </div>
        )}

        {/* ══ SECTION 2: Website Info ══ */}
        {activeSection === 'website' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1a202c', marginBottom: '20px' }}>
              🌐 Website Info
            </h2>
            <div style={sectionCardStyle}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2D3748', marginBottom: '20px' }}>
                Basic Website Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Website Title</label>
                  <input style={inputStyle} value={siteTitle}
                    onChange={e => setSiteTitle(e.target.value)} placeholder="e.g. CareerAI" />
                </div>
                <div>
                  <label style={labelStyle}>Tagline</label>
                  <input style={inputStyle} value={siteTagline}
                    onChange={e => setSiteTagline(e.target.value)}
                    placeholder="e.g. Predict Your Perfect Career With AI" />
                </div>
                <div>
                  <label style={labelStyle}>Contact Email</label>
                  <input style={inputStyle} type="email" value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="e.g. support@careerai.com" />
                </div>
              </div>

              {/* Live Preview */}
              <div style={{
                marginTop: '20px', padding: '16px', borderRadius: '12px',
                background: '#fff5f5', border: '1px solid #fecaca'
              }}>
                <p style={{ fontSize: '11px', color: '#718096', fontWeight: '700',
                  textTransform: 'uppercase', marginBottom: '8px' }}>
                  Live Preview:
                </p>
                <p style={{ fontSize: '20px', fontWeight: '800', color: '#FF6B6B', margin: 0 }}>
                  {siteTitle || 'CareerAI'}
                </p>
                <p style={{ fontSize: '13px', color: '#718096', margin: '4px 0 0' }}>
                  {siteTagline}
                </p>
                <p style={{ fontSize: '12px', color: '#a0aec0', margin: '4px 0 0' }}>
                  📧 {contactEmail}
                </p>
              </div>

              <button style={saveBtnStyle} onClick={handleSaveWebsite}>
                💾 Save Website Info
              </button>
            </div>
          </div>
        )}

        {/* ══ SECTION 3: Notifications ══ */}
        {activeSection === 'notifications' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1a202c', marginBottom: '20px' }}>
              🔔 Notification Preferences
            </h2>
            <div style={sectionCardStyle}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2D3748', marginBottom: '20px' }}>
                Email Notifications
              </h3>

              {[
                { label: 'New Student Registered', desc: 'Jab koi naya student signup kare', value: notifyNewStudent, set: setNotifyNewStudent },
                { label: 'Prediction Completed', desc: 'Jab koi student prediction complete kare', value: notifyPrediction, set: setNotifyPrediction },
                { label: 'New Feedback Received', desc: 'Jab koi student feedback submit kare', value: notifyFeedback, set: setNotifyFeedback },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px', borderRadius: '12px', marginBottom: '10px',
                  background: item.value ? '#fff5f5' : '#f8fafc',
                  border: `1.5px solid ${item.value ? '#fecaca' : '#e2e8f0'}`,
                  transition: 'all 0.2s'
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', color: '#2D3748', fontSize: '14px' }}>
                      {item.label}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#718096' }}>
                      {item.desc}
                    </p>
                  </div>
                  {/* Toggle Switch */}
                  <div onClick={() => item.set(!item.value)} style={{
                    width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer',
                    background: item.value ? '#FF6B6B' : '#cbd5e0',
                    position: 'relative', transition: 'background 0.3s', flexShrink: 0
                  }}>
                    <div style={{
                      position: 'absolute', top: '3px',
                      left: item.value ? '25px' : '3px',
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: 'white', transition: 'left 0.3s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>
              ))}

              <button style={saveBtnStyle} onClick={handleSaveNotifications}>
                💾 Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* ══ SECTION 4: Career Management ══ */}
{activeSection === 'careers' && (
  <div>
    <h2 style={{ fontSize: '22px', fontWeight: '800', 
      color: '#1a202c', marginBottom: '20px' }}>
      🎓 Career Management
    </h2>
    <div style={sectionCardStyle}>
      
      {/* Info Banner */}
      <div style={{
        background: '#fffbeb', border: '1px solid #fde68a',
        borderRadius: '10px', padding: '12px 16px',
        marginBottom: '20px', display: 'flex', 
        alignItems: 'center', gap: '10px'
      }}>
        <span style={{ fontSize: '18px' }}>ℹ️</span>
        <p style={{ margin: 0, fontSize: '13px', color: '#92400e' }}>
          <strong>Note:</strong> Yeh careers humara ML model predict kar sakta hai. 
          Yeh list Kaggle dataset se train ki gayi hai aur 
          <strong> change nahi ho sakti</strong> bina model retraining ke.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', 
        alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', 
          color: '#2D3748', margin: 0 }}>
          Model Supported Careers ({careers.length})
        </h3>
        <span style={{
          background: '#fff5f5', color: '#FF6B6B',
          padding: '4px 12px', borderRadius: '20px',
          fontSize: '12px', fontWeight: '700',
          border: '1px solid #fecaca'
        }}>
          🤖 ML Model Fixed
        </span>
      </div>

      {/* Read-only Career List */}
      {/* Read-only Career List */}
        {careersLoading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#718096' }}>
            ⏳ Loading careers from database...
        </div>
        ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {careers.map((career, i) => (
            <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#f8fafc', border: '1.5px solid #e2e8f0',
                borderRadius: '10px', padding: '8px 14px',
                fontSize: '13px', fontWeight: '600', color: '#2D3748'
            }}>
                <span style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: '#FF6B6B', color: 'white',
                fontSize: '11px', fontWeight: '700',
                display: 'flex', alignItems: 'center', 
                justifyContent: 'center', flexShrink: 0
                }}>{i + 1}</span>
                {career}
            </div>
            ))}
        </div>
        )}

      {/* Bottom Note */}
      <div style={{
        marginTop: '20px', padding: '12px 16px',
        background: '#f0fff4', borderRadius: '10px',
        border: '1px solid #9ae6b4'
      }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#276749' }}>
          ✅ <strong>Model Accuracy: 91.9%</strong> — 
          Yeh careers 5000 student records pe train kiye gaye hain.
          Naye careers add karne ke liye model ko retraining ki zaroorat hogi.
        </p>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default SettingsPage;