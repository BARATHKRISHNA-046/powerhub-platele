import React from 'react';
import { UserProfile, INITIAL_PROFILES, isSupabaseConfigured, supabase } from '../lib/supabase';
import { LogIn, Sparkles, ShieldCheck, Zap, Layers } from 'lucide-react';

interface LoginViewProps {
  onSelectProfile: (profile: UserProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSelectProfile }) => {

  const handleGoogleSignIn = async () => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      } catch (err: any) {
        alert(`Google Sign-In Error: ${err.message || err}`);
      }
    } else {
      alert('Supabase credentials not configured yet. Pick any profile below to proceed into the platform demo!');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-50 overflow-hidden bg-grid-pattern px-4 py-12">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pastel-blue/40 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200/80 shadow-xl rounded-2xl p-8 text-center backdrop-blur-sm">
        {/* Brand Logo & Header */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-blue/10 text-brand-blue mb-4">
          <Zap className="w-8 h-8 fill-brand-blue" />
        </div>

        <h1 className="text-3xl font-heading font-extrabold text-brand-slate tracking-tight mb-2">
          Powerhub
        </h1>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          The Shared Student & Mentor Learning Platform. Zero local state, real-time cross-device sync.
        </p>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-brand-blue hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-xl shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Sign in with Google
        </button>

        {!isSupabaseConfigured && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs text-left">
            <span className="font-semibold block mb-1">⚡ Quick Demo Mode Active</span>
            Supabase URL not detected in environment variables. You can click any user below to enter instantly!
          </div>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-medium">Or Select Test Profile</span>
          </div>
        </div>

        {/* Profile Fast Switcher */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {INITIAL_PROFILES.map((profile) => (
            <button
              key={profile.id}
              onClick={() => onSelectProfile(profile)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-brand-blue/30 hover:bg-blue-50/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={profile.profile_pic_url}
                  alt={profile.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="font-medium text-sm text-slate-800 group-hover:text-brand-blue">
                    {profile.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {profile.domain} • {profile.roles.join(' & ')}
                  </div>
                </div>
              </div>
              <LogIn className="w-4 h-4 text-slate-400 group-hover:text-brand-blue transition-colors" />
            </button>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Postgres Shared DB
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-brand-blue" />
            Vite + React + TS
          </span>
        </div>
      </div>
    </div>
  );
};
