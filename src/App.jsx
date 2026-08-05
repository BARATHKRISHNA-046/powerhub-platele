import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginView from './components/LoginView';
import ProfilePicker from './components/ProfilePicker';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import MentorDashboard from './components/MentorDashboard';

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
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
