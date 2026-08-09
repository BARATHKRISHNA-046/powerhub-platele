import React, { useState } from 'react';
import { compressImageFile, useApp } from '../context/AppContext';
import { uploadProfilePicture } from '../lib/uploadSubmission';
import { Zap, Bell, RotateCcw, Users, Shield, GraduationCap, Loader2, Sparkles, FileText, LogOut, User, Trophy, LayoutDashboard } from 'lucide-react';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar() {
  const { currentUser, currentRoleView, toggleRoleView, setAuthScreen, notifications, setShowUserProfileModal, handleSignOut, activeTopTab, setActiveTopTab } = useApp();
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  const userRoles = currentUser?.roles || ['student'];
  const userName = currentUser?.name || 'STUDENT';
  const userId = currentUser?.id || 'user-barath';
  const isDualRole = userRoles.includes('student') && userRoles.includes('mentor');
  const canSwitchRole = currentUser?.role === 'mentor' || currentUser?.email === 'barathkrishna046@gmail.com' || isDualRole;
  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  const avatarSrc = currentUser?.profilePicUrl || currentUser?.profilePic || currentUser?.avatarUrl;
  const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;


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
          padding: '0.5rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.6rem'
        }}>
          {/* Logo & Brand - Click directly opens Student's Public Portfolio */}
          <a
            href={`/portfolio/${userId}`}
            target="_blank"
            rel="noreferrer"
            title="Click to view your Public Portfolio Page"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              textDecoration: 'none', 
              cursor: 'pointer',
              transition: 'transform 0.2s ease, opacity 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#2752dd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(39, 82, 221, 0.3)'
            }}>
              <Zap size={20} fill="#ffffff" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: '900', fontFamily: 'var(--font-heading)', color: '#0f172a', letterSpacing: '0.02em', lineHeight: 1 }}>
                POWERHUB
              </span>
            </div>
          </a>

          {/* TOP-LEVEL NAV TABS: Dashboard vs SIH Hackathon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f1f5f9', padding: '3px', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
            <button
              onClick={() => setActiveTopTab('dashboard')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTopTab === 'dashboard' ? '#ffffff' : 'transparent',
                color: activeTopTab === 'dashboard' ? '#0f172a' : '#64748b',
                fontWeight: '800',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                boxShadow: activeTopTab === 'dashboard' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTopTab('hackathon')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTopTab === 'hackathon' ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'transparent',
                color: activeTopTab === 'hackathon' ? '#0f172a' : '#64748b',
                fontWeight: '900',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                boxShadow: activeTopTab === 'hackathon' ? '0 2px 8px rgba(245,158,11,0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Trophy size={15} style={{ color: activeTopTab === 'hackathon' ? '#0f172a' : '#d97706' }} />
              <span>SIH Hackathon</span>
            </button>
          </div>

          {/* User Profile & Dual Role Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            
            {/* LUXURIOUS ROLE VIEW SEGMENTED TOGGLE */}
            {canSwitchRole && (
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '9999px',
                  padding: '3px',
                  boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.05)',
                  transition: 'all 0.2s ease'
                }}
              >
                <button
                  onClick={() => toggleRoleView('student')}
                  style={{
                    padding: '0.4rem 0.75rem',
                    minHeight: '40px',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    border: 'none',
                    background: currentRoleView === 'student' ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' : 'transparent',
                    color: currentRoleView === 'student' ? '#ffffff' : '#64748b',
                    boxShadow: currentRoleView === 'student' ? '0 2px 10px rgba(37, 99, 235, 0.32)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <GraduationCap size={15} style={{ color: currentRoleView === 'student' ? '#ffffff' : '#64748b' }} />
                  <span>Student View</span>
                </button>

                <button
                  onClick={() => toggleRoleView('mentor')}
                  style={{
                    padding: '0.4rem 0.75rem',
                    minHeight: '40px',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    border: 'none',
                    background: currentRoleView === 'mentor' ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'transparent',
                    color: currentRoleView === 'mentor' ? '#ffffff' : '#64748b',
                    boxShadow: currentRoleView === 'mentor' ? '0 2px 10px rgba(79, 70, 229, 0.32)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <Shield size={15} style={{ color: currentRoleView === 'mentor' ? '#ffffff' : '#64748b' }} />
                  <span>Mentor View</span>
                </button>
              </div>
            )}

            {/* Quick Resume Builder Navigation Pill */}
            {currentRoleView === 'student' && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('POWERHUB_NAVIGATE_RESUME'));
                }}
                style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
                  border: '1.5px solid #c7d2fe',
                  color: '#4338ca',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.12)',
                  transition: 'all 0.2s ease'
                }}
                title="Open Verified Resume Builder"
              >
                <Sparkles size={15} style={{ color: '#4f46e5' }} />
                <span>Resume Builder</span>
              </button>
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

            {/* User Profile Pill (Opens Read-Only Profile Modal) */}
            <div 
              onClick={() => setShowUserProfileModal && setShowUserProfileModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                padding: '0.25rem 0.65rem 0.25rem 0.25rem',
                borderRadius: '999px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s ease'
              }}
              title="Click to view Read-Only Profile"
            >
              <img 
                src={avatarSrc ? (avatarSrc.includes('data:image') ? avatarSrc : `${avatarSrc}?t=${Date.now()}`) : fallbackAvatar} 
                alt={currentUser.name} 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackAvatar;
                }}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #2563eb',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }} 
              />

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1' }}>
                  {currentUser.name}
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {currentRoleView === 'mentor' ? 'MENTOR' : 'STUDENT'} • {currentUser.domain}
                </span>
              </div>
            </div>

            {/* Log Out Button */}
            <button
              onClick={handleSignOut}
              title="Sign out of Powerhub"
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} />
            </button>

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
