import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  NotificationItem,
  fetchProfilesFromSupabase,
  fetchNotificationsFromSupabase,
  supabase,
  isSupabaseConfigured
} from './lib/supabase';
import { LoginView } from './components/LoginView';
import { ProfilePicker } from './components/ProfilePicker';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { MentorDashboard } from './components/MentorDashboard';

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'student' | 'mentor'>('student');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load profiles on mount (Architecture Rule 1 & Rule 3: Always read fresh from Supabase)
  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await fetchProfilesFromSupabase();
      setProfiles(data);
    } catch (err) {
      console.error('Failed loading profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  // Listen to Supabase Auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        // Sync or locate user profile
        const userEmail = session.user.email || '';
        const existing = profiles.find((p) => p.email === userEmail);
        if (existing) {
          setActiveProfile(existing);
          setCurrentView(existing.roles.includes('mentor') ? 'mentor' : 'student');
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [profiles]);

  // Load notifications when active profile changes
  useEffect(() => {
    let channel: any = null;
    if (activeProfile) {
      fetchNotificationsFromSupabase(activeProfile.id).then(setNotifications);

      // Realtime Notification Subscription (Architecture Rule 4)
      if (isSupabaseConfigured) {
        channel = supabase
          .channel(`notifs_${activeProfile.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `student_id=eq.${activeProfile.id}`
            },
            (payload) => {
              setNotifications((prev) => [payload.new as NotificationItem, ...prev]);
            }
          )
          .subscribe();
      }
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [activeProfile]);

  const handleSelectProfile = (profile: UserProfile) => {
    setActiveProfile(profile);
    setIsLoggedIn(true);
    // Set initial view based on roles
    if (profile.roles.includes('student')) {
      setCurrentView('student');
    } else if (profile.roles.includes('mentor')) {
      setCurrentView('mentor');
    }
  };

  const handleToggleView = () => {
    setCurrentView((prev) => (prev === 'student' ? 'mentor' : 'student'));
  };

  const handleSwitchProfile = () => {
    setActiveProfile(null);
  };

  if (!isLoggedIn) {
    return <LoginView onSelectProfile={handleSelectProfile} />;
  }

  if (!activeProfile) {
    return (
      <ProfilePicker
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        onRefreshProfiles={loadProfiles}
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-slate flex flex-col font-sans">
      <Navbar
        activeProfile={activeProfile}
        currentView={currentView}
        onToggleView={handleToggleView}
        onSwitchProfile={handleSwitchProfile}
        notifications={notifications}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'student' ? (
          <StudentDashboard activeProfile={activeProfile} />
        ) : (
          <MentorDashboard activeProfile={activeProfile} />
        )}
      </main>
    </div>
  );
}

export default App;
