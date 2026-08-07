import React, { useState } from 'react';
import { compressImageFile, useApp } from '../context/AppContext';
import { uploadProfilePicture } from '../lib/uploadSubmission';
import { Zap, Bell, RotateCcw, Users, Shield, GraduationCap, Loader2 } from 'lucide-react';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar() {
  const { currentUser, currentRoleView, toggleRoleView, setAuthScreen, notifications, updateUserProfilePic } = useApp();
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);

  const userRoles = currentUser?.roles || ['student'];
  const userName = currentUser?.name || 'STUDENT';
  const userId = currentUser?.id || 'user-barath';
  const isDualRole = userRoles.includes('student') && userRoles.includes('mentor');
  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  const avatarSrc = currentUser?.profilePicUrl || currentUser?.profilePic || currentUser?.avatarUrl;
  const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;


  const handlePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[Navbar Profile Pic Upload] File selected:', file.name, file.size, file.type);

    // 1. Validation: accept only image/png, image/jpeg, image/webp; max size 2MB
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('❌ Invalid File Format! Please select a PNG, JPEG, or WEBP image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert(`❌ File Size Exceeds 2MB Limit! Selected file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`);
      return;
    }

    setIsUploadingPic(true);
    try {
      const res = await uploadProfilePicture(file);
      if (res && res.profilePicUrl) {
        updateUserProfilePic(currentUser.id, res.profilePicUrl);
        console.log('[Navbar Profile Pic Upload] Successfully updated profile picture for:', currentUser.name);
      }
    } catch (err) {
      console.error('[Navbar Profile Pic Upload Error]', err);
      alert(err.message || 'Failed to upload profile picture.');
    } finally {
      setIsUploadingPic(false);
    }
  };


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
                style={{ cursor: isUploadingPic ? 'wait' : 'pointer', position: 'relative', display: 'inline-block' }} 
                title="Click to update profile picture from device gallery"
              >
                {isUploadingPic && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                  }}>
                    <Loader2 size={18} className="animate-spin" style={{ color: '#ffffff' }} />
                  </div>
                )}

                <img 
                  src={avatarSrc ? (avatarSrc.includes('data:image') ? avatarSrc : `${avatarSrc}?t=${Date.now()}`) : fallbackAvatar} 
                  alt={currentUser.name} 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackAvatar;
                  }}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #2563eb',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }} 
                />

                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  disabled={isUploadingPic}
                  style={{ display: 'none' }}
                  onChange={handlePicUpload}
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


            {/* Multi-Device Cloud Sync Button */}
            <button
              onClick={useApp().syncCloudDatabase}
              title="Sync live teams, announcements, and scores across mobile and desktop devices"
              style={{
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
              }}
            >
              ☁️ Sync Cloud
            </button>



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
