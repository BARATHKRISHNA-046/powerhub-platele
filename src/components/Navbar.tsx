import React, { useState } from 'react';
import { UserProfile, NotificationItem } from '../lib/supabase';
import { Zap, Bell, Shield, BookOpen, Repeat, UserCheck, X } from 'lucide-react';

interface NavbarProps {
  activeProfile: UserProfile;
  currentView: 'student' | 'mentor';
  onToggleView: () => void;
  onSwitchProfile: () => void;
  notifications: NotificationItem[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeProfile,
  currentView,
  onToggleView,
  onSwitchProfile,
  notifications,
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const isDualRole = activeProfile.roles.includes('student') && activeProfile.roles.includes('mentor');
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-md">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-xl text-brand-slate tracking-tight">
              Powerhub
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {activeProfile.domain}
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Dual Role View Switcher Toggle */}
          {isDualRole && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={onToggleView}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'student'
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Student View
              </button>
              <button
                onClick={onToggleView}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'mentor'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Mentor View
              </button>
            </div>
          )}

          {/* Single Role View Label */}
          {!isDualRole && (
            <span className="hidden md:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 capitalize">
              {currentView === 'mentor' ? (
                <Shield className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <BookOpen className="w-3.5 h-3.5 text-brand-blue" />
              )}
              {currentView} Dashboard
            </span>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <h4 className="font-heading font-bold text-sm text-brand-slate">
                    Notifications
                  </h4>
                  <button
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-xs ${
                          n.read ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-blue-50/70 border-blue-100 text-slate-800 font-medium'
                        }`}
                      >
                        <div className="font-semibold mb-0.5 text-brand-blue">{n.title}</div>
                        <div>{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active Profile Badge & Switcher */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <img
              src={activeProfile.profile_pic_url}
              alt={activeProfile.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-300 shadow-sm"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-800 line-clamp-1">
                {activeProfile.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {activeProfile.batch}
              </div>
            </div>

            <button
              onClick={onSwitchProfile}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Switch Profile"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
