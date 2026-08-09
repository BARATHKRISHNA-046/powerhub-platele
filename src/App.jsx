import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginView from './components/LoginView';
import ProfilePicker from './components/ProfilePicker';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import MentorDashboard from './components/MentorDashboard';
import PublicVerifyView from './components/PublicVerifyView';
import PublicPortfolioView from './components/PublicPortfolioView';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("🔴 [Powerhub Root ErrorBoundary] Uncaught Crash Exception:", error);
    console.error("🔴 [Powerhub Root ErrorBoundary] Component Stack:", errorInfo?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', fontFamily: 'var(--font-body, sans-serif)', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', border: '2px solid #fca5a5', borderRadius: '24px', padding: '2.5rem 2rem', maxWidth: '580px', width: '100%', boxShadow: '0 10px 30px rgba(220,38,38,0.1)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.5rem', color: '#dc2626', fontWeight: '900', marginBottom: '0.5rem' }}>
              Powerhub Platform Recovered
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              An unexpected error occurred. You can view technical details below or click reset to restore default state.
            </p>

            {/* TOGGLEABLE ON-SCREEN ERROR DETAILS FOR DIAGNOSTICS */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <button
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: '700', color: '#475569', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span>🔍 {this.state.showDetails ? 'Hide Error Trace' : 'Show Error Details'}</span>
                <span>{this.state.showDetails ? '▲' : '▼'}</span>
              </button>
              
              {this.state.showDetails && (
                <div style={{ marginTop: '0.5rem', background: '#0f172a', color: '#f8fafc', padding: '1rem', borderRadius: '12px', fontSize: '0.78rem', fontFamily: 'monospace', maxHeight: '220px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  <strong>Error:</strong> {this.state.error?.toString()}<br/><br/>
                  <strong>Component Stack:</strong><br/>
                  {this.state.errorInfo?.componentStack || 'Stack trace available in browser console.'}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button 
                onClick={() => {
                  try {
                    localStorage.removeItem('POWERHUB_PERMANENT_DB_V11');
                    localStorage.removeItem('ph_active_user_id');
                  } catch (e) {}
                  window.location.reload();
                }}
                style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
              >
                🔄 Reset State & Reload
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.75rem 1.25rem', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer' }}
              >
                ⚡ Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


import PublicResumeView from './components/PublicResumeView';
import PowerhubMascot from './components/PowerhubMascot';
import ProfileSetupModal from './components/ProfileSetupModal';
import UserProfileModal from './components/UserProfileModal';

import HackathonModule from './components/HackathonModule';

function MainLayout() {
  const { 
    authScreen, 
    currentRoleView, 
    currentUser,
    showProfileSetupModal, 
    pendingSetupProfile, 
    handleCompleteStudentSetup, 
    showUserProfileModal, 
    setShowUserProfileModal,
    calculateStudentStreak,
    calculateStudentScore,
    activeTopTab
  } = useApp();

  const urlParams = new URLSearchParams(window.location.search);
  const shareResumeUserId = urlParams.get('shareResume');
  if (shareResumeUserId) {
    return <PublicResumeView userId={shareResumeUserId} />;
  }

  const pathName = window.location.pathname;
  const matchVerify = pathName.match(/\/verify\/([^/]+)/);
  const verifyCertId = matchVerify ? matchVerify[1] : urlParams.get('verifyCert');
  if (verifyCertId) {
    return <PublicVerifyView initialCertId={verifyCertId} onBack={() => { window.location.href = '/'; }} />;
  }

  const matchPortfolio = pathName.match(/\/portfolio\/([^/]+)/);
  const portfolioUsername = matchPortfolio ? matchPortfolio[1] : urlParams.get('portfolio');
  if (portfolioUsername) {
    return <PublicPortfolioView username={portfolioUsername} />;
  }

  if (authScreen === 'login') {
    return <LoginView />;
  }

  if (authScreen === 'profile_picker') {
    return <ProfilePicker />;
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {activeTopTab === 'hackathon' ? (
          <HackathonModule />
        ) : currentRoleView === 'student' ? (
          <StudentDashboard />
        ) : (
          <MentorDashboard />
        )}
      </main>
      <PowerhubMascot />

      {showProfileSetupModal && (
        <ProfileSetupModal 
          profile={pendingSetupProfile || currentUser} 
          onCompleteSetup={handleCompleteStudentSetup} 
        />
      )}

      {showUserProfileModal && (
        <UserProfileModal 
          profile={currentUser} 
          onClose={() => setShowUserProfileModal(false)}
          myStreak={calculateStudentStreak ? calculateStudentStreak(currentUser?.id) : 0}
          totalScore={calculateStudentScore ? calculateStudentScore(currentUser?.id) : 0}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}

