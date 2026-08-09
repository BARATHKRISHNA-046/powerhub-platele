/**
 * PowerHub Role-Based Auth Service & Supabase Profile Manager
 */

import { supabase, isSupabaseConfigured } from './supabase';

export const MENTOR_EMAIL = (
  import.meta.env?.VITE_MENTOR_EMAIL || 
  (typeof process !== 'undefined' ? process.env?.VITE_MENTOR_EMAIL : '') || 
  'barathkrishna046@gmail.com'
).toLowerCase().trim();

/**
 * Checks if a given email belongs to the hardcoded Mentor account.
 * 
 * @param {string} email 
 * @returns {boolean}
 */
export function isMentorEmail(email) {
  if (!email) return false;
  return email.toLowerCase().trim() === MENTOR_EMAIL;
}

/**
 * Initiates Google OAuth Sign-In with Supabase
 */
export async function signInWithGoogle() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.warn('⚠️ Supabase Google OAuth redirect notice:', err.message);
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: 'Supabase OAuth client URL not configured in dev environment' };
}

/**
 * Fetches existing profile or creates a new profile record without duplicate rows.
 * Hardcodes role="mentor" for barathkrishna046@gmail.com and role="student" for all others.
 * 
 * @param {Object} authUser - User object from Supabase auth session
 * @param {Array} existingUsers - Current users in state
 * @returns {Promise<Object>} Updated profile object & setup status
 */
export async function fetchOrCreateUserProfile(authUser, existingUsers = []) {
  if (!authUser || !authUser.email) {
    throw new Error('Invalid authentication user payload.');
  }

  const email = authUser.email.toLowerCase().trim();
  const isMentor = isMentorEmail(email);
  const assignedRole = isMentor ? 'mentor' : 'student';

  // 1. Check local/memory state users first to prevent duplicate profile creation
  const existingLocal = existingUsers.find(u => 
    u.id === authUser.id || (u.email && u.email.toLowerCase().trim() === email)
  );

  if (existingLocal) {
    // Return existing profile without creating duplicates
    return {
      profile: {
        ...existingLocal,
        email,
        roles: isMentor ? ['mentor', 'student'] : ['student'],
        role: assignedRole
      },
      isNewUser: false,
      setupCompleted: isMentor || Boolean(existingLocal.setupCompleted || existingLocal.domain)
    };
  }

  // 2. Query Supabase 'profiles' table if Supabase is active
  if (isSupabaseConfigured) {
    try {
      const { data: dbProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${authUser.id},email.eq.${email}`)
        .maybeSingle();

      if (dbProfile && !error) {
        return {
          profile: {
            id: dbProfile.id,
            email: dbProfile.email,
            name: dbProfile.name || authUser.user_metadata?.full_name || email.split('@')[0],
            roles: isMentor ? ['mentor', 'student'] : ['student'],
            role: dbProfile.role || assignedRole,
            domain: dbProfile.domain || 'FULLSTACK',
            batch: dbProfile.batch || 'FULLSTACK Cohort 2026',
            created_at: dbProfile.created_at || new Date().toISOString(),
            setupCompleted: isMentor || Boolean(dbProfile.setup_completed)
          },
          isNewUser: false,
          setupCompleted: isMentor || Boolean(dbProfile.setup_completed)
        };
      }
    } catch (e) {
      console.warn('⚠️ Supabase profiles lookup notice:', e.message);
    }
  }

  // 3. Create NEW Profile row (First time login)
  const defaultName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || email.split('@')[0];
  const newProfile = {
    id: authUser.id || `user-${Date.now()}`,
    email,
    name: defaultName,
    roles: isMentor ? ['mentor', 'student'] : ['student'],
    role: assignedRole,
    domain: 'FULLSTACK',
    batch: 'FULLSTACK Cohort 2026',
    created_at: new Date().toISOString(),
    myStreak: 0,
    totalScore: 0,
    setupCompleted: isMentor // Mentors skip profile creation setup
  };

  // Upsert to Supabase 'profiles' table if active
  if (isSupabaseConfigured) {
    try {
      await supabase.from('profiles').upsert({
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
        role: newProfile.role,
        domain: newProfile.domain,
        batch: newProfile.batch,
        created_at: newProfile.created_at,
        setup_completed: newProfile.setupCompleted
      });
    } catch (e) {
      console.warn('⚠️ Supabase profile creation notice:', e.message);
    }
  }

  return {
    profile: newProfile,
    isNewUser: true,
    setupCompleted: isMentor
  };
}

/**
 * Signs out current user session
 */
export async function signOutUser() {
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
  }
  return { success: true };
}
