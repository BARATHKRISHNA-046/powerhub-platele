import React from 'react';
import { useApp } from '../context/AppContext';
import { Zap, Bell, RotateCcw, Users, Shield, GraduationCap } from 'lucide-react';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar() {
  const { currentUser, currentRoleView, toggleRoleView, setAuthScreen, notifications } = useApp();
  const [showNotifDrawer, setShowNotifDrawer] = React.useState(false);

  const isDualRole = currentUser.roles.includes('student') && currentUser.roles.includes('mentor');
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0.65rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Logo & Brand matching Netlify App Screenshot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#2752dd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(39, 82, 221, 0.3)'
            }}>
              <Zap size={22} fill="#ffffff" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: '900', fontFamily: 'var(--font-heading)', color: '#0f172a', letterSpacing: '0.02em' }}>
              POWERHUB
            </span>
          </div>

          {/* User Profile & Dual Role Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            
            {/* Dual Role Segmented Switcher for Barathkrishna */}
            {isDualRole && (
              <div style={{
                background: '#f1f5f9',
                padding: '3px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                border: '1px solid var(--border-medium)'
              }}>
                <button
                  onClick={() => toggleRoleView('student')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: currentRoleView === 'student' ? '#ffffff' : 'transparent',
                    color: currentRoleView === 'student' ? 'var(--primary-blue)' : 'var(--text-muted)',
                    boxShadow: currentRoleView === 'student' ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  <GraduationCap size={14} /> Student View
                </button>

                <button
                  onClick={() => toggleRoleView('mentor')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: currentRoleView === 'mentor' ? 'var(--dark-navy)' : 'transparent',
                    color: currentRoleView === 'mentor' ? '#ffffff' : 'var(--text-muted)',
                    boxShadow: currentRoleView === 'mentor' ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  <Shield size={14} /> Mentor View
                </button>
              </div>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifDrawer(true)}
              style={{
                position: 'relative',
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                color: 'var(--dark-navy)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: '800',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Avatar & Gallery Profile Pic Update */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label 
                style={{ cursor: 'pointer', position: 'relative' }} 
                title="Click to update profile picture from device gallery"
              >
                {currentUser.profilePic ? (
                  <img 
                    src={currentUser.profilePic} 
                    alt={currentUser.name} 
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #2563eb',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }} 
                  />
                ) : (
                  <div 
                    className="avatar-circle"
                    style={{
                      width: '38px',
                      height: '38px',
                      backgroundColor: currentUser.avatarBg || '#fb923c',
                      fontSize: '0.85rem'
                    }}
                  >
                    {currentUser.initials}
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        useApp().updateUserProfilePic(currentUser.id, event.target.result);
                        alert(`Profile picture updated from gallery for ${currentUser.name}!`);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1' }}>
                  {currentUser.name}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {currentRoleView === 'mentor' ? 'MENTOR' : 'STUDENT'} • {currentUser.domain}
                </span>
              </div>
            </div>


            {/* Persistent DB Backup Export & Restore Controls (MENTOR PROFILE ONLY) */}
            {currentRoleView === 'mentor' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  onClick={useApp().exportDatabase}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer'
                  }}
                  title="Download Persistent DB Backup JSON"
                >
                  💾 Export DB
                </button>

                <label 
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer'
                  }}
                  title="Restore DB from Backup JSON File"
                >
                  📥 Restore DB
                  <input 
                    type="file" 
                    accept=".json" 
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            useApp().importDatabase(event.target.result);
                            alert('Database successfully restored from persistent backup!');
                            window.location.reload();
                          } catch (err) {
                            alert('Failed to restore database: ' + err.message);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>
            )}


            {/* Switch User Icon */}
            <button
              onClick={() => setAuthScreen('profile_picker')}
              style={{
                background: 'none',
                color: 'var(--text-muted)',
                padding: '0.35rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Switch Profile"
            >
              <Users size={18} />
            </button>


          </div>
        </div>
      </header>

      {showNotifDrawer && <NotificationDrawer onClose={() => setShowNotifDrawer(false)} />}
    </>
  );
}
