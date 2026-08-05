import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCircle2, Clock, Settings, X, ShieldAlert } from 'lucide-react';

export default function NotificationDrawer({ onClose }) {
  const { notifications, markNotificationRead, notifPreferences, setNotifPreferences } = useApp();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="card" 
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '5rem',
          right: '2rem',
          maxWidth: '420px',
          width: '90%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          zIndex: 1050
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} style={{ color: 'var(--primary-blue)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Notifications & Reminders</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              style={{ background: 'none', color: 'var(--text-muted)' }}
              title="Notification Settings"
            >
              <Settings size={18} />
            </button>
            <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {showSettings ? (
          <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', fontWeight: '700' }}>
              Daily Automated Schedule Preferences
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600' }}>7:00 PM Study Nudge</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily study session starting alert</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifPreferences.studyReminderEnabled} 
                  onChange={e => setNotifPreferences({ ...notifPreferences, studyReminderEnabled: e.target.checked })} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600' }}>8:30 PM Submission Alert</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deadline protection reminder for unsubmitted work</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifPreferences.submitReminderEnabled} 
                  onChange={e => setNotifPreferences({ ...notifPreferences, submitReminderEnabled: e.target.checked })} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Student Timezone
                </label>
                <select
                  value={notifPreferences.timezone}
                  onChange={e => setNotifPreferences({ ...notifPreferences, timezone: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }}
                >
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                  <option value="America/New_York (EST)">America/New_York (EST)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                </select>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="btn-primary" 
                style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.85rem' }}
              >
                Back to Notifications
              </button>
            </div>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
            {notifications.map(notif => (
              <div 
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.75rem',
                  background: notif.isRead ? '#ffffff' : 'var(--primary-blue-light)',
                  border: '1px solid ' + (notif.isRead ? 'var(--border-light)' : 'var(--pill-blue)'),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    {notif.title}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock size={12} /> {notif.timestamp}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {notif.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
