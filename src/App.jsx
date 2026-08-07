import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginView from './components/LoginView';
import ProfilePicker from './components/ProfilePicker';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import MentorDashboard from './components/MentorDashboard';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#dc2626', fontWeight: '800', marginBottom: '0.5rem' }}>
            ⚠️ Powerhub Platform Recovered
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '480px', marginBottom: '1.5rem' }}>
            An unexpected error occurred. Click the button below to restore state and continue seamlessly.
          </p>
          <button 
            onClick={() => {
              localStorage.removeItem('POWERHUB_PERMANENT_DB_V11');
              window.location.reload();
            }}
            style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer' }}
          >
            🔄 Reset & Reload Powerhub
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainLayout() {
  const { authScreen, currentRoleView } = useApp();

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
        {currentRoleView === 'student' ? <StudentDashboard /> : <MentorDashboard />}
      </main>
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

